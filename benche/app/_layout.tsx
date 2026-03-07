import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Outfit_700Bold } from "@expo-google-fonts/outfit";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useUserStore } from "@/stores/userStore";
import { useFeedbackStore } from "@/stores/feedbackStore";
import { TRANSLATIONS } from "@/constants/translations";
import { colors } from "@/constants/colors";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    "Outfit-Bold": Outfit_700Bold,
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
  });

  const { setSupabaseUserId, setIsPro, resetStore, language } = useUserStore();
  const t = TRANSLATIONS[language ?? "tr"] ?? TRANSLATIONS.en;

  const runBootstrap = async () => {
    try {
      const { initAnonymousSession, clearSessionAndStore } = await import("@/lib/auth");
      const session = await initAnonymousSession();
      const userId = session?.user?.id ?? null;

      if (userId) {
        setSupabaseUserId(userId);
        setIsPro(false);
      }

      setError(null);
    } catch (err) {
      console.error("[bootstrap] error:", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Refresh Token") || msg.includes("Invalid") || msg.includes("JWT")) {
        try {
          const { clearSessionAndStore } = await import("@/lib/auth");
          await clearSessionAndStore();
        } catch {
          /* ignore */
        }
        resetStore();
        setError(null);
        return runBootstrap();
      }
      setError(msg || "Başlatma hatası");
    } finally {
      setIsReady(true);
    }
  };

  // Faz 2: SDK'lar dynamic import ile — native modüller sadece UI gösterildikten sonra yüklenir
  const runDeferredInit = async () => {
    const userId = useUserStore.getState().supabaseUserId;
    if (!userId) return;

    try {
      const { initAnalytics } = await import("@/lib/analytics");
      await initAnalytics(userId);
    } catch {
      /* Analytics optional */
    }

    try {
      const { initRevenueCat, getProInfo } = await import("@/lib/revenuecat");
      await initRevenueCat(userId);
      const proInfo = await getProInfo();
      useUserStore.getState().setIsPro(proInfo.isPro);

      const { getFeedbackForUser } = await import("@/lib/db");
      const { liked, disliked } = await getFeedbackForUser(userId);
      useFeedbackStore.getState().hydrateFromDb(liked, disliked);

      const { getInitialUtm } = await import("@/lib/utm");
      const { syncProfileProUtm } = await import("@/lib/db");
      const utm = await getInitialUtm();
      await syncProfileProUtm({
        userId,
        isPro: proInfo.isPro,
        proProductId: proInfo.productId,
        ...(utm && {
          utmSource: utm.utmSource ?? null,
          utmMedium: utm.utmMedium ?? null,
          utmCampaign: utm.utmCampaign ?? null,
          referrer: utm.referrer ?? null,
        }),
      });
    } catch {
      useUserStore.getState().setIsPro(false);
    }

  };

  useEffect(() => {
    runBootstrap();
  }, [setSupabaseUserId, setIsPro]);

  useEffect(() => {
    if (!isReady) return;
    const t = setTimeout(() => runDeferredInit(), 500);
    return () => clearTimeout(t);
  }, [isReady]);

  // Redirect is handled by app/index.tsx based on onboardingComplete

  if (!fontsLoaded || !isReady) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.bg }}
      >
        <ActivityIndicator size="large" color={colors.gradPrimary[0]} />
        <Text className="mt-4 text-white/60">{t.app.loading}</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: colors.bg }}
      >
        <Text className="text-center text-red-400 mb-4">{error || t.app.error}</Text>
        <Pressable
          onPress={() => {
            setError(null);
            setIsReady(false);
            runBootstrap();
          }}
          className="px-6 py-3 rounded-xl"
          style={{ backgroundColor: colors.gradPrimary[0] }}
        >
          <Text className="text-white font-semibold">Tekrar Dene</Text>
        </Pressable>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/language" />
        <Stack.Screen name="onboarding/interests" />
        <Stack.Screen name="onboarding/location" />
        <Stack.Screen name="onboarding/notification" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="selection" />
        <Stack.Screen name="loading" />
        <Stack.Screen name="results" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="paywall" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
