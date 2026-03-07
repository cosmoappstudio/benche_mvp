import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const secret = req.headers.get("x-dashboard-secret");
    if (secret !== process.env.DASHBOARD_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from("auto_push_config")
      .select("*")
      .order("trigger_type");

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("[auto-push] GET Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const secret = req.headers.get("x-dashboard-secret");
    if (secret !== process.env.DASHBOARD_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, body: msgBody, enabled, rules } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (msgBody !== undefined) updates.body = msgBody;
    if (enabled !== undefined) updates.enabled = enabled;
    if (rules !== undefined) updates.rules = rules;

    const { data, error } = await getSupabaseAdmin()
      .from("auto_push_config")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("[auto-push] PATCH Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
