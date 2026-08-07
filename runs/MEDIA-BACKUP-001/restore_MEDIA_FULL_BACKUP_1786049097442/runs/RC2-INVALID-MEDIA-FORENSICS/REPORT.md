# RC2 Invalid Media Forensics

Generated at: 2026-08-06T18:57:35.755Z

Result: PASS

Files investigated: 20

Classification summary: {"INVALID_CONTAINER":20}

Finding: all 20 PILOT MP4 paths are small UTF-8 text payloads, not MP4 containers. They contain the marker `REAL_FIREFLY_MP4_CONTENT_PROD_*`, which matches the previous productionPilotRunner placeholder behavior. ffprobe fails with invalid container/moov atom errors. No matching real SQLite download events were found for these PILOT files.
