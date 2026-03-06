/**
 * Öneri için çalışır link üretir.
 * Yemek, Film, Dizi, Kitap: her zaman arama linki (model linkleri güvenilir değil).
 * Playlist: model geçerli Spotify playlist URL verirse kullan, yoksa arama.
 */
const isValidUrl = (s: string | undefined): boolean => {
  if (!s || typeof s !== "string") return false;
  const trimmed = s.trim();
  if (trimmed.length < 10) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const GENERIC_PLAYLIST_NAMES = new Set([
  "today's top hits", "viral hits", "top 50", "rapcaviar", "top hits turkey",
  "global top 50", "hot hits",
]);
const isGenericPlaylist = (name: string) =>
  GENERIC_PLAYLIST_NAMES.has(name.toLowerCase().trim()) ||
  name.toLowerCase().includes("top hits") ||
  name.toLowerCase().includes("top 50");

/** Spotify playlist URL: open.spotify.com/playlist/ID - direkt çalma listesi açılır */
const isValidSpotifyPlaylistUrl = (s: string | undefined): boolean => {
  if (!s || typeof s !== "string") return false;
  const trimmed = s.trim();
  if (trimmed.length < 40) return false;
  return /^https?:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]{20,25}/.test(trimmed);
};

/** JustWatch: locale + arama path (dile göre: tr=arama, de=suche, en=search) */
function getJustWatchSearchUrl(countryCode?: string, query: string): string {
  const cc = countryCode?.toUpperCase() ?? "TR";
  const localeMap: Record<string, string> = {
    TR: "tr", DE: "de", US: "us", GB: "uk", ES: "es", RU: "ru", FR: "fr",
  };
  const pathMap: Record<string, string> = {
    TR: "arama", DE: "suche", AT: "suche", CH: "suche",
  };
  const locale = localeMap[cc] ?? "tr";
  const path = pathMap[cc] ?? "search";
  return `https://www.justwatch.com/${locale}/${path}?q=${encodeURIComponent(query)}`;
}

export function getRecommendationLink(
  category: string,
  title: string,
  modelLink?: string | null,
  countryCode?: string
): string | null {
  const q = encodeURIComponent(title);
  const amazonDomain = countryCode === "TR" ? "amazon.com.tr" : countryCode === "DE" ? "amazon.de" : "amazon.com";

  switch (category) {
    case "Yemek":
    case "Food":
      return `https://www.google.com/search?q=${encodeURIComponent(title + " tarifi")}`;
    case "Playlist":
    case "Çalma Listesi": {
      if (isValidSpotifyPlaylistUrl(modelLink)) return modelLink!.trim();
      const searchTerm = isGenericPlaylist(title) ? "chill mix playlist" : title;
      return `https://open.spotify.com/search/${encodeURIComponent(searchTerm)}`;
    }
    case "Film":
    case "Movie":
    case "Series":
    case "Dizi":
      return getJustWatchSearchUrl(countryCode, title);
    case "Kitap":
    case "Book":
      return `https://www.${amazonDomain}/s?k=${q}`;
    case "Aktivite":
    case "Activity":
      return isValidUrl(modelLink) ? modelLink!.trim() : `https://www.google.com/search?q=${encodeURIComponent(title)}`;
    default:
      return `https://www.google.com/search?q=${q}`;
  }
}
