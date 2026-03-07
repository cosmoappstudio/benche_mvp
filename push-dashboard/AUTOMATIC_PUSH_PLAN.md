# Otomatik Push Senaryoları

## Mimari Özet

- **Supabase Edge Function** veya **Vercel Cron** ile periyodik job'lar
- **pg_cron** (Supabase) veya **Vercel Cron** ile zamanlanmış tetikleyiciler
- Yeni tablo/kolonlar: `paywall_viewed_at`, `last_app_open_at` (opsiyonel)

---

## Senaryo Listesi

### 1. İndirme sonrası ilk plan hatırlatması
**Tetikleyici:** Kullanıcı indirdi, onboarding tamamladı, hiç plan oluşturmadı  
**Gecikme:** 1 saat  
**Kriter:** `created_at` 1–2 saat önce, `total_plans_created = 0`, push token var  
**Örnek mesaj:** "İlk planını oluştur — 5 seçimle gününü şekillendir ✨"

---

### 2. Günlük sabah push
**Tetikleyici:** Zamanlanmış (örn. her sabah 08:00)  
**Gecikme:** Yok (cron)  
**Kriter:** Push token var  
**Örnek mesaj:** "Güne Benche ile başla — bugünkü modunu seç 🌅"

---

### 3. Paywall abandon (satın alma yapılmadı)
**Tetikleyici:** Paywall görüldü, 10 dk içinde satın alma yok  
**Gecikme:** 10 dakika  
**Kriter:** `paywall_viewed_at` 10+ dk önce, `is_pro = false`, push token var  
**Veri ihtiyacı:** `profiles.paywall_viewed_at` (yeni kolon)  
**Örnek mesaj:** "PRO ile sınırsız plan — bugün dene 🚀"

---

### 4. Onboarding tamamlandı, ilk plan yok (24 saat)
**Tetikleyici:** Onboarding bitti, 24 saat geçti, hâlâ 0 plan  
**Gecikme:** 24 saat  
**Kriter:** `created_at` 24–25 saat önce, `total_plans_created = 0`, push token var  
**Örnek mesaj:** "Hâlâ ilk planını oluşturmadın — 1 dakikada hazır!"

---

### 5. Churn riski (7 gün aktivite yok)
**Tetikleyici:** Son 7 günde plan oluşturulmadı  
**Gecikme:** 7 gün  
**Kriter:** Son `daily_cards.created_at` 7+ gün önce VEYA hiç plan yok + `created_at` 7+ gün önce  
**Veri ihtiyacı:** `daily_cards` sorgusu veya `profiles.last_plan_at` (opsiyonel)  
**Örnek mesaj:** "Seni özledik — bugün yeni bir plan dene 💜"

---

### 6. Düşük engagement (1–2 plan, son 3 gün sessiz)
**Tetikleyici:** 1–2 plan var, son 3 günde aktivite yok  
**Gecikme:** 3 gün  
**Kriter:** `total_plans_created` 1–2, son plan 3+ gün önce  
**Örnek mesaj:** "Modun bugün nasıl? Yeni bir plan oluştur 🎨"

---

### 7. PRO teşviki (5+ plan, hâlâ FREE)
**Tetikleyici:** 5+ plan oluşturdu, PRO değil  
**Gecikme:** Son plan oluşturulduktan 1 saat sonra  
**Kriter:** `total_plans_created >= 5`, `is_pro = false`, push token var  
**Örnek mesaj:** "5 plan oluşturdun! PRO ile sınırsız devam et ⭐"

---

### 8. Hafta sonu hatırlatması
**Tetikleyici:** Cumartesi/Pazar sabahı  
**Gecikme:** Yok (cron)  
**Kriter:** Push token var, isteğe bağlı: son 7 günde plan yok  
**Örnek mesaj:** "Hafta sonu planın hazır mı? Benche ile keşfet 🌴"

---

### 9. Paywall abandon (1 saat)
**Tetikleyici:** Paywall görüldü, 1 saat içinde satın alma yok  
**Gecikme:** 1 saat  
**Kriter:** `paywall_viewed_at` 1+ saat önce, `is_pro = false`  
**Örnek mesaj:** "PRO'yu kaçırma — sınırsız plan, geçmiş kartlar, reklamsız deneyim"

---

### 10. Yeni kullanıcı (ilk 24 saat, 0 plan)
**Tetikleyici:** İndirme üzerinden 24 saat geçti, hâlâ 0 plan  
**Gecikme:** 24 saat  
**Not:** Senaryo 4 ile aynı mantık.

---

## Veri İhtiyaçları

| Alan | Tablo | Açıklama |
|------|-------|----------|
| `paywall_viewed_at` | profiles | Paywall açıldığında güncellenir |
| `last_plan_at` | profiles | Opsiyonel; `daily_cards` ile de hesaplanabilir |

---

## Teknik Uygulama Seçenekleri

### A) Supabase Edge Function + pg_cron
- pg_cron ile 5–15 dk aralıklarla job
- Edge Function: kriterlere uyan kullanıcıları bul, Expo Push API ile gönder

### B) Vercel Cron (push-dashboard)
- `vercel.json` ile cron tanımı
- API route: `/api/cron/auto-push`
- Vercel Pro gerekebilir (cron için)

### C) Harici servis (Inngest, Trigger.dev, QStash)
- Event-driven veya zamanlanmış job'lar
- Daha esnek, ek maliyet

---

## Önerilen Sıra

1. **paywall_viewed_at** kolonu + paywall açıldığında güncelleme  
2. **Günlük sabah push** (en basit)  
3. **İndirme sonrası 1 saat** (0 plan)  
4. **Paywall abandon 10 dk**  
5. **Churn 7 gün**  
6. Diğer senaryolar

---

## Spam Önleme

- Aynı kullanıcıya aynı trigger tipinden günde max 1 push
- `push_sent_log` tablosu: `user_id`, `trigger_type`, `sent_at`
- Veya `profiles.last_push_at`, `profiles.last_push_type`
