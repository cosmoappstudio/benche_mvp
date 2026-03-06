import { supabase } from "./supabase";

/**
 * app_config'den değer okur. Supabase Dashboard'dan güncellenebilir.
 */
export async function getAppConfig<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", key)
    .single();

  if (error || data?.value === undefined || data?.value === null) {
    return fallback;
  }

  return data.value as T;
}

/**
 * "X kişi bugün planladı" social proof sayısı
 */
export async function getPeoplePlannedToday(): Promise<number> {
  const val = await getAppConfig<number | string>("people_planned_today", 12450);
  if (typeof val === "number") return val;
  const parsed = parseInt(String(val), 10);
  return Number.isNaN(parsed) ? 12450 : parsed;
}

/**
 * Social proof alanı açık mı? false ise gizlenir.
 */
export async function getSocialProofEnabled(): Promise<boolean> {
  const val = await getAppConfig<boolean | string>("social_proof_enabled", true);
  if (typeof val === "boolean") return val;
  return String(val).toLowerCase() === "true";
}

function toStringOrEmpty(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "string") return val.trim();
  return String(val).trim();
}

/** Legal & Support URLs - backend'den yüklenir */
export async function getLegalUrls(): Promise<{
  privacyPolicy: string;
  terms: string;
  eula: string;
  support: string;
  appStore: string;
  playStore: string;
}> {
  const [privacyPolicy, terms, eula, support, appStore, playStore] = await Promise.all([
    getAppConfig<unknown>("privacy_policy_url", ""),
    getAppConfig<unknown>("terms_url", ""),
    getAppConfig<unknown>("eula_url", ""),
    getAppConfig<unknown>("support_url", ""),
    getAppConfig<unknown>("app_store_url", ""),
    getAppConfig<unknown>("play_store_url", ""),
  ]);
  return {
    privacyPolicy: toStringOrEmpty(privacyPolicy),
    terms: toStringOrEmpty(terms),
    eula: toStringOrEmpty(eula),
    support: toStringOrEmpty(support),
    appStore: toStringOrEmpty(appStore),
    playStore: toStringOrEmpty(playStore),
  };
}
