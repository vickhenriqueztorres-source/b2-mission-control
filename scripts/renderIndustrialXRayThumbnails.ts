import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const episodeId = 'OOL-EP04-GPS-TEMPO';
const prodDir = path.join(process.cwd(), 'runs', episodeId);
const thumbDir = path.join(prodDir, 'postproduction', 'thumbnails');
const artifactDir = 'C:/Users/brend/.gemini/antigravity/brain/458559fc-b6a0-43b0-900e-40923ec3998e';

fs.mkdirSync(thumbDir, { recursive: true });

const thumbnailsToRender = [
  {
    filename: 'thumbnail_variant_a_mechanism.png',
    baseImageSrc: 'assets/submarine_curated/laser_silica_lab.jpg',
    headlineLines: ['CÉSIO-133', '9.192.631.770', 'POR SEGUNDO'],
    subheadline: 'O CORAÇÃO ATÔMICO DO SATÉLITE.',
    revealPercentage: 88,
    coordinates: '38.8977° N, 77.0365° W'
  },
  {
    filename: 'thumbnail_variant_b_consequence.png',
    baseImageSrc: 'assets/submarine_curated/satellite_space.jpg',
    headlineLines: ['SE O TEMPO', 'DERIVAR', '0.000038s'],
    subheadline: 'O ERRO DE EINSTEIN QUE QUEBRARIA OS BANCOS.',
    revealPercentage: 94,
    coordinates: '20.200 KM ORBIT'
  },
  {
    filename: 'thumbnail_variant_c_final_handoff.png',
    baseImageSrc: 'assets/submarine_curated/server_room_datacenter.jpg',
    headlineLines: ['O GPS', 'NÃO É UM', 'MAPA.'],
    subheadline: 'A VERDADE ESCONDIDA SOB A SUPERFÍCIE.',
    revealPercentage: 73,
    coordinates: '22.9042° S, 43.1729° W'
  }
];

console.log('══════════════════════════════════════════════════════════════════');
console.log('🎨 RENDERIZANDO THUMBNAILS 4K — IDENTIDADE INDUSTRIAL X-RAY');
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
  execSync(cmd, { stdio: 'inherit' });

  // Copia para a pasta de artefatos
  fs.copyFileSync(outPath, path.join(artifactDir, t.filename));
  console.log(`✅ ${t.filename} gerada com sucesso! (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)\n`);
}

// Copia também para official
const offSrc = path.join(thumbDir, 'thumbnail_variant_c_final_handoff.png');
const offDst = path.join(thumbDir, 'thumbnail_variant_c_official.png');
fs.copyFileSync(offSrc, offDst);
fs.copyFileSync(offSrc, path.join(artifactDir, 'thumbnail_variant_c_official.png'));

console.log('🎉 Todas as thumbnails 4K Industrial X-Ray foram renderizadas!');
