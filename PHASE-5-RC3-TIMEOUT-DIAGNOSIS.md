# PHASE-5-RC3-TIMEOUT-DIAGNOSIS

Generated at: 2026-08-06T22:28:12Z
Candidate: v1.0.0-rc3

## Executive Decision

RC3 remediation is approved for the single-job diagnostic gate. The RC2 pilot failure was traced to an internal StateReader timeout/observability failure, not to a proven Firefly provider timeout. The smallest correction was applied: a StateReader recovery timeout no longer escalates directly to `failed-infra` inside the generation budget, and the worker now persists traceback, URL, HTML, DOM summary, selector diagnostics, per-poll timing, and optional screenshots.

`RC3-MEDIA-E2E-001` passed with one real Firefly job. It reached `RESULT_READY`, downloaded a real MP4, validated it with ffprobe, calculated SHA-256, and marked the job `done` only after media validation.

`RC2-REQ-9` remains **FAIL** for RC2 and the 20-job pilot remains **BLOCKED / NOT RESTARTED**. No new 20-video pilot was executed during this phase.

## Evidence Index

- Timeout diagnosis: `runs/RC3-TIMEOUT-DIAG-001/`
- Job cleanup: `runs/RC3-TIMEOUT-DIAG-001/job_cleanup.json`
- Traceback reconstruction: `runs/RC3-TIMEOUT-DIAG-001/traceback_full.txt`
- Timeline: `runs/RC3-TIMEOUT-DIAG-001/timeline.json`
- StateReader reconstruction: `runs/RC3-TIMEOUT-DIAG-001/state_reader_polls.json`
- Timeout inventory: `runs/RC3-TIMEOUT-DIAG-001/timeout_inventory.json`
- Timeout conflicts: `runs/RC3-TIMEOUT-DIAG-001/timeout_conflicts.json`
- Final screen inspection: `runs/RC3-TIMEOUT-DIAG-001/final_screen_inspection.json`
- Single-job diagnostic: `runs/RC3-MEDIA-E2E-001/`
- Single-job manifest: `runs/RC3-MEDIA-E2E-001/media_e2e_manifest.json`
- Single-job ffprobe: `runs/RC3-MEDIA-E2E-001/ffprobe.json`
- Single-job video copy: `runs/RC3-MEDIA-E2E-001/video_result.mp4`
- Single-job report: `runs/RC3-MEDIA-E2E-001/REPORT.md`

## Etapa 0 - Neutralizacao Dos Jobs Restantes

The four `RC2-PILOT-001` jobs were located. Job 59 was preserved as `failed-infra`. Jobs 60, 61, and 62 were moved to the officially supported equivalent state `dead` because the current SQLite constraint does not allow `cancelled_pilot_aborted`.

No physical row deletion was performed. The cleanup record preserves previous/final state, reason, timestamp, run id, production id, and causal event in `runs/RC3-TIMEOUT-DIAG-001/job_cleanup.json`.

Follow-up validation started the worker once and confirmed no old pilot job was reclaimed. The worker exited queue-empty with exit code `10`; the result is recorded in `runs/RC3-TIMEOUT-DIAG-001/worker_once_no_claim_result.json`.

## Etapa 1 - Traceback

The full RC2 traceback was not available because the RC2 worker only persisted `TimeoutError:` in the log. This was classified as an observability defect and corrected in RC3.

Reconstructed failing operation:

- File: `C:\B2-AI-STUDIO\links\firefly-automation\firefly_bot\worker.py`
- Function: `Worker._read_generation_state`
- Current reference lines after RC3 patch: 674-715
- Operation: `asyncio.wait_for(state_reader.read_screen_state(job.id), timeout=self.config.state_read_timeout_seconds)`
- Timer: `state_read_timeout_seconds = 15s`
- Library surface: Python `asyncio.wait_for` around Patchright/DOM selector inspection
- Preliminary class: `STATE_READER_TIMEOUT`

The missing original traceback is documented in `runs/RC3-TIMEOUT-DIAG-001/traceback_full.txt`.

## Etapa 2 - Linha Do Tempo

The RC2 timeline was reconstructed from the worker log and persisted as `runs/RC3-TIMEOUT-DIAG-001/timeline.json`.

