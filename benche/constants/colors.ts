export const colors = {
  // Tasarım değişkenleri (birebir)
  background: "#0A0A1A",
  primaryStart: "#7B2FFF",
  primaryEnd: "#00D4FF",
  secondaryStart: "#FF6B35",
  secondaryEnd: "#FFD700",
  like: "#FF4D6D",
  dislike: "#6B7280",
  cardSurface: "rgba(255,255,255,0.08)",
  cardBorder: "rgba(255,255,255,0.15)",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0C0",

  // Alias (mevcut kullanım için)
  bg: "#0A0A1A",
  gradPrimary: ["#7B2FFF", "#00D4FF"] as const,
  gradSecondary: ["#FF6B35", "#FFD700"] as const,
  liked: "#FF4D6D",
  disliked: "#6B7280",

  // Kategori renkleri (tasarıma göre)
  categories: {
    yemek: ["#FF9500", "#FF3B30"] as const,
    Food: ["#FF9500", "#FF3B30"] as const,
    playlist: ["#AF52DE", "#FF2D55"] as const,
    Playlist: ["#AF52DE", "#FF2D55"] as const,
    film: ["#32ADE6", "#1A1A6E"] as const,
    Movie: ["#32ADE6", "#1A1A6E"] as const,
    dizi: ["#00C7BE", "#32ADE6"] as const,
    Series: ["#00C7BE", "#32ADE6"] as const,
    kitap: ["#FFCC00", "#FF9500"] as const,
    Book: ["#FFCC00", "#FF9500"] as const,
    aktivite: ["#34C759", "#00C7BE"] as const,
    Activity: ["#34C759", "#00C7BE"] as const,
    Yemek: ["#FF9500", "#FF3B30"] as const,
    Aktivite: ["#34C759", "#00C7BE"] as const,
  },
} as const;
