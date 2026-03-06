import { TRANSLATIONS } from "@/constants/translations";
import { COLORS, SYMBOLS, ELEMENTS, VIBE_NAMES } from "@/constants/selections";
import type { Language } from "@/stores/userStore";

const SELECTION_LABELS: Record<Language, Record<string, Record<string, string>>> = {
  tr: {
    colors: Object.fromEntries(COLORS.map((c) => [c.id, c.label])),
    symbols: Object.fromEntries(SYMBOLS.map((s) => [s.id, s.label])),
    elements: Object.fromEntries(ELEMENTS.map((e) => [e.id, e.label])),
  },
  en: {
    colors: { kirmizi: "Red", turuncu: "Orange", sari: "Yellow", yesil: "Green", turkuaz: "Teal", mavi: "Blue", lacivert: "Indigo", mor: "Purple", pembe: "Pink", beyaz: "White", gri: "Gray", siyah: "Black" },
    symbols: { ay: "Moon", gunes: "Sun", yildiz: "Star", dalga: "Wave", dag: "Mountain", orman: "Forest", ates: "Fire", kristal: "Crystal", goz: "Eye", spiral: "Spiral" },
    elements: { ates: "Fire", su: "Water", toprak: "Earth", hava: "Air", isik: "Light", gece: "Night" },
  },
  de: {
    colors: { kirmizi: "Rot", turuncu: "Orange", sari: "Gelb", yesil: "Grün", turkuaz: "Türkis", mavi: "Blau", lacivert: "Indigo", mor: "Lila", pembe: "Rosa", beyaz: "Weiß", gri: "Grau", siyah: "Schwarz" },
    symbols: { ay: "Mond", gunes: "Sonne", yildiz: "Stern", dalga: "Welle", dag: "Berg", orman: "Wald", ates: "Feuer", kristal: "Kristall", goz: "Auge", spiral: "Spirale" },
    elements: { ates: "Feuer", su: "Wasser", toprak: "Erde", hava: "Luft", isik: "Licht", gece: "Nacht" },
  },
  es: {
    colors: { kirmizi: "Rojo", turuncu: "Naranja", sari: "Amarillo", yesil: "Verde", turkuaz: "Turquesa", mavi: "Azul", lacivert: "Índigo", mor: "Morado", pembe: "Rosa", beyaz: "Blanco", gri: "Gris", siyah: "Negro" },
    symbols: { ay: "Luna", gunes: "Sol", yildiz: "Estrella", dalga: "Ola", dag: "Montaña", orman: "Bosque", ates: "Fuego", kristal: "Cristal", goz: "Ojo", spiral: "Espiral" },
    elements: { ates: "Fuego", su: "Agua", toprak: "Tierra", hava: "Aire", isik: "Luz", gece: "Noche" },
  },
};

/** Renk, sembol veya element etiketini dile göre döndür */
export function getSelectionLabel(
  type: "color" | "symbol" | "element",
  id: string,
  lang: Language
): string {
  return SELECTION_LABELS[lang]?.[`${type}s`]?.[id] ?? SELECTION_LABELS.tr[`${type}s`]?.[id] ?? id;
}

/** Kart için vibe adı ve emoji döndür (symbol veya element öncelikli) */
export function getVibeForCard(
  symbol: string | null,
  element: string | null,
  lang: Language
): { vibe: string; emoji: string } {
  const langKey = lang === "tr" ? "tr" : lang === "de" ? "de" : lang === "es" ? "es" : "en";
  const id = symbol || element || "kristal";
  const vibe = VIBE_NAMES[id]?.[langKey] ?? VIBE_NAMES[id]?.en ?? getSelectionLabel("symbol", id, lang);
  const el = element ? ELEMENTS.find((e) => e.id === element) : null;
  const emoji = el?.emoji ?? "🔮";
  return { vibe, emoji };
}
