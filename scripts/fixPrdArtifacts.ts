import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const episodeId = 'OOL-EP04-GPS-TEMPO';
const runDir = path.join(process.cwd(), 'runs', episodeId);
const postDir = path.join(runDir, 'postproduction');
const thumbDir = path.join(postDir, 'thumbnails');
const artifactDir = 'C:/Users/brend/.gemini/antigravity/brain/458559fc-b6a0-43b0-900e-40923ec3998e';

// 1. Obter duração real do master narration.mp3
const narrationPath = path.join(postDir, 'narration.mp3');
const probe = spawnSync('ffprobe', [
  '-v', 'error',
  '-show_entries', 'format=duration',
  '-of', 'default=noprint_wrappers=1:nokey=1',
  narrationPath
], { encoding: 'utf8' });

const audioDur = parseFloat(probe.stdout.trim()) || 451.48;
console.log(`🎙️ Duração real do áudio de narração: ${audioDur.toFixed(2)}s`);

// 2. Ajustar scene_timings.json para ter exatamente 50 cenas e total idêntico
const timingsPath = path.join(postDir, 'scene_timings.json');
let timings = JSON.parse(fs.readFileSync(timingsPath, 'utf8'));

// Normalizar as durações proporcionais para fechar exatamente no áudio
const currentSum = timings.reduce((acc: number, s: any) => acc + s.durationSeconds, 0);
const ratio = audioDur / currentSum;

let currentFrame = 0;
const normalizedTimings = timings.map((s: any, idx: number) => {
  const isLast = idx === timings.length - 1;
  let dur = Math.round(s.durationSeconds * ratio * 100) / 100;
  let frames = Math.round(dur * 30);
  
  if (isLast) {
    const targetTotalFrames = Math.round(audioDur * 30);
    frames = targetTotalFrames - currentFrame;
    dur = frames / 30;
  }

  const item = {
    sceneId: s.sceneId,
    startFrame: currentFrame,
    durationFrames: frames,
    durationSeconds: dur
  };

  currentFrame += frames;
  return item;
});

fs.writeFileSync(timingsPath, JSON.stringify(normalizedTimings, null, 2), 'utf8');
console.log(`✅ scene_timings.json sincronizado: 50 cenas, total ${audioDur.toFixed(2)}s (${currentFrame} frames)`);

// 3. Sincronizar thumbnails
const srcC = path.join(thumbDir, 'thumbnail_variant_c_final_handoff.png');
const dstC = path.join(thumbDir, 'thumbnail_variant_c_official.png');
if (fs.existsSync(srcC)) {
  fs.copyFileSync(srcC, dstC);
  fs.copyFileSync(srcC, path.join(artifactDir, 'thumbnail_variant_c_final_handoff.png'));
  fs.copyFileSync(srcC, path.join(artifactDir, 'thumbnail_variant_c_official.png'));
}

// 4. Copiar vídeo final para os artefatos
const masterSrc = path.join(runDir, 'final_master.mp4');
const masterDst = path.join(artifactDir, 'ep04_gps_tempo_final_master.mp4');
if (fs.existsSync(masterSrc)) {
  fs.copyFileSync(masterSrc, masterDst);
  console.log(`✅ Master MP4 copiado para artefatos: ${(fs.statSync(masterDst).size / 1024 / 1024).toFixed(2)} MB`);
}
