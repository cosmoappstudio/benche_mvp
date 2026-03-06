-- Social proof aç/kapa: true = göster, false = gizle (Supabase Dashboard'dan güncellenebilir)
insert into public.app_config (key, value)
values ('social_proof_enabled', to_jsonb(true))
on conflict (key) do nothing;
