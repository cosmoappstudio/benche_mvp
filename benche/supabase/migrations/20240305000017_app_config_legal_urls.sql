-- Legal & Support URLs - Supabase Dashboard'dan güncellenebilir
-- value: string (URL)
insert into public.app_config (key, value)
values
  ('privacy_policy_url', '""'::jsonb),
  ('terms_url', '""'::jsonb),
  ('eula_url', '""'::jsonb),
  ('support_url', '""'::jsonb),
  ('app_store_url', '""'::jsonb),
  ('play_store_url', '""'::jsonb)
on conflict (key) do nothing;
