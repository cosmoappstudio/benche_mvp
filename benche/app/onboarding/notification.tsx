import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { requestNotificationPermission } from "@/lib/permissions";
import { useUserStore } from "@/stores/userStore";
import { track } from "@/lib/analytics";
import { upsertProfile } from "@/lib/db";
import { colors } from "@/constants/colors";
import { TRANSLATIONS } from "@/constants/translations";
import { Screen } from "@/components/ui/Screen";

export default function NotificationScreen() {
  const router = useRouter();
  const {
    supabaseUserId,
    setNotificationsEnabled,
    setOnboardingComplete,
    language,
    locationCountry,
    locationCity,
    interests,
  } = useUserStore();
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  const finishOnboarding = async () => {
    setOnboardingComplete(true);
    router.replace("/(tabs)");
  };

  const handleAllow = async () => {
    const { granted, expoPushToken } = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      track("onboarding_notification_granted");
    } else {
      track("onboarding_notification_denied");
    }
    if (supabaseUserId) {
      await upsertProfile({
        userId: supabaseUserId,
        language,
        locationCountry: locationCountry || undefined,
        locationCity: locationCity || undefined,
        interests: interests?.length ? interests : undefined,
        expoPushToken: expoPushToken ?? undefined,
      });
    }
    await finishOnboarding();
  };

  const handleSkip = async () => {
    track("onboarding_notification_denied");
    setNotificationsEnabled(false);
    if (supabaseUserId) {
      await upsertProfile({
        userId: supabaseUserId,
        language,
        locationCountry: locationCountry || undefined,
        locationCity: locationCity || undefined,
        interests: interests?.length ? interests : undefined,
      });
    }
    finishOnboarding();
  };

  return (
    <Screen centered padding={24}>
      <View className="absolute inset-0 overflow-hidden pointer-events-none">
        <View
          className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-20"
          style={{ backgroundColor: colors.gradSecondary[0] }}
        />
        <View
          className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-20"
          style={{ backgroundColor: colors.gradSecondary[1] }}
        />
      </View>

      <View className="z-10">
        <Text className="mb-2 text-2xl font-bold text-white text-center">
          {t.onboarding.notificationTitle} 🔔
        </Text>
        <Text className="mb-8 text-base leading-6 text-white/70 text-center">
          {t.onboarding.notificationDesc}
        </Text>

        <Pressable
          onPress={handleAllow}
          className="mb-4 overflow-hidden rounded-2xl"
        >
          <LinearGradient
            colors={colors.gradPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 16, alignItems: "center", justifyContent: "center" }}
          >
            <Text className="text-center text-lg font-semibold text-white">
              {t.onboarding.allowNotification}
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={handleSkip} className="py-3">
          <Text className="text-center text-sm text-white/50">
            {t.onboarding.skipNotification}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
