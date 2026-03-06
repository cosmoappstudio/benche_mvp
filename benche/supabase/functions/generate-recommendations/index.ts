// Edge Function: Deno runtime. IDE hataları normal (Node varsayıyor).
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  userId?: string;
  color: string | null;
  symbol: string | null;
  element: string | null;
  letter: string | null;
  number: number | null;
  language: string;
  city: string;
  country: string;
  countryCode: string;
  lat?: number;
  lon?: number;
  weatherCondition?: string;
  weatherTempC?: number;
  interests?: string[];
  liked?: string[];
  disliked?: string[];
}

interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  reason: string;
  link?: string;
  platform?: string;
}

function getSeason(): string {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

async function getWeather(lat: number, lon: number): Promise<{ condition: string; tempC: number }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=auto`;
  const res = await fetch(url);
  const data = (await res.json()) as { current: { temperature_2m: number; weathercode: number } };
  const code = data.current.weathercode;
  const tempC = Math.round(data.current.temperature_2m);
  const conditions: Record<number, string> = {
    0: "clear", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
    45: "foggy", 48: "foggy", 51: "drizzle", 61: "rainy", 71: "snowy", 80: "showery", 95: "stormy",
  };
  const condition = conditions[code] ?? "variable";
  return { condition, tempC };
}

async function getConfig<T>(supabase: ReturnType<typeof createClient>, key: string, fallback: T): Promise<T> {
  const { data } = await supabase.from("app_config").select("value").eq("key", key).single();
  const val = data?.value;
  if (val !== undefined && val !== null) return val as T;
  return fallback;
}

function applyPromptTemplate(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
  }
  return out;
}

const FEEDBACK_LIMIT = 25;

/** Generic playlist isimleri - bunları sonuçlardan atla */
const GENERIC_PLAYLIST_NAMES = new Set([
  "today's top hits", "today's top 50", "viral hits", "top 50", "rapcaviar",
  "top hits turkey", "global top 50", "top hits deutschland", "hot hits",
  "top hits usa", "top hits global", "top 50 global", "top 50 turkey",
  "bugünün en iyi şarkıları", "trend şarkılar", "en çok dinlenenler",
]);

function isGenericPlaylist(name: string): boolean {
  const lower = name.toLowerCase().trim();
  return GENERIC_PLAYLIST_NAMES.has(lower) || lower.includes("top hits") || lower.includes("top 50");
}

/** Spotify Client Credentials - Supabase secrets: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET */
async function getSpotifyToken(): Promise<string | null> {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID")?.trim();
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET")?.trim();
  if (!clientId || !clientSecret) return null;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

/** Spotify playlist URL doğrula - open.spotify.com/playlist/ID */
function isSpotifyPlaylistUrl(url: string | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  return /open\.spotify\.com\/playlist\/[a-zA-Z0-9]{20,25}/.test(url.trim());
}

/**
 * Spotify Search API - type=playlist, her zaman direkt playlist URL döndür.
 * Generic playlist'leri atla, spotify_query veya fallback ile ara.
 */
async function searchSpotifyPlaylist(
  searchQuery: string,
  countryCode: string,
  interests: string[]
): Promise<{ url: string; title?: string } | null> {
  const token = await getSpotifyToken();
  if (!token) return null;

  const market = countryCode && countryCode.length === 2 ? countryCode : "TR";
  const limit = 10; // API max per type

  const doSearch = async (term: string): Promise<{ url: string; title: string } | null> => {
    const q = encodeURIComponent(term.trim());
    if (!q) return null;
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${q}&type=playlist&limit=${limit}&market=${market}`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      playlists?: { items?: { name: string; external_urls?: { spotify?: string } }[] };
    };
    const items = data.playlists?.items ?? [];
    for (const item of items) {
      if (isGenericPlaylist(item.name)) continue;
      const url = item.external_urls?.spotify;
      if (url && isSpotifyPlaylistUrl(url)) return { url: url.trim(), title: item.name };
    }
    return null;
  };

  // 1. spotify_query (model'den gelen arama terimi)
  if (searchQuery && !isGenericPlaylist(searchQuery)) {
    const found = await doSearch(searchQuery);
    if (found) return found;
    const withPlaylist = await doSearch(`${searchQuery} playlist`);
    if (withPlaylist) return withPlaylist;
  }

  // 2. İlgi alanları
  if (interests.length > 0) {
    const found = await doSearch(`${interests.slice(0, 3).join(" ")} playlist`);
    if (found) return found;
  }

  // 3. Fallback - her zaman bir playlist bul
  const fallbacks = ["chill mix playlist", "indie playlist", "focus music playlist", "relaxing music"];
  for (const term of fallbacks) {
    const found = await doSearch(term);
    if (found) return found;
  }

  return null;
}

