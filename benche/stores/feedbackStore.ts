import { create } from "zustand";

interface FeedbackStore {
  liked: string[];
  disliked: string[];
  addFeedback: (category: string, recommendation: string, liked: boolean) => void;
  removeFeedback: (key: string) => void;
  hydrateFromDb: (liked: string[], disliked: string[]) => void;
  reset: () => void;
}

export const useFeedbackStore = create<FeedbackStore>((set) => ({
  liked: [],
  disliked: [],
  hydrateFromDb: (liked, disliked) => set({ liked, disliked }),
  addFeedback: (category, recommendation, liked) =>
    set((state) => {
      const key = `${category}:${recommendation}`;
      if (liked) {
        return {
          liked: [...state.liked.filter((x) => x !== key), key],
          disliked: state.disliked.filter((x) => x !== key),
        };
      }
      return {
        disliked: [...state.disliked.filter((x) => x !== key), key],
        liked: state.liked.filter((x) => x !== key),
      };
    }),
  removeFeedback: (key) =>
    set((state) => ({
      liked: state.liked.filter((x) => x !== key),
      disliked: state.disliked.filter((x) => x !== key),
    })),
  reset: () => set({ liked: [], disliked: [] }),
}));
