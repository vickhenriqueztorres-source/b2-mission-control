import fs from 'fs';
import path from 'path';
import {execSync} from 'child_process';

async function main() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🖼️ SQUAD DE THUMBNAILS 4K — IDENTIDADE OFICIAL: O OUTRO LADO');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const outDir = path.resolve('runs/OOL-EP01-PIX/postproduction/thumbnails');
  fs.mkdirSync(outDir, {recursive: true});

  // Imagens 35mm cinematográficas do episódio
  const baseImages = {
    hsmVault: 'editorial/execution/OOL_010/firefly_start_frame.png',
    datacenterCore: 'editorial/execution/OOL_002/firefly_start_frame.png',
    cyberRoute: 'editorial/execution/OOL_008/firefly_start_frame.png'
  };

  const variants = [
    {
      id: 'variant_a_mechanism',
      title: 'A Máquina de 1,4 Segundo',
      baseImage: baseImages.hsmVault,
      categoryBadge: 'INFRAESTRUTURA // EPISÓDIO 01',
      headlineLines: ['A MÁQUINA DE', '1,4 SEGUNDO'],
      subheadline: 'O QUE ACONTECE NOS BASTIDORES DO BACEN',
      outputFile: path.join(outDir, 'thumbnail_variant_a_mechanism.png')
    },
    {
      id: 'variant_b_consequence',
      title: 'O Que Acontece Se o Pix Cair?',
      baseImage: baseImages.datacenterCore,
      categoryBadge: 'RISCO SISTÊMICO // EPISÓDIO 01',
      headlineLines: ['O QUE ACONTECE', 'SE O PIX CAIR?'],
      subheadline: 'A VULNERABILIDADE QUE POUCOS CONHECEM',
      outputFile: path.join(outDir, 'thumbnail_variant_b_consequence.png')
    },
    {
      id: 'variant_c_official',
      title: 'O Outro Lado do Pix',
      baseImage: baseImages.cyberRoute,
      categoryBadge: 'INVESTIGAÇÃO // EPISÓDIO 01',
      headlineLines: ['O OUTRO LADO', 'DO PIX'],
      subheadline: 'A ENGENHARIA OCULTA DE 140 MILHÕES DE TRANSAÇÕES',
      outputFile: path.join(outDir, 'thumbnail_variant_c_official.png')
    }
  ];

  for (const v of variants) {
    console.log(`🎨 Renderizando 4K Thumbnail: [${v.id}] — "${v.title}"...`);
    const props = {
      baseImageSrc: v.baseImage,
      headlineLines: v.headlineLines,
      categoryBadge: v.categoryBadge,
      subheadline: v.subheadline,
      textSide: 'LEFT',
      accentColor: '#FF5500',
      telemetryColor: '#00F0FF'
    };

    const propsJson = JSON.stringify(props).replace(/"/g, '\\"');
    const cmd = `npx remotion still remotion/index.ts HslThumbnail "${v.outputFile}" --props="${propsJson}"`;

    try {
      execSync(cmd, {stdio: 'inherit'});
      console.log(`  ✅ Salvo: ${v.outputFile}\n`);
    } catch (e) {
      console.error(`  ❌ Erro ao renderizar ${v.id}:`, e);
    }
  }

  // Copia a variante recomendada oficial como thumbnail principal
  const officialThumb = path.resolve('runs/OOL-EP01-PIX/postproduction/thumbnail.png');
  const pubThumb = path.resolve('public/postproduction/thumbnail.png');
  if (fs.existsSync(variants[2].outputFile)) {
    fs.copyFileSync(variants[2].outputFile, officialThumb);
    fs.copyFileSync(variants[2].outputFile, pubThumb);
    console.log(`⭐ Thumbnail Oficial 4K definida: ${officialThumb}`);
  }

  console.log('\n🎉 SQUAD DE THUMBNAILS ATUALIZADO COM A IDENTIDADE "O OUTRO LADO"!');
}

main().catch((err) => {
  console.error('❌ Erro no Squad de Thumbnails:', err);
  process.exit(1);
});
