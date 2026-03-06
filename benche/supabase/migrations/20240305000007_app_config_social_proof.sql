-- Social proof sayısı: "X kişi bugün planladı" - Supabase Dashboard'dan güncellenebilir
insert into public.app_config (key, value)
values ('people_planned_today', to_jsonb(12450))
on conflict (key) do nothing;
