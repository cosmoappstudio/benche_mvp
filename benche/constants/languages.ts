export const LANGUAGES = [
  { code: "tr" as const, name: "Türkçe", flag: "🇹🇷" },
  { code: "en" as const, name: "English", flag: "🇬🇧" },
  { code: "de" as const, name: "Deutsch", flag: "🇩🇪" },
  { code: "es" as const, name: "Español", flag: "🇪🇸" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
