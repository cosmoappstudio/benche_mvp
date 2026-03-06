-- Unique short user IDs (BEN-XXXXXXXX format)
-- Used in settings, support, and human-readable references

-- Generate unique short_id: BEN- + 8 alphanumeric (A-Z, 0-9)
create or replace function public.gen_short_id()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- exclude 0,O,I,1 for readability
  result text := 'BEN-';
  i int;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- Ensure uniqueness with retry
create or replace function public.ensure_short_id(p_id uuid)
returns text as $$
declare
  sid text;
  exists_count int;
begin
  select short_id into sid from public.profiles where id = p_id;
  if sid is not null and sid != '' then
    return sid;
  end if;

  loop
    sid := public.gen_short_id();
    select count(*) into exists_count from public.profiles where short_id = sid;
    exit when exists_count = 0;
  end loop;

  update public.profiles set short_id = sid where id = p_id;
  return sid;
end;
$$ language plpgsql security definer;

-- Add short_id column
alter table public.profiles add column if not exists short_id text unique;

create unique index if not exists idx_profiles_short_id on public.profiles(short_id) where short_id is not null;

-- Backfill existing profiles
do $$
declare
  r record;
  sid text;
  exists_count int;
begin
  for r in select id from public.profiles where short_id is null or short_id = '' loop
    loop
      sid := public.gen_short_id();
      select count(*) into exists_count from public.profiles where short_id = sid;
      exit when exists_count = 0;
    end loop;
    update public.profiles set short_id = sid where id = r.id;
  end loop;
end $$;

-- Update handle_new_user to set short_id on insert (retry on unique violation)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  sid text;
  exists_count int;
  max_attempts int := 10;
  attempt int := 0;
begin
  loop
    attempt := attempt + 1;
    if attempt > max_attempts then
      raise exception 'Could not generate unique short_id after % attempts', max_attempts;
    end if;
    sid := public.gen_short_id();
    select count(*) into exists_count from public.profiles where short_id = sid;
    if exists_count = 0 then
      begin
        insert into public.profiles (id, short_id) values (new.id, sid);
        return new;
      exception when unique_violation then
        null;  -- retry with new sid
      end;
    end if;
  end loop;
end;
$$ language plpgsql security definer;

-- RPC for client to ensure short_id exists (backfill on first settings view)
create or replace function public.get_or_create_short_id(p_user_id uuid)
returns text as $$
begin
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized';
  end if;
  return public.ensure_short_id(p_user_id);
end;
$$ language plpgsql security definer;

grant execute on function public.get_or_create_short_id(uuid) to authenticated;
grant execute on function public.get_or_create_short_id(uuid) to anon;
