begin;
create schema if not exists extensions;
create extension if not exists vector with schema extensions;

create table vectra.knowledge_chunks (
  release_version text not null references vectra.knowledge_releases(version),
  id text not null,
  topic_id text not null,
  record jsonb not null,
  content_hash text not null,
  embedding_model text not null,
  embedding extensions.vector(1536) not null,
  search_document tsvector generated always as (
    setweight(to_tsvector('english', coalesce(record->>'title', '') || ' ' || coalesce(record->>'terms', '')), 'A') ||
    setweight(to_tsvector('english', coalesce(record->>'body', '')), 'B')
  ) stored,
  primary key (release_version, id),
  check (record->>'approval' = 'approved' and record->>'classification' = 'public_safe')
);
create index vera_chunk_topic on vectra.knowledge_chunks(release_version, topic_id);
create index vera_chunk_hash on vectra.knowledge_chunks(content_hash, embedding_model);
create index vera_chunk_search on vectra.knowledge_chunks using gin(search_document);

create table vectra.knowledge_edges (
  release_version text not null references vectra.knowledge_releases(version),
  id text not null,
  from_topic text not null,
  to_topic text not null,
  relation text not null,
  status text not null,
  primary key (release_version, id)
);
create index vera_edge_from on vectra.knowledge_edges(release_version, from_topic);
create index vera_edge_to on vectra.knowledge_edges(release_version, to_topic);
alter table vectra.knowledge_chunks enable row level security;
alter table vectra.knowledge_edges enable row level security;
revoke all on vectra.knowledge_chunks, vectra.knowledge_edges from public, anon, authenticated, service_role;
commit;
