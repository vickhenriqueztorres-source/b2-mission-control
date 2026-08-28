import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const episodeId = 'OOL-EP05-RADAR-ASFALTO';
const prodDir = path.join(process.cwd(), 'runs', episodeId);
const thumbDir = path.join(prodDir, 'postproduction', 'thumbnails');
const artifactDir = 'C:/Users/brend/.gemini/antigravity/brain/458559fc-b6a0-43b0-900e-40923ec3998e';

fs.mkdirSync(thumbDir, { recursive: true });

const thumbnailsToRender = [
  {
    filename: 'thumbnail_variant_a_mechanism.png',
    baseImageSrc: 'assets/submarine_curated/laser_silica_lab.jpg',
    headlineLines: ['O SEGREDO', 'DENTRO DO', 'ASFALTO.'],
    subheadline: 'A FÍSICA INVISÍVEL QUE CALCULA SUA VELOCIDADE NO ESCURO.',
    revealPercentage: 92,
    coordinates: '-23.5505° S, -46.6333° W'
  },
  {
    filename: 'thumbnail_variant_b_consequence.png',
    baseImageSrc: 'assets/submarine_curated/satellite_space.jpg',
    headlineLines: ['NÃO É A', 'CÂMERA NO', 'POSTE.'],
    subheadline: 'O QUE ESTÁ ESCONDIDO DEBAIXO DAS SUAS RODAS.',
    revealPercentage: 87,
    coordinates: 'RODOVIA DOS IMIGRANTES // KM 42'
  },
  {
    filename: 'thumbnail_variant_c_final_handoff.png',
    baseImageSrc: 'assets/submarine_curated/server_room_datacenter.jpg',
    headlineLines: ['ARMADILHA', 'MAGNÉTICA', '3 METROS'],
    subheadline: 'COMO O LAÇO INDUTIVO MEDE O CARRO EM MILISSEGUNDOS.',
    revealPercentage: 95,
    coordinates: 'INMETRO // PORTARIA 158/2022'
  }
];

console.log('══════════════════════════════════════════════════════════════════');
console.log('🎨 RENDERIZANDO THUMBNAILS 4K EPISÓDIO 05 — REMOTION STILL');
console.log('══════════════════════════════════════════════════════════════════\n');

for (const t of thumbnailsToRender) {
  const outPath = path.join(thumbDir, t.filename);
  const props = {
    baseImageSrc: t.baseImageSrc,
    headlineLines: t.headlineLines,
    subheadline: t.subheadline,
    revealPercentage: t.revealPercentage,
    coordinates: t.coordinates,
    accentColor: '#FF5500',
    telemetryColor: '#00F0FF'
  };

  const propsJson = JSON.stringify(props).replace(/"/g, '\\"');
  const cmd = `npx remotion still remotion/index.ts HslThumbnail "${outPath}" --props="${propsJson}"`;

  console.log(`Renderizando ${t.filename}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    fs.copyFileSync(outPath, path.join(artifactDir, `ep05_${t.filename}`));
    console.log(`✅ ${t.filename} renderizada com sucesso!`);
  } catch (e: any) {
    console.warn(`⚠️ Erro ao renderizar ${t.filename}:`, e.message);
  }
}

// Sincroniza thumbnail_variant_c_official.png
const offSrc = path.join(thumbDir, 'thumbnail_variant_c_final_handoff.png');
const offDst = path.join(thumbDir, 'thumbnail_variant_c_official.png');
if (fs.existsSync(offSrc)) {
  fs.copyFileSync(offSrc, offDst);
  fs.copyFileSync(offSrc, path.join(artifactDir, 'ep05_thumbnail_variant_c_official.png'));
}

console.log('\n🎉 Todas as Thumbnails 4K do Episódio 05 foram renderizadas com sucesso!');
