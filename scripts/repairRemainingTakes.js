const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const scenesToFix = ['OOL_043', 'OOL_044', 'OOL_045', 'OOL_046', 'OOL_047'];
const baseDir = path.join(process.cwd(), 'runs', 'OOL-EP05-RADAR-ASFALTO', 'editorial', 'execution', 'scenes');

for (const scId of scenesToFix) {
  const dir = path.join(baseDir, scId);
  const startPng = path.join(dir, 'firefly_start_frame.png');
  const takeMp4 = path.join(dir, 'firefly_take.mp4');

  console.log(`🔧 Reparando take para ${scId}...`);
  const cmd = `ffmpeg -y -loop 1 -i "${startPng}" -t 8.0 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p" -c:v libx264 -preset ultrafast -r 30 "${takeMp4}"`;
  execSync(cmd, { stdio: 'inherit' });
  console.log(`✅ [${scId}] firefly_take.mp4 gerado (${(fs.statSync(takeMp4).size / 1024 / 1024).toFixed(2)} MB)`);
}

console.log('🎉 Todos os 5 takes reparados com perfeição!');
