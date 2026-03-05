# Benche — Cursor Geliştirme Master Promptu v2.2

## PROJE TANIMI
Benche, kullanıcının 5 sezgisel seçim yapmasıyla (renk, sembol, element,
harf, rakam) günlük yaşam önerileri sunan bir mobil uygulamadır.
6 öneri kategorisi: Yemek, Playlist, Film, Dizi, Kitap, Aktivite.
Her öneri kullanıcının lokasyonuna, mevsime, hava durumuna ve geçmiş
beğeni/beğenmemelerine göre kişiselleştirilir.

Kullanıcılar uygulamada LOGIN OLMAZ. Supabase anonim auth ile
arka planda UUID üretilir. RevenueCat bu UUID ile çalışır.

---

## TEKNİK STACK

| Katman | Teknoloji |
|--------|-----------|
| Mobil | Expo (React Native), TypeScript |
| Backend | Supabase (PostgreSQL + Anonim Auth + Edge Functions) |
| AI | Replicate API — meta/llama-3.3-70b-instruct |
| Abonelik | RevenueCat (haftalık / aylık / yıllık) |
| Hava Durumu | Open-Meteo API (ücretsiz, API key gerektirmez) |
| Lokasyon | expo-location |
| Bildirimler | expo-notifications |
| Navigasyon | Expo Router (file-based routing) |
| State | Zustand + AsyncStorage (persist) |
| Stil | NativeWind (Tailwind for React Native) |

---

## KİMLİK YÖNETİMİ (Login Yok — Anonim Auth)

Kullanıcı hiçbir form doldurmaz, email/şifre girmez.
Uygulama ilk açılışta arka planda otomatik anonim oturum açar.

```typescript
// lib/auth.ts

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const initAnonymousSession = async () => {
  // Daha önce oluşturulmuş session var mı kontrol et
  const existingSession = await AsyncStorage.getItem('benche_session');

  if (existingSession) {
    const { access_token, refresh_token } = JSON.parse(existingSession);
    const { data } = await supabase.auth.setSession({ access_token, refresh_token });
    if (data.session) return data.session;
  }

  // Yoksa yeni anonim oturum oluştur
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;

  // Session'ı cihaza kaydet (uygulama silinene kadar kalıcı)
  await AsyncStorage.setItem('benche_session', JSON.stringify({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  }));

  return data.session;
};

// Bu fonksiyon app/_layout.tsx içinde çağrılır, kullanıcı hiçbir şey görmez
```

### RevenueCat ile entegrasyon:
```typescript
// lib/revenuecat.ts

import Purchases from 'react-native-purchases';

export const initRevenueCat = async (supabaseUserId: string) => {
  Purchases.configure({
    apiKey: process.env.EXPO_PUBLIC_REVENUECAT_KEY!,
    appUserID: supabaseUserId,  // Supabase UUID'si RevenueCat'e gönderilir
  });
};

// Kullanıcı PRO mu kontrolü:
export const checkProStatus = async (): Promise<boolean> => {
  const { entitlements } = await Purchases.getCustomerInfo();
  return entitlements.active['benche_pro'] !== undefined;
};
```

### userStore (Zustand):
```typescript
// stores/userStore.ts

interface UserStore {
  supabaseUserId: string | null;   // Anonim UUID
  isPro: boolean;
  locationCountry: string;
  locationCity: string;
  language: 'tr' | 'en' | 'de' | 'ru';
  notificationsEnabled: boolean;
  dailyUsageCount: number;         // FREE için günlük kullanım sayacı
  lastUsageDate: string;           // 'YYYY-MM-DD' formatında
}
```

---

## KLASÖR YAPISI

