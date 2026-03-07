import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getProfilesBySegment, type SegmentRules } from "@/lib/pushSegments";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-dashboard-secret");
    if (secret !== process.env.DASHBOARD_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, body: msgBody, segmentId } = body;

    if (!title || !msgBody) {
      return NextResponse.json(
        { error: "title and body required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    let profiles: { id: string; expo_push_token: string }[];

    if (segmentId) {
      const { data: segment, error: segError } = await supabase
        .from("push_segments")
        .select("rules")
        .eq("id", segmentId)
        .single();

      if (segError || !segment) {
        return NextResponse.json({ error: "Segment not found" }, { status: 404 });
      }

      profiles = await getProfilesBySegment(
        supabase,
        (segment.rules ?? {}) as SegmentRules
      );
    } else {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, expo_push_token")
        .not("expo_push_token", "is", null);

      if (error) throw error;
      profiles = (data ?? []).filter((p) => p.expo_push_token) as {
        id: string;
        expo_push_token: string;
      }[];
    }

    const tokens = profiles.map((p) => p.expo_push_token);

    if (tokens.length === 0) {
      return NextResponse.json({
        sent: 0,
        failed: 0,
        total: 0,
        message: "No push tokens found for segment",
      });
    }

    const CHUNK_SIZE = 100;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
      const chunk = tokens.slice(i, i + CHUNK_SIZE);
      const messages = chunk.map((to) => ({
        to,
        title: String(title).slice(0, 100),
        body: String(msgBody).slice(0, 500),
        sound: "default",
      }));

      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messages),
      });

      const result = await res.json();
      const data = Array.isArray(result) ? result : result.data ?? [];

      sent += data.filter((r: { status?: string }) => r.status === "ok").length;
      failed += data.filter((r: { status?: string }) => r.status === "error").length;
    }

    return NextResponse.json({
      sent,
      failed,
      total: tokens.length,
    });
  } catch (err) {
    console.error("[send-push] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
