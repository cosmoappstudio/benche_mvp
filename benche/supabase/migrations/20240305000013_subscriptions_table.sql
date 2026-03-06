-- Subscriptions table (links to profiles via user_id)
-- For future: sync RevenueCat purchases, track plan limits, etc.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

alter table public.subscriptions enable row level security;

create policy "Kendi aboneliklerini gör" on public.subscriptions
  for all using (auth.uid() = user_id);
