import path from 'path';
import {PublicationPackagingSquad} from '../packaging-agent';

async function main() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('📦 SQUAD DE PACKAGING & SEO — EPISÓDIO 02: CABOS SUBMARINOS');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const squad = new PublicationPackagingSquad();

  const result = squad.run({
    productionId: 'runs/OOL-EP02-CABOS',
    episodeId: 'OOL-002',
    episodeTitle: 'O Outro Lado da Internet: Os Cabos Submarinos no Fundo do Oceano',
    objectOrFlow: 'Cabo Submarino de 25mm de Fibra Ótica',
    systemBeingAnalyzed: 'Rede Dorsal Submarina Internacional e Repetidores de 10.000V',
    heroVisual: 'Corte transversal do cabo submarino emitindo laser laranja no abismo escuro do Oceano Atlântico',
    mainConstraint: 'Espessura de apenas 25mm suportando 400 atmosferas de pressão a 4.000m de profundidade',
    primaryConsequence: 'Risco de Ruptura por Âncoras e Redirecionamento BGP Autônomo em 15 Milissegundos',
    centralQuestion: 'O que acontece no fundo do mar quando você dá play em um vídeo em 4K no celular?',
    baseImages: {
      A: 'editorial/execution/OOL_008/firefly_start_frame.png',
      B: 'editorial/execution/OOL_031/firefly_start_frame.png',
      C: 'editorial/execution/OOL_015/firefly_start_frame.png'
    },
    outputDirectory: 'runs/OOL-EP02-CABOS/postproduction',
    recommendedVariant: 'C'
  });

  console.log('\n🎉 PACOTE DE PUBLICAÇÃO DO EPISÓDIO 02 GERADO COM SUCESSO!');
  console.log(`📌 Título Recomendado: "${result.metadata.recommended_title}"`);
  console.log(`🖼️ Thumbnail Recomendada: Variante ${result.metadata.recommended_thumbnail_variant}`);
  console.log(`📁 Resumo em: ${result.summary_md_path}\n`);
}

main().catch((err) => {
  console.error('❌ Erro no Packaging Agent:', err);
  process.exit(1);
});
