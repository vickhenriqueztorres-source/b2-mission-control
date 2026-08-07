# RC2-PILOT-001 REPORT

Generated at: 2026-08-06T21:22:14.965Z

## Result

RC2-REQ-9: FAIL.

The pilot stopped during PROD-01 because job 59 (RC2_PILOT_001_PROD_01_TAKE_01) transitioned to failed-infra with TimeoutError before any MP4 download or media validation. Per the gate rules, the remaining jobs were not allowed to continue.

## Counts

- Expected jobs: 20
- Jobs enqueued: 4
- Jobs done: 0
- New RC2 pilot MP4 files found: 0
- ffprobe PASS: 0
- media_validation_status PASS: 0
- .part files remaining: 0

## Failure Evidence

- worker_output.txt shows job 59 progressing to generating, repeated still_generating observations, then screen_state_read_timeout and failed-infra.
- screenshots/job_59_worker_failure.png was copied from the Firefly bot failure screenshot path.
- jobs_inventory.json records job 59 as failed-infra and jobs 60-62 as dead after abort.

## Backup RC2-002

MEDIA-BACKUP-RC2-002 was not executed because RC2-REQ-9 did not pass and there are not 20 new valid RC2-PILOT-001 MP4s to back up.
