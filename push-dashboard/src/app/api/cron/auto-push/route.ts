import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  getProfilesForAutoPush,
  hasReceivedToday,
  hasEverReceived,
} from "@/lib/pushSegments";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const ONCE_EVER_TRIGGERS = ["install_1h", "onboarding_24h", "pro_teachvik"];
const DAILY_TRIGGERS = ["daily_morning", "weekend"];

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const supabase = getSupabaseAdmin();
    const now = new Date();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;

    const { data: configs, error: configError } = await supabase
      .from("auto_push_config")
      .select("*")
      .eq("enabled", true);

    if (configError) throw configError;

    const results: Record<string, { sent: number; skipped: number }> = {};

    for (const config of configs ?? []) {
      const { trigger_type, title, body, rules } = config;
      const rulesObj = (rules ?? {}) as Record<string, unknown>;

      if (trigger_type === "weekend" && !isWeekend) continue;
      if (trigger_type === "daily_morning" && isWeekend) continue;

      const hour = (rulesObj.hour as number) ?? 8;
      const minute = (rulesObj.minute as number) ?? 0;
      if (trigger_type === "daily_morning" || trigger_type === "weekend") {
        if (now.getHours() !== hour) continue;
        if (now.getMinutes() < minute || now.getMinutes() >= minute + 15) continue;
      }

      let profiles = await getProfilesForAutoPush(supabase, trigger_type, rulesObj);

      const toSend: { id: string; expo_push_token: string }[] = [];
      for (const p of profiles) {
        if (ONCE_EVER_TRIGGERS.includes(trigger_type)) {
          const received = await hasEverReceived(supabase, p.id, trigger_type);
          if (received) continue;
        } else if (DAILY_TRIGGERS.includes(trigger_type)) {
          const received = await hasReceivedToday(supabase, p.id, trigger_type);
          if (received) continue;
        }
        toSend.push(p);
      }

      const tokens = toSend.map((x) => x.expo_push_token);
      let sent = 0;

      if (tokens.length > 0) {
        const CHUNK_SIZE = 100;
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
        }

        for (const p of toSend) {
          await supabase.from("push_sent_log").insert({
            user_id: p.id,
            trigger_type,
          });
        }
      }

      results[trigger_type] = {
        sent,
        skipped: profiles.length - toSend.length,
      };
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("[cron/auto-push] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
