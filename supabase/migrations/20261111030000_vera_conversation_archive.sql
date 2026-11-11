begin;
set local lock_timeout = '3s';

-- Guest access expires independently of Voltron's retained conversation record.
create table vectra.conversation_archive (
  session_hash text primary key,
  turns jsonb not null check (jsonb_typeof(turns) = 'array'),
  retained_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table vectra.conversation_archive enable row level security;
revoke all on vectra.conversation_archive from public, anon, authenticated, service_role;

create function vectra.retain_conversation() returns trigger
language plpgsql security definer set search_path = '' as $function$
begin
  if jsonb_array_length(new.turns) > 0 then
    insert into vectra.conversation_archive(session_hash, turns)
    values (new.session_hash, new.turns)
    on conflict (session_hash) do update
      set turns = excluded.turns, updated_at = now();
  end if;
  return new;
end;
$function$;
revoke all on function vectra.retain_conversation() from public, anon, authenticated, service_role;
create trigger vera_retain_conversation
after insert or update of turns on vectra.guest_sessions
for each row execute function vectra.retain_conversation();

insert into vectra.conversation_archive(session_hash, turns)
select session_hash, turns from vectra.guest_sessions where jsonb_array_length(turns) > 0;
comment on table vectra.conversation_archive is
  'Private Voltron-retained conversations. Separate from the 24-hour guest access window; no public read policy or automatic expiry.';
commit;
