-- TÜM KULLANICILARI VE VERİLERİ SIFIRLA
-- Supabase Dashboard → SQL Editor → bu scripti yapıştır → Run
-- Sıra önemli: child tablolar önce, parent en son

-- 1. Public tablolar
delete from public.feedback;
delete from public.daily_cards;
delete from public.subscriptions;
delete from public.profiles;

-- 2. Auth tabloları (auth.users'tan önce)
delete from auth.sessions;
delete from auth.refresh_tokens;
delete from auth.identities;

-- 3. Auth users
delete from auth.users;
