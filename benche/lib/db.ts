import { supabase } from "./supabase";

export async function getProfileShortId(userId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_or_create_short_id", {
    p_user_id: userId,
  });
  if (error) {
    console.warn("[db] getProfileShortId error:", error.message);
    return null;
  }
  return data as string | null;
}

export async function upsertProfile(params: {
  userId: string;
  language?: string;
  locationCountry?: string;
  locationCity?: string;
  interests?: string[];
  expoPushToken?: string | null;
  deviceOs?: string;
  deviceModel?: string;
  totalPlansCreated?: number;
  isPro?: boolean;
  proProductId?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
}) {
  const row: Record<string, unknown> = {
    id: params.userId,
    language: params.language,
    location_country: params.locationCountry,
    location_city: params.locationCity,
    interests: params.interests ?? [],
  };
  if (params.expoPushToken !== undefined) {
    row.expo_push_token = params.expoPushToken;
  }
  if (params.deviceOs !== undefined) {
    row.device_os = params.deviceOs;
  }
  if (params.deviceModel !== undefined) {
    row.device_model = params.deviceModel;
  }
  if (params.totalPlansCreated !== undefined) {
    row.total_plans_created = params.totalPlansCreated;
  }
  if (params.isPro !== undefined) {
    row.is_pro = params.isPro;
  }
  if (params.proProductId !== undefined) {
    row.pro_product_id = params.proProductId;
  }
  if (params.utmSource !== undefined) {
    row.utm_source = params.utmSource;
  }
  if (params.utmMedium !== undefined) {
    row.utm_medium = params.utmMedium;
  }
  if (params.utmCampaign !== undefined) {
    row.utm_campaign = params.utmCampaign;
  }
  if (params.referrer !== undefined) {
    row.referrer = params.referrer;
  }
  const { error } = await supabase.from("profiles").upsert(row, {
    onConflict: "id",
  });
  if (error) {
    console.warn("[db] upsertProfile error:", error.message);
  }
}

export async function updateProfilePushToken(
  userId: string,
  expoPushToken: string | null
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ expo_push_token: expoPushToken })
    .eq("id", userId);
  if (error) {
    console.warn("[db] updateProfilePushToken error:", error.message);
  }
}

/** Plan oluşturulduğunda total_plans_created artır */
export async function incrementProfileTotalPlans(userId: string): Promise<void> {
  const { error } = await supabase.rpc("increment_profile_total_plans", {
    p_user_id: userId,
  });
  if (error) {
    console.warn("[db] incrementProfileTotalPlans error:", error.message);
  }
}

/** PRO + UTM bilgisini güncelle (bootstrap'ta) */
export async function syncProfileProUtm(params: {
  userId: string;
  isPro?: boolean;
  proProductId?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
}): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (params.isPro !== undefined) updates.is_pro = params.isPro;
  if (params.proProductId !== undefined) updates.pro_product_id = params.proProductId;
  if (params.utmSource !== undefined) updates.utm_source = params.utmSource;
  if (params.utmMedium !== undefined) updates.utm_medium = params.utmMedium;
  if (params.utmCampaign !== undefined) updates.utm_campaign = params.utmCampaign;
  if (params.referrer !== undefined) updates.referrer = params.referrer;
  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase.from("profiles").update(updates).eq("id", params.userId);
  if (error) {
    console.warn("[db] syncProfileProUtm error:", error.message);
  }
}

export async function saveDailyCard(params: {
  userId: string;
  selectedColor: string | null;
  selectedSymbol: string | null;
  selectedElement: string | null;
  selectedLetter: string | null;
  selectedNumber: number | null;
  recommendations?: Record<string, unknown>[];
}) {
  const { data, error } = await supabase
    .from("daily_cards")
    .insert({
      user_id: params.userId,
      selected_color: params.selectedColor,
      selected_symbol: params.selectedSymbol,
      selected_element: params.selectedElement,
      selected_letter: params.selectedLetter,
      selected_number: params.selectedNumber,
      recommendations: params.recommendations ?? [],
    })
    .select("id")
    .single();

  if (error) {
    console.warn("[db] saveDailyCard error:", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function updateDailyCardRecommendations(
  cardId: string,
  userId: string,
  recommendations: Record<string, unknown>[]
): Promise<void> {
  const { error } = await supabase
    .from("daily_cards")
    .update({ recommendations })
    .eq("id", cardId)
    .eq("user_id", userId);
  if (error) {
    console.warn("[db] updateDailyCardRecommendations error:", error.message);
  }
}

export async function upsertFeedback(params: {
  userId: string;
  cardId: string;
  category: string;
  recommendation: string;
  liked: boolean;
}) {
  // Önce varsa sil, sonra ekle (toggle için)
  await supabase
    .from("feedback")
    .delete()
    .eq("user_id", params.userId)
    .eq("card_id", params.cardId)
    .eq("category", params.category)
    .eq("recommendation", params.recommendation);

  const { error } = await supabase.from("feedback").insert({
    user_id: params.userId,
    card_id: params.cardId,
    category: params.category,
    recommendation: params.recommendation,
    liked: params.liked,
  });

  if (error) {
    console.warn("[db] upsertFeedback error:", error.message);
  }
}

export interface DailyCardRow {
  id: string;
  selected_color: string | null;
  selected_symbol: string | null;
  selected_element: string | null;
  selected_letter: string | null;
  selected_number: number | null;
  created_at: string;
}

export async function getDailyCards(userId: string): Promise<
  (DailyCardRow & { liked_count: number; disliked_count: number })[]
> {
  const { data: cards, error } = await supabase
    .from("daily_cards")
    .select("id, selected_color, selected_symbol, selected_element, selected_letter, selected_number, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error || !cards) return [];

  const cardIds = cards.map((c) => c.id);
  const { data: feedback } = await supabase
    .from("feedback")
    .select("card_id, liked")
    .eq("user_id", userId)
    .in("card_id", cardIds);

  const counts: Record<string, { liked: number; disliked: number }> = {};
  cardIds.forEach((id) => (counts[id] = { liked: 0, disliked: 0 }));
  feedback?.forEach((f) => {
    if (counts[f.card_id]) {
      if (f.liked) counts[f.card_id].liked++;
      else counts[f.card_id].disliked++;
    }
  });

  return cards.map((c) => ({
    ...c,
    liked_count: counts[c.id]?.liked ?? 0,
    disliked_count: counts[c.id]?.disliked ?? 0,
  }));
}

export async function getDailyCardById(
  userId: string,
  cardId: string
): Promise<(DailyCardRow & { recommendations?: unknown[] }) | null> {
  const { data, error } = await supabase
    .from("daily_cards")
    .select("id, selected_color, selected_symbol, selected_element, selected_letter, selected_number, created_at, recommendations")
    .eq("user_id", userId)
    .eq("id", cardId)
    .single();

  if (error || !data) return null;
  return data as DailyCardRow & { recommendations?: unknown[] };
}
