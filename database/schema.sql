-- DaakDio additive schema. No existing application tables or auth settings are changed.
create schema if not exists dd_private;
revoke all on schema dd_private from public, anon, authenticated;
create table public.dd_events (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(length(title) between 1 and 120),host_names text not null check(length(host_names) between 1 and 120),
 kind text not null default 'wedding' check(kind in ('wedding','holud','birthday','aqiqah','other')),
 event_date timestamptz not null,venue text not null check(length(venue) between 1 and 160),address text not null default '' check(length(address)<=400),
 message text not null default '' check(length(message)<=800),theme text not null default 'neel' check(theme in ('neel','alta','bon','noor')),
 language text not null default 'bn' check(language in ('bn','en')),published boolean not null default false,album_enabled boolean not null default false,created_at timestamptz not null default now()
);
create index dd_events_owner on public.dd_events(owner_id);
create table public.dd_guests (
 id uuid primary key default gen_random_uuid(),event_id uuid not null references public.dd_events(id) on delete cascade,
 name text not null check(length(name) between 1 and 120),max_party integer not null default 1 check(max_party between 1 and 20),
 relationship text not null default 'family',token text not null unique default replace(gen_random_uuid()::text||gen_random_uuid()::text,'-',''),
 status text not null default 'pending' check(status in ('pending','yes','no','maybe')),party_size integer not null default 0 check(party_size>=0 and party_size<=max_party),
 note text not null default '' check(length(note)<=500),opened_at timestamptz,created_at timestamptz not null default now()
);
create index dd_guests_event on public.dd_guests(event_id);
create table public.dd_photos (
 id uuid primary key default gen_random_uuid(),event_id uuid not null references public.dd_events(id) on delete cascade,
 guest_id uuid references public.dd_guests(id) on delete set null,name text not null check(length(name)<=200),path text not null unique,
 size bigint not null check(size between 1 and 10485760),mime text not null check(mime in ('image/jpeg','image/png','image/webp')),
 ready boolean not null default false,created_at timestamptz not null default now()
);
create index dd_photos_event on public.dd_photos(event_id);
create index dd_photos_guest on public.dd_photos(guest_id);
alter table public.dd_events enable row level security;
alter table public.dd_guests enable row level security;
alter table public.dd_photos enable row level security;
revoke all on public.dd_events,public.dd_guests,public.dd_photos from anon,authenticated;
grant select,insert on public.dd_events to authenticated;
grant update(title,host_names,kind,event_date,venue,address,message,theme,language,published,album_enabled) on public.dd_events to authenticated;
grant select on public.dd_guests to authenticated;
grant insert(event_id,name,max_party,relationship) on public.dd_guests to authenticated;
grant update(name,max_party,relationship) on public.dd_guests to authenticated;
grant select on public.dd_photos to authenticated;
create policy dd_event_read on public.dd_events for select to authenticated using((select auth.uid())=owner_id);
create policy dd_event_create on public.dd_events for insert to authenticated with check((select auth.uid())=owner_id);
create policy dd_event_update on public.dd_events for update to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
create policy dd_guest_read on public.dd_guests for select to authenticated using(event_id in (select id from public.dd_events where owner_id=(select auth.uid())));
create policy dd_guest_create on public.dd_guests for insert to authenticated with check(event_id in (select id from public.dd_events where owner_id=(select auth.uid())));
create policy dd_guest_update on public.dd_guests for update to authenticated using(event_id in (select id from public.dd_events where owner_id=(select auth.uid()))) with check(event_id in (select id from public.dd_events where owner_id=(select auth.uid())));
create policy dd_photo_read on public.dd_photos for select to authenticated using(event_id in (select id from public.dd_events where owner_id=(select auth.uid())));
create function dd_private.limit_events() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or auth.uid()<>new.owner_id then raise exception 'Sign in to create an event.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(new.owner_id::text,0));
 if (select count(*) from public.dd_events where owner_id=new.owner_id)>=3 then raise exception 'Free pilot allows 3 events per account.'; end if;
 return new;
end;$$;
revoke all on function dd_private.limit_events() from public,anon,authenticated;
create trigger dd_limit_events before insert on public.dd_events for each row execute function dd_private.limit_events();
create function dd_private.limit_guests() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.dd_events where id=new.event_id and owner_id=auth.uid()) then raise exception 'Not authorized.'; end if;
 perform 1 from public.dd_events where id=new.event_id for update;
 if (select count(*) from public.dd_guests where event_id=new.event_id)>=20 then raise exception 'Free pilot allows 20 invitations per event.'; end if;
 return new;
end;$$;
revoke all on function dd_private.limit_guests() from public,anon,authenticated;
create trigger dd_limit_guests before insert on public.dd_guests for each row execute function dd_private.limit_guests();
-- This trigger is service-only; browser roles have no INSERT grant on photos.
create function dd_private.limit_photos() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 perform 1 from public.dd_events where id=new.event_id for update;
 if (select coalesce(sum(size),0) from public.dd_photos where event_id=new.event_id)+new.size>104857600 then raise exception 'This event has reached its 100 MB pilot album limit.'; end if;
 if (select count(*) from public.dd_photos where event_id=new.event_id)>=100 then raise exception 'This event has reached its 100-photo pilot limit.'; end if;
 return new;
end;$$;
revoke all on function dd_private.limit_photos() from public,anon,authenticated;
create trigger dd_limit_photos before insert on public.dd_photos for each row execute function dd_private.limit_photos();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('daakdio-albums','daakdio-albums',false,10485760,array['image/jpeg','image/png','image/webp']);
-- Storage access uses short-lived signed links issued only after token/owner authorization.
