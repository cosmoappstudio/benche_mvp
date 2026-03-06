-- Toplam plan sayısı, PRO paket, UTM/referrer
alter table public.profiles
add column if not exists total_plans_created int default 0,
add column if not exists pro_product_id text,
add column if not exists utm_source text,
add column if not exists utm_medium text,
add column if not exists utm_campaign text,
add column if not exists referrer text;

comment on column public.profiles.total_plans_created is 'Total daily cards/plans created by user';
comment on column public.profiles.pro_product_id is 'RevenueCat product identifier, e.g. benche_pro_monthly';
comment on column public.profiles.utm_source is 'UTM source from install/referrer';
comment on column public.profiles.utm_medium is 'UTM medium';
comment on column public.profiles.utm_campaign is 'UTM campaign';
comment on column public.profiles.referrer is 'Install or referrer URL';

-- Plan sayısı artırma (atomic) - sadece kendi profilini güncelleyebilir
create or replace function public.increment_profile_total_plans(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  if auth.uid() is distinct from p_user_id then
    return;
  end if;
  update public.profiles
  set total_plans_created = coalesce(total_plans_created, 0) + 1
  where id = p_user_id;
end;
$$;

grant execute on function public.increment_profile_total_plans(uuid) to anon;
grant execute on function public.increment_profile_total_plans(uuid) to authenticated;