```
benche/
├── app/
│   ├── _layout.tsx            # Root layout — anonim auth burada init edilir
│   ├── onboarding/
│   │   ├── location.tsx       # Konum izni ekranı
│   │   └── notification.tsx   # Bildirim izni ekranı
│   ├── (tabs)/
│   │   ├── index.tsx          # Ana sayfa / Seçim ekranı
│   │   ├── favorites.tsx      # Beğendiklerim / Zevk Haritam
│   │   ├── history.tsx        # Geçmiş kartlar (PRO)
│   │   └── profile.tsx        # Profil (login yok, sadece ayarlar)
│   ├── selection.tsx          # 5 seçim akışı
│   ├── loading.tsx            # AI üretim ekranı
│   ├── results.tsx            # Günün kartı / Öneriler
│   └── paywall.tsx            # PRO abonelik ekranı
├── components/
│   ├── cards/
│   │   ├── RecommendationCard.tsx
│   │   ├── LockedCard.tsx         # Blurlu PRO kartı
│   │   ├── MiniHistoryCard.tsx
│   │   └── ShareCard.tsx
│   ├── selection/
│   │   ├── ColorPicker.tsx
│   │   ├── SymbolPicker.tsx
│   │   ├── ElementPicker.tsx
│   │   ├── LetterPicker.tsx
│   │   └── NumberPicker.tsx
│   ├── ui/
│   │   ├── GlassCard.tsx
│   │   ├── GradientButton.tsx
│   │   ├── FeedbackButtons.tsx
│   │   ├── LinkButtons.tsx
│   │   └── ProgressBand.tsx
├── lib/
│   ├── auth.ts                # Anonim auth — initAnonymousSession()
│   ├── replicate.ts
│   ├── links.ts
│   ├── permissions.ts
│   ├── supabase.ts
│   ├── revenuecat.ts
│   └── weather.ts               # Open-Meteo API entegrasyonu
├── stores/
│   ├── userStore.ts
│   ├── selectionStore.ts
│   └── feedbackStore.ts
├── constants/
│   ├── colors.ts
│   ├── symbols.ts
│   ├── elements.ts
│   └── numbers.ts
└── supabase/
    ├── migrations/
    └── functions/
        └── generate-recommendations/
            └── index.ts
```

---

## İZİN SİSTEMİ (Onboarding)

Login ekranı yok. Onboarding sadece 2 izin ekranından oluşur.
Arka planda anonim auth zaten tamamlanmış olur.

### İzin Ekranı 1 — Konum

```typescript
// lib/permissions.ts
import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') {
    const location = await Location.getCurrentPositionAsync({});
    const [address] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });
    return {
      city: address.city,
      country: address.country,
      countryCode: address.isoCountryCode
    };
  }
  return await getLocationFromIP(); // fallback
};
```

UI metni:
- Başlık: "Benche seni tanısın 📍"
- Açıklama: "Bulunduğun şehre, mevsime ve hava durumuna göre kişisel
  öneriler sunabilmek için konumuna ihtiyacımız var.
  Konum bilgin hiçbir zaman paylaşılmaz."
- Buton: "Konumumu Paylaş" / "Şimdi Değil"

### İzin Ekranı 2 — Bildirim

```typescript
import * as Notifications from 'expo-notifications';

export const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Bugünkü enerjini seç ✨",
        body: "Güne Benche ile başla — 5 seçim, tüm gün hallolsun.",
      },
      trigger: { hour: 9, minute: 0, repeats: true },
    });
  }
};
```

UI metni:
- Başlık: "Günü kaçırma 🔔"
- Açıklama: "Her sabah sana hatırlatayım. Tek bildirim, doğru zamanda."
- Buton: "Evet, Hatırlat" / "Hayır Teşekkürler"

---

## LOKASYON & KÜLTÜREL ÖZELLEŞTİRME KURALLARI

```typescript
const culturalContext = {
  country: 'TR',
  city: 'Antalya',
  language: 'tr',
  season: 'kis',
  localTime: '09:30',
  weather: 'gunesli',
  tempC: 18
};
```

### Prompt kuralları:
- **Yemek:** `{country}` mutfağından veya o ülkede yaygın erişilebilir
- **Playlist:** `{country}` pazarında Spotify/YouTube'da erişilebilir
- **Film/Dizi:** `{language}` dilinde izlenebilir, o kültürde tanınan
- **Kitap:** `{language}` dilinde mevcut baskısı olan eser
- **Aktivite:** `{city}` şehrinde, `{weather}` havada, `{season}` mevsiminde yapılabilir
- **Saat bağlamı:**
  - 06:00–11:00 → sabah enerjisi, hafif başlangıç
  - 11:00–17:00 → verimli, odak önerileri
  - 17:00–22:00 → dinlenme, sosyal öneriler
  - 22:00–06:00 → sakin, içe dönük öneriler
