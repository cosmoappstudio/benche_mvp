import { supabase } from "./supabase";

function toStringOrEmpty(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "string") return val.trim();
  return String(val).trim();
}

/** app_config'den store URL'lerini çeker. Supabase yoksa boş döner (fallback kullanılır). */
export async function getStoreUrls(): Promise<{
  appStore: string;
  playStore: string;
}> {
  if (!supabase) return { appStore: "", playStore: "" };

  try {
    const [appStoreRes, playStoreRes] = await Promise.all([
      supabase.from("app_config").select("value").eq("key", "app_store_url").single(),
      supabase.from("app_config").select("value").eq("key", "play_store_url").single(),
    ]);

    const appStore = toStringOrEmpty(appStoreRes.data?.value);
    const playStore = toStringOrEmpty(playStoreRes.data?.value);

    return { appStore, playStore };
  } catch {
    return { appStore: "", playStore: "" };
  }
}
