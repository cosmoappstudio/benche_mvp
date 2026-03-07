/**
 * Meta conversion eventleri — AppEventsLogger ile
 */
import { AppEventsLogger } from "react-native-fbsdk-next";

export function trackCompleteRegistration(): void {
  try {
    AppEventsLogger.logEvent(AppEventsLogger.AppEvents.CompletedRegistration, {
      [AppEventsLogger.AppEventParams.RegistrationMethod]: "onboarding",
    });
  } catch (e) {
    if (__DEV__) console.warn("[adsTracking] CompleteRegistration failed:", e);
  }
}

export function trackViewContent(contentType: string, contentId?: string): void {
  try {
    const params: Record<string, string | number> = {
      [AppEventsLogger.AppEventParams.ContentType]: contentType,
    };
    if (contentId) params[AppEventsLogger.AppEventParams.ContentID] = contentId;
    AppEventsLogger.logEvent(AppEventsLogger.AppEvents.ViewedContent, params);
  } catch (e) {
    if (__DEV__) console.warn("[adsTracking] ViewContent failed:", e);
  }
}

export function trackSubscribe(value: number, currency: string): void {
  try {
    // Subscribe event: valueToSum + Currency (subscription conversion)
    AppEventsLogger.logEvent(
      AppEventsLogger.AppEvents.Subscribe,
      value,
      { [AppEventsLogger.AppEventParams.Currency]: currency }
    );
  } catch (e) {
    if (__DEV__) console.warn("[adsTracking] Subscribe failed:", e);
  }
}
