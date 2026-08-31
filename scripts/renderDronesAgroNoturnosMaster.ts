import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { writeCinematicRenderManifest } from '../remotion/cinema/CinematicEpisode';
import { DRONES_AGRO_NOTURNOS_TIMELINE_CONTRACT, EPISODE_DRONES_AGRO_NOTURNOS_CALCULATED_TIMELINE } from '../remotion/episodeDronesAgroNoturnosTimelineData';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';
import { parseEpisodeContract } from '../contracts/episodeContract';

const runId = 'drones-agro-noturnos';
const runDir = path.join(process.cwd(), 'runs', runId);
const finalPath = path.join(runDir, 'final_master.mp4');
const pendingFinalPath = path.join(runDir, 'final_master.pending.mp4');
const rawPath = path.join(runDir, 'final_master.remotion.mp4');
const renderManifestPath = path.join(runDir, 'render_manifest.json');

fs.mkdirSync(runDir, { recursive: true });
const preflight = PipelineContractGate.auditRun({
  runId,
  stageScope: 'PRE_RENDER',
  contract: parseEpisodeContract(path.join(process.cwd(), 'contracts', 'episodes', `${runId}.episode.json`)),
});
if (!preflight.passed) throw new Error(`PRE_RENDER_GATE_FAILED:${JSON.stringify(preflight.failures)}`);
fs.rmSync(renderManifestPath, {force: true});
fs.rmSync(pendingFinalPath, {force: true});

const runManifestPath = path.join(runDir, 'run-manifest.json');
if (fs.existsSync(runManifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(runManifestPath, 'utf8'));
  manifest.status = 'RENDERING';
  manifest.finalMaster = null;
  manifest.stages = {
    ...(manifest.stages || {}),
    render: {status: 'RUNNING', engine: 'CinematicEpisode'},
  };
  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(runManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify({
  status: 'RENDER_STARTING',
  runId,
  finalPath,
  totalFrames: EPISODE_DRONES_AGRO_NOTURNOS_CALCULATED_TIMELINE.totalDurationFrames,
  totalSeconds: EPISODE_DRONES_AGRO_NOTURNOS_CALCULATED_TIMELINE.totalDurationSeconds,
}, null, 2));

const renderConcurrency = String(Math.min(4, Math.max(1, Number(process.env.REMOTION_CONCURRENCY || 4))));
const renderScale = process.env.REMOTION_SCALE || '1';
execSync(`npx remotion render remotion/index.ts EpisodeDronesAgroNoturnos "${rawPath}" --concurrency=${renderConcurrency} --scale=${renderScale} --gl=angle --codec=h264 --crf=18`, {
  stdio: 'inherit',
});

if (!fs.existsSync(rawPath) || fs.statSync(rawPath).size < 1024 * 1024) {
  throw new Error(`FINAL_MASTER_MISSING_OR_TOO_SMALL:${finalPath}`);
}

execSync(`ffmpeg -y -hide_banner -loglevel error -i "${rawPath}" -map 0:v:0 -map 0:a:0 -vf "scale=1920:1080:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -r 30 -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 192k -ar 48000 -ac 2 -map_metadata -1 -movflags +faststart "${pendingFinalPath}"`, {stdio: 'inherit'});

const finalProbe = PipelineContractGate.probeMedia(pendingFinalPath);
if (
  !finalProbe.valid
  || finalProbe.codec !== 'h264'
  || finalProbe.width !== 1920
  || finalProbe.height !== 1080
  || fs.statSync(pendingFinalPath).size < 1024 * 1024
) {
  throw new Error(`FINAL_MASTER_MEDIA_VALIDATION_FAILED:${JSON.stringify(finalProbe)}`);
}
const frozenRatio = PipelineContractGate.calculateFrozenRatio(pendingFinalPath, finalProbe.duration);
if (frozenRatio >= 0.85) {
  throw new Error(`FINAL_MASTER_STATIC_VIDEO_REJECTED:frozenRatio=${frozenRatio.toFixed(4)}`);
}

fs.rmSync(finalPath, {force: true});
fs.renameSync(pendingFinalPath, finalPath);
const finalSha256 = crypto.createHash('sha256').update(fs.readFileSync(finalPath)).digest('hex');
const cinematicManifestPath = writeCinematicRenderManifest(
  DRONES_AGRO_NOTURNOS_TIMELINE_CONTRACT,
  runId,
  runDir,
  {
    compositionId: 'EpisodeDronesAgroNoturnos',
    output: {
      path: finalPath,
      sha256: finalSha256,
      sizeBytes: fs.statSync(finalPath).size,
      durationSeconds: finalProbe.duration,
      codec: finalProbe.codec,
      width: finalProbe.width!,
      height: finalProbe.height!,
      frozenRatio,
    },
  },
);
fs.rmSync(rawPath, {force: true});

if (fs.existsSync(runManifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(runManifestPath, 'utf8'));
  manifest.status = 'DONE';
  manifest.finalMaster = finalPath;
  manifest.stages = {
    ...(manifest.stages || {}),
    render: {
      status: 'DONE',
      engine: 'CinematicEpisode',
      composition: 'EpisodeDronesAgroNoturnos',
      renderManifest: cinematicManifestPath,
      frozenRatio,
      outputSha256: finalSha256,
    },
    cinematic_grade: { status: 'DONE' },
    FFMPEG_MUX: { status: 'DONE' },
  };
  manifest.render = {
    engine: 'CinematicEpisode',
    composition: 'EpisodeDronesAgroNoturnos',
    sourceScenes: EPISODE_DRONES_AGRO_NOTURNOS_CALCULATED_TIMELINE.scenes.length,
    sourcePolicy: 'real_temporal_video_for_matter_and_specialized_remotion_for_dossiers',
    renderManifest: cinematicManifestPath,
    frozenRatio,
    outputSha256: finalSha256,
  };
  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(runManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify({
  status: 'RENDER_DONE',
  runId,
  finalPath,
  bytes: fs.statSync(finalPath).size,
  engine: 'CinematicEpisode',
  frozenRatio,
}, null, 2));
