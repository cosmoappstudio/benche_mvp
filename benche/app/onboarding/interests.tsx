import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { INTEREST_OPTIONS, INTERESTS_REQUIRED } from "@/constants/interests";
import { TRANSLATIONS } from "@/constants/translations";
import { useUserStore } from "@/stores/userStore";
import { colors } from "@/constants/colors";
import type { Language } from "@/stores/userStore";

export default function InterestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, interests, setInterests } = useUserStore();
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setInterests(interests.filter((x) => x !== id));
    } else if (interests.length < INTERESTS_REQUIRED) {
      setInterests([...interests, id]);
    }
  };

  const canContinue = interests.length >= INTERESTS_REQUIRED;

  const handleContinue = () => {
    router.push("/onboarding/location");
  };

  const labelKey = language in INTEREST_OPTIONS[0].labels ? language : "en";

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: colors.bg,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 32,
          paddingBottom: 48,
          maxWidth: 480,
          alignSelf: "center",
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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
          <Text className="text-2xl font-bold text-white mb-2 text-center">
            {t.onboarding.interestsTitle}
          </Text>
          <Text className="text-base text-white/60 mb-2 text-center">
            {t.onboarding.interestsDesc}
          </Text>
          <Text className="text-sm text-white/50 mb-6 text-center">
            {interests.length}/{INTERESTS_REQUIRED} {t.onboarding.interestsCount}
          </Text>

          <View className="flex-row flex-wrap gap-3 justify-center">
            {INTEREST_OPTIONS.map((opt) => {
              const selected = interests.includes(opt.id);
              const label = opt.labels[labelKey as keyof typeof opt.labels] ?? opt.labels.en;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => toggleInterest(opt.id)}
                  className="px-4 py-3 rounded-2xl border"
                  style={{
                    backgroundColor: selected
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(255,255,255,0.05)",
                    borderColor: selected
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text
                    className="text-base font-medium"
                    style={{
                      color: selected ? "#fff" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={handleContinue}
            disabled={!canContinue}
            className="mt-8 rounded-2xl py-4 items-center justify-center"
            style={{
              backgroundColor: canContinue ? "#fff" : "rgba(255,255,255,0.3)",
            }}
          >
            <Text
              className="text-lg font-bold"
              style={{ color: canContinue ? "#000" : "rgba(255,255,255,0.7)" }}
            >
              {t.onboarding.interestsContinue}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
