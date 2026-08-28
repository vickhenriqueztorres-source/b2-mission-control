import {PackagingRagClient} from '../rag/packaging-rag-client';
import {ThumbnailConcept, TitleCandidate} from '../types/publication.types';

export class TitlePlanner {
  private readonly rag = new PackagingRagClient();

  plan(input: {
    objectOrFlow: string;
    systemBeingAnalyzed: string;
    centralQuestion: string;
    primaryConsequence: string;
    thumbnailConcepts: readonly ThumbnailConcept[];
  }): readonly TitleCandidate[] {
    const isEp2 = input.objectOrFlow.toLowerCase().includes('cabo') || input.systemBeingAnalyzed.toLowerCase().includes('submarina');

    const titles: TitleCandidate[] = isEp2
      ? [
          {
            variant_id: 'A',
            type: 'SEARCH_INTENT',
            title: 'Como a Internet Chega ao Brasil: Os Cabos Submarinos no Fundo do Oceano',
            desire_driver: 'Entender a engenharia oculta e os bastidores físicos da rede mundial',
            target_ctr_goal: '8.0% - 9.5% em Busca e Sugeridos'
          },
          {
            variant_id: 'B',
            type: 'BROWSE_CURIOSITY',
            title: 'O Cabo de 25mm no Fundo do Mar que Sustenta a Internet de 200 Milhões de Pessoas',
            desire_driver: 'Curiosidade em escala monumental e fragilidade de infraestrutura',
            target_ctr_goal: '9.0% - 11.5% na Página Inicial (Browse)'
          },
          {
            variant_id: 'C',
            type: 'PARADOX_CONTRADICTION',
            title: 'O Outro Lado da Internet: O Que Acontece Se os Cabos Submarinos Forem Cortados?',
            desire_driver: 'Risco sistêmico de colapso, vulnerabilidade oculta e curiosidade técnica',
            target_ctr_goal: '9.5% - 13.0% em Recomendação e Sugeridos'
          }
        ]
      : [
          {
            variant_id: 'A',
            type: 'SEARCH_INTENT',
            title: 'Como Funciona o Pix: A Infraestrutura Invisível de 1,4 Segundo',
            desire_driver: 'Entender a engenharia oculta e os bastidores reais do sistema financeiro',
            target_ctr_goal: '7.5% - 9.0% em Busca e Sugeridos'
          },
          {
            variant_id: 'B',
            type: 'BROWSE_CURIOSITY',
            title: 'A Máquina Oculta que Move 140 Milhões de Pagamentos no Brasil',
            desire_driver: 'Curiosidade em escala monumental e volume nacional de dados',
            target_ctr_goal: '8.5% - 11.0% na Página Inicial (Browse)'
          },
          {
            variant_id: 'C',
            type: 'PARADOX_CONTRADICTION',
            title: 'O Outro Lado do Pix: O Que Acontece Se os Servidores do Bacen Pararem?',
            desire_driver: 'Risco sistêmico, vulnerabilidade oculta e revelação de bastidores',
            target_ctr_goal: '9.0% - 12.5% em Recomendação e Sugeridos'
          }
        ];

    // Validação estrita: O título não pode ser idêntico à headline da thumbnail correspondente
    for (const t of titles) {
      const matchingThumb = input.thumbnailConcepts.find((tc) => tc.variant_id === t.variant_id);
      if (matchingThumb && matchingThumb.headline_text.toLowerCase() === t.title.toLowerCase()) {
        throw new Error(`TITLE_REPEATS_THUMBNAIL_HEADLINE_VIOLATION:${t.variant_id}`);
      }
    }

    return titles;
  }
}
