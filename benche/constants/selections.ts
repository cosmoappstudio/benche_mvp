export const COLORS = [
  { id: "kirmizi", label: "Kırmızı", hex: "#FF4444", meaning: "Tutku ve güç" },
  { id: "turuncu", label: "Turuncu", hex: "#FF8C00", meaning: "Enerji ve yaratıcılık" },
  { id: "sari", label: "Sarı", hex: "#FFD700", meaning: "Neşe ve özgürlük" },
  { id: "yesil", label: "Yeşil", hex: "#00C851", meaning: "Denge ve büyüme" },
  { id: "turkuaz", label: "Turkuaz", hex: "#00D4FF", meaning: "Sezgi ve akış" },
  { id: "mavi", label: "Mavi", hex: "#1A52FF", meaning: "Odak ve derinlik" },
  { id: "lacivert", label: "Lacivert", hex: "#4B0082", meaning: "Bilgelik ve gizem" },
  { id: "mor", label: "Mor", hex: "#7B2FFF", meaning: "Ruhsallık ve dönüşüm" },
  { id: "pembe", label: "Pembe", hex: "#FF6B9D", meaning: "Sevgi ve şefkat" },
  { id: "beyaz", label: "Beyaz", hex: "#F8F8F8", meaning: "Berraklık ve yenilik" },
  { id: "gri", label: "Gri", hex: "#888888", meaning: "Nötr ve olgunluk" },
  { id: "siyah", label: "Siyah", hex: "#1A1A1A", meaning: "Güç ve kararlılık" },
] as const;

export const SYMBOLS = [
  { id: "ay", label: "Ay", icon: "moon", gradient: ["#7B2FFF", "#00D4FF"] as const },
  { id: "gunes", label: "Güneş", icon: "sun", gradient: ["#FFD700", "#FF8C00"] as const },
  { id: "yildiz", label: "Yıldız", icon: "star", gradient: ["#7B2FFF", "#FF6B9D"] as const },
  { id: "dalga", label: "Dalga", icon: "wave", gradient: ["#1A52FF", "#4B0082"] as const },
  { id: "dag", label: "Dağ", icon: "mountain", gradient: ["#00D4FF", "#0066CC"] as const },
  { id: "orman", label: "Orman", icon: "tree", gradient: ["#00C851", "#ADFF2F"] as const },
  { id: "ates", label: "Ateş", icon: "flame", gradient: ["#FF4500", "#FF8C00"] as const },
  { id: "kristal", label: "Kristal", icon: "gem", gradient: ["#00D4FF", "#1A52FF"] as const },
  { id: "goz", label: "Göz", icon: "eye", gradient: ["#FF6B9D", "#7B2FFF"] as const },
  { id: "spiral", label: "Spiral", icon: "spiral", gradient: ["#7B2FFF", "#00D4FF"] as const },
] as const;

export const ELEMENTS = [
  { id: "ates", label: "Ateş", emoji: "🔥", gradient: ["#FF4500", "#FF8C00"] as const },
  { id: "su", label: "Su", emoji: "💧", gradient: ["#0066CC", "#00BFFF"] as const },
  { id: "toprak", label: "Toprak", emoji: "🌱", gradient: ["#2D5016", "#6B8F3A"] as const },
  { id: "hava", label: "Hava", emoji: "💨", gradient: ["#B0C4DE", "#E8F4FD"] as const },
  { id: "isik", label: "Işık", emoji: "✨", gradient: ["#FFD700", "#FFF8DC"] as const },
  { id: "gece", label: "Gece", emoji: "🌙", gradient: ["#1A0A2E", "#4B0082"] as const },
] as const;

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Vibe names for History Cards (symbol/element -> display name)
export const VIBE_NAMES: Record<string, Record<string, string>> = {
  kristal: { en: "Deep Calm", tr: "Derin Sakinlik", de: "Tiefe Ruhe", es: "Calma profunda" },
  ates: { en: "Wild Fire", tr: "Vahşi Ateş", de: "Wildes Feuer", es: "Fuego salvaje" },
  dalga: { en: "Ocean Flow", tr: "Okyanus Akışı", de: "Ozeanfluss", es: "Flujo oceánico" },
  toprak: { en: "Earth Root", tr: "Toprak Kökü", de: "Erdwurzel", es: "Raíz terrestre" },
  su: { en: "Ocean Flow", tr: "Okyanus Akışı", de: "Ozeanfluss", es: "Flujo oceánico" },
  ay: { en: "Moon Glow", tr: "Ay Işığı", de: "Mondlicht", es: "Brillo lunar" },
  gunes: { en: "Sun Rise", tr: "Güneş Doğuşu", de: "Sonnenaufgang", es: "Amanecer" },
  yildiz: { en: "Star Light", tr: "Yıldız Işığı", de: "Sternenlicht", es: "Luz estelar" },
  dag: { en: "Mountain Peak", tr: "Dağ Zirvesi", de: "Berggipfel", es: "Pico montaña" },
  orman: { en: "Forest Soul", tr: "Orman Ruhu", de: "Waldseele", es: "Alma del bosque" },
  goz: { en: "Inner Vision", tr: "İç Görü", de: "Innere Vision", es: "Visión interior" },
  spiral: { en: "Spiral Flow", tr: "Spiral Akış", de: "Spiralfluss", es: "Flujo espiral" },
  hava: { en: "Air Breeze", tr: "Hava Esintisi", de: "Luftbrise", es: "Brisa de aire" },
  isik: { en: "Light Shine", tr: "Işık Parıltısı", de: "Lichtschein", es: "Brillo de luz" },
  gece: { en: "Night Dream", tr: "Gece Rüyası", de: "Nachttraum", es: "Sueño nocturno" },
};

export const NUMBERS = [
  { value: 1, meaning: "Başlangıç ve liderlik" },
  { value: 2, meaning: "Denge ve uyum" },
  { value: 3, meaning: "Yaratıcılık ve ifade" },
  { value: 4, meaning: "Kararlılık ve yapı" },
  { value: 5, meaning: "Özgürlük ve değişim" },
  { value: 6, meaning: "Sevgi ve sorumluluk" },
  { value: 7, meaning: "Bilgelik ve gizem" },
  { value: 8, meaning: "Güç ve bolluk" },
  { value: 9, meaning: "Tamamlanma ve sezgi" },
] as const;
