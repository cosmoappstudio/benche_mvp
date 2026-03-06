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
