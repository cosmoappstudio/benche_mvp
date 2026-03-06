-- İlgi alanları: onboarding'de kullanıcı 10 tane seçer
-- profiles.interests: seçilen ilgi alanı key'leri (jsonb array)

alter table public.profiles
add column if not exists interests jsonb default '[]';

comment on column public.profiles.interests is 'User selected interest keys from onboarding, e.g. ["music","sports","food"]';
