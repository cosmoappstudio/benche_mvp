# Supabase Kurulumu

## Tabloları Oluşturma

1. [Supabase Dashboard](https://supabase.com/dashboard) → Projeni seç
2. **SQL Editor** → **New query**
3. `migrations/20240305000001_initial_schema.sql` dosyasının içeriğini kopyala-yapıştır
4. **Run** tıkla

## Tablolar

- **profiles** — Kullanıcı profili (anonim auth ile otomatik oluşur)
- **daily_cards** — Günlük seçim kartları
- **feedback** — Beğeni/beğenmeme kayıtları

## Anonim Auth

Supabase Dashboard → **Authentication** → **Providers** → **Anonymous Sign-Ins** → **Enable**
