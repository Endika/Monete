-- 0007 moved the tables but not the retention job: pg_cron stores its command as text,
-- so `monete-retention` kept deleting from a public.parties that no longer exists and
-- would have failed silently every night at 03:00, stopping GDPR retention.

select cron.alter_job(
  (select jobid from cron.job where jobname = 'monete-retention'),
  command => $$ delete from monete.parties
     where (data->'event'->>'startsAt')::timestamptz < now() - interval '90 days' $$
);