Important timestamps:

- Job claimed: 2026-08-06T21:14:07.827Z
- First frame uploaded: 2026-08-06T21:16:07.369Z
- Generation started: 2026-08-06T21:16:22.360Z
- Last successful `still_generating` poll: 2026-08-06T21:17:51.988Z
- StateReader timeout warning: 2026-08-06T21:18:10.293Z
- Job marked `failed-infra`: 2026-08-06T21:18:43.854Z
- Elapsed from generation start to failed-infra: 141.494s

RC2 did not capture per-poll URL, selector found/absent lists, read duration, HTML, or DOM summary. RC3 adds those fields and proved them during `RC3-MEDIA-E2E-001`.

## Etapa 3 - Timeouts

Timeout inventory was saved in `runs/RC3-TIMEOUT-DIAG-001/timeout_inventory.json`.

Key values:

- `navigation_timeout_ms`: 90000
- `browser_action_timeout_ms`: 60000
- `state_reader_timeout_ms`: 15000
- `poll_interval_ms`: 3000
- `generation_budget_ms`: 600000
- `watchdog_wall_clock_ms`: 800000
- `per_slot_wall_clock_ms`: 770000
- `download_timeout_ms`: 120000
- `mission_control_worker_timeout_ms`: null / not observed for the direct Firefly worker run
- `selector_micro_timeout_ms`: 500

Primary conflict: `STATE_READER_TIMEOUT_ESCALATED_TO_JOB_FAILURE`. A short DOM read timeout could fail the job at 141.494s even though the generation budget was 600s.

No evidence showed `Watchdog timeout < generation budget`. The watchdog budget was larger than the generation budget.

## Etapa 4 - Ultima Tela Real

The nearest RC2 failure screenshot is `runs/RC2-PILOT-001/screenshots/job_59_worker_failure.png`.

Observed visually:

- Firefly page still loaded.
- `Baixar` button visible/enabled.
- No obvious logout.
- No obvious quota message.
- No obvious content rejection.
- No obvious network error.

Because RC2 did not capture DOM/HTML at failure time, the screenshot supports but does not prove `RESULT_READY` at selector level. RC3 now writes failure artifacts automatically: screenshot, page HTML, URL, DOM summary, and traceback.

## Etapa 5 - RESULT_READY Perdido

Classification: probable `STATE_READER_FALSE_NEGATIVE`.

Reasoning:

- RC2 last successful polls showed real `still_generating`.
- The final screen showed a visible/enabled `Baixar` button.
- The job failed from StateReader timeout, not from provider rejection, quota, login, or a generation budget expiry.
- RC2 lacked DOM evidence, so this is classified as probable rather than absolute.

RC3 selector diagnostics proved the intended path on the new job: `RC3-MEDIA-E2E-001` captured `result_ready` at 2026-08-06T22:25:29Z with `selectors_found=["result_ready"]`.

## Etapa 6 - Watchdog E Heartbeat

The RC2 watchdog was not premature. The failure occurred inside `_read_generation_state` before the watchdog wall-clock budget. The watchdog restart happened after the worker had already failed job 59.

RC3 captured 35 polling heartbeats in `runs/RC3-MEDIA-E2E-001/heartbeats.jsonl`. The browser stayed responsive, state reads continued, and `RESULT_READY` was detected before download.

## Etapa 7 - Correcao Aplicada

Code changes:

- `C:\B2-AI-STUDIO\links\firefly-automation\firefly_bot\state_reader.py`
  - Added URL, selector found/absent lists, selector errors, and read duration to `ScreenObservation`.
  - Added per-poll JSONL diagnostics under `FIREFLY_DIAG_DIR`.
  - Added optional polling screenshots via `FIREFLY_CAPTURE_POLL_SCREENSHOTS=true`.
  - Added a fast DOM fallback that can detect enabled download controls.

- `C:\B2-AI-STUDIO\links\firefly-automation\firefly_bot\worker.py`
  - Added fallback `read_dom_state_fast` after foreground StateReader timeout.
  - Changed recovery timeout handling to return `UNKNOWN` and continue inside generation budget instead of immediately failing the job.
  - Added full traceback capture.
  - Added failure screenshot, URL, HTML, and DOM summary artifacts.

