-- Auto-push configs: dashboard'dan düzenlenebilir tetikleyiciler
create table if not exists public.auto_push_config (
  id uuid primary key default gen_random_uuid(),
  trigger_type text not null unique,
  name text not null,
  title text not null default '',
  body text not null default '',
  enabled boolean default true,
  rules jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.auto_push_config is 'Otomatik push tetikleyicileri - dashboard üzerinden düzenlenir';
comment on column public.auto_push_config.trigger_type is 'daily_morning, weekend, install_1h, onboarding_24h, pro_teachvik';
comment on column public.auto_push_config.rules is 'Tetikleyiciye özel parametreler (hour, min_hours, min_plans vb.)';

-- Gönderim logu: spam önleme
create table if not exists public.push_sent_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  trigger_type text not null,
  sent_at timestamptz default now()
);

create index if not exists idx_push_sent_log_user_trigger on public.push_sent_log(user_id, trigger_type);
create index if not exists idx_push_sent_log_sent_at on public.push_sent_log(sent_at desc);

-- RLS: dashboard service role ile erişilir, app tarafı okumaz
alter table public.auto_push_config enable row level security;
alter table public.push_sent_log enable row level security;

create policy "Service role full access auto_push_config" on public.auto_push_config for all using (true);
create policy "Service role full access push_sent_log" on public.push_sent_log for all using (true);

-- Segmentler: manuel push için hedef kitle
create table if not exists public.push_segments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  rules jsonb not null default '{}',
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.push_segments is 'Manuel push için segment tanımları';
comment on column public.push_segments.rules is 'Örn: { "is_pro": false, "device_os": "ios", "total_plans_created_max": 0 }';

alter table public.push_segments enable row level security;
create policy "Service role full access push_segments" on public.push_segments for all using (true);

-- Varsayılan auto_push_config kayıtları
insert into public.auto_push_config (trigger_type, name, title, body, rules) values
  ('daily_morning', 'Günlük sabah push', 'Güne Benche ile başla 🌅', 'Bugünkü modunu seç — 5 seçim, tüm gün hallolsun.', '{"hour":8,"minute":0}'),
  ('weekend', 'Hafta sonu hatırlatması', 'Hafta sonu planın hazır mı? 🌴', 'Benche ile hafta sonunu keşfet.', '{"hour":8,"minute":0}'),
  ('install_1h', 'İndirme sonrası 1 saat', 'İlk planını oluştur ✨', '5 seçimle gününü şekillendir — 1 dakikada hazır!', '{"min_hours":1,"max_hours":2}'),
  ('onboarding_24h', 'Onboarding 24 saat', 'Hâlâ ilk planını oluşturmadın!', '1 dakikada hazır — modunu seç, önerileri al.', '{"min_hours":24,"max_hours":25}'),
  ('pro_teachvik', 'PRO teşviki (5+ plan)', '5 plan oluşturdun! ⭐', 'PRO ile sınırsız devam et — geçmiş kartlar, reklamsız deneyim.', '{"min_plans":5}')
on conflict (trigger_type) do nothing;

-- Varsayılan segmentler
insert into public.push_segments (name, description, rules, sort_order) values
  ('Tümü', 'Push tokenı olan tüm kullanıcılar', '{}', 0),
  ('PRO', 'PRO aboneleri', '{"is_pro":true}', 1),
  ('FREE', 'Ücretsiz kullanıcılar', '{"is_pro":false}', 2),
  ('iOS', 'iOS kullanıcıları', '{"device_os":"ios"}', 3),
  ('Android', 'Android kullanıcıları', '{"device_os":"android"}', 4),
  ('Türkçe', 'Türkçe dil tercihi', '{"language":"tr"}', 5),
  ('İngilizce', 'İngilizce dil tercihi', '{"language":"en"}', 6),
  ('0 plan', 'Hiç plan oluşturmamış', '{"total_plans_created_max":0}', 7),
  ('1-5 plan', 'Düşük engagement', '{"total_plans_created_min":1,"total_plans_created_max":5}', 8),
  ('6+ plan', 'Yüksek engagement', '{"total_plans_created_min":6}', 9),
  ('Yeni (7 gün)', 'Son 7 günde kayıt olanlar', '{"created_at_after":"7d"}', 10),
  ('Yeni (30 gün)', 'Son 30 günde kayıt olanlar', '{"created_at_after":"30d"}', 11);
