import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalPlans: number;
    proUsers: number;
    proRate: number;
    pushSubscribers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
  };
  byLanguage: { language: string; count: number }[];
  byDeviceOs: { os: string; count: number }[];
  byUtmSource: { source: string; count: number }[];
  topDevices: { model: string; count: number }[];
  plansDistribution: { range: string; count: number }[];
}

export async function GET(req: NextRequest) {
  try {
    const secret = req.headers.get("x-dashboard-secret");
    if (secret !== process.env.DASHBOARD_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: totalUsers },
      { data: profiles },
      { count: pushSubscribers },
      { count: newToday },
      { count: newThisWeek },
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("language, device_os, device_model, utm_source, total_plans_created, is_pro, created_at"),
      supabase
        .from("profiles")
        .select("expo_push_token", { count: "exact", head: true })
        .not("expo_push_token", "is", null),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekAgo),
    ]);

    const rows = (profiles ?? []) as {
      language: string | null;
      device_os: string | null;
      device_model: string | null;
      utm_source: string | null;
      total_plans_created: number | null;
      is_pro: boolean | null;
    }[];

    const totalPlans = rows.reduce((s, r) => s + (r.total_plans_created ?? 0), 0);
    const proUsers = rows.filter((r) => r.is_pro === true).length;

    const langMap: Record<string, number> = {};
    rows.forEach((r) => {
      const k = r.language || "unknown";
      langMap[k] = (langMap[k] ?? 0) + 1;
    });
    const byLanguage = Object.entries(langMap)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);

    const osMap: Record<string, number> = {};
    rows.forEach((r) => {
      const k = r.device_os || "unknown";
      osMap[k] = (osMap[k] ?? 0) + 1;
    });
    const byDeviceOs = Object.entries(osMap)
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count);

    const utmMap: Record<string, number> = {};
    rows.forEach((r) => {
      const k = r.utm_source || "organic";
      utmMap[k] = (utmMap[k] ?? 0) + 1;
    });
    const byUtmSource = Object.entries(utmMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const deviceMap: Record<string, number> = {};
    rows.forEach((r) => {
      const k = (r.device_model || "unknown").slice(0, 40);
      deviceMap[k] = (deviceMap[k] ?? 0) + 1;
    });
    const topDevices = Object.entries(deviceMap)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const ranges = [
      { range: "0", min: 0, max: 0 },
      { range: "1-5", min: 1, max: 5 },
      { range: "6-10", min: 6, max: 10 },
      { range: "11-25", min: 11, max: 25 },
      { range: "26+", min: 26, max: 9999 },
    ];
    const plansDist = ranges.map(({ range, min, max }) => ({
      range,
      count: rows.filter((r) => {
        const v = r.total_plans_created ?? 0;
        return v >= min && v <= max;
      }).length,
    }));

    const data: AnalyticsData = {
      overview: {
        totalUsers: totalUsers ?? 0,
        totalPlans,
        proUsers,
        proRate: (totalUsers ?? 0) > 0 ? Math.round((proUsers / (totalUsers ?? 1)) * 1000) / 10 : 0,
        pushSubscribers: pushSubscribers ?? 0,
        newUsersToday: newToday ?? 0,
        newUsersThisWeek: newThisWeek ?? 0,
      },
      byLanguage,
      byDeviceOs,
      byUtmSource,
      topDevices,
      plansDistribution: plansDist,
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error("[analytics] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