async function fetchUserFeedback(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<{ liked: string[]; disliked: string[] }> {
  const { data, error } = await supabase
    .from("feedback")
    .select("category, recommendation, liked")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(FEEDBACK_LIMIT * 2);

  if (error || !data) return { liked: [], disliked: [] };

  const liked: string[] = [];
  const disliked: string[] = [];
  const seenLiked = new Set<string>();
  const seenDisliked = new Set<string>();

  for (const row of data) {
    const key = `${row.category}: ${row.recommendation}`;
    if (row.liked) {
      if (!seenLiked.has(key) && liked.length < FEEDBACK_LIMIT) {
        liked.push(key);
        seenLiked.add(key);
      }
    } else {
      if (!seenDisliked.has(key) && disliked.length < FEEDBACK_LIMIT) {
        disliked.push(key);
        seenDisliked.add(key);
      }
    }
  }

  return { liked, disliked };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = (await req.json()) as GenerateRequest;
    const {
      userId,
      color,
      symbol,
      element,
      letter,
      number,
      language,
      city,
      country,
      countryCode,
      lat,
      lon,
      weatherCondition,
      weatherTempC,
      interests = [],
      liked: bodyLiked = [],
      disliked: bodyDisliked = [],
    } = body;

    let liked: string[] = bodyLiked;
    let disliked: string[] = bodyDisliked;
    if (userId) {
      const dbFeedback = await fetchUserFeedback(supabase, userId);
      const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
      const merge = (db: string[], body: string[]) => {
        const set = new Set(db.map(norm));
        const out = [...db];
        for (const x of body) {
          if (!set.has(norm(x))) {
            out.push(x.replace(/:\s*/, ": "));
            set.add(norm(x));
          }
        }
        return out;
      };
      liked = merge(dbFeedback.liked, bodyLiked);
      disliked = merge(dbFeedback.disliked, bodyDisliked);
    }

    let weather = { condition: weatherCondition ?? "clear", tempC: weatherTempC ?? 20 };
    if (lat != null && lon != null) {
      try {
        weather = await getWeather(lat, lon);
      } catch {
        // fallback
      }
    }

    const season = getSeason();

    const [model, promptTemplate, maxRecs] = await Promise.all([
      getConfig<string>(supabase, "replicate_model", "meta/meta-llama-3-70b-instruct"),
      getConfig<string>(supabase, "prompt_template", ""),
      getConfig<number>(supabase, "max_recommendations", 6),
    ]);

    const promptVars: Record<string, string> = {
      language,
      city,
      country,
      countryCode,
      weather: weather.condition,
      weatherTemp: String(weather.tempC),
      season,
      interests: Array.isArray(interests) && interests.length ? interests.join(", ") : "none",
      color: color ?? "",
      symbol: symbol ?? "",
      element: element ?? "",
      letter: letter ?? "",
      number: String(number ?? ""),
      liked: liked.join(", ") || "none",
      disliked: disliked.join(", ") || "none",
    };

    const prompt = promptTemplate
      ? applyPromptTemplate(promptTemplate, promptVars)
      : applyPromptTemplate(
          `Act as Benche, a cool daily lifestyle guide. Generate exactly 6 personalized recommendations in JSON format.

CRITICAL - DESCRIPTION: Each "description" MUST be SPECIFIC to that item. Describe the content (film plot, playlist vibe, book theme). NEVER use generic phrases like "a good choice for a day in {{city}}" for Film, Series, Playlist, Book, Food. ONLY Activity may mention location.

CRITICAL - PLAYLIST / spotify_query: For Playlist you MUST include "spotify_query". Examples: "turkish sad acoustic", "sabah enerjisi türkçe". NEVER "Today's Top Hits" etc.

User context:
- Language: {{language}}
- Location: {{city}}, {{country}} ({{countryCode}})
- Weather: {{weather}}, {{weatherTemp}}°C
- Season: {{season}}
- Interests (prioritize these): {{interests}}
- Selections: color={{color}}, symbol={{symbol}}, element={{element}}, letter={{letter}}, number={{number}}
- Liked (avoid similar): {{liked}}
- Disliked (never suggest): {{disliked}}

Rules:
- Food: describe the dish, omit link
- Playlist: describe music mood, REQUIRED "spotify_query"
- Film/Series: describe the content, "platform" (Netflix etc), omit link
- Book: describe the book, omit link
- Activity: doable in {{city}}, MUST mention {{city}} in description

CRITICAL - LANGUAGE: Write ALL output ONLY in {{language}}.
CRITICAL - OUTPUT: Return ONLY a raw JSON array. No markdown. Start with [ and end with ].
[
  {"category":"Yemek","title":"...","description":"...","reason":"..."},
  {"category":"Playlist","title":"...","description":"...","reason":"...","spotify_query":"turkish sad acoustic"},
  {"category":"Film","title":"...","description":"...","reason":"...","platform":"Netflix"},
  {"category":"Series","title":"...","description":"...","reason":"...","platform":"Amazon Prime"},
  {"category":"Kitap","title":"...","description":"...","reason":"..."},
  {"category":"Aktivite","title":"...","description":"...","reason":"...","link":"optional"}
]`,
          promptVars
        );

    const replicateToken =
      Deno.env.get("REPLICATE_API_TOKEN")?.trim() ||
      Deno.env.get("REPLICATE_API_KEY")?.trim();
    if (!replicateToken) {
      throw new Error("REPLICATE_API_TOKEN or REPLICATE_API_KEY not set");
    }

    const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${replicateToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: model,
        input: { prompt },
      }),
    });

    if (!replicateRes.ok) {
      const err = await replicateRes.text();
      throw new Error(`Replicate API error: ${err}`);
    }

    const pred = (await replicateRes.json()) as { id: string; urls: { get: string } };
    let output: string | null = null;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const statusRes = await fetch(pred.urls.get, {
        headers: { Authorization: `Bearer ${replicateToken}` },
      });
      const status = (await statusRes.json()) as { status: string; output?: string | string[] };
      if (status.status === "succeeded") {
        output = Array.isArray(status.output) ? status.output.join("") : (status.output ?? "");
        break;
      }
      if (status.status === "failed" || status.status === "canceled") {
        throw new Error(`Replicate prediction failed: ${status.status}`);
      }
    }

    if (!output) throw new Error("Replicate timeout");

    let jsonStr = output
      .replace(/^[\s\S]*?```(?:json)?\s*/i, "")
      .replace(/\s*```[\s\S]*$/i, "")
      .trim();
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) jsonStr = jsonMatch[0];
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1");

    function parseModelJson(str: string): Record<string, string>[] {
      const tryParse = (s: string): Record<string, string>[] | null => {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed as Record<string, string>[];
          return null;
        } catch {
          return null;
        }
      };

      let result = tryParse(jsonStr);
      if (result) return result;

      const truncateAt = (pattern: RegExp): Record<string, string>[] | null => {
        const m = str.match(pattern);
        if (!m) return null;
        const idx = str.lastIndexOf(m[0]);
        if (idx < 5) return null;
        const cut = str.slice(0, idx + 1) + "]";
        return tryParse(cut);
      };

      result = truncateAt(/\},\s*\{\s*"category"\s*:\s*"/);
      if (result) return result;
      result = truncateAt(/\},\s*\{\s*"category"/);
      if (result) return result;
      result = truncateAt(/\}\s*,\s*\{/);
      if (result) return result;

      const lastBrace = str.lastIndexOf('},{"category"');
      if (lastBrace > 10) {
        result = tryParse(str.slice(0, lastBrace) + "]");
        if (result) return result;
      }

      const objRegex = /\{\s*"category"\s*:\s*"[^"]*"\s*,\s*"title"\s*:\s*"[^"]*"[^}]*\}/g;
      const objs: Record<string, string>[] = [];
      let match: RegExpExecArray | null;
      while ((match = objRegex.exec(str)) !== null) {
        try {
          const obj = JSON.parse(match[0]) as Record<string, string>;
          if (obj.category && obj.title) objs.push(obj);
        } catch {
          // skip malformed object
        }
      }
      if (objs.length >= 3) return objs;

      console.error("JSON parse failed. Raw (500 chars):", output.slice(0, 500));
      throw new Error("Invalid JSON from model");
    }

    const items = parseModelJson(jsonStr);

    const limit = Math.min(
      typeof maxRecs === "number" ? maxRecs : typeof maxRecs === "string" ? parseInt(maxRecs, 10) || 6 : 6,
      12
    );
    let recommendations: Recommendation[] = (items ?? []).slice(0, limit).map((item, i) => ({
      id: String(i + 1),
      category: item.category ?? "Aktivite",
      title: item.title ?? "Öneri",
      description: item.description ?? "",
      reason: item.reason ?? "",
      link: item.link,
      platform: item.platform,
    }));

    // Playlist: spotify_query ile Spotify Search (type=playlist), ilk sonucun linki
    const playlistCats = ["Playlist", "Çalma Listesi"];
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      if (!playlistCats.includes(rec.category)) continue;
      const hasValidLink = rec.link && isSpotifyPlaylistUrl(rec.link);
      if (hasValidLink && !isGenericPlaylist(rec.title)) continue;

      const rawItem = items[i];
      const spotifyQuery = (rawItem?.spotify_query ?? "").trim() || rec.title;
      const found = await searchSpotifyPlaylist(spotifyQuery, countryCode ?? "TR", interests);
      if (found) {
        recommendations = [...recommendations];
        recommendations[i] = {
          ...rec,
          link: found.url,
          ...(found.title && { title: found.title }),
        };
      }
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
