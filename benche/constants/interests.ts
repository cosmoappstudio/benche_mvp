// İlgi alanları: onboarding'de kullanıcı 10 tane seçer
// id: API ve prompt'ta kullanılan key

export interface InterestOption {
  id: string;
  labels: Record<string, string>;
}

export const INTEREST_OPTIONS: InterestOption[] = [
  { id: "music", labels: { tr: "Müzik", en: "Music", de: "Musik", es: "Música" } },
  { id: "sports", labels: { tr: "Spor", en: "Sports", de: "Sport", es: "Deportes" } },
  { id: "food", labels: { tr: "Yemek", en: "Food", de: "Essen", es: "Comida" } },
  { id: "cinema", labels: { tr: "Sinema", en: "Cinema", de: "Kino", es: "Cine" } },
  { id: "series", labels: { tr: "Dizi", en: "TV Series", de: "Serien", es: "Series" } },
  { id: "books", labels: { tr: "Kitap", en: "Books", de: "Bücher", es: "Libros" } },
  { id: "travel", labels: { tr: "Seyahat", en: "Travel", de: "Reisen", es: "Viajes" } },
  { id: "art", labels: { tr: "Sanat", en: "Art", de: "Kunst", es: "Arte" } },
  { id: "nature", labels: { tr: "Doğa", en: "Nature", de: "Natur", es: "Naturaleza" } },
  { id: "tech", labels: { tr: "Teknoloji", en: "Technology", de: "Technologie", es: "Tecnología" } },
  { id: "fashion", labels: { tr: "Moda", en: "Fashion", de: "Mode", es: "Moda" } },
  { id: "gaming", labels: { tr: "Oyun", en: "Gaming", de: "Gaming", es: "Videojuegos" } },
  { id: "fitness", labels: { tr: "Fitness", en: "Fitness", de: "Fitness", es: "Fitness" } },
  { id: "photography", labels: { tr: "Fotoğraf", en: "Photography", de: "Fotografie", es: "Fotografía" } },
  { id: "cooking", labels: { tr: "Yemek Yapma", en: "Cooking", de: "Kochen", es: "Cocina" } },
  { id: "wellness", labels: { tr: "Wellness", en: "Wellness", de: "Wellness", es: "Bienestar" } },
  { id: "pets", labels: { tr: "Evcil Hayvanlar", en: "Pets", de: "Haustiere", es: "Mascotas" } },
  { id: "culture", labels: { tr: "Kültür", en: "Culture", de: "Kultur", es: "Cultura" } },
  { id: "science", labels: { tr: "Bilim", en: "Science", de: "Wissenschaft", es: "Ciencia" } },
  { id: "outdoor", labels: { tr: "Açık Hava", en: "Outdoor", de: "Outdoor", es: "Aire libre" } },
  { id: "diy", labels: { tr: "El İşi", en: "DIY", de: "DIY", es: "Bricolaje" } },
  { id: "podcasts", labels: { tr: "Podcast", en: "Podcasts", de: "Podcasts", es: "Podcasts" } },
  { id: "dance", labels: { tr: "Dans", en: "Dance", de: "Tanz", es: "Baile" } },
  { id: "coffee", labels: { tr: "Kahve", en: "Coffee", de: "Kaffee", es: "Café" } },
  { id: "wine", labels: { tr: "Şarap", en: "Wine", de: "Wein", es: "Vino" } },
];

export const INTERESTS_REQUIRED = 10;
