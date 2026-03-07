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
  weeklyUsageCount: number;
  lastWeekKey: string;
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
  incrementWeeklyUsage: () => void;
  canRequestRecommendation: () => boolean;
  setOnboardingComplete: (value: boolean) => void;
  setLastPlanStats: (color: string | null, symbol: string | null, element: string | null) => void;
  resetStore: () => void;
}

function getWeekKey(d: Date): string {
  const start = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const weekNum = Math.ceil(dayOfYear / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
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
      weeklyUsageCount: 0,
      lastWeekKey: "",
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
      incrementWeeklyUsage: () =>
        set((state) => {
          const currentWeek = getWeekKey(new Date());
          if (state.lastWeekKey !== currentWeek) {
            return { weeklyUsageCount: 1, lastWeekKey: currentWeek };
          }
          return { weeklyUsageCount: Math.min(state.weeklyUsageCount + 1, 999) };
        }),
      canRequestRecommendation: () => {
        const state = get();
        if (state.isPro) return true;
        const currentWeek = getWeekKey(new Date());
        if (state.lastWeekKey !== currentWeek) return true;
        return state.weeklyUsageCount < 2;
      },
      setOnboardingComplete: (value) => set({ onboardingComplete: value }),
      setLastPlanStats: (color, symbol, element) =>
        set((state) => ({
          totalPlansCreated: state.totalPlansCreated + 1,
          lastColor: color,
          lastSymbol: symbol,
          lastElement: element,
        })),
      resetStore: () =>
        set({
          supabaseUserId: null,
          interests: [],
          locationCountry: "",
          locationCity: "",
          locationCountryCode: "TR",
          language: "tr",
          notificationsEnabled: false,
          onboardingComplete: false,
          totalPlansCreated: 0,
          weeklyUsageCount: 0,
          lastWeekKey: "",
          lastColor: null,
          lastSymbol: null,
          lastElement: null,
        }),
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
        weeklyUsageCount: state.weeklyUsageCount,
        lastWeekKey: state.lastWeekKey,
        onboardingComplete: state.onboardingComplete,
        totalPlansCreated: state.totalPlansCreated,
        lastColor: state.lastColor,
        lastSymbol: state.lastSymbol,
        lastElement: state.lastElement,
      }),
    }
  )
);
