import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

/** Expo push token al — izin verildiyse */
export async function getExpoPushToken(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing !== "granted") return null;

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants.easConfig as { projectId?: string } | undefined)?.projectId ??
      process.env.EXPO_PUBLIC_PROJECT_ID;

    const { data } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return data ?? null;
  } catch {
    return null;
  }
}
