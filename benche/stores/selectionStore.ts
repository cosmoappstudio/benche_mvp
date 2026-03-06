import { create } from "zustand";

interface SelectionStore {
  color: string | null;
  symbol: string | null;
  element: string | null;
  letter: string | null;
  number: number | null;
  cardId: string | null;
  setColor: (color: string | null) => void;
  setSymbol: (symbol: string | null) => void;
  setElement: (element: string | null) => void;
  setLetter: (letter: string | null) => void;
  setNumber: (number: number | null) => void;
  setCardId: (id: string | null) => void;
  setFromCard: (card: {
    selected_color: string | null;
    selected_symbol: string | null;
    selected_element: string | null;
    selected_letter: string | null;
    selected_number: number | null;
  }) => void;
  reset: () => void;
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  color: null,
  symbol: null,
  element: null,
  letter: null,
  number: null,
  cardId: null,
  setColor: (color) => set({ color }),
  setSymbol: (symbol) => set({ symbol }),
  setElement: (element) => set({ element }),
  setLetter: (letter) => set({ letter }),
  setNumber: (number) => set({ number }),
  setCardId: (cardId) => set({ cardId }),
  setFromCard: (card) =>
    set({
      color: card.selected_color,
      symbol: card.selected_symbol,
      element: card.selected_element,
      letter: card.selected_letter,
      number: card.selected_number,
    }),
  reset: () =>
    set({
      color: null,
      symbol: null,
      element: null,
      letter: null,
      number: null,
      cardId: null,
    }),
}));
