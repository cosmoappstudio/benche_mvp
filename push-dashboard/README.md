# Benche Push Dashboard

Expo Push Notification yönetim paneli. Tüm push abonelerine bildirim gönderir.

## Vercel Deploy

1. [Vercel](https://vercel.com) → New Project → push-dashboard klasörünü seç
2. **Environment Variables** ekle:
   - `NEXT_PUBLIC_SUPABASE_URL` — Benche Supabase URL (benche/.env'deki)
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase Dashboard → Settings → API → service_role
   - `DASHBOARD_SECRET` — Rastgele güçlü string (örn. `openssl rand -hex 32`)

3. Deploy

## Kullanım

1. Dashboard açıldığında "Dashboard Secret" alanına Vercel'deki `DASHBOARD_SECRET` değerini gir
2. "Kaydet" tıkla
3. Başlık + mesaj yaz, "Gönder" tıkla

## Lokal çalıştırma

```bash
cp .env.example .env.local
# .env.local'e gerçek değerleri yaz
npm run dev
```
