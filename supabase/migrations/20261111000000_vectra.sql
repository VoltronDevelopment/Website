begin;
create schema if not exists vectra;
revoke all on schema vectra from public, anon, authenticated;

create table vectra.knowledge_releases (
  version text primary key,
  records jsonb not null check (jsonb_typeof(records) = 'array'),
  created_at timestamptz not null default now()
);

create table vectra.guest_sessions (
  session_hash text primary key,
  turns jsonb not null default '[]' check (jsonb_typeof(turns) = 'array'),
  lease uuid,
  lease_until timestamptz,
  expires_at timestamptz not null default now() + interval '1 day'
);
create index vectra_session_expiry on vectra.guest_sessions(expires_at);

create table vectra.request_windows (
  bucket text primary key,
  used integer not null check (used > 0),
  expires_at timestamptz not null
);
create index vectra_window_expiry on vectra.request_windows(expires_at);

alter table vectra.knowledge_releases enable row level security;
alter table vectra.guest_sessions enable row level security;
alter table vectra.request_windows enable row level security;

revoke all on all tables in schema vectra from public, anon, authenticated, service_role;
commit;
