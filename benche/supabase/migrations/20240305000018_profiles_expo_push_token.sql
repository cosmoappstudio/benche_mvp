-- Expo push token: remote bildirim gönderimi için
alter table public.profiles
add column if not exists expo_push_token text;

create index if not exists idx_profiles_expo_push_token on public.profiles(expo_push_token) where expo_push_token is not null;

comment on column public.profiles.expo_push_token is 'Expo push token for remote notifications (ExponentPushToken[...])';
