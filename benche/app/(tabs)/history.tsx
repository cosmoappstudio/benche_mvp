import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@/stores/userStore";
import { colors } from "@/constants/colors";
import { TRANSLATIONS } from "@/constants/translations";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const language = useUserStore((s) => s.language);
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  const router = useRouter();
  const isPro = useUserStore((s) => s.isPro);

  // Geçmiş Supabase'den gelecek — şimdilik placeholder
  const historyCards: { id: string; date: string; vibe: string; emoji: string }[] = [];

  if (!isPro) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: colors.bg,
          paddingTop: insets.top,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 80,
        }}
      >
        <View
          className="rounded-2xl p-6 items-center max-w-xs"
          style={{ backgroundColor: colors.cardSurface, borderWidth: 1, borderColor: colors.cardBorder }}
        >
          <Text className="text-4xl mb-4">🔒</Text>
          <Text className="text-xl font-bold text-white text-center mb-2">
            {t.history.proTitle}
          </Text>
          <Text className="text-white/60 text-center text-sm mb-6">
            {t.history.proDesc}
          </Text>
          <Pressable
            onPress={() => router.push("/paywall")}
            className="rounded-2xl py-3 px-6"
            style={{ backgroundColor: colors.gradPrimary[0] }}
          >
            <Text className="font-bold text-white">{t.history.goPro}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 80,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-3xl font-bold text-white mb-1">
        {t.profile?.pastCards ?? "Geçmiş Kartlar"}
      </Text>
      <Text className="text-white/60 text-sm mb-6">
        {t.history.last6Months}
      </Text>

      {historyCards.length === 0 ? (
        <View className="items-center py-12">
          <Text className="text-white/40 text-center">
            {t.history.empty}
          </Text>
          <Pressable
            onPress={() => router.push("/selection")}
            className="mt-6 rounded-2xl py-3 px-6"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <Text className="font-semibold text-white">{t.history.discover}</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-4">
            {historyCards.map((card) => (
              <View
                key={card.id}
                className="w-[45%] aspect-[3/4] rounded-2xl p-4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Text className="text-xs text-white/40 font-mono">{card.date}</Text>
                <Text className="text-2xl mt-2">{card.emoji}</Text>
                <Text className="text-sm font-bold text-white mt-1">{card.vibe}</Text>
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  );
}
