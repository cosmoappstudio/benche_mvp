import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-dashboard-secret");
    if (secret !== process.env.DASHBOARD_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body } = await req.json();
    if (!title || !body) {
      return NextResponse.json(
        { error: "title and body required" },
        { status: 400 }
      );
    }

    const { data: profiles, error } = await getSupabaseAdmin()
      .from("profiles")
      .select("expo_push_token")
      .not("expo_push_token", "is", null);

    if (error) {
      console.error("[send-push] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const tokens = (profiles ?? [])
      .map((p) => p.expo_push_token)
      .filter((t): t is string => !!t);

    if (tokens.length === 0) {
      return NextResponse.json({
        sent: 0,
        message: "No push tokens found",
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
        body: String(body).slice(0, 500),
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
