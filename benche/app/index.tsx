import { Redirect } from "expo-router";
import { useUserStore } from "@/stores/userStore";

export default function Index() {
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);

  if (onboardingComplete) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding/language" />;
}