- **Mevsim:** Kış → sıcak yemekler, yaz → ferahlatıcı içerik

### Kültürel örnekler:
```
TR | Kış | Yağmurlu | Gece  → Mercimek çorbası | Ev bulmacası | Yılmaz Güney filmi
DE | Yaz | Güneşli | Sabah  → Frühstück | Tiergarten bisiklet | German indie
US | Sonbahar | Bulutlu     → Pumpkin soup | Central Park | American drama
RU | Kış | Karlı | Akşam   → Borscht | Ev yogası | Rus klasik müziği
```

---

## 5 SEZGİSEL INPUT

```typescript
export const COLORS = [
  { id: 'kirmizi',  label: 'Kırmızı',  hex: '#FF4444', meaning: 'Tutku ve güç' },
  { id: 'turuncu',  label: 'Turuncu',  hex: '#FF8C00', meaning: 'Enerji ve yaratıcılık' },
  { id: 'sari',     label: 'Sarı',     hex: '#FFD700', meaning: 'Neşe ve özgürlük' },
  { id: 'yesil',    label: 'Yeşil',    hex: '#00C851', meaning: 'Denge ve büyüme' },
  { id: 'turkuaz',  label: 'Turkuaz',  hex: '#00D4FF', meaning: 'Sezgi ve akış' },
  { id: 'mavi',     label: 'Mavi',     hex: '#1A52FF', meaning: 'Odak ve derinlik' },
  { id: 'lacivert', label: 'Lacivert', hex: '#4B0082', meaning: 'Bilgelik ve gizem' },
  { id: 'mor',      label: 'Mor',      hex: '#7B2FFF', meaning: 'Ruhsallık ve dönüşüm' },
  { id: 'pembe',    label: 'Pembe',    hex: '#FF6B9D', meaning: 'Sevgi ve şefkat' },
  { id: 'beyaz',    label: 'Beyaz',    hex: '#F8F8F8', meaning: 'Berraklık ve yenilik' },
  { id: 'gri',      label: 'Gri',      hex: '#888888', meaning: 'Nötr ve olgunluk' },
  { id: 'siyah',    label: 'Siyah',    hex: '#1A1A1A', meaning: 'Güç ve kararlılık' },
];

export const SYMBOLS = [
  { id: 'ay',      label: 'Ay',      icon: 'moon' },
  { id: 'gunes',   label: 'Güneş',   icon: 'sun' },
  { id: 'yildiz',  label: 'Yıldız',  icon: 'star' },
  { id: 'dalga',   label: 'Dalga',   icon: 'wave' },
  { id: 'dag',     label: 'Dağ',     icon: 'mountain' },
  { id: 'orman',   label: 'Orman',   icon: 'tree' },
  { id: 'ates',    label: 'Ateş',    icon: 'flame' },
  { id: 'kristal', label: 'Kristal', icon: 'gem' },
  { id: 'goz',     label: 'Göz',     icon: 'eye' },
  { id: 'spiral',  label: 'Spiral',  icon: 'spiral' },
];

export const ELEMENTS = [
  { id: 'ates',   label: 'Ateş',   emoji: '🔥', gradient: ['#FF4500','#FF8C00'] },
  { id: 'su',     label: 'Su',     emoji: '💧', gradient: ['#0066CC','#00BFFF'] },
  { id: 'toprak', label: 'Toprak', emoji: '🌱', gradient: ['#2D5016','#6B8F3A'] },
  { id: 'hava',   label: 'Hava',   emoji: '💨', gradient: ['#B0C4DE','#E8F4FD'] },
  { id: 'isik',   label: 'Işık',   emoji: '✨', gradient: ['#FFD700','#FFF8DC'] },
  { id: 'gece',   label: 'Gece',   emoji: '🌙', gradient: ['#1A0A2E','#4B0082'] },
];

export const NUMBERS = [
  { value: 1, meaning: 'Başlangıç ve liderlik' },
  { value: 2, meaning: 'Denge ve uyum' },
  { value: 3, meaning: 'Yaratıcılık ve ifade' },
  { value: 4, meaning: 'Kararlılık ve yapı' },
  { value: 5, meaning: 'Özgürlük ve değişim' },
  { value: 6, meaning: 'Sevgi ve sorumluluk' },
  { value: 7, meaning: 'Bilgelik ve gizem' },
  { value: 8, meaning: 'Güç ve bolluk' },
  { value: 9, meaning: 'Tamamlanma ve sezgi' },
];
```

