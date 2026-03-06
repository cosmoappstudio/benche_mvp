import { create } from "zustand";

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  reason: string;
  link?: string;
  platform?: string;
}

interface RecommendationsStore {
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
  setRecommendations: (recs: Recommendation[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

export const useRecommendationsStore = create<RecommendationsStore>((set) => ({
  recommendations: [],
  isLoading: false,
  error: null,
  setRecommendations: (recs) => set({ recommendations: recs, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (err) => set({ error: err, isLoading: false }),
  reset: () =>
    set({ recommendations: [], isLoading: false, error: null }),
}));
