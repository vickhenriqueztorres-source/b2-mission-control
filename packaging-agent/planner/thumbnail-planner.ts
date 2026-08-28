import {PackagingRagClient} from '../rag/packaging-rag-client';
import {ThumbnailConcept, ThumbnailVariantId} from '../types/publication.types';

export class ThumbnailPlanner {
  private readonly rag = new PackagingRagClient();

  plan(input: {
    episodeTitle: string;
    objectOrFlow: string;
    systemBeingAnalyzed: string;
    heroVisual: string;
    mainConstraint: string;
    primaryConsequence: string;
  }): readonly ThumbnailConcept[] {
    const isEp2 = input.objectOrFlow.toLowerCase().includes('cabo') || input.episodeTitle.toLowerCase().includes('cabo');

    const rawConcepts: Array<{
      id: ThumbnailVariantId;
      role: ThumbnailConcept['role'];
      intent: ThumbnailConcept['target_audience_intent'];
      emotion: ThumbnailConcept['emotion_trigger'];
      focal: string;
      gaze: ThumbnailConcept['gaze_direction'];
      evidence: string;
      headline: string;
      subheadline: string;
      badge: string;
      side: ThumbnailConcept['composition_side'];
      rational: string;
    }> = isEp2
      ? [
          {
            id: 'A',
            role: 'MECHANISM',
            intent: 'BROWSE',
            emotion: 'TECH_CURIOSITY',
            focal: 'Corte Transversal do Cabo de 25mm com Feixe Laser',
            gaze: 'AT_EVIDENCE_RIGHT',
            evidence: '7 Camadas de aço e tubo de cobre energizado a 10.000V',
            headline: '25 MILÍMETROS',
            subheadline: 'A MÁQUINA DE FIBRA NO FUNDO DO MAR',
            badge: 'ENGENHARIA // EPISÓDIO 02',
            side: 'LEFT',
            rational: 'Mecanismo físico concreto + curiosidade de escala extrema (25mm sustentando 200 milhões de pessoas).'
          },
          {
            id: 'B',
            role: 'CONSEQUENCE',
            intent: 'SUGGESTED',
            emotion: 'CONSEQUENCE_COLLAPSE',
            focal: 'Cabo Submarino Rompido no Abismo a 4.000m',
            gaze: 'AT_EVIDENCE_LEFT',
            evidence: 'Âncora de navio cortando a fibra óptica e alerta de failover BGP',
            headline: 'SE O CABO CORTAR?',
            subheadline: 'O QUE ACONTECE NO FUNDO DO MAR',
            badge: 'RISCO GLOBAL // EPISÓDIO 02',
            side: 'LEFT',
            rational: 'Aversão à perda e risco de desconexão nacional instantânea sob o oceano.'
          },
          {
            id: 'C',
            role: 'FINAL_HANDOFF',
            intent: 'HYBRID',
            emotion: 'SURPRISE_DISCOVERY',
            focal: 'Feixe de Fótons Iluminando a Fossa Abissal Atlântica',
            gaze: 'AT_CAMERA',
            evidence: 'Selo oficial O Outro Lado + Repetidor óptico de Érbio em alta voltagem',
            headline: 'NO FUNDO DO MAR',
            subheadline: 'O OUTRO LADO DA INTERNET',
            badge: 'O OUTRO LADO // EPISÓDIO 02',
            side: 'LEFT',
            rational: 'Identidade editorial máxima com mistério e revelação de infraestrutura oculta.'
          }
        ]
      : [
          {
            id: 'A',
            role: 'MECHANISM',
            intent: 'BROWSE',
            emotion: 'TECH_CURIOSITY',
            focal: 'Criptoprocessador HSM e Circuito de Alta Segurança',
            gaze: 'AT_EVIDENCE_RIGHT',
            evidence: 'Linha de laser laranja cortando o chip de segurança bancária',
            headline: 'A MÁQUINA DE 1,4 SEGUNDO',
            subheadline: 'O QUE ACONTECE NOS BASTIDORES DO BACEN',
            badge: 'INFRAESTRUTURA // EPISÓDIO 01',
            side: 'LEFT',
            rational: 'Mecanismo físico concreto + curiosidade de tempo ultrarrápido (1,4s) revelando o hardware oculto.'
          },
          {
            id: 'B',
            role: 'CONSEQUENCE',
            intent: 'SUGGESTED',
            emotion: 'CONSEQUENCE_COLLAPSE',
            focal: 'Datacenter Central com Alerta Vermelho de Falha',
            gaze: 'AT_EVIDENCE_LEFT',
            evidence: 'Terminal de controle com status crítico de interrupção de transações',
            headline: 'O QUE ACONTECE SE O PIX CAIR?',
            subheadline: 'A VULNERABILIDADE QUE POUCOS CONHECEM',
            badge: 'RISCO SISTÊMICO // EPISÓDIO 01',
            side: 'LEFT',
            rational: 'Aversão à perda e risco de interrupção em grande escala no sistema financeiro nacional.'
          },
          {
            id: 'C',
            role: 'FINAL_HANDOFF',
            intent: 'HYBRID',
            emotion: 'SURPRISE_DISCOVERY',
            focal: 'Servidor Central do BACEN com Iluminação Chiaroscuro',
            gaze: 'AT_CAMERA',
            evidence: 'Selo oficial O Outro Lado + Linhas de telemetria ciano',
            headline: 'O OUTRO LADO DO PIX',
            subheadline: 'DOCUMENTÁRIO INVESTIGATIVO',
            badge: 'O OUTRO LADO // EPISÓDIO 01',
            side: 'LEFT',
            rational: 'Identidade editorial máxima aliada à curiosidade de bastidores oficiais.'
          }
        ];

    return rawConcepts.map((c) => {
      const words = c.headline.trim().split(/\s+/).filter(Boolean);
      const headline_lines =
        words.length <= 2
          ? [words.join(' ')]
          : words.length === 3
          ? [words.slice(0, 1).join(' '), words.slice(1).join(' ')]
          : [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')];

      return {
        variant_id: c.id,
        role: c.role,
        target_audience_intent: c.intent,
        emotion_trigger: c.emotion,
        focal_subject: c.focal,
        gaze_direction: c.gaze,
        evidence_highlight: c.evidence,
        headline_text: c.headline,
        headline_lines,
        subheadline_text: c.subheadline,
        category_badge: c.badge,
        color_palette: {
          background: '#060709',
          accent: '#FF5500',
          telemetry: '#00F0FF',
          textPrimary: '#F4F4F5'
        },
        prompt_for_dalle: [
          'Cinematic investigative documentary thumbnail base frame, 16:9 photorealistic 35mm film.',
          `Subject: ${c.focal}.`,
          `Evidence highlight: ${c.evidence}.`,
          'Denis Villeneuve Chiaroscuro aesthetic: deep carbon black shadows (#060709) with luminous sodium-vapor orange (#FF5500) and cyan telemetry (#00F0FF).',
          `Negative space preserved on the ${c.side.toLowerCase()} side for text overlay.`,
          'High visual contrast, single focal point, no embedded text or letters.'
        ].join(' '),
        composition_side: c.side,
        rational: c.rational
      };
    });
  }
}
