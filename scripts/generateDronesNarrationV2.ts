import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {spawnSync} from 'child_process';
import scenes from '../contracts/episodes/drones-agro-noturnos.scenes.json';
import {ElevenLabsAdapter, OFFICIAL_CHRIS_VOICE_ID, OFFICIAL_ELEVENLABS_MODEL_ID} from '../adapters/elevenLabsAdapter';
import {assertOfficialHslNarrationConfig} from '../config/hslProductionRules';

const episodeId = 'drones-agro-noturnos';
const root = process.cwd();
const runAudio = path.join(root, 'runs', episodeId, 'audio', 'narration');
const publicAudio = path.join(root, 'public', 'episodes', episodeId, 'audio', 'narration');
const rawPath = path.join(runAudio, 'narration-chris-raw.mp3');
const masterPath = path.join(runAudio, 'narration.mp3');
const publicPath = path.join(publicAudio, 'narration.mp3');

function hash(file: string) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function probe(file: string) {
  const out = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], {encoding: 'utf8'});
  if (out.status !== 0) throw new Error(`NARRATION_PROBE_FAILED:${out.stderr}`);
  return Number(out.stdout.trim());
}

async function main() {
  assertOfficialHslNarrationConfig();
  fs.mkdirSync(runAudio, {recursive: true}); fs.mkdirSync(publicAudio, {recursive: true});
  const text = (scenes as any[]).map((scene) => scene.voiceover.trim()).join('\n\n');
  if (/\bCena\s+\d+/i.test(text)) throw new Error('NARRATION_SCENE_LABELS_FORBIDDEN');
  const adapter = new ElevenLabsAdapter(); await adapter.initialize();
  if (!await adapter.checkHealth()) throw new Error('ELEVENLABS_HEALTHCHECK_FAILED');
  await adapter.synthesizeText(text, rawPath, {voiceId: OFFICIAL_CHRIS_VOICE_ID, modelId: OFFICIAL_ELEVENLABS_MODEL_ID, stability: 0.52, similarityBoost: 0.82});
  const normalize = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', rawPath, '-af', 'highpass=f=65,lowpass=f=15500,loudnorm=I=-16:TP=-1.5:LRA=7', '-ar', '48000', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '192k', masterPath], {encoding: 'utf8'});
  if (normalize.status !== 0) throw new Error(`NARRATION_NORMALIZE_FAILED:${normalize.stderr}`);
  fs.copyFileSync(masterPath, publicPath);
  const receipt = {
    schema: 'hsl.narration.provenance.v2', status: 'APPROVED_OFFICIAL_VOICE', provider: 'elevenlabs',
    voiceName: 'Chris', voiceId: OFFICIAL_CHRIS_VOICE_ID, modelId: OFFICIAL_ELEVENLABS_MODEL_ID,
    words: text.split(/\s+/).length, rawDurationSeconds: probe(rawPath), durationSeconds: probe(masterPath),
    rawSha256: hash(rawPath), masterSha256: hash(masterPath), sampleRate: 48000, channels: 2,
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(runAudio, 'narration-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  const manifestPath = path.join(root, 'runs', episodeId, 'run-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.stages.narration = {status: 'DONE', provider: 'elevenlabs', voice: 'Chris', voiceId: OFFICIAL_CHRIS_VOICE_ID, model: OFFICIAL_ELEVENLABS_MODEL_ID, durationSeconds: receipt.durationSeconds};
  manifest.updatedAt = new Date().toISOString(); fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({...receipt, status: 'NARRATION_DONE', masterPath}, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
