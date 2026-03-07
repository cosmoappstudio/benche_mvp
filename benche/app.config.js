const buildNumber = process.env.EAS_BUILD_NUMBER
  ? String(process.env.EAS_BUILD_NUMBER)
  : "1";

const appJson = {
  expo: {
    scheme: "benche",
    name: "benche",
    slug: "benche",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0A0A1A",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.mavkaistudio.benche",
      buildNumber: "8",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "Bulunduğun şehre göre kişisel öneriler sunmak için konumuna ihtiyacımız var.",
        NSUserNotificationUsageDescription:
          "Sabah enerjini seçmen için günlük hatırlatma göndermek istiyoruz.",
      },
    },
    android: {
      package: "com.mavkaistudio.benche",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Bulunduğun şehre göre kişisel öneriler sunmak için konumuna ihtiyacımız var.",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#7B2FFF",
        },
      ],
    ],
  },
};

module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      buildNumber,
    },
    updates: {
      url: "https://u.expo.dev/6adc5b29-95dd-4731-83cf-22cb91697739",
      checkAutomatically: "NEVER",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    extra: {
      ...appJson.expo.extra,
      eas: {
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID || "6adc5b29-95dd-4731-83cf-22cb91697739",
      },
    },
  },
};
