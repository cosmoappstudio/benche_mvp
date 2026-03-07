import { supabase } from "./supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import { useFeedbackStore } from "@/stores/feedbackStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useUserStore } from "@/stores/userStore";

const SESSION_KEY = "benche_session";
export const USER_STORE_KEY = "benche-user";
export const ONBOARDING_KEY = "onboardingCompleted";

/** Geçersiz session sonrası tüm veriyi temizle (profile silindiğinde) */
export const clearSessionAndStore = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
  await AsyncStorage.removeItem(USER_STORE_KEY);
  await AsyncStorage.removeItem(ONBOARDING_KEY);
  await supabase.auth.signOut();
  useUserStore.getState().resetStore();
  useFeedbackStore.getState().reset();
  useSelectionStore.getState().reset();
};

export const initAnonymousSession = async (): Promise<Session | null> => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error("Supabase URL veya API key eksik. EAS Environment Variables kontrol et.");
  }

  const existingSession = await AsyncStorage.getItem(SESSION_KEY);

  if (existingSession) {
    try {
      const { access_token, refresh_token } = JSON.parse(existingSession);
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) throw error;
      if (data.session) return data.session;
    } catch {
      // Invalid refresh token (user deleted) - clear everything and start fresh
      await clearSessionAndStore();
    }
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;

  if (data.session) {
    await AsyncStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })
    );
  }

  return data.session;
};
