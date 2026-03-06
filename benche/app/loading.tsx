import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useSelectionStore } from "@/stores/selectionStore";
import { useUserStore } from "@/stores/userStore";
import { useFeedbackStore } from "@/stores/feedbackStore";
import { useRecommendationsStore } from "@/stores/recommendationsStore";
import { saveDailyCard, updateDailyCardRecommendations, incrementProfileTotalPlans } from "@/lib/db";
import { generateRecommendations } from "@/lib/recommendations";
import { TRANSLATIONS } from "@/constants/translations";
import { colors } from "@/constants/colors";

const STEP_KEYS = ["step1", "step2", "step3"] as const;

const LOADING_COLORS = ["#FF2D55", "#AF52DE", "#32ADE6", "#FFCC00", "#FF2D55"];

function AnimatedBar({ color, delay }: { color: string; delay: number }) {
  const height = useSharedValue(20);
  useEffect(() => {
    height.value = withDelay(
      delay * 100,
      withRepeat(
        withSequence(
          withSpring(80, { damping: 8 }),
          withSpring(20, { damping: 8 })
        ),
        -1,
        true
      )
    );
  }, [delay]);
  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));
  return (
    <Animated.View
      className="w-4 rounded-full"
      style={[{ backgroundColor: color }, animatedStyle]}
    />
  );
}

export default function LoadingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  const {
    color,
    symbol,
    element,
    letter,
    number,
    setCardId,
  } = useSelectionStore();
  const {
    supabaseUserId,
    language,
    interests,
    setLastPlanStats,
    locationCity,
    locationCountry,
    locationCountryCode,
    locationLat,
    locationLon,
  } = useUserStore();
  const { liked, disliked } = useFeedbackStore();
  const { setRecommendations, setLoading, setError } = useRecommendationsStore();
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEP_KEYS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const run = async () => {
      let savedCardId: string | null = null;
      if (supabaseUserId) {
        savedCardId = await saveDailyCard({
          userId: supabaseUserId,
          selectedColor: color,
          selectedSymbol: symbol,
          selectedElement: element,
          selectedLetter: letter,
          selectedNumber: number ?? 0,
        });
        if (!cancelled && savedCardId) {
          setCardId(savedCardId);
          incrementProfileTotalPlans(supabaseUserId);
        }
      }

      const city = locationCity || "Bilinmiyor";
      const country = locationCountry || "Türkiye";
      const countryCode = locationCountryCode || "TR";

      try {
        const { recommendations } = await generateRecommendations({
          userId: supabaseUserId ?? undefined,
          color,
          symbol,
          element,
          letter,
          number: number ?? 0,
          language,
          city,
          country,
          countryCode,
          lat: locationLat ?? undefined,
          lon: locationLon ?? undefined,
          interests: interests?.length ? interests : undefined,
          liked,
          disliked,
        });
        if (!cancelled) {
          setRecommendations(recommendations);
          setLastPlanStats(color, symbol, element);
          if (supabaseUserId && savedCardId && recommendations.length > 0) {
            await updateDailyCardRecommendations(
              savedCardId,
              supabaseUserId,
              recommendations as Record<string, unknown>[]
            );
          }
          router.replace("/results");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setRecommendations([]);
          setLastPlanStats(color, symbol, element);
          router.replace("/results");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [
    supabaseUserId,
    color,
    symbol,
    element,
    letter,
    number,
    interests,
    locationCity,
    locationCountry,
    locationCountryCode,
    locationLat,
    locationLon,
    liked,
    disliked,
    setCardId,
    setRecommendations,
    setLoading,
    setError,
    setLastPlanStats,
    router,
  ]);

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{
        backgroundColor: colors.bg,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="flex-row items-end gap-2 h-32 mb-12">
        {LOADING_COLORS.map((c, i) => (
          <AnimatedBar key={i} color={c} delay={i * 0.1} />
        ))}
      </View>

      <Text className="text-2xl font-bold text-white mb-2 text-center">
        {t.loading[STEP_KEYS[stepIndex]]}
      </Text>
      <Text className="text-white/60 text-center max-w-xs text-sm">
        {t.onboarding.explanationDesc}
      </Text>
    </View>
  );
}
