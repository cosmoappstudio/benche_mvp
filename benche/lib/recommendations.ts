import { supabase } from "@/lib/supabase";

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  reason: string;
  link?: string;
  platform?: string;
}

export interface GenerateRecommendationsInput {
  userId?: string;
  isPro?: boolean;
  color: string | null;
  symbol: string | null;
  element: string | null;
  letter: string | null;
  number: number | null;
  language: string;
  city: string;
  country: string;
  countryCode: string;
  lat?: number;
  lon?: number;
  weatherCondition?: string;
  weatherTempC?: number;
  interests?: string[];
  liked?: string[];
  disliked?: string[];
}

export interface GenerateRecommendationsResult {
  recommendations: Recommendation[];
}

export async function generateRecommendations(
  input: GenerateRecommendationsInput
): Promise<GenerateRecommendationsResult> {
  const { data, error } = await supabase.functions.invoke<
    GenerateRecommendationsResult | { error: string }
  >("generate-recommendations", {
    body: input,
  });

  if (error) {
    throw new Error(error.message ?? "Failed to generate recommendations");
  }

  const result = data as GenerateRecommendationsResult | { error: string };
  if (result && "error" in result) {
    throw new Error((result as { error: string }).error);
  }

  const recommendations = (result as GenerateRecommendationsResult).recommendations ?? [];
  return { recommendations };
}
