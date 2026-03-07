import { SupabaseClient } from "@supabase/supabase-js";

export interface SegmentRules {
  is_pro?: boolean;
  device_os?: string;
  language?: string;
  total_plans_created_min?: number;
  total_plans_created_max?: number;
  created_at_after?: string; // "7d" | "30d"
}

/** Segment kurallarına göre profiles sorgusu - expo_push_token olanları döner */
export async function getProfilesBySegment(
  supabase: SupabaseClient,
  rules: SegmentRules
): Promise<{ id: string; expo_push_token: string }[]> {
  let query = supabase
    .from("profiles")
    .select("id, expo_push_token")
    .not("expo_push_token", "is", null);

  if (rules.is_pro !== undefined && rules.is_pro !== null) {
    query = query.eq("is_pro", rules.is_pro);
  }
  if (rules.device_os) {
    query = query.eq("device_os", rules.device_os);
  }
  if (rules.language) {
    query = query.eq("language", rules.language);
  }
  if (rules.total_plans_created_min !== undefined && rules.total_plans_created_min !== null) {
    query = query.gte("total_plans_created", rules.total_plans_created_min);
  }
  if (rules.total_plans_created_max !== undefined && rules.total_plans_created_max !== null) {
    if (rules.total_plans_created_max === 0) {
      query = query.or("total_plans_created.eq.0,total_plans_created.is.null");
    } else {
      query = query.lte("total_plans_created", rules.total_plans_created_max);
    }
  }
  if (rules.created_at_after) {
    const d = new Date();
    if (rules.created_at_after === "7d") d.setDate(d.getDate() - 7);
    else if (rules.created_at_after === "30d") d.setDate(d.getDate() - 30);
    query = query.gte("created_at", d.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).filter((p) => p.expo_push_token) as { id: string; expo_push_token: string }[];
}

/** Auto-push tetikleyicisine göre hedef kullanıcıları bul */
export async function getProfilesForAutoPush(
  supabase: SupabaseClient,
  triggerType: string,
  rules: Record<string, unknown>
): Promise<{ id: string; expo_push_token: string }[]> {
  const now = new Date();

  let query = supabase
    .from("profiles")
    .select("id, expo_push_token, created_at, total_plans_created, is_pro")
    .not("expo_push_token", "is", null);

  switch (triggerType) {
    case "daily_morning":
    case "weekend":
      // Tüm push aboneleri - filtre yok
      break;

    case "install_1h": {
      const minH = (rules.min_hours as number) ?? 1;
      const maxH = (rules.max_hours as number) ?? 2;
      const minDate = new Date(now.getTime() - maxH * 60 * 60 * 1000);
      const maxDate = new Date(now.getTime() - minH * 60 * 60 * 1000);
      query = query
        .gte("created_at", minDate.toISOString())
        .lte("created_at", maxDate.toISOString())
        .eq("total_plans_created", 0);
      break;
    }

    case "onboarding_24h": {
      const minH = (rules.min_hours as number) ?? 24;
      const maxH = (rules.max_hours as number) ?? 25;
      const minDate = new Date(now.getTime() - maxH * 60 * 60 * 1000);
      const maxDate = new Date(now.getTime() - minH * 60 * 60 * 1000);
      query = query
        .gte("created_at", minDate.toISOString())
        .lte("created_at", maxDate.toISOString())
        .eq("total_plans_created", 0);
      break;
    }

    case "pro_teachvik": {
      const minPlans = (rules.min_plans as number) ?? 5;
      query = query
        .gte("total_plans_created", minPlans)
        .eq("is_pro", false);
      break;
    }

    default:
      return [];
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).filter((p) => p.expo_push_token) as { id: string; expo_push_token: string }[];
}

/** Bu kullanıcı bu tetikleyiciyi bugün aldı mı? (daily/weekend için) */
export async function hasReceivedToday(
  supabase: SupabaseClient,
  userId: string,
  triggerType: string
): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("push_sent_log")
    .select("id")
    .eq("user_id", userId)
    .eq("trigger_type", triggerType)
    .gte("sent_at", `${today}T00:00:00Z`)
    .limit(1)
    .maybeSingle();
  return !!data;
}

/** Bu kullanıcı bu tetikleyiciyi hiç aldı mı? (once-ever için) */
export async function hasEverReceived(
  supabase: SupabaseClient,
  userId: string,
  triggerType: string
): Promise<boolean> {
  const { data } = await supabase
    .from("push_sent_log")
    .select("id")
    .eq("user_id", userId)
    .eq("trigger_type", triggerType)
    .limit(1)
    .maybeSingle();
  return !!data;
}
