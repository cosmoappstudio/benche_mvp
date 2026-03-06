import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Outfit_700Bold } from "@expo-google-fonts/outfit";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { initAnonymousSession } from "@/lib/auth";
import { initAnalytics } from "@/lib/analytics";
import { initRevenueCat, checkProStatus } from "@/lib/revenuecat";
import { initMeta } from "@/lib/meta";
import { useUserStore } from "@/stores/userStore";
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

  const { setSupabaseUserId, setIsPro, setOnboardingComplete, language } = useUserStore();
  const t = TRANSLATIONS[language ?? "tr"] ?? TRANSLATIONS.en;

  useEffect(() => {
    if (__DEV__) setOnboardingComplete(false);
  }, [setOnboardingComplete]);

  const runBootstrap = async () => {
    try {
      const session = await initAnonymousSession();
      const userId = session?.user?.id ?? null;

      if (userId) {
        setSupabaseUserId(userId);
        try {
          initAnalytics(userId);
        } catch {
          /* Analytics optional */
        }
        try {
          await initRevenueCat(userId);
          try {
            setIsPro(await checkProStatus());
          } catch {
            setIsPro(false);
          }
        } catch {
          setIsPro(false);
        }
      }

      initMeta();
      setError(null);
    } catch (err) {
      console.error("[bootstrap] error:", err);
      setError(err instanceof Error ? err.message : "Başlatma hatası");
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    runBootstrap();
  }, [setSupabaseUserId, setIsPro]);

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