- `C:\B2-AI-STUDIO\mission-control\package.json`
  - Version changed to `1.0.0-rc3`.

- `C:\B2-AI-STUDIO\mission-control\package-lock.json`
  - Version changed to `1.0.0-rc3`.

No broad timeout increase was applied.

## Etapa 8 - Teste Diagnostico De Um Job

Run: `RC3-MEDIA-E2E-001`

Result: **PASS**

Evidence from `runs/RC3-MEDIA-E2E-001/media_e2e_manifest.json`:

```json
{
  "job_id": 63,
  "job_name": "RC3_MEDIA_E2E_001_TAKE_01",
  "status": "done",
  "attempts": 1,
  "file_size_bytes": 4349688,
  "sha256": "05473e9cf1ba0b5447a799b55724c1eacf4bc40be93da4a5ed52547284e27a8d",
  "media_validation_status": "PASS",
  "poll_count": 35,
  "local_poll_screenshot_count": 35,
  "pass": true
}
```

ffprobe evidence:

```json
{
  "codec_name": "h264",
  "width": 720,
  "height": 1280,
  "duration": "5.041667",
  "size": "4349688"
}
```

Command results:

- Feed exit code: 0
- Worker exit code: 0
- Active queued/claimed/generating jobs after run: 0

## Objective Answers

1. Qual operacao lancou o `TimeoutError`?
   `asyncio.wait_for(state_reader.read_screen_state(job.id), timeout=15s)` inside `Worker._read_generation_state`.

2. Qual arquivo, funcao e linha?
   `C:\B2-AI-STUDIO\links\firefly-automation\firefly_bot\worker.py`, function `_read_generation_state`; current reference lines 674-715. Exact RC2 line cannot be proven because RC2 did not persist the traceback.

3. Quanto tempo havia transcorrido?
   141.494s from `generation_started` to `failed-infra`.

4. Qual timer venceu?
   The 15s StateReader DOM/screen-read timeout, not the 600s generation budget.

5. O Firefly ainda estava realmente gerando?
   Last proven RC2 state was `still_generating` at elapsed 89.6s. The final screenshot later showed an enabled `Baixar` button, so it likely became ready before/around failure, but RC2 lacks DOM proof.

6. O navegador continuava responsivo?
   The final screenshot indicates the page was rendered and visible. RC2 lacks DOM/heartbeat proof; RC3 corrected this and the diagnostic job captured responsive polls through completion.

7. `RESULT_READY` ja estava presente e nao foi detectado?
   Probable, but not absolutely provable for RC2 because no DOM snapshot exists. Visual evidence shows `Baixar`; RC3 proved `RESULT_READY` detection with selector evidence on the diagnostic job.

8. O Watchdog encerrou prematuramente?
   No. The worker failed job 59 before the watchdog restart. Watchdog budgets were larger than the generation budget.

9. A falha foi interna ou externa?
   Internal: `STATE_READER_TIMEOUT_WITH_PROBABLE_STATE_READER_FALSE_NEGATIVE`.

10. Qual correcao foi aplicada?
    StateReader timeout no longer causes immediate job failure inside the generation budget; a fast DOM fallback, richer selector diagnostics, per-poll evidence, traceback, URL, HTML, screenshot, and DOM summary capture were added.

11. O teste de um unico job passou?
    Yes. `RC3-MEDIA-E2E-001` passed with a real MP4, ffprobe PASS, SHA-256, and job `done` after media validation.

12. O piloto de 20 jobs permanece bloqueado?
    Yes. It was not restarted in this phase. The next release gate can only proceed after explicit execution of a fresh 20-video pilot.

## Verification

- Python compile: `python -m compileall firefly_bot` PASS
- Mission Control build: `npm run build` PASS
- Build version: `b2-mission-control@1.0.0-rc3`

## Final Status

- RC2-REQ-9: **FAIL** for RC2.
- RC3 single-job diagnostic: **PASS**.
- 20-video pilot: **BLOCKED / NOT EXECUTED** in RC3.
- Backup repeat after new 20 videos: **NOT EXECUTED**.
