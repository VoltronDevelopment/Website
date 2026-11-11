begin;
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule(
  'vera-expired-guests',
  '17 * * * *',
  $job$
    delete from vectra.guest_sessions where expires_at <= now();
    delete from vectra.request_windows where expires_at <= now();
  $job$
);
commit;
