-- Öneri history: 7 günden eski daily_cards silinir
-- Bu fonksiyon cron veya manuel çağrılabilir

create or replace function delete_daily_cards_older_than_7_days()
returns bigint
language plpgsql
security definer
as $$
declare
  deleted_count bigint;
begin
  with deleted as (
    delete from public.daily_cards
    where created_at < now() - interval '7 days'
    returning id
  )
  select count(*) into deleted_count from deleted;
  return deleted_count;
end;
$$;

comment on function delete_daily_cards_older_than_7_days() is '7 günden eski daily_cards kayıtlarını siler. pg_cron veya harici cron ile günlük çalıştır: select delete_daily_cards_older_than_7_days();';
