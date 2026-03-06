import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { getExpoPushToken } from "./push";

export interface LocationResult {
  city: string;
  country: string;
  countryCode: string;
  lat?: number;
  lon?: number;
}

export interface NotificationPermissionResult {
  granted: boolean;
  expoPushToken: string | null;
}

export const requestLocationPermission = async (): Promise<
  LocationResult | null
> => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status === "granted") {
    const location = await Location.getCurrentPositionAsync({});
    const [address] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    const city = address?.city ?? "Bilinmiyor";
    const country = address?.country ?? "Bilinmiyor";
    const countryCode = address?.isoCountryCode ?? "TR";

    return {
      city,
      country,
      countryCode,
      lat: location.coords.latitude,
      lon: location.coords.longitude,
    };
  }

  return null;
};

export const requestNotificationPermission =
  async (): Promise<NotificationPermissionResult> => {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === "granted") {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Bugünkü enerjini seç ✨",
            body: "Güne Benche ile başla — 5 seçim, tüm gün hallolsun.",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 9,
            minute: 0,
          },
        });
      } catch {
        // iOS simulator veya bazı cihazlarda daily trigger çalışmayabilir
      }
      const expoPushToken = await getExpoPushToken();
      return { granted: true, expoPushToken };
    }

    return { granted: false, expoPushToken: null };
  };