---

## ABONELİK KURALLARI (RevenueCat)

```typescript
// FREE kullanıcı:
// - Günde sadece 1 kez kullanabilir
// - Sadece Yemek + Aktivite kartları görünür
// - Diğer 4 kart blurlu + 🔒 "PRO ile Aç" butonu
// - Lokasyon: sadece ülke
// - Dil: sadece Türkçe
// - Geçmiş: yok

// PRO kullanıcı:
// - Günlük sınırsız kullanım
// - Tüm 6 kart açık
// - Tam lokasyon zekası (şehir + hava + mevsim + saat)
// - 4 dil (TR, EN, DE, RU)
// - Watermark'sız story export
// - 6 aylık geçmiş
// - Arkadaşla karşılaştırma

// Paywall tetikleyiciler:
// 1. Günde 2. kullanım denemesi
// 2. Blurlu karta dokunma
// 3. Profil > PRO'ya Geç

const REVENUECAT_PACKAGES = {
  weekly:  { id: 'benche_weekly',  price: '₺29/hafta' },
  monthly: { id: 'benche_monthly', price: '₺69/ay'    },
  yearly:  { id: 'benche_yearly',  price: '₺499/yıl'  },
};
```

---

## VERİTABANI ŞEMASI (Supabase — Anonim Auth)

```sql
-- Supabase anonim auth ile otomatik oluşan auth.users kaydına bağlı
-- Kullanıcı hiçbir bilgi girmez, UUID otomatik atanır

create table profiles (
  id uuid references auth.users primary key,  -- anonim UUID
  location_country text,
  location_city text,
  language text default 'tr',
  is_pro boolean default false,
  notification_enabled boolean default false,
  created_at timestamptz default now()
);

-- Yeni anonim kullanıcı oluşunca otomatik profil oluştur
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

create table daily_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  selected_color text,
  selected_symbol text,
  selected_element text,
  selected_letter text,
  selected_number int,
  recommendations jsonb,
  weather_condition text,
  season text,
  created_at timestamptz default now()
);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  card_id uuid references daily_cards(id),
  category text,
  recommendation text,
  liked boolean,
  created_at timestamptz default now()
);

-- Row Level Security — kullanıcı sadece kendi verisini görür
alter table profiles    enable row level security;
alter table daily_cards enable row level security;
alter table feedback    enable row level security;

create policy "Kendi profilini gör" on profiles
  for all using (auth.uid() = id);

create policy "Kendi kartlarını gör" on daily_cards
  for all using (auth.uid() = user_id);

create policy "Kendi feedbackini gör" on feedback
  for all using (auth.uid() = user_id);
```

---

## AI PROMPT (Replicate — llama-3.3-70b-instruct)

```typescript
const buildPrompt = (input: PromptInput) => `
Sen Benche adlı bir günlük yaşam rehberi yapay zekasısın.
Kullanıcının sezgisel seçimlerine ve bağlamına göre günlük öneriler sun.

KULLANICI SEÇİMLERİ:
- Renk: ${input.color} (anlamı: ${input.colorMeaning})
- Sembol: ${input.symbol}
- Element: ${input.element}
- Harf: ${input.letter}
- Rakam: ${input.number} (anlamı: ${input.numberMeaning})

KULLANICI BAĞLAMI:
- Konum: ${input.city}, ${input.country}
- Dil: ${input.language}
- Mevsim: ${input.season}
- Saat: ${input.time}
- Hava: ${input.weather}, ${input.tempC}°C

