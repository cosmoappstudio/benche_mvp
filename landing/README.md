# Benche Landing Page

benche.app için app landing page. Vercel üzerinden deploy edilir.

## Geliştirme

```bash
npm install
npm run dev
```

## Deploy (Vercel)

1. [Vercel](https://vercel.com) → New Project → Import `benche_mvp` repo
2. **Root Directory**: `landing` olarak ayarla
3. **Framework Preset**: Next.js (otomatik algılanır)
4. Domain: `benche.app` ekle (Vercel Dashboard → Settings → Domains)

## Ortam Değişkenleri (gerekli)

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (benche ile aynı) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (benche ile aynı) |

Store URL'leri **Supabase `app_config`** tablosundan okunur (`app_store_url`, `play_store_url`). Dashboard'dan güncelleyebilirsin. Boşsa fallback URL'ler kullanılır.
