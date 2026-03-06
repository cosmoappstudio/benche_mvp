import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "tr" | "en" | "de" | "es";

interface UserStore {
  supabaseUserId: string | null;
  isPro: boolean;
  interests: string[];
  locationCountry: string;
  locationCity: string;
  locationCountryCode: string;
  locationLat: number | null;
  locationLon: number | null;
  language: Language;
  notificationsEnabled: boolean;
  dailyUsageCount: number;
  lastUsageDate: string;
  onboardingComplete: boolean;
  totalPlansCreated: number;
  lastColor: string | null;
  lastSymbol: string | null;
  lastElement: string | null;
  setSupabaseUserId: (id: string | null) => void;
  setInterests: (interests: string[]) => void;
  setIsPro: (value: boolean) => void;
  setLocation: (country: string, city: string, countryCode?: string, lat?: number, lon?: number) => void;
  setLanguage: (lang: Language) => void;
  setNotificationsEnabled: (value: boolean) => void;
  incrementDailyUsage: () => void;
  setOnboardingComplete: (value: boolean) => void;
  setLastPlanStats: (color: string | null, symbol: string | null, element: string | null) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      supabaseUserId: null,
      isPro: false,
      interests: [],
      locationCountry: "",
      locationCity: "",
      locationCountryCode: "TR",
      locationLat: null,
      locationLon: null,
      language: "tr",
      notificationsEnabled: false,
      dailyUsageCount: 0,
      lastUsageDate: "",
      onboardingComplete: false,
      totalPlansCreated: 0,
      lastColor: null,
      lastSymbol: null,
      lastElement: null,
      setSupabaseUserId: (id) => set({ supabaseUserId: id }),
      setIsPro: (value) => set({ isPro: value }),
      setInterests: (interests) => set({ interests }),
      setLocation: (country, city, countryCode, lat, lon) =>
        set({
          locationCountry: country,
          locationCity: city,
          locationCountryCode: countryCode ?? "TR",
          locationLat: lat ?? null,
          locationLon: lon ?? null,
        }),
      setLanguage: (lang) => set({ language: lang }),
      setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
      incrementDailyUsage: () =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          if (state.lastUsageDate !== today) {
            return { dailyUsageCount: 1, lastUsageDate: today };
          }
          return { dailyUsageCount: state.dailyUsageCount + 1 };
        }),
      setOnboardingComplete: (value) => set({ onboardingComplete: value }),
      setLastPlanStats: (color, symbol, element) =>
        set((state) => ({
          totalPlansCreated: state.totalPlansCreated + 1,
          lastColor: color,
          lastSymbol: symbol,
          lastElement: element,
        })),
    }),
    {
      name: "benche-user",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        interests: state.interests,
        locationCountry: state.locationCountry,
        locationCity: state.locationCity,
        locationCountryCode: state.locationCountryCode,
        locationLat: state.locationLat,
        locationLon: state.locationLon,
        language: state.language,
        notificationsEnabled: state.notificationsEnabled,
        dailyUsageCount: state.dailyUsageCount,
        lastUsageDate: state.lastUsageDate,
        onboardingComplete: state.onboardingComplete,
        totalPlansCreated: state.totalPlansCreated,
        lastColor: state.lastColor,
        lastSymbol: state.lastSymbol,
        lastElement: state.lastElement,
      }),
    }
  )
);
