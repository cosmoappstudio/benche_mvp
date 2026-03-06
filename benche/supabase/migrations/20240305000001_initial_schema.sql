-- Benche Initial Schema
-- Anonim auth ile çalışır, kullanıcı hiçbir bilgi girmez

-- Profiles tablosu (auth.users'a bağlı)
create table if not exists public.profiles (
  id uuid references auth.users primary key,
  location_country text,
  location_city text,
  language text default 'tr',
  is_pro boolean default false,
  notification_enabled boolean default false,
  created_at timestamptz default now()
);

-- Yeni anonim kullanıcı oluşunca otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger (eğer yoksa)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Günlük kartlar
create table if not exists public.daily_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  selected_color text,
  selected_symbol text,
  selected_element text,
  selected_letter text,
  selected_number int,
  recommendations jsonb,
  weather_condition text,
  season text,
  created_at timestamptz default now()
);

-- Feedback (beğeni/beğenmeme)
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  card_id uuid references public.daily_cards(id) on delete cascade,
  category text,
  recommendation text,
  liked boolean,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.daily_cards enable row level security;
alter table public.feedback enable row level security;

-- Policies
drop policy if exists "Kendi profilini gör" on public.profiles;
create policy "Kendi profilini gör" on public.profiles
  for all using (auth.uid() = id);

drop policy if exists "Kendi kartlarını gör" on public.daily_cards;
create policy "Kendi kartlarını gör" on public.daily_cards
  for all using (auth.uid() = user_id);

drop policy if exists "Kendi feedbackini gör" on public.feedback;
create policy "Kendi feedbackini gör" on public.feedback
  for all using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_daily_cards_user_id on public.daily_cards(user_id);
create index if not exists idx_daily_cards_created_at on public.daily_cards(created_at desc);
create index if not exists idx_feedback_user_id on public.feedback(user_id);
create index if not exists idx_feedback_card_id on public.feedback(card_id);
