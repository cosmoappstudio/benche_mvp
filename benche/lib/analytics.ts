import * as amplitude from "@amplitude/analytics-react-native";

let analyticsReady = false;

export const initAnalytics = (userId: string): void => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY;
    if (apiKey) {
      amplitude.init(apiKey, userId);
      analyticsReady = true;
    }
  } catch {
    analyticsReady = false;
  }
};

export const track = (
  event: string,
  props?: Record<string, string | number | boolean>
): void => {
  if (!analyticsReady) return;
  try {
    amplitude.track(event, props);
  } catch {
    // Geçersiz API key vb. - uygulama çalışmaya devam etsin
  }
};
