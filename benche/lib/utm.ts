import { Linking } from "react-native";

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}

/** URL'den UTM parametrelerini parse et */
export function parseUtmFromUrl(url: string | null): UtmParams | null {
  if (!url || typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    const utmSource = parsed.searchParams.get("utm_source") ?? undefined;
    const utmMedium = parsed.searchParams.get("utm_medium") ?? undefined;
    const utmCampaign = parsed.searchParams.get("utm_campaign") ?? undefined;
    if (!utmSource && !utmMedium && !utmCampaign) return null;
    return {
      utmSource,
      utmMedium,
      utmCampaign,
      referrer: url.slice(0, 500),
    };
  } catch {
    return null;
  }
}

/** İlk açılış URL'ini al (deep link / deferred deep link) */
export async function getInitialUtm(): Promise<UtmParams | null> {
  try {
    const url = await Linking.getInitialURL();
    return parseUtmFromUrl(url);
  } catch {
    return null;
  }
}
