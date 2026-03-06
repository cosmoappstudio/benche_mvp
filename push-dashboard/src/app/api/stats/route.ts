import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const secret = req.headers.get("x-dashboard-secret");
    if (secret !== process.env.DASHBOARD_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count } = await getSupabaseAdmin()
      .from("profiles")
      .select("expo_push_token", { count: "exact", head: true })
      .not("expo_push_token", "is", null);

    return NextResponse.json({ subscribers: count ?? 0 });
  } catch (err) {
    console.error("[stats] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
