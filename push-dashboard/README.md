# Benche Admin Dashboard

Analytics raporları + Push notification yönetim paneli.

## Özellikler

- **Overview** — KPI kartları, dil/platform/UTM dağılımları, plan sayısı segmentasyonu, top cihazlar
- **Push** — Tüm abonelere bildirim gönder

## Vercel Deploy

1. [Vercel](https://vercel.com) → New Project → push-dashboard klasörünü seç
2. **Environment Variables** ekle:
   - `NEXT_PUBLIC_SUPABASE_URL` — Benche Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase Dashboard → Settings → API → service_role
   - `DASHBOARD_SECRET` — Rastgele güçlü string (`openssl rand -hex 32`)

3. Deploy

## Kullanım

1. Dashboard açıldığında secret girin → Giriş
2. **Overview** — Metrikleri ve grafikleri inceleyin
3. **Push** — Başlık + mesaj yazıp gönderin

## Lokal

```bash
cp .env.example .env.local
# .env.local'e gerçek değerleri yaz
npm run dev
```
