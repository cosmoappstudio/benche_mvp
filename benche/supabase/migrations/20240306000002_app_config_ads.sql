-- TikTok / Meta App ID'leri — Supabase Dashboard'dan güncellenebilir.
-- Build almadan değiştirilebilir.
insert into public.app_config (key, value)
values
  ('tiktok_ios_app_id', '""'),
  ('tiktok_android_app_id', '""')
on conflict (key) do nothing;
