# Tasarım Kuralları — Eksik ve Hatalı Noktalar

> **Güncelleme:** Aşağıdaki maddelerin çoğu uygulandı. Detaylar için git geçmişine bakın.

## 1. RENK & TEMA — `constants/colors.ts`

| Tasarım | Mevcut | Durum |
|---------|--------|-------|
| `background: #0A0A1A` | `bg: "#0A0A1A"` | ✅ |
| `primaryStart: #7B2FFF` | `gradPrimary[0]` | ✅ |
| `primaryEnd: #00D4FF` | `gradPrimary[1]` | ✅ |
| `secondaryStart: #FF6B35` | `gradSecondary[0]` | ✅ |
| `secondaryEnd: #FFD700` | `gradSecondary[1]` | ✅ |
| `like: #FF4D6D` | `liked: "#FF4D6D"` | ✅ |
| `dislike: #6B7280` | `disliked: "#6B7280"` | ✅ |
| `cardSurface: rgba(255,255,255,0.08)` | ✅ | ✅ |
| `cardBorder: rgba(255,255,255,0.15)` | `0.12` | ❌ 0.15 olmalı |
| `textPrimary: #FFFFFF` | `textPrimary` | ✅ |
| `textSecondary: #A0A0C0` | `textSecondary` | ✅ |

**Eksik:** Tasarımda `background`, `primaryStart` vb. isimler var; mevcut `bg`, `gradPrimary` kullanılıyor. Tutarlılık için yeni key'ler eklenebilir veya mevcut yapı korunup sadece `cardBorder` düzeltilebilir.

---

## 2. TİPOGRAFİ

| Öğe | Durum |
|-----|-------|
| Outfit (başlıklar) | ❌ Yüklü değil |
| Inter (gövde) | ❌ Yüklü değil |
| expo-font | ❌ Yüklü değil |

**Eksik:** `@expo-google-fonts/outfit`, `@expo-google-fonts/inter`, `expo-font` paketleri ve `_layout.tsx` içinde font yükleme yok.

---

## 3. GLASS CARD — `components/ui/GlassCard.tsx`

| Tasarım | Mevcut | Durum |
|---------|--------|-------|
| background: rgba(255,255,255,0.08) | ✅ | ✅ |
| border: 1px solid rgba(255,255,255,0.15) | 0.12 | ❌ |
| borderRadius: 24 | rounded-2xl (16) | ❌ 24 olmalı |
| BlurView (backdrop blur 20px) | Yok | ❌ |

**Eksik:** `expo-blur` var ama GlassCard içinde kullanılmıyor. BlurView + borderRadius 24 eklenmeli.

---

## 4. WELCOME SCREEN (Home)

| Kontrol | Durum |
|---------|-------|
| Conic gradient blur | ❌ Blur yok |
| BENCHE çift katman (beyaz + gradient) | ⚠️ Sadece gradient, mix-blend-overlay yok |
| Alt başlık text-white/80 font-medium | ✅ |
| Buton shadow-[0_0_30px_rgba(255,255,255,0.3)] | ✅ shadowRadius 30 |
| Kullanıcı kartı glass-card | ❌ rgba(255,255,255,0.05) kullanılıyor, GlassCard değil |
| Sosyal proof bandı | ✅ |
| Giriş animasyonu spring (0.8→1) | ❌ withTiming kullanılıyor, withSpring olmalı |

---

## 5. SEÇİM EKRANI

| Kontrol | Durum |
|---------|-------|
| Sticky header + 5 adım progress | ✅ |
| Renk: Paint drop SVG (daire değil) | ✅ SVG damla var |
| Seçilince y: -10, scale 1.2 | ✅ |
| Seçilen rengin glow (drop-shadow) | ❌ Yok |
| Sembol kartları 160x160 | ✅ |
| Seçilince glow ring | ❌ Yok |
| Harf: text-8xl | ❌ text-6xl kullanılıyor |
| Rakam: seçilince shadow | ❌ Yok |
| CTA: tamamlanmadan opacity-50 translate-y-20 | ⚠️ Sadece opacity 0.5 |
| CTA: tamamlanınca shimmer | ❌ Yok |

---

## 6. LOADING SCREEN

| Kontrol | Durum |
|---------|-------|
| 5 dikey bar | ✅ |
| Renkler #FF2D55, #AF52DE, #32ADE6, #FFCC00 | ✅ |
| Bar delay 0.1s stagger | ❌ delay kullanılmıyor |
| withSpring (bounce) | ❌ withTiming kullanılıyor |
| Metin 2 sn değişimi | ✅ |

---

## 7. SONUÇ EKRANI

| Kontrol | Durum |
|---------|-------|
| Seçim chip'leri | ✅ |
| "Bugünün Enerjisi" gradient-text | ❌ Düz beyaz |
| Feedback progress bandı | ✅ |
| Sol kenar 4px gradient şerit | ❌ w-1 (4px) var ama gradient değil, tek renk |
| ❤️ beğenilince shadow + confetti | ❌ Yok |
| 👎 grayscale + blur overlay | ⚠️ opacity 0.6 var, grayscale yok |
| Link butonları kategoriye göre metin | ❌ Genel "Tarifi Gör" / "Aç" |
| Alt butonlar: "Yeni Kart", "Story Paylaş", "WhatsApp" | ⚠️ "Yeni Plan", "Paylaş", "WhatsApp" |

---

## 8. KATEGORİ RENKLERİ

| Kategori | Tasarım | Mevcut |
|----------|---------|--------|
| Food | #FF9500 → #FF3B30 | #FF6B35 → #FF8C00 |
| Playlist | #AF52DE → #FF2D55 | #7B2FFF → #FF6B9D |
| Movie | #32ADE6 → #1A1A6E | #1A52FF → #4B0082 |
| Series | #00C7BE → #32ADE6 | #00D4FF → #0066CC |
| Book | #FFCC00 → #FF9500 | #FFD700 → #FFA500 |
| Activity | #34C759 → #00C7BE | #00C851 → #ADFF2F |

**Tümü farklı** — Tasarıma göre güncellenmeli.

---

## 9. ANİMASYONLAR

| Kural | Mevcut | Durum |
|-------|--------|-------|
| withSpring kullan | withTiming | ❌ Tüm ekranlarda withTiming |
| withTiming kullanma | — | ❌ |

---

## 10. ÖNCELİK SIRASI

1. **WelcomeScreen** — colors, GlassCard, spring, glass stats card
2. **SelectionScreen** — glow, text-8xl, CTA shimmer, number shadow
3. **LoadingScreen** — spring, bar stagger
4. **ResultsScreen** — gradient title, category colors, 4px strip, liked shadow, link metinleri

---

## colors.ts KULLANIMI

Mevcut kod `colors.bg`, `colors.gradPrimary`, `colors.cardBorder` vb. kullanıyor. Yeni key'ler eklense bile geriye dönük uyum için alias tutulmalı:

```typescript
// Önerilen: Yeni key'ler + alias
export const colors = {
  background: '#0A0A1A',
  primaryStart: '#7B2FFF',
  primaryEnd: '#00D4FF',
  // ... tasarım key'leri
  // Alias (mevcut kullanım için)
  bg: '#0A0A1A',
  gradPrimary: ['#7B2FFF', '#00D4FF'] as const,
  cardBorder: 'rgba(255,255,255,0.15)', // 0.12 → 0.15
  // ...
};
```
