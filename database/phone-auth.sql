create table public.dd_phone_accounts(phone_hash text primary key check(length(phone_hash)=64),owner_id uuid not null unique references auth.users(id) on delete cascade,created_at timestamptz not null default now());
alter table public.dd_phone_accounts enable row level security;
revoke all on public.dd_phone_accounts from anon,authenticated;
create table public.dd_auth_limits(key text primary key,window_start timestamptz not null default now(),hits integer not null default 1);
alter table public.dd_auth_limits enable row level security;
revoke all on public.dd_auth_limits from anon,authenticated;
create function public.dd_take_auth_slot(p_key text,p_limit integer,p_seconds integer) returns boolean language plpgsql security invoker set search_path='' as $$
declare v_hits integer;
begin
 insert into public.dd_auth_limits(key,hits) values(p_key,1)
 on conflict(key) do update set hits=case when public.dd_auth_limits.window_start<now()-make_interval(secs=>p_seconds) then 1 else public.dd_auth_limits.hits+1 end,window_start=case when public.dd_auth_limits.window_start<now()-make_interval(secs=>p_seconds) then now() else public.dd_auth_limits.window_start end returning hits into v_hits;
 return v_hits<=p_limit;
end;$$;
revoke all on function public.dd_take_auth_slot(text,integer,integer) from public,anon,authenticated;
grant execute on function public.dd_take_auth_slot(text,integer,integer) to service_role;
alter table public.dd_guests add column personal_message text not null default '' check(length(personal_message)<=600);
grant insert(personal_message),update(personal_message) on public.dd_guests to authenticated;
alter table public.dd_photos add column featured boolean not null default false;

create function dd_private.limit_featured() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.featured then
  perform 1 from public.dd_events where id=new.event_id for update;
  if (select count(*) from public.dd_photos where event_id=new.event_id and featured and id<>new.id)>=3 then raise exception 'Choose up to three invitation photos'; end if;
 end if;
 return new;
end; $$;
create trigger dd_featured_limit before insert or update of featured on public.dd_photos for each row execute function dd_private.limit_featured();
