import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function main() {
  const scenes = JSON.parse(fs.readFileSync('contracts/episodes/gps-tempo.scenes.json', 'utf8'));
  const imagesDir = path.join(process.cwd(), 'public', 'episodes', 'gps-tempo', 'images');
  fs.mkdirSync(imagesDir, { recursive: true });

  const videoPath = path.join(process.cwd(), 'runs', 'gps-tempo', 'final_master_gps.mp4');

  // Copia a Thumbnail Master 4K para a pasta
  const thumbArtifact = 'C:\\Users\\brend\\.gemini\\antigravity\\brain\\c5f04ba1-5381-4193-8f04-e56c8fb7e558\\gps_thumbnail_master_1788099183200.jpg';
  if (fs.existsSync(thumbArtifact)) {
    fs.copyFileSync(thumbArtifact, path.join(imagesDir, '00_THUMBNAIL_MASTER_4K.jpg'));
  }

  let accumulatedSeconds = 0;
  const chapterNames = [
    'O_EFEITO_COTIDIANO',
    'A_MAQUINA_OCULTA',
    'O_CORACAO_DE_CESIO',
    'A_FISICA_DA_TRIANGULACAO',
    'O_PARADOXO_DE_EINSTEIN',
    'O_VEREDITO_DO_TEMPO'
  ];

  console.log('🖼️ Extraindo quadros em alta resolução das 30 cenas...');

  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const sec = accumulatedSeconds + 1.0; // 1 segundo após o início para capturar o frame estabilizado
    const indexStr = String(i + 1).padStart(2, '0');
    const outName = `CENA_${indexStr}_${sc.sceneId}.png`;
    const outPath = path.join(imagesDir, outName);

    spawnSync('ffmpeg', [
      '-y',
      '-ss', sec.toFixed(2),
      '-i', videoPath,
      '-vframes', '1',
      '-q:v', '2',
      outPath
    ]);

    if (i % 5 === 0) {
      const chapNum = Math.floor(i / 5) + 1;
      const chapName = `CAPITULO_0${chapNum}_${chapterNames[chapNum - 1]}.png`;
      const chapPath = path.join(imagesDir, chapName);
      if (fs.existsSync(outPath)) {
        fs.copyFileSync(outPath, chapPath);
      }
    }

    accumulatedSeconds += (sc.targetSeconds || 12);
    console.log(`  ✅ [${indexStr}/30] ${outName} extraído em t = ${sec.toFixed(1)}s`);
  }

  console.log(`\n🎉 Todas as imagens foram organizadas com sucesso em:\n${imagesDir}`);
}

main().catch(console.error);
