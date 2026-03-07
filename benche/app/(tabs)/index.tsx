import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPeoplePlannedToday, getSocialProofEnabled } from "@/lib/appConfig";
import { useUserStore } from "@/stores/userStore";
import { track } from "@/lib/analytics";
import { colors } from "@/constants/colors";
import { TRANSLATIONS } from "@/constants/translations";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const language = useUserStore((s) => s.language);
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] ?? TRANSLATIONS.en;

  const [peoplePlanned, setPeoplePlanned] = useState<number | null>(null);
  const [socialProofEnabled, setSocialProofEnabled] = useState(true);

  useEffect(() => {
    Promise.all([getPeoplePlannedToday(), getSocialProofEnabled()]).then(
      ([count, enabled]) => {
        setPeoplePlanned(count);
        setSocialProofEnabled(enabled);
      }
    );
  }, []);

  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(10);
  const subtitleOpacity = useSharedValue(0);
  const buttonY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const socialOpacity = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 5000 }),
        withTiming(1, { duration: 5000 })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12 });
    logoOpacity.value = withSpring(1);
    subtitleY.value = withSpring(0);
    subtitleOpacity.value = withDelay(200, withSpring(1));
    buttonY.value = withDelay(400, withSpring(0));
    buttonOpacity.value = withDelay(400, withSpring(1));
    socialOpacity.value = withDelay(600, withSpring(1));
  }, []);

  const conicStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: scale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: subtitleY.value }],
    opacity: subtitleOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonY.value }],
    opacity: buttonOpacity.value,
  }));

  const socialStyle = useAnimatedStyle(() => ({
    opacity: socialOpacity.value,
  }));

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 80,
        paddingHorizontal: 24,
        justifyContent: "center",
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Conic gradient background */}
      <Animated.View
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-20"
        style={conicStyle}
      >
        <LinearGradient
          colors={["transparent", "#FF2D55", "transparent", "#AF52DE", "transparent"]}
          locations={[0, 0.1, 0.2, 0.4, 0.5]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, width: "100%", height: "100%" }}
        />
      </Animated.View>

      <View className="z-10 items-center w-full max-w-md self-center">
        {/* BENCHE Logo - gradient text */}
        <Animated.View className="mb-6 items-center" style={logoStyle}>
          <MaskedView
            maskElement={
              <Text className="text-6xl font-black italic tracking-tighter text-white">
                BENCHE
              </Text>
            }
          >
            <LinearGradient
              colors={["#FF2D55", "#AF52DE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 4 }}
            >
              <Text className="text-6xl font-black italic tracking-tighter" style={{ opacity: 0 }}>
                BENCHE
              </Text>
            </LinearGradient>
          </MaskedView>
        </Animated.View>

        <Animated.Text
          className="text-xl text-white/80 mb-8 max-w-xs text-center font-medium"
          style={subtitleStyle}
        >
          {t.welcome.subtitle}
        </Animated.Text>

        <Animated.View className="w-full max-w-xs" style={buttonStyle}>
          <Pressable
            onPress={() => {
              track("home_lets_go_clicked");
              router.push("/selection");
            }}
            className="w-full"
          >
            <View
              className="rounded-2xl py-4 items-center justify-center w-full"
              style={{
                backgroundColor: "#fff",
                shadowColor: "#fff",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 30,
              }}
            >
              <Text className="text-lg font-bold text-black">
                {(t.welcome as { letsGo?: string }).letsGo ?? t.welcome.start}
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Social Proof */}
        {socialProofEnabled && (
          <Animated.View
            className="mt-8 flex-row items-center gap-3 px-4 py-2 rounded-full"
            style={[
              socialStyle,
              {
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              },
            ]}
          >
            <View className="flex-row items-center" style={{ marginLeft: -8 }}>
              {["#FF6B9D", "#7B2FFF", "#00D4FF"].map((color, i) => (
                <View
                  key={i}
                  className="w-6 h-6 rounded-full border-2"
                  style={{
                    marginLeft: i > 0 ? -8 : 0,
                    backgroundColor: color,
                    borderColor: colors.bg,
                  }}
                />
              ))}
            </View>
            <Text className="text-xs text-white/60">
              <Text className="font-bold text-white">
                {peoplePlanned != null
                  ? `${peoplePlanned.toLocaleString(language === "tr" ? "tr-TR" : "en-US")}+`
                  : "12,450+"}
              </Text>{" "}
              {t.home.peoplePlanned}
            </Text>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}
