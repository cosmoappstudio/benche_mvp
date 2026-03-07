import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "@/stores/userStore";
import { ONBOARDING_KEY } from "@/lib/auth";

export default function Index() {
  const [checked, setChecked] = useState(false);
  const [completed, setCompleted] = useState<boolean | null>(null);
  const setOnboardingComplete = useUserStore((s) => s.setOnboardingComplete);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (cancelled) return;
      const isCompleted = value === "true";
      setCompleted(isCompleted);
      setOnboardingComplete(isCompleted);
      setChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setOnboardingComplete]);

  if (!checked) {
    return null;
  }

  if (completed) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding/language" />;
}
