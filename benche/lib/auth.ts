import { supabase } from "./supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";

const SESSION_KEY = "benche_session";

export const initAnonymousSession = async (): Promise<Session | null> => {
  const existingSession = await AsyncStorage.getItem(SESSION_KEY);

  if (existingSession) {
    try {
      const { access_token, refresh_token } = JSON.parse(existingSession);
      const { data } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (data.session) return data.session;
    } catch {
      // Session invalid, create new one
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
