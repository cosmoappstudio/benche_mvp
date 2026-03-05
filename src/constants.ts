export const COLORS = [
  { id: "red", value: "#FF3B30", label: "Red", meaning: "Hype & Energy" },
  { id: "orange", value: "#FF9500", label: "Orange", meaning: "Fun & Social" },
  { id: "yellow", value: "#FFCC00", label: "Yellow", meaning: "Happy & Bright" },
  { id: "green", value: "#34C759", label: "Green", meaning: "Fresh & Chill" },
  { id: "teal", value: "#00C7BE", label: "Teal", meaning: "Creative Flow" },
  { id: "blue", value: "#32ADE6", label: "Blue", meaning: "Cool & Calm" },
  { id: "purple", value: "#AF52DE", label: "Purple", meaning: "Deep & Mysterious" },
  { id: "pink", value: "#FF2D55", label: "Pink", meaning: "Playful & Sweet" },
];

export const SYMBOLS = [
  { id: "spark", icon: "Zap", label: "Energy", gradient: "from-yellow-400 to-orange-500" },
  { id: "fire", icon: "Flame", label: "Hype", gradient: "from-red-500 to-orange-600" },
  { id: "star", icon: "Star", label: "Shine", gradient: "from-purple-400 to-pink-500" },
  { id: "music", icon: "Music", label: "Rhythm", gradient: "from-blue-400 to-indigo-500" },
  { id: "heart", icon: "Heart", label: "Love", gradient: "from-pink-500 to-rose-500" },
  { id: "diamond", icon: "Gem", label: "Luxe", gradient: "from-cyan-400 to-blue-500" },
];

export const ELEMENTS = [
  { id: "party", icon: "PartyPopper", label: "Party", gradient: "from-pink-500 to-purple-600" },
  { id: "chill", icon: "Coffee", label: "Chill", gradient: "from-green-400 to-teal-500" },
  { id: "focus", icon: "Brain", label: "Focus", gradient: "from-blue-500 to-indigo-600" },
  { id: "explore", icon: "Compass", label: "Explore", gradient: "from-orange-400 to-red-500" },
];

export const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" }
];

export const GENDERS = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "non-binary", label: "Non-binary" },
  { id: "prefer-not-to-say", label: "Prefer not to say" }
];

export type Category = "Food" | "Playlist" | "Movie" | "Series" | "Book" | "Activity";

export interface Selections {
  color: string | null;
  symbol: string | null;
  element: string | null;
  letter: string | null;
  number: number | null;
}

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  reason: string;
  link?: string;
  platform?: string;
  liked?: boolean;
  disliked?: boolean;
}

export const CATEGORIES: Record<Category, { color: string, icon: string }> = {
  Food: { color: "from-orange-400 to-red-500", icon: "Utensils" },
  Playlist: { color: "from-purple-500 to-pink-500", icon: "Music" },
  Movie: { color: "from-blue-600 to-indigo-800", icon: "Film" },
  Series: { color: "from-cyan-400 to-blue-500", icon: "Tv" },
  Book: { color: "from-yellow-400 to-amber-600", icon: "Book" },
  Activity: { color: "from-green-400 to-emerald-600", icon: "Activity" },
};
