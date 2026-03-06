import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LANGUAGES } from "@/constants/languages";
import { TRANSLATIONS } from "@/constants/translations";
import { useUserStore } from "@/stores/userStore";
import { colors } from "@/constants/colors";
import type { Language } from "@/stores/userStore";

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useUserStore();
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  const handleSelect = (code: Language) => {
    setLanguage(code);
  };

  const handleContinue = () => {
    router.push("/onboarding/interests");
  };

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
          justifyContent: "center",
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
            {t.onboarding.languageTitle}
          </Text>
          <Text className="text-base text-white/60 mb-8 text-center">
            {t.onboarding.languageDesc}
          </Text>

          <View className="gap-3">
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => handleSelect(lang.code)}
                className="flex-row items-center gap-4 p-4 rounded-2xl border"
                style={{
                  backgroundColor:
                    language === lang.code
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.05)",
                  borderColor:
                    language === lang.code ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                }}
              >
                <Text className="text-3xl">{lang.flag}</Text>
                <Text
                  className="flex-1 text-lg font-medium"
                  style={{
                    color: language === lang.code ? "#fff" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {lang.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleContinue}
            className="mt-8 rounded-2xl py-4 items-center justify-center"
            style={{ backgroundColor: "#fff" }}
          >
            <Text className="text-lg font-bold text-black">
              {t.onboarding.continue}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
