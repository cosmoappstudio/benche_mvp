import Purchases from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
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

/** Placement'a göre paywall göster. PRO değilse gösterir. */
export async function presentPaywallForPlacement(
  placementId: PaywallPlacement
): Promise<boolean> {
  try {
    const proInfo = await getProInfo();
    if (proInfo.isPro) return true;

    let offering = await Purchases.getCurrentOfferingForPlacement(placementId);
    if (!offering) {
      const { current } = await Purchases.getOfferings();
      offering = current;
    }

    const result = await RevenueCatUI.presentPaywall({
      offering: offering ?? undefined,
      displayCloseButton: true,
    });

    if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
      const updated = await getProInfo();
      useUserStore.getState().setIsPro(updated.isPro);
      trackSubscribe(0, "USD");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
