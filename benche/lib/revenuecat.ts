import Purchases from "react-native-purchases";
import { Platform } from "react-native";

export const initRevenueCat = async (supabaseUserId: string): Promise<void> => {
  const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  const apiKey = Platform.OS === "ios" ? iosKey : androidKey ?? iosKey;

  if (!apiKey?.trim()) return;

  Purchases.configure({
    apiKey: apiKey.trim(),
    appUserID: supabaseUserId,
  });
};

export const checkProStatus = async (): Promise<boolean> => {
  const { entitlements } = await Purchases.getCustomerInfo();
  return entitlements.active["benche_pro"] !== undefined;
};

export interface ProInfo {
  isPro: boolean;
  productId: string | null;
}

/** PRO durumu ve paket bilgisi */
export const getProInfo = async (): Promise<ProInfo> => {
  try {
    const info = await Purchases.getCustomerInfo();
    const entitlement = info.entitlements.active["benche_pro"];
    const isPro = !!entitlement;
    const productId = entitlement?.productIdentifier ?? null;
    return { isPro, productId };
  } catch {
    return { isPro: false, productId: null };
  }
};
