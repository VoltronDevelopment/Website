import { createHash, randomUUID } from "node:crypto";
import { Pool } from "pg";
import knowledge from "./published.json";
import { knowledgeVersion } from "./knowledge-version.mjs";
import type { Turn } from "./types";
import type { RankedHit } from "./retrieval";
import { databaseConfig } from "./database-config.mjs";

export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const version = knowledgeVersion(knowledge);
let pool: Pool | undefined;

export function vectraConfigured() {
  return Boolean(process.env.VECTRA_DATABASE_URL && process.env.OPENAI_API_KEY);
}

function db() {
  if (!pool) {
    if (!process.env.VECTRA_DATABASE_URL) throw new Error("Vectra database is not configured");
    pool = new Pool({ ...databaseConfig(process.env.VECTRA_DATABASE_URL), max: 3 });
    pool.on("error", () => console.error("[vectra] idle database connection failed"));
  }
  return pool;
}

let release: Promise<typeof knowledge> | undefined;
export function releaseKnowledge() {
  release ??= (async () => {
    const { rows } = await db().query<{ records: typeof knowledge }>("select records from vectra.knowledge_releases where version = $1", [version]);
    if (!rows[0] || knowledgeVersion(rows[0].records) !== version) throw new Error("Vectra knowledge release did not verify");
    return rows[0].records;
  })().catch(error => { release = undefined; throw error; });
  return release;
}

export async function searchKnowledge(question: string, embedding?: number[]): Promise<RankedHit[]> {
  const { rows } = await db().query<RankedHit>(
    `with lexical as (
       select id, row_number() over (order by ts_rank_cd(search_document, websearch_to_tsquery('english',$2)) desc, id) as rank
       from vectra.knowledge_chunks
       where release_version=$1 and search_document @@ websearch_to_tsquery('english',$2)
       order by rank limit 12
     ), semantic as (
       select id, row_number() over (order by embedding OPERATOR(extensions.<=>) $3::extensions.vector, id) as rank
       from vectra.knowledge_chunks where release_version=$1 and $3::extensions.vector is not null
       order by rank limit 12
     )
     select id, sum(120.0 / (60 + rank))::float as score
     from (select * from lexical union all select * from semantic) candidates
     group by id order by score desc, id limit 16`,
    [version, question.slice(0, 2400), embedding ? JSON.stringify(embedding) : null]);
  return rows;
}

export async function loadTurns(session: string): Promise<Turn[] | null> {
  const { rows } = await db().query<{ turns: Turn[] }>(
    "select turns from vectra.guest_sessions where session_hash = $1 and expires_at > now()", [session]);
  return rows[0]?.turns ?? null;
}

export async function createSession(session: string, previous?: string) {
  await db().query(
    `with deleted as (delete from vectra.guest_sessions where session_hash = $2)
     insert into vectra.guest_sessions(session_hash) values ($1)`,
    [session, previous ?? null]);
}

export async function takeWindow(bucket: string, max: number, expires: Date) {
  const { rowCount } = await db().query(
    `insert into vectra.request_windows(bucket, used, expires_at) values ($1, 1, $3)
     on conflict (bucket) do update set used = vectra.request_windows.used + 1
     where vectra.request_windows.used < $2`, [bucket, max, expires]);
  return rowCount === 1;
}

export async function reserveTurn(session: string) {
  const lease = randomUUID();
  const { rows } = await db().query<{ turns: Turn[] }>(
    `update vectra.guest_sessions set lease = $2, lease_until = now() + interval '45 seconds'
     where session_hash = $1 and expires_at > now()
       and (lease is null or lease_until <= now()) and jsonb_array_length(turns) < 24
     returning turns`, [session, lease]);
  return rows[0] ? { lease, turns: rows[0].turns } : null;
}

export async function finishTurn(session: string, lease: string, turn?: Turn) {
  const { rowCount } = await db().query(
    `update vectra.guest_sessions set lease = null, lease_until = null,
     turns = turns || $3::jsonb where session_hash = $1 and lease = $2 and expires_at > now()`,
    [session, lease, JSON.stringify(turn ? [turn] : [])]);
  return rowCount === 1;
}
