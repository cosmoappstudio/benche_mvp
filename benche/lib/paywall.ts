import Purchases from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { router } from "expo-router";
import { getProInfo } from "./revenuecat";
import { useUserStore } from "@/stores/userStore";
import { trackSubscribe } from "./adsTracking";

/** RevenueCat placement ID'leri — dashboard'da tanımlanmalı */
export const PLACEMENT = {
  ONBOARDING: "onboarding",
  BEFORE_RESULTS: "before_results",
  PROFILE: "profile",
} as const;

export type PaywallPlacement = (typeof PLACEMENT)[keyof typeof PLACEMENT];

export interface PresentPaywallOptions {
  /** true ise RevenueCat başarısız olunca fallback paywall'a yönlendirilmez (zaten fallback'tayken kullan) */
  skipFallback?: boolean;
}

/** Placement'a göre paywall göster. PRO değilse gösterir. RevenueCat başarısız olursa custom paywall'a yönlendirir. */
export async function presentPaywallForPlacement(
  placementId: PaywallPlacement,
  options?: PresentPaywallOptions
): Promise<boolean> {
  try {
    const proInfo = await getProInfo();
    if (proInfo.isPro) return true;

    let offering = null;
    try {
      offering = await Purchases.getCurrentOfferingForPlacement(placementId);
      if (!offering) {
        const { current, all } = await Purchases.getOfferings();
        offering = all["default"] ?? current;
      }
    } catch (e) {
      if (__DEV__) console.warn("[paywall] Offering fetch failed:", e);
    }

    // Offering yoksa veya config hatası (Error 23) riski varsa doğrudan fallback
    if (!offering) {
      if (!options?.skipFallback) router.push("/paywall");
      return false;
    }

    const result = await RevenueCatUI.presentPaywall({
      offering,
      displayCloseButton: true,
    });

    if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
      const updated = await getProInfo();
      useUserStore.getState().setIsPro(updated.isPro);
      trackSubscribe(0, "USD");
      return true;
    }
    return false;
  } catch (err) {
    if (__DEV__) console.warn("[paywall] RevenueCat UI failed, showing fallback:", err);
    if (!options?.skipFallback) {
      router.push("/paywall");
    }
    return false;
  }
}
