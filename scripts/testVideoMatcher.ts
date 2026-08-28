import { VideoRepositoryMatcher } from '../hsl/media/videoRepositoryMatcher';
import { VideoMatchRequest } from '../hsl/media/types';

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🧪 TESTE DO VIDEO REPOSITORY MATCHER (BUSCA SEMÂNTICA DE B-ROLLS)');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const testRequests: VideoMatchRequest[] = [
    {
      sceneId: 'SC_001',
      chapterTitle: 'O GATILHO & O MITO COTIDIANO',
      visualSubject: 'Rodovia escura a noite com asfalto molhado e trafego de carros em alta velocidade',
      tags: ['asfalto', 'noturno', 'rodovia', 'chuva'],
      requiredCategory: 'infrastructure'
    },
    {
      sceneId: 'SC_003',
      chapterTitle: 'A ANATOMIA DO SISTEMA',
      visualSubject: 'Corredor escuro de data center com racks de servidores e leds de dados piscando em fibra otica',
      tags: ['servidores', 'datacenter', 'telemetria', 'fibra_otica'],
      requiredCategory: 'cyber_telemetry'
    },
    {
      sceneId: 'SC_009',
      chapterTitle: 'A RESISTENCIA MECANICA',
      visualSubject: 'Cabecote industrial de corte a laser cortando chapa de aco pesada com chuva de faiscas alaranjadas',
      tags: ['laser', 'corte', 'usinagem', 'aco'],
      requiredCategory: 'industrial'
    },
    {
      sceneId: 'SC_025',
      chapterTitle: 'O ABISMO ATLANTICO',
      visualSubject: 'Cabo submarino repousando no leito de areia a 4000 metros de profundidade no fundo do mar escuro',
      tags: ['submarino', 'abismo', 'oceano', 'profundidade'],
      requiredCategory: 'deep_sea'
    },
    {
      sceneId: 'SC_030',
      chapterTitle: 'O GARGALO PORTUARIO',
      visualSubject: 'Guindaste gigante içando conteiner de carga pesado no porto de Santos',
      tags: ['porto', 'conteiner', 'guindaste', 'logistica'],
      requiredCategory: 'industrial'
    },
    {
      sceneId: 'SC_035',
      chapterTitle: 'A TRIAGEM DE ENCOMENDAS',
      visualSubject: 'Esteira rolante automatizada transportando pacotes e caixas em centro de distribuicao',
      tags: ['pacote', 'esteira', 'triagem', 'logistica'],
      requiredCategory: 'industrial'
    },
    {
      sceneId: 'SC_040',
      chapterTitle: 'A FISICA DA AGUA',
      visualSubject: 'Agua cristalina saindo da torneira e enchendo copo de vidro em close macro',
      tags: ['agua', 'torneira', 'copo', 'hidraulica'],
      requiredCategory: 'macro_physics'
    }
  ];

  for (const req of testRequests) {
    console.log(`[QUERY] Cena ${req.sceneId} (${req.requiredCategory}): "${req.visualSubject}"`);
    const smartResult = VideoRepositoryMatcher.matchScene(req, 'smart');
    console.log(`  -> Ação Recomendada: ${smartResult.recommendedAction}`);
    console.log(`  -> Score: ${(smartResult.matchScore * 100).toFixed(1)}%`);
    console.log(`  -> Motivo: ${smartResult.reason}`);
    if (smartResult.videoEntry) {
      console.log(`  -> Vídeo Selecionado: ${smartResult.videoEntry.id} (${smartResult.videoEntry.filename})`);
      console.log(`  -> Movimento Recomendado: ${smartResult.videoEntry.recommendedMotion}`);
    }
    console.log('-------------------------------------------------------------------');
  }

  console.log('\n[TESTE COMPLETO] Matcher executado com sucesso.');
}

main().catch(err => {
  console.error('[ERRO_TESTE]', err);
  process.exit(1);
});
