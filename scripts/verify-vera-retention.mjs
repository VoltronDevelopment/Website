import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { Pool } from 'pg';
import { databaseConfig } from '../lib/vectra/database-config.mjs';

let connection = process.env.VECTRA_DATABASE_URL;
if (process.argv.includes('--admin-from-file')) {
  const url = new URL(connection);
  url.username = url.username.includes('.') ? 'postgres.' + url.username.split('.').slice(1).join('.') : 'postgres';
  url.password = (await readFile('supabase password.txt', 'utf8')).trim();
  connection = url.toString();
}
const pool = new Pool({ ...databaseConfig(connection), max: 1 });
const client = await pool.connect();
try {
  const { rows } = await client.query("select to_regclass('vectra.conversation_archive') as archive");
  if (!rows[0].archive) {
    if (!process.argv.includes('--apply')) throw new Error('Apply the archive migration first');
    await client.query(await readFile('supabase/migrations/20261111030000_vera_conversation_archive.sql', 'utf8'));
    console.log('Applied private conversation archive migration.');
  }
  const app = new Pool({ ...databaseConfig(process.env.VECTRA_DATABASE_URL), max: 1 });
  const session = randomBytes(32).toString('hex');
  try {
    const first = [{ id: 'synthetic-retention-check', question: 'Synthetic retention check', reply: { text: 'Test only', enquiry: false, sources: [] } }];
    await app.query('insert into vectra.guest_sessions(session_hash) values($1)', [session]);
    await app.query('update vectra.guest_sessions set turns=$2::jsonb where session_hash=$1', [session, JSON.stringify(first)]);
    let archive = await client.query('select turns from vectra.conversation_archive where session_hash=$1', [session]);
    assert.deepEqual(archive.rows[0].turns, first);
    const updated = [...first, { ...first[0], id: 'synthetic-retention-check-2' }];
    await app.query('update vectra.guest_sessions set turns=$2::jsonb where session_hash=$1', [session, JSON.stringify(updated)]);
    await client.query("update vectra.guest_sessions set expires_at=now()-interval '1 second' where session_hash=$1", [session]);
    await app.query('delete from vectra.guest_sessions where session_hash=$1', [session]);
    archive = await client.query('select turns from vectra.conversation_archive where session_hash=$1', [session]);
    assert.deepEqual(archive.rows[0].turns, updated);
    for (const role of ['anon', 'authenticated', 'service_role', 'vectra_app']) {
      const permissions = await client.query("select has_table_privilege($1,'vectra.conversation_archive','SELECT') as allowed", [role]);
      assert.equal(permissions.rows[0].allowed, false, `${role} must not read retained conversations`);
    }
    let denied = false;
    try { await app.query('select turns from vectra.conversation_archive limit 1'); }
    catch (error) { denied = error.code === '42501'; }
    assert(denied, 'Website role must not read the archive');
    console.log('Retention passed: real website-role writes update snapshots; archives survive expired guest removal; visitor and runtime roles cannot read them.');
  } finally {
    await client.query('delete from vectra.guest_sessions where session_hash=$1', [session]);
    await client.query('delete from vectra.conversation_archive where session_hash=$1', [session]);
    await app.end();
    console.log('Removed synthetic verification records.');
  }
} catch (error) {
  await client.query('rollback').catch(() => {});
  console.error('Retention verification failed:', error.code || error.name, error.message);
  process.exitCode = 1;
} finally { client.release(); await pool.end(); }
