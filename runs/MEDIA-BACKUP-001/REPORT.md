# MEDIA-BACKUP-001 REPORT

Generated at: 2026-08-06T20:52:45.122Z

## Result

Physical backup mechanism: PASS for the currently valid media set.

RC2-REQ-8 gate: BLOCKED, because the original acceptance criterion requires 20 ffprobe-valid MP4 files and the current source roots contain only 12 valid MP4s.

The backup destination is D:\motion b2 backup. Windows mapped C: to DiskIndex 0 and D: to DiskIndex 1, so the selected destination is not the same physical disk index as C:.

## Evidence

- Backup ID: MEDIA_FULL_BACKUP_1786049097442
- Policy: media-full-backup
- verify_sha256: true
- media_files_included: true
- Destination root: D:\motion b2 backup
- Restore root: D:\B2-MEDIA-RESTORE-TEST\MEDIA_FULL_BACKUP_1786049097442_20260806174756
- Total files copied: 370
- Total files restored: 370
- Total source size bytes: 82723359
- Total destination size bytes: 82723359
- Total restore size bytes: 82723359
- Missing files: 0
- Hash mismatches: 0

## MP4 Validation

- MP4s discovered in source roots: 60
- Valid MP4s included: 12
- Valid MP4s copied to external destination: 12
- Valid MP4 destination hashes PASS: 12
- Valid MP4s restored to empty D: directory: 12
- Valid MP4 restore hashes PASS: 12
- Valid MP4 ffprobe PASS after restore: 12
- Invalid legacy/placeholder MP4s skipped: 48

## Blocking Condition

The source tree currently has 12 ffprobe-valid MP4 files, not 20. The 20-new-video requirement remains RC2-REQ-9 and still requires a fresh real pilot run. After that pilot, this backup test must be rerun so RC2-REQ-8 can prove 20 MP4s copied, hashed, restored, and ffprobe-approved.

## Files

- media_backup_manifest.json
- source_hashes.json
- destination_hashes.json
- restore_hashes.json
- ffprobe_restore_results.json
- backup_command_output.txt
- verify_command_output.txt
- restore_command_output.txt
- source_mp4_preflight.json
- skipped_invalid_mp4s.json
- external_destination_evidence.json
- backup_summary.json
