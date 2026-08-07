# RC1 Video Audit

- Generated at: 2026-08-06T18:06:28.098Z
- Command: ffprobe -v error -show_format -show_streams -of json <arquivo>
- Result: FAIL

## Summary

- Expected files: 20
- Physical files found: 20
- Valid videos by ffprobe: 0
- Invalid/non-probeable files: 20

## Technical Finding

The 20 .mp4 files were found and hashed on disk, but ffprobe did not identify a video stream in the audited files. Width, height, codec, FPS, duration and bitrate were left null when ffprobe could not provide them. The prior 1080p claim is not supported by the physical files audited here.

## Evidence

- video_probe_results.json
- video_hashes.json
- resolution_comparison.json
- ffprobe_raw/*.json
