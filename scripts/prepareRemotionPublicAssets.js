const fs = require('fs');
const path = require('path');

const EPISODE_ID = 'OOL-EP05-RADAR-ASFALTO';
const runDir = path.join(process.cwd(), 'runs', EPISODE_ID);
const executionScenesDir = path.join(runDir, 'editorial', 'execution', 'scenes');
const publicExecDir = path.join(process.cwd(), 'public', 'editorial', 'execution');
const publicScenesDir = path.join(publicExecDir, 'scenes');
const publicRunExecDir = path.join(publicExecDir, EPISODE_ID, 'scenes');

fs.mkdirSync(publicExecDir, { recursive: true });
fs.mkdirSync(publicScenesDir, { recursive: true });
fs.mkdirSync(publicRunExecDir, { recursive: true });

const availableMedia = {};

for (let i = 1; i <= 50; i++) {
  const scId = `OOL_${String(i).padStart(3, '0')}`;
  const srcSceneDir = path.join(executionScenesDir, scId);

  const targetDirs = [
    path.join(publicExecDir, scId),
    path.join(publicScenesDir, scId),
    path.join(publicRunExecDir, scId)
  ];

  for (const d of targetDirs) {
    fs.mkdirSync(d, { recursive: true });
  }

  const srcPng = path.join(srcSceneDir, 'firefly_start_frame.png');
  const srcTake = path.join(srcSceneDir, 'firefly_take.mp4');
  const srcReceipt = path.join(srcSceneDir, 'start_frame_receipt.json');

  let hasImage = false;
  let hasVideo = false;
  let isDossier = false;

  if (fs.existsSync(srcReceipt)) {
    try {
      const rec = JSON.parse(fs.readFileSync(srcReceipt, 'utf8'));
      if (rec.takeType === 'KEYFRAME_DOSSIER') isDossier = true;
    } catch {}
  }

  if (fs.existsSync(srcPng)) {
    hasImage = true;
    for (const d of targetDirs) {
      const destPng = path.join(d, 'firefly_start_frame.png');
      try {
        if (fs.existsSync(destPng)) fs.unlinkSync(destPng);
        fs.linkSync(srcPng, destPng);
      } catch {
        fs.copyFileSync(srcPng, destPng);
      }
    }
  }

  if (fs.existsSync(srcTake)) {
    hasVideo = true;
    for (const d of targetDirs) {
      const destTake = path.join(d, 'firefly_take.mp4');
      try {
        if (fs.existsSync(destTake)) fs.unlinkSync(destTake);
        fs.linkSync(srcTake, destTake);
      } catch {
        fs.copyFileSync(srcTake, destTake);
      }
    }
  }

  availableMedia[scId] = {
    hasVideo,
    hasImage,
    isDossier
  };
}

fs.writeFileSync(
  path.join(process.cwd(), 'remotion', 'availableMedia.json'),
  JSON.stringify(availableMedia, null, 2)
);

console.log('✅ 50 Cenas sincronizadas no public/ para renderização do Remotion!');
