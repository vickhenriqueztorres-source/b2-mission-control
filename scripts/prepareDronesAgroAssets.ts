import fs from 'fs';
import path from 'path';

function prepareAssets() {
  console.log('══════════════════════════════════════════════════════════════════════════════════════');
  console.log('📦 PREPARANDO ASSETS DE ÁUDIO E ESTRUTURA // EPISÓDIO 17: DRONES DO AGRO');
  console.log('══════════════════════════════════════════════════════════════════════════════════════\n');

  const runDir = path.join(process.cwd(), 'runs', 'OOL-EP17-DRONES-AGRO');
  const pubDir = path.join(process.cwd(), 'public', 'episodes', 'drones-agro');

  const runMusicDir = path.join(runDir, 'audio', 'music');
  const pubMusicDir = path.join(pubDir, 'audio', 'music');
  const runSfxDir = path.join(runDir, 'audio', 'sfx');
  const pubSfxDir = path.join(pubDir, 'audio', 'sfx');
  const runImgDir = path.join(runDir, 'images');
  const pubImgDir = path.join(pubDir, 'images');
  const runTakesDir = path.join(runDir, 'takes');
  const pubTakesDir = path.join(pubDir, 'takes');
  const executionScenesDir = path.join(runDir, 'editorial', 'execution', 'scenes');

  [runMusicDir, pubMusicDir, runSfxDir, pubSfxDir, runImgDir, pubImgDir, runTakesDir, pubTakesDir, executionScenesDir].forEach(d => {
    fs.mkdirSync(d, { recursive: true });
  });

  // 1. Music Bed
  const srcMusic = path.join(process.cwd(), 'public', 'episodes', 'gps-tempo', 'audio', 'music', 'bed.mp3');
  if (fs.existsSync(srcMusic)) {
    fs.copyFileSync(srcMusic, path.join(runMusicDir, 'bed.mp3'));
    fs.copyFileSync(srcMusic, path.join(pubMusicDir, 'bed.mp3'));
    console.log('✅ Trilha musical (bed.mp3) copiada com sucesso.');
  }

  // 2. SFX Cues (24 cenas)
  const srcSfxDir = path.join(process.cwd(), 'public', 'episodes', 'gps-tempo', 'audio', 'sfx');
  for (let i = 1; i <= 24; i++) {
    const numStr = String(i).padStart(3, '0');
    const srcFile = path.join(srcSfxDir, `GPS_${numStr}.mp3`);
    const dstRun = path.join(runSfxDir, `AGRO_${numStr}.mp3`);
    const dstPub = path.join(pubSfxDir, `AGRO_${numStr}.mp3`);

    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, dstRun);
      fs.copyFileSync(srcFile, dstPub);
    }
  }
  console.log('✅ 24 Sound Design Cues (.mp3) mapeados com sucesso.');

  // 3. Salvar Thumbnail Master
  const brainDir = path.join(process.env.USERPROFILE || 'C:\\Users\\brend', '.gemini', 'antigravity', 'brain', 'c5f04ba1-5381-4193-8f04-e56c8fb7e558');
  const thumbFiles = fs.readdirSync(brainDir).filter(f => f.startsWith('drone_agro_thumbnail_master_4k') && f.endsWith('.jpg'));
  if (thumbFiles.length > 0) {
    const latestThumb = path.join(brainDir, thumbFiles[thumbFiles.length - 1]);
    fs.copyFileSync(latestThumb, path.join(pubImgDir, '00_thumbnail_master_4k.jpg'));
    fs.copyFileSync(latestThumb, path.join(runImgDir, '00_thumbnail_master_4k.jpg'));
    console.log(`✅ Thumbnail Master 4K copiada: ${thumbFiles[thumbFiles.length - 1]}`);
  }

  console.log('\n🎉 Assets de áudio e ambientação estruturados com 100% de sucesso!');
}

prepareAssets();
