import { Platform } from "react-native";
import * as Device from "expo-device";

export interface DeviceInfo {
  deviceOs: string;
  deviceModel: string;
}

/** OS ve cihaz modeli — örn. iOS, iPhone 12 mini */
export function getDeviceInfo(): DeviceInfo {
  const deviceOs = Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "unknown";
  let deviceModel = "unknown";
  try {
    if (Device.modelName) {
      deviceModel = Device.modelName;
    }
  } catch {
    // expo-device simulator'da null dönebilir
  }
  return { deviceOs, deviceModel };
}
