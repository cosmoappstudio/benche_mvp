import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { requestLocationPermission } from "@/lib/permissions";
import { useUserStore } from "@/stores/userStore";
import { track } from "@/lib/analytics";
import { colors } from "@/constants/colors";
import { TRANSLATIONS } from "@/constants/translations";
import { Screen } from "@/components/ui/Screen";

export default function LocationScreen() {
  const router = useRouter();
  const { setLocation, language } = useUserStore();
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  const handleAllow = async () => {
    const result = await requestLocationPermission();
    if (result) {
      setLocation(
        result.country,
        result.city,
        result.countryCode,
        result.lat,
        result.lon
      );
      track("onboarding_location_granted");
    } else {
      track("onboarding_location_denied");
      setLocation("Türkiye", "Bilinmiyor", "TR");
    }
    router.push("/onboarding/notification");
  };

  const handleSkip = () => {
    track("onboarding_location_denied");
    setLocation("Türkiye", "Bilinmiyor", "TR");
    router.push("/onboarding/notification");
  };

  return (
    <Screen centered padding={24}>
      <View className="absolute inset-0 overflow-hidden pointer-events-none">
        <View
          className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-20"
          style={{ backgroundColor: colors.gradPrimary[0] }}
        />
        <View
          className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-20"
          style={{ backgroundColor: colors.gradPrimary[1] }}
        />
      </View>

      <View className="z-10">
        <Text className="mb-2 text-2xl font-bold text-white text-center">
          {t.onboarding.locationTitle} 📍
        </Text>
        <Text className="mb-8 text-base leading-6 text-white/70 text-center">
          {t.onboarding.locationDesc}
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
              {t.onboarding.allowLocation}
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={handleSkip} className="py-3">
          <Text className="text-center text-sm text-white/50">
            {t.onboarding.skip}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
