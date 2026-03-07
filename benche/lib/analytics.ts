/**
 * Amplitude analytics — lazy load ile native modül sadece init'te yüklenir
 */
let analyticsReady = false;
let amplitudeModule: typeof import("@amplitude/analytics-react-native") | null = null;

export const initAnalytics = async (userId: string): Promise<void> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY;
    if (!apiKey) return;

    amplitudeModule = await import("@amplitude/analytics-react-native");
    amplitudeModule.init(apiKey, userId);
    analyticsReady = true;
  } catch {
    analyticsReady = false;
  }
};

export const identify = (
  props: Record<string, string | number | boolean | string[]>
): void => {
  if (!analyticsReady || !amplitudeModule) return;
  try {
    const id = new amplitudeModule.Identify();
    for (const [k, v] of Object.entries(props)) {
      id.set(k, v);
    }
    amplitudeModule.identify(id);
  } catch {
    /* ignore */
  }
};

export const track = (
  event: string,
  props?: Record<string, string | number | boolean>
): void => {
  if (!analyticsReady || !amplitudeModule) return;
  try {
    amplitudeModule.track(event, props);
  } catch {
    /* ignore */
  }
};
