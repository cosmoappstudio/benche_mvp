import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getProfilesBySegment, type SegmentRules } from "@/lib/pushSegments";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const secret = req.headers.get("x-dashboard-secret");
    if (secret !== process.env.DASHBOARD_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: segment, error: segError } = await supabase
      .from("push_segments")
      .select("rules")
      .eq("id", id)
      .single();

    if (segError || !segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    const profiles = await getProfilesBySegment(
      supabase,
      (segment.rules ?? {}) as SegmentRules
    );

    return NextResponse.json({ count: profiles.length });
  } catch (err) {
    console.error("[segments/count] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
