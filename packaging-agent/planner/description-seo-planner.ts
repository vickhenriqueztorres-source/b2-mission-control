import {PackagingRagClient} from '../rag/packaging-rag-client';
import {ChapterItem, TitleCandidate, YouTubePublicationMetadata} from '../types/publication.types';

export class DescriptionAndSeoPlanner {
  private readonly rag = new PackagingRagClient();

  plan(input: {
    episodeId: string;
    episodeTitle: string;
    objectOrFlow: string;
    systemBeingAnalyzed: string;
    centralQuestion: string;
    primaryConsequence: string;
    titles: readonly TitleCandidate[];
    recommendedTitleVariant: 'A' | 'B' | 'C';
  }): YouTubePublicationMetadata {
    const recommended_title =
      input.titles.find((t) => t.variant_id === input.recommendedTitleVariant)?.title || input.titles[0].title;

    const isEp2 = input.objectOrFlow.toLowerCase().includes('cabo') || input.episodeTitle.toLowerCase().includes('cabo');

    // 1. Hook editorial de 2-3 linhas (Above the fold)
    const hook_lines = isEp2
      ? [
          'Este documentário investiga como 99% da internet mundial viaja por cabos de 25 milímetros no fundo do Oceano Atlântico.',
          'Revelamos a infraestrutura física invisível de estações de aterrisagem em Fortaleza e Praia Grande, repetidores ópticos de 10.000 Volts e o failover BGP em 15 milissegundos.'
        ]
      : [
          'Este documentário investiga como o Pix processa 140 milhões de transações diárias em menos de 1,4 segundo.',
          'Revelamos a infraestrutura física invisível de servidores criptográficos HSM, redes de fibra ótica subterrânea e o protocolo ISO 20022 que operam 24/7 no Brasil sem que ninguém veja.'
        ];

    // 2. Capítulos com intenção de busca
    const chapters: ChapterItem[] = isEp2
      ? [
          {
            time_seconds: 0,
            timestamp: '00:00',
            title: 'O Mito do Satélite e o Clique em 4K',
            search_intent_topic: 'como a internet viaja pelo mundo'
          },
          {
            time_seconds: 45,
            timestamp: '00:45',
            title: 'A Anatomia do Cabo de 25mm: Raio-X 3D',
            search_intent_topic: 'tamanho do cabo submarino de internet'
          },
          {
            time_seconds: 95,
            timestamp: '01:35',
            title: 'O Abismo a 4.000m e os Repetidores de 10.000V',
            search_intent_topic: 'repetidor optico de erbio edfa submarino'
          },
          {
            time_seconds: 140,
            timestamp: '02:20',
            title: 'As Estações de Aterrisagem: Fortaleza e Praia Grande',
            search_intent_topic: 'estacao de cabos submarinos praia do futuro'
          },
          {
            time_seconds: 190,
            timestamp: '03:10',
            title: 'Âncoras, Tubarões e o Redirecionamento BGP em 15ms',
            search_intent_topic: 'o que acontece se cortar cabo submarino de internet'
          },
          {
            time_seconds: 240,
            timestamp: '04:00',
            title: 'Conclusão: A Fragilidade dos 25 Milímetros',
            search_intent_topic: 'importancia dos cabos submarinos no brasil'
          }
        ]
      : [
          {
            time_seconds: 0,
            timestamp: '00:00',
            title: 'O Clique Invisível e os 12 Milissegundos',
            search_intent_topic: 'como funciona a velocidade do pix'
          },
          {
            time_seconds: 45,
            timestamp: '00:45',
            title: 'A Rota da Fibra Ótica até o Datacenter',
            search_intent_topic: 'rede de fibra ótica do banco central'
          },
          {
            time_seconds: 110,
            timestamp: '01:50',
            title: 'Dentro do Cofre: O Criptoprocessador HSM',
            search_intent_topic: 'segurança e criptografia hsm pix'
          },
          {
            time_seconds: 195,
            timestamp: '03:15',
            title: 'O Protocolo ISO 20022 e a Liquidação no SPI',
            search_intent_topic: 'sistema de pagamentos instantaneos spi bacen'
          },
          {
            time_seconds: 280,
            timestamp: '04:40',
            title: 'Risco Sistêmico: O Que Acontece Se a Rede Cair?',
            search_intent_topic: 'o que acontece se o pix cair falha geral'
          },
          {
            time_seconds: 340,
            timestamp: '05:40',
            title: 'Conclusão: A Máquina que Nunca Dorme',
            search_intent_topic: 'o outro lado da infraestrutura bancaria'
          }
        ];

    const chaptersText = chapters.map((c) => `${c.timestamp} ${c.title}`).join('\n');

    // 3. Descrição Completa em Camadas
    const description_full = [
      hook_lines.join('\n'),
      '',
      `🔍 Pergunta Central: ${input.centralQuestion}`,
      `⚠️ O que está em jogo: ${input.primaryConsequence}`,
      '',
      '📌 CAPÍTULOS DESTA INVESTIGAÇÃO:',
      chaptersText,
      '',
      '📄 FONTES E DOCUMENTAÇÃO OFICIAL:',
      isEp2
        ? '- ITU-T G.977 — Characteristics of optically amplified optical submarine cable systems\n- Submarine Telecoms Forum — Annual Submarine Cable Industry Report\n- NIC.br / IX.br — Ponto de Troca de Tráfego de São Paulo e Dorsal Nacional\n- Telegeography — Submarine Cable Map Interactive Registry'
        : '- Banco Central do Brasil — Regulamento do Sistema de Pagamentos Instantâneos (SPI)\n- Manual de Segurança e Criptografia do Pix (Resolução BCB)\n- Especificações Técnicas do Protocolo ISO 20022 XML (pain.001 / pacs.008)\n- Relatórios de Resiliência do RSFN (Rede do Sistema Financeiro Nacional)',
      '',
      '🔗 PRÓXIMA INVESTIGAÇÃO (CLUSTER DEEP TECH):',
      'Assista à playlist oficial de infraestruturas invisíveis no Brasil.',
      '',
      '🎬 O OUTRO LADO // DOCUMENTÁRIOS',
      'Investigar. Revelar. Compreender.',
      'O que acontece depois que você clica, compra, liga ou aperta.',
      '',
      isEp2
        ? '#OOutroLado #Internet #CabosSubmarinos #DeepTech #FibraOptica #Tecnologia'
        : '#OOutroLado #Pix #Documentario #BancoCentral #Tecnologia #Infraestrutura'
    ].join('\n');

    // 4. Taxonomia de Tags Estratégicas
    const tags = isEp2
      ? {
          core_entities: [
            'Cabos Submarinos',
            'Internet Submarina',
            'Fibra Ótica',
            'Praia Grande',
            'Fortaleza',
            'Praia do Futuro',
            'Oceano Atlântico'
          ],
          technical_mechanisms: [
            'Repetidor EDFA',
            'Fibra Dopada com Érbio',
            'BGP Failover',
            'OTDR',
            'Tensão 10000V',
            'Multiplexação Óptica DWDM',
            'IX.br'
          ],
          search_intent_queries: [
            'como a internet chega ao brasil',
            'cabo submarino de internet',
            'o que acontece se cortar cabo submarino',
            'mapa dos cabos submarinos brasil',
            'velocidade da luz na fibra optica',
            'como funciona cabo de fibra submarino'
          ],
          channel_branding: [
            'O Outro Lado',
            'O Outro Lado Documentário',
            'Engenharia Oculta',
            'Deep Tech Brasil',
            'Investigação Tecnológica',
            'Documentários em Português'
          ],
          all_flat_tags: [
            'Cabos Submarinos',
            'Internet Submarina',
            'Fibra Ótica',
            'Praia Grande',
            'Fortaleza',
            'Praia do Futuro',
            'Oceano Atlântico',
            'Repetidor EDFA',
            'Fibra Dopada com Érbio',
            'BGP Failover',
            'Tensão 10000V',
            'como a internet chega ao brasil',
            'cabo submarino de internet',
            'o que acontece se cortar cabo submarino',
            'O Outro Lado',
            'Documentário',
            'Tecnologia',
            'Engenharia Oculta',
            'Deep Tech Brasil'
          ]
        }
      : {
          core_entities: [
            'Pix',
            'Banco Central do Brasil',
            'BACEN',
            'SPI',
            'RSFN',
            'Sistema de Pagamentos Instantâneos',
            'Bancos Brasileiros'
          ],
          technical_mechanisms: [
            'ISO 20022',
            'Hardware Security Module',
            'HSM',
            'Criptografia de Curva Elíptica',
            'Fibra Ótica Subterrânea',
            'Datacenter Bancário',
            'Liquidação Bruta em Tempo Real'
          ],
          search_intent_queries: [
            'como funciona o pix',
            'bastidores do pix',
            'o pix é seguro',
            'por que o pix é tão rápido',
            'como os bancos processam pagamentos',
            'o que acontece se o pix cair',
            'servidores do banco central',
            'tecnologia por tras do pix'
          ],
          channel_branding: [
            'O Outro Lado',
            'O Outro Lado Documentário',
            'Engenharia Oculta',
            'Deep Tech Brasil',
            'Investigação Tecnológica',
            'Documentários em Português'
          ],
          all_flat_tags: [
            'Pix',
            'Banco Central do Brasil',
            'BACEN',
            'SPI',
            'RSFN',
            'ISO 20022',
            'HSM',
            'Criptografia',
            'Datacenter',
            'Fibra Ótica',
            'como funciona o pix',
            'bastidores do pix',
            'o pix é seguro',
            'segurança bancaria',
            'o que acontece se o pix cair',
            'O Outro Lado',
            'Documentario',
            'Tecnologia',
            'Engenharia Oculta',
            'Deep Tech Brasil'
          ]
        };

    const hashtags = isEp2
      ? [
          '#OOutroLado',
          '#Internet',
          '#CabosSubmarinos',
          '#DeepTech',
          '#FibraOptica',
          '#Tecnologia',
          '#Documentario'
        ]
      : [
          '#OOutroLado',
          '#Pix',
          '#Documentario',
          '#BancoCentral',
          '#Tecnologia',
          '#Infraestrutura',
          '#FinTech'
        ];

    // 5. Ponte com Shorts
    const shorts_bridge = isEp2
      ? {
          short_hook: 'Você abre o Instagram em 1 segundo. Mas o que acontece no fundo do Oceano Atlântico para esse vídeo chegar até você?',
          bridge_question: 'Por que 99% da internet não vem do céu, mas de um tubo de 25mm debaixo d\'água?',
          pinned_comment:
            '👉 Assista ao documentário completo sobre os cabos submarinos do Brasil: [Link do Vídeo Completo]'
        }
      : {
          short_hook: 'Você faz um Pix em 1 segundo. Mas o que acontece fisicamente nos 12 milissegundos seguintes?',
          bridge_question: 'Por que o sistema nunca cai no Brasil inteiro de uma só vez?',
          pinned_comment:
            '👉 Assista ao documentário completo com os bastidores dos servidores do Bacen: [Link do Vídeo Completo]'
        };

    // 6. Matriz de Hipóteses de Teste A/B/C
    const ab_test_matrix = isEp2
      ? {
          hypothesis_a: 'Variante A atrai público técnico e curiosidade por escala física (25 milímetros).',
          hypothesis_b: 'Variante B atrai público amplo por aversão à perda e risco de apagão digital (Se o cabo cortar?).',
          hypothesis_c: 'Variante C estabelece autoridade documental investigativa da marca O Outro Lado.',
          primary_decision_metric: 'WATCH_TIME_SHARE' as const
        }
      : {
          hypothesis_a: 'Variante A atrai público técnico e entusiastas de mecanismo (Foco no Hardware HSM e 1,4s).',
          hypothesis_b: 'Variante B atrai público amplo e engajamento por aversão à perda (Foco no risco de queda sistêmica).',
          hypothesis_c: 'Variante C estabelece a identidade institucional e autoridade investigativa da marca.',
          primary_decision_metric: 'WATCH_TIME_SHARE' as const
        };

    return {
      title_candidates: input.titles,
      recommended_title,
      recommended_thumbnail_variant: input.recommendedTitleVariant,
      hook_lines,
      description_full,
      chapters,
      tags,
      hashtags,
      shorts_bridge,
      ab_test_matrix
    };
  }
}
