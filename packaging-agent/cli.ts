import path from 'path';
import {PublicationPackagingSquad} from './index';

async function main() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('📦 SQUAD DE PUBLICAÇÃO, THUMBNAILS, TÍTULOS E SEO (RAG-DRIVEN)');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const squad = new PublicationPackagingSquad();

  const result = squad.run({
    productionId: 'OOL-EP01-PIX',
    episodeId: 'OOL-001',
    episodeTitle: 'O Outro Lado do Pix: A Máquina Invisível de 1,4 Segundo',
    objectOrFlow: 'O Pacote de Dados Criptográfico do Pix',
    systemBeingAnalyzed: 'Sistema de Pagamentos Instantâneos (SPI) do Banco Central',
    heroVisual: 'Criptoprocessador HSM em Sala Segura Blindada',
    mainConstraint: 'Latência de 12ms e Criptografia de Chave Privada',
    primaryConsequence: 'Risco de Travamento em 140 Milhões de Transações Diárias',
    centralQuestion: 'O que acontece fisicamente nos 1,4 segundo entre clicar e pagar?',
    baseImages: {
      A: 'editorial/execution/OOL_010/firefly_start_frame.png',
      B: 'editorial/execution/OOL_002/firefly_start_frame.png',
      C: 'editorial/execution/OOL_008/firefly_start_frame.png'
    },
    outputDirectory: 'runs/OOL-EP01-PIX/postproduction',
    recommendedVariant: 'C'
  });

  console.log('✅ Pacote de Publicação Gerado com Sucesso!\n');
  console.log(`📌 Título Recomendado: "${result.metadata.recommended_title}"`);
  console.log(`🖼️ Thumbnail Recomendada: Variante ${result.metadata.recommended_thumbnail_variant}`);
  console.log(`📁 Resumo em: ${result.summary_md_path}\n`);
}

main().catch((err) => {
  console.error('❌ Erro no Squad de Publicação:', err);
  process.exit(1);
});
