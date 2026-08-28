import path from 'path';
import fs from 'fs';
import { PublicationPackagingSquad } from '../packaging-agent/index';
import { RunManifest } from '../pipeline/runManifest';
import { ArtifactRegistry } from '../pipeline/artifactRegistry';

async function main(): Promise<void> {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('📦 GERANDO PACOTE DE EMBALAGEM, THUMBNAILS 4K & SEO // EP04');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const episodeId = 'OOL-EP04-GPS-TEMPO';
  const prodDir = path.join(process.cwd(), 'runs', episodeId);
  const postDir = path.join(prodDir, 'postproduction');
  const thumbDir = path.join(postDir, 'thumbnails');

  fs.mkdirSync(thumbDir, { recursive: true });

  const squad = new PublicationPackagingSquad();

  const result = squad.run({
    productionId: episodeId,
    episodeId: 'OOL-004',
    episodeTitle: 'O Outro Lado do GPS: O Relógio Atômico que Evita o Colapso dos Bancos',
    objectOrFlow: 'Pulsos de Tempo Atômico e Sincronização de Transações Financeiras',
    systemBeingAnalyzed: 'Constelação GPS de 31 Satélites e Dilatação Temporal Relativística',
    heroVisual: 'Cavidade Atômica de Césio-133 em Laser Azul com Telemetria Ciano',
    mainConstraint: 'Desvio Obrigatório de +38.7 Microssegundos por Dia',
    primaryConsequence: 'Erro de 11.6 km por Dia e Colapso das Redes Bancárias e 5G',
    centralQuestion: 'Se o GPS não é um mapa, mas um relógio atômico, o que acontece se o tempo no espaço desviar 38 microssegundos?',
    baseImages: {
      A: 'assets/submarine_curated/laser_silica_lab.jpg',
      B: 'assets/submarine_curated/satellite_space.jpg',
      C: 'assets/submarine_curated/server_room_datacenter.jpg'
    },
    outputDirectory: postDir,
    recommendedVariant: 'C'
  });

  // Gera as 3 Thumbnails 4K físicas (3840x2160) com ffmpeg se ainda não existirem
  const variants = [
    { id: 'a', name: 'thumbnail_variant_a_mechanism.png', src: 'assets/submarine_curated/laser_silica_lab.jpg', title: 'CÉSIO-133: 9.192.631.770/s' },
    { id: 'b', name: 'thumbnail_variant_b_consequence.png', src: 'assets/submarine_curated/satellite_space.jpg', title: 'SE O TEMPO DERIVAR 0.000038s' },
    { id: 'c', name: 'thumbnail_variant_c_official.png', src: 'assets/submarine_curated/server_room_datacenter.jpg', title: 'O GPS NÃO É UM MAPA' }
  ];

  for (const v of variants) {
    const thumbPath = path.join(thumbDir, v.name);
    const cmd = `ffmpeg -y -hide_banner -loglevel error -i "${v.src}" -vf "scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,eq=contrast=1.15:gamma=0.92:saturation=1.10" -frames:v 1 "${thumbPath}"`;
    require('child_process').execSync(cmd);
    console.log(`✅ Thumbnail 4K gerada: ${v.name} (${(fs.statSync(thumbPath).size / 1024 / 1024).toFixed(2)} MB)`);
  }

  // Gera description.txt
  const descPath = path.join(postDir, 'description.txt');
  const descContent = [
    `O Outro Lado do GPS: O Relógio Atômico que Evita o Colapso dos Bancos`,
    ``,
    `Se a constelação inteira de 31 satélites de GPS fosse desligada agora, os carros continuariam andando pelas ruas com mapas salvos na memória. Porém, em menos de 10 minutos, o sistema bancário global travaria, o Pix pararia de funcionar e as redes 5G entrariam em colapso.`,
    ``,
    `Neste documentário investigativo, revelamos a verdade física oculta: o GPS não é um sistema de localização. Ele é o relógio mestre da civilização moderna.`,
    ``,
    `CAPÍTULOS:`,
    `00:00 - O Mito do Mapa & O Desligamento Invisível`,
    `01:20 - A Constelação Orbital & A Física do Tempo`,
    `02:45 - A Jornada do Nanossegundo: Wall Street & Faria Lima`,
    `04:10 - O Paradoxo de Einstein: O Erro de 38 Microssegundos`,
    `05:50 - A Sala de Controle & Redes Terrestres de Redundância`,
    `07:15 - A Infraestrutura Mais Frágil da Terra`,
    ``,
    `TAGS:`,
    `#GPS #Relatividade #EconomiaDigital #Pix #Tecnologia #Documentario #OOutroLado`
  ].join('\n');
  fs.writeFileSync(descPath, descContent, 'utf8');

  // Atualiza manifesto
  const manifest = new RunManifest(prodDir, episodeId);
  manifest.startStage('PACKAGING', 5);
  manifest.completeStage('PACKAGING', 5, {
    recommendedTitle: result.metadata.recommended_title,
    recommendedVariant: result.metadata.recommended_thumbnail_variant
  });
  manifest.recordAsset('postproduction/youtube-metadata.json', path.join(postDir, 'youtube-metadata.json'));
  manifest.recordAsset('postproduction/description.txt', descPath);
  manifest.recordAsset('postproduction/publication-summary.md', path.join(postDir, 'publication-summary.md'));
  for (const v of variants) {
    manifest.recordAsset(`postproduction/thumbnails/${v.name}`, path.join(thumbDir, v.name));
  }

  // Registra no ArtifactRegistry
  new ArtifactRegistry().registerRun(prodDir, episodeId);

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('🎉 PACOTE DE EMBALAGEM E METADADOS CONCLUÍDO COM SUCESSO!');
  console.log('══════════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ Erro no Packaging do EP04:', err);
  process.exit(1);
});
