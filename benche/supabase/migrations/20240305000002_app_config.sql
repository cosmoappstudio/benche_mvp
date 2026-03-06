-- Model yapılandırması: Backend'den Replicate modeli değiştirilebilir
create table if not exists public.app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Varsayılan model
insert into public.app_config (key, value)
values (
  'replicate_model',
  '"meta/meta-llama-3-70b-instruct"'::jsonb
)
on conflict (key) do nothing;

-- RLS: Herkes okuyabilir (anon dahil)
alter table public.app_config enable row level security;
drop policy if exists "app_config_read" on public.app_config;
create policy "app_config_read" on public.app_config for select using (true);