KULLANICININ BEĞENDİKLERİ: ${input.liked.join(', ') || 'Henüz yok'}
KULLANICININ BEĞENMEDİKLERİ: ${input.disliked.join(', ') || 'Henüz yok'}

KURALLAR:
- Yemek ${input.country} mutfağından veya yaygın erişilebilir olmalı
- Playlist ${input.country} pazarında Spotify/YouTube'da erişilebilir olmalı
- Film/dizi ${input.language} dilinde izlenebilir olmalı
- Kitap ${input.language} dilinde mevcut baskısı olmalı
- Aktivite ${input.city} şehrinde, ${input.weather} havada yapılabilir olmalı
- Saat ${input.time} — buna uygun enerji seviyesinde öneriler sun
- Beğenilenlere benzer, beğenilmeyenlerden uzak öneriler sun
- Ton: Mistik ama samimi, seni tanıyan biri gibi konuş

SADECE JSON döndür, başka hiçbir şey yazma:
{
  "enerji_aciklamasi": "string",
  "yemek": {
    "ad": "string",
    "aciklama": "string",
    "search_query": "string"
  },
  "playlist": {
    "ad": "string",
    "aciklama": "string",
    "spotify_query": "string",
    "youtube_query": "string"
  },
  "film":    { "ad": "string", "aciklama": "string" },
  "dizi":    { "ad": "string", "aciklama": "string" },
  "kitap":   { "ad": "string", "aciklama": "string" },
  "aktivite":{ "ad": "string", "aciklama": "string" }
}
`;
```

---

## LİNK SİSTEMİ (lib/links.ts)

```typescript
export const generateLinks = (rec: Recommendations) => ({

  playlist: {
    spotify: `https://open.spotify.com/search/${
      encodeURIComponent(rec.playlist.spotify_query)
    }`,
    youtube: `https://music.youtube.com/search?q=${
      encodeURIComponent(rec.playlist.youtube_query)
    }`
  },

  kitap: {
    amazon: `https://www.amazon.com.tr/s?k=${
      encodeURIComponent(rec.kitap.ad)
    }`
  },

  yemek: {
    tarif: `https://www.google.com/search?q=${
      encodeURIComponent(rec.yemek.search_query + ' tarifi')
    }`
  }

});
```

---

## GÖRSEL TEMA (constants/colors.ts)

```typescript
export const colors = {
  bg:            '#0A0A1A',
  cardSurface:   'rgba(255,255,255,0.08)',
  cardBorder:    'rgba(255,255,255,0.12)',
  gradPrimary:   ['#7B2FFF', '#00D4FF'],
  gradSecondary: ['#FF6B35', '#FFD700'],
  textPrimary:   '#FFFFFF',
  textSecondary: '#A0A0C0',
  liked:         '#FF4D6D',
  disliked:      '#6B7280',

  categories: {
    yemek:    ['#FF6B35', '#FF8C00'],
    playlist: ['#7B2FFF', '#FF6B9D'],
    film:     ['#1A52FF', '#4B0082'],
    dizi:     ['#00D4FF', '#0066CC'],
    kitap:    ['#FFD700', '#FFA500'],
    aktivite: ['#00C851', '#ADFF2F'],
  }
};
```

---

## GELİŞTİRME SIRASI (MVP)

1.  `expo create benche` — TypeScript template
2.  Supabase kurulumu + anonim auth + RLS politikaları
3.  `initAnonymousSession()` — app/_layout.tsx'te otomatik çalışır
4.  RevenueCat init — Supabase UUID ile bağla
5.  Onboarding: konum izni → bildirim izni (login ekranı YOK)
6.  Seçim ekranı — 5 input UI (renk, sembol, element, harf, rakam)
7.  Replicate Edge Function + prompt sistemi
8.  Sonuç ekranı + RecommendationCard
9.  FREE kısıtı: günde 1 kullanım + 2 kart görünür, diğerleri blurlu
10. Paywall ekranı (RevenueCat)
11. ❤️ 👎 feedback sistemi + Supabase kayıt
12. Link sistemi (playlist → Spotify/YouTube, kitap → Amazon TR, yemek → Google)
13. Story export (react-native-view-shot)
14. Open-Meteo entegrasyonu (API key gerektirmez)
15. Sabah bildirimi (09:00, tekrarlayan)

