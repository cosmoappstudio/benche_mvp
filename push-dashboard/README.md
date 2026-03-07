# Benche Admin Dashboard

Analytics raporları + Push notification yönetim paneli.

## Özellikler

- **Overview** — KPI kartları, dil/platform/UTM dağılımları, plan sayısı segmentasyonu, top cihazlar
- **Push** — Segment seçerek veya tümüne bildirim gönder
- **Otomatik Push** — 5 tetikleyici: günlük sabah, hafta sonu, indirme 1 saat, onboarding 24 saat, PRO teşviki

## Vercel Deploy

1. [Vercel](https://vercel.com) → New Project → push-dashboard klasörünü seç
2. **Environment Variables** ekle:
   - `NEXT_PUBLIC_SUPABASE_URL` — Benche Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase Dashboard → Settings → API → service_role
   - `DASHBOARD_SECRET` — Rastgele güçlü string (`openssl rand -hex 32`)
   - `CRON_SECRET` — Otomatik push için (Vercel cron otomatik gönderir)

3. Deploy

## Otomatik Push Cron

`vercel.json` ile her 15 dakikada `/api/cron/auto-push` çağrılır. Vercel `CRON_SECRET`'i Bearer token olarak gönderir.

## Kullanım

1. Dashboard açıldığında secret girin → Giriş
2. **Overview** — Metrikleri ve grafikleri inceleyin
3. **Push** — Segment seç, başlık + mesaj yazıp gönder
4. **Otomatik Push** — Tetikleyicilerin metin ve kurallarını düzenle

## Lokal

```bash
cp .env.example .env.local
# .env.local'e gerçek değerleri yaz
npm run dev
```
