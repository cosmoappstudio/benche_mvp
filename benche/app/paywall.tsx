import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";
import { Icon } from "@/components/ui/Icon";
import { TRANSLATIONS } from "@/constants/translations";
import { colors } from "@/constants/colors";

export default function PaywallScreen() {
  const router = useRouter();
  const language = useUserStore((s) => s.language);
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  const features = [t.paywall.feature1, t.paywall.feature2, t.paywall.feature3];

  return (
    <View
      className="flex-1 p-6 justify-center items-center"
      style={{ backgroundColor: colors.bg }}
    >
      <View
        className="rounded-3xl p-8 max-w-sm w-full"
        style={{ backgroundColor: colors.cardSurface, borderWidth: 1, borderColor: colors.cardBorder }}
      >
        <View className="items-center mb-6">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(123,47,255,0.3)" }}
          >
            <Icon name="Sparkles" size={32} color={colors.gradPrimary[0]} />
          </View>
          <Text className="text-2xl font-bold text-white text-center mb-2">
            {t.paywall.title}
          </Text>
          <Text className="text-white/60 text-center text-sm">
            {t.paywall.subtitle}
          </Text>
        </View>

        <View className="gap-3 mb-4">
          {features.map((item, i) => (
            <View key={i} className="flex-row items-center gap-3">
              <Icon name="RefreshCw" size={18} color={colors.gradPrimary[0]} />
              <Text className="text-white">{item}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.back()}
          className="rounded-2xl py-4 mb-3"
          style={{ backgroundColor: colors.gradPrimary[0] }}
        >
          <Text className="text-center font-bold text-white">{t.paywall.cta}</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} className="py-4">
          <Text className="text-center text-white/50 text-sm">{t.paywall.later}</Text>
        </Pressable>
      </View>
    </View>
  );
}
