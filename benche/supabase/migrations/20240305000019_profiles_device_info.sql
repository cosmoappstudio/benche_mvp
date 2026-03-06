-- Cihaz bilgisi: OS ve model (örn. iOS - iPhone 12 mini)
alter table public.profiles
add column if not exists device_os text,
add column if not exists device_model text;

comment on column public.profiles.device_os is 'Platform: ios, android';
comment on column public.profiles.device_model is 'Device model name, e.g. iPhone 12 mini';