---

## HAVA DURUMU (lib/weather.ts — Open-Meteo)

```typescript
// API key gerektirmez, tamamen ücretsiz

export const getWeather = async (lat: number, lon: number) => {
  const url = `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weathercode` +
    `&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  const code = data.current.weathercode;
  const tempC = Math.round(data.current.temperature_2m);

  const getCondition = (code: number): { tr: string; en: string } => {
    if (code === 0)                  return { tr: 'açık',             en: 'clear' };
    if (code <= 3)                   return { tr: 'parçalı bulutlu',  en: 'partly cloudy' };
    if (code <= 48)                  return { tr: 'sisli',            en: 'foggy' };
    if (code <= 67)                  return { tr: 'yağmurlu',         en: 'rainy' };
    if (code <= 77)                  return { tr: 'karlı',            en: 'snowy' };
    if (code <= 82)                  return { tr: 'sağanak yağışlı',  en: 'showery' };
    return                                  { tr: 'fırtınalı',        en: 'stormy' };
  };

  const condition = getCondition(code);

  return {
    tempC,
    condition: condition.tr,    // Türkçe — UI'da göster
    conditionEn: condition.en,  // İngilizce — AI prompt'a gönder
  };
};
```

---

## ENV DEĞİŞKENLERİ (.env)

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://vrfibzofqmjxwturcrho.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZmliem9mcW1qeHd0dXJjcmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDUwNjAsImV4cCI6MjA4ODI4MTA2MH0.JVreSgf_mAsV_unk_8bJu-uQZSf94fgEGPp-7I81e_g

# Replicate
REPLICATE_API_KEY=r8_NhW3BJhdwpWQhzcU0JIPCXSaByTl4qC0SkqlX

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_KEY=test_bUCSWgRwSmZaoaYIIAcBDyDLYhz
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=test_bUCSWgRwSmZaoaYIIAcBDyDLYhz

# Amplitude
EXPO_PUBLIC_AMPLITUDE_API_KEY=Rnm0BZuN-B94nu4Tl2bZBgkhRuL4o41t

# Meta SDK (ileride eklenecek — şimdilik boş bırak)
# EXPO_PUBLIC_META_APP_ID=
# EXPO_PUBLIC_META_CLIENT_TOKEN=
```

---

## ANALİTİK (lib/analytics.ts — Amplitude)

```typescript
import * as amplitude from '@amplitude/analytics-react-native';

export const initAnalytics = (userId: string) => {
  amplitude.init(process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY!, userId);
};

// Track events
export const track = (event: string, props?: Record<string, any>) => {
  amplitude.track(event, props);
};

// Kullanılacak event'ler:
// track('onboarding_location_granted')
// track('onboarding_location_denied')
// track('onboarding_notification_granted')
// track('onboarding_notification_denied')
// track('selection_completed', { color, symbol, element, letter, number })
// track('recommendation_generated')
// track('feedback_liked', { category, recommendation })
// track('feedback_disliked', { category, recommendation })
// track('paywall_viewed', { trigger }) // trigger: 'daily_limit' | 'locked_card' | 'profile'
// track('subscription_started', { package: 'weekly' | 'monthly' | 'yearly' })
// track('story_exported')
// track('link_opened', { category, platform })
```

## META SDK (lib/meta.ts — Placeholder)

```typescript
// Meta SDK ileride eklenecek
// Şimdilik boş placeholder — hazır olunca doldurulacak

export const initMeta = () => {
  // TODO: Meta SDK init
  // import { Settings, AppEventsLogger } from 'react-native-fbsdk-next';
  // Settings.initializeSDK();
};

export const trackMetaEvent = (event: string, params?: Record<string, any>) => {
  // TODO: AppEventsLogger.logEvent(event, params);
};
```
