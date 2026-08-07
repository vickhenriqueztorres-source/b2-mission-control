const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const Database = require('better-sqlite3');

const args = Object.fromEntries(process.argv.slice(2).map((value) => {
  const [key, ...rest] = value.replace(/^--/, '').split('=');
  return [key, rest.join('=')];
}));

const runDir = 'C:/B2-AI-STUDIO/mission-control/runs/RC3-PILOT-001';
const fireflyDbPath = 'C:/B2-AI-STUDIO/links/firefly-automation/data/firefly_jobs.db';
const jobName = args.name;
const prod = args.prod;
const take = args.take;
const prodDir = path.join(runDir, 'productions', prod);
const db = new Database(fireflyDbPath, { readonly: true });
const job = db.prepare('select * from jobs where name=?').get(jobName);
const active = db.prepare("select id,name,status,attempts,error from jobs where status in ('claimed','generating','stale_generating') order by id").all();
db.close();

function fail(reason, extra = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    run_id: 'RC3-PILOT-001',
    production: prod,
    take,
    job_name: jobName,
    result: 'FAIL',
    reason,
    job,
    active,
    ...extra,
  };
  fs.writeFileSync(path.join(prodDir, `${jobName}_validation.json`), JSON.stringify(payload, null, 2));
  fs.appendFileSync(path.join(runDir, 'events.jsonl'), JSON.stringify({ event: 'take_validation_failed', ...payload }) + '\n');
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

if (!job) fail('JOB_NOT_FOUND');
if (job.status !== 'done') fail(`JOB_NOT_DONE:${job.status}`);
if (job.media_validation_status !== 'PASS') fail(`MEDIA_VALIDATION_NOT_PASS:${job.media_validation_status}`);
if (!job.sha256) fail('SHA256_MISSING');
if (!job.output_path || !fs.existsSync(job.output_path)) fail('OUTPUT_FILE_MISSING');
if (active.length !== 0) fail('ACTIVE_JOB_LEFT_AFTER_WORKER_ONCE', { active });

const output = job.output_path;
const stat = fs.statSync(output);
if (stat.size <= 100000) fail('OUTPUT_TOO_SMALL', { size: stat.size });
if (path.extname(output).toLowerCase() !== '.mp4') fail('OUTPUT_NOT_MP4', { output });
const head = fs.readFileSync(output).subarray(0, 16);
if (head.length < 12 || head.subarray(4, 8).toString('ascii') !== 'ftyp') fail('INVALID_CONTAINER_SIGNATURE');

const ffprobeText = execFileSync('ffprobe', [
  '-v', 'error',
  '-show_format',
  '-show_streams',
  '-of', 'json',
  output,
], { encoding: 'utf8' });
const ffprobe = JSON.parse(ffprobeText);
const videoStreams = (ffprobe.streams || []).filter((stream) => stream.codec_type === 'video');
if (videoStreams.length < 1) fail('NO_VIDEO_STREAM', { ffprobe });
const stream = videoStreams[0];
const duration = Number((ffprobe.format || {}).duration || stream.duration || 0);
if (!(Number(stream.width) > 0)) fail('INVALID_WIDTH', { ffprobe });
if (!(Number(stream.height) > 0)) fail('INVALID_HEIGHT', { ffprobe });
if (!(duration > 0)) fail('INVALID_DURATION', { ffprobe });
if (!stream.codec_name) fail('MISSING_CODEC', { ffprobe });

const sha256 = crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');
if (sha256 !== String(job.sha256).toLowerCase()) fail('SHA256_MISMATCH', { computed_sha256: sha256, job_sha256: job.sha256 });

const evidenceVideo = path.join(prodDir, `${jobName}.mp4`);
fs.copyFileSync(output, evidenceVideo);
const manifest = {
  timestamp: new Date().toISOString(),
  run_id: 'RC3-PILOT-001',
  production: prod,
  take,
  job_id: job.id,
  job_name: jobName,
  status: job.status,
  attempts: job.attempts,
  output_path: output,
  evidence_video_path: evidenceVideo,
  file_size_bytes: stat.size,
  sha256,
  media_validation_status: job.media_validation_status,
  ffprobe,
  video_stream_count: videoStreams.length,
  width: Number(stream.width),
  height: Number(stream.height),
  duration_seconds: duration,
  codec: stream.codec_name,
  pass: true,
};

fs.writeFileSync(path.join(prodDir, `${jobName}_ffprobe.json`), JSON.stringify(ffprobe, null, 2));
fs.writeFileSync(path.join(prodDir, `${jobName}_hash.json`), JSON.stringify({ sha256, path: output }, null, 2));
fs.writeFileSync(path.join(prodDir, `${jobName}_intake_manifest.json`), JSON.stringify({
  run_id: 'RC3-PILOT-001',
  production_id: `RC3-PILOT-${prod}`,
  job_id: job.id,
  job_name: jobName,
  media_path: evidenceVideo,
  source_output_path: output,
  sha256,
  ffprobe_pass: true,
  video_stream_count: videoStreams.length,
  width: Number(stream.width),
  height: Number(stream.height),
  duration_seconds: duration,
  codec: stream.codec_name,
}, null, 2));
fs.writeFileSync(path.join(prodDir, `${jobName}_validation.json`), JSON.stringify(manifest, null, 2));
fs.appendFileSync(path.join(runDir, 'events.jsonl'), JSON.stringify({ event: 'take_validation_passed', job_id: job.id, job_name: jobName, production: prod, take, sha256, file_size_bytes: stat.size, timestamp: manifest.timestamp }) + '\n');
fs.appendFileSync(path.join(runDir, 'state_transitions.jsonl'), JSON.stringify({ timestamp: manifest.timestamp, job_id: job.id, job_name: jobName, final_status: 'done', media_validation_status: 'PASS' }) + '\n');
console.log(JSON.stringify(manifest, null, 2));
