import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  HSL_REFERENCE_SHINGLE_WORDS,
  normalizeReferenceWords,
  phraseFingerprints
} from '../reference/referenceInsightIngestAgent';

export type AbrahamDomain =
  | 'AUDIO_ENGINEERING'
  | 'CONTRARIAN_STRATEGY'
  | 'ATTENTION_PSYCHOLOGY'
  | 'NICHE_AND_TOPIC'
  | 'COGNITIVE_PRODUCTIVITY'
  | 'SCRIPTWRITING'
  | 'POST_PRODUCTION';

export type AbrahamModuleId = 1 | 2 | 3 | 4 | 5;

export interface AbrahamRagChunk {
  readonly chunk_id: string;
  readonly domain: AbrahamDomain;
  readonly module_id: AbrahamModuleId;
  readonly module_title: string;
  readonly section_title: string;
  readonly source_file: string;
  readonly time_start_seconds?: number;
  readonly time_end_seconds?: number;
  readonly principles: readonly string[];
  readonly actionable_rules: readonly string[];
  readonly content: string;
  readonly keywords: readonly string[];
}

export interface AbrahamRagModuleSummary {
  readonly module_id: AbrahamModuleId;
  readonly title: string;
  readonly domain: AbrahamDomain;
  readonly chunk_count: number;
  readonly principles: readonly string[];
  readonly core_summary: string;
}

export interface AbrahamRagSnapshot {
  readonly schema: 'hsl.editorial.abraham-rag-index.v1';
  readonly schema_version: '1.0.0';
  readonly reference_only: true;
  readonly generated_at: string;
  readonly source_directory_label: 'DOCS ABRAHAM';
  readonly source_docs_sha256: string;
  readonly total_chunks: number;
  readonly modules: readonly AbrahamRagModuleSummary[];
  readonly chunks: readonly AbrahamRagChunk[];
  readonly phrase_fingerprints: readonly string[];
  readonly system_prompts: Readonly<Record<string, string>>;
  readonly json_schemas: Readonly<Record<string, Record<string, unknown>>>;
}

export interface AbrahamQueryOptions {
  readonly query: string;
  readonly domain?: AbrahamDomain;
  readonly module_id?: AbrahamModuleId;
  readonly top_k?: number;
  readonly min_score?: number;
}

export interface AbrahamScoredChunk {
  readonly chunk: AbrahamRagChunk;
  readonly score: number;
  readonly matched_terms: readonly string[];
}

export interface AbrahamRetrievalResult {
  readonly schema: 'hsl.editorial.abraham-retrieval.v1';
  readonly query: string;
  readonly domain_filter?: AbrahamDomain;
  readonly module_filter?: AbrahamModuleId;
  readonly total_matches: number;
  readonly scored_chunks: readonly AbrahamScoredChunk[];
  readonly principles: readonly string[];
  readonly actionable_rules: readonly string[];
  readonly augmented_context: string;
}

function sha256(value: string | Buffer): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function tokenize(text: string): string[] {
  return normalizeReferenceWords(text).filter((w) => w.length > 2);
}

const MODULE_DEFINITIONS: Record<
  AbrahamModuleId,
  {
    title: string;
    domain: AbrahamDomain;
    fileBase: string;
    principles: string[];
    summary: string;
  }
> = {
  1: {
    title: 'Módulo I — Engenharia de Áudio e Pós-Produção (DaVinci Fairlight & AI)',
    domain: 'AUDIO_ENGINEERING',
    fileBase: 'aula_01_trabalhando_com_audio',
    principles: [
      'NARRATION_IS_PRIMARY_STEM',
      'SEPARATE_AUDIO_INTO_6_STEMS',
      'DUCK_SUPPORTING_AUDIO_MANUALLY_OR_SIDECHAIN',
      'NOISE_REDUCTION_AUTO_OR_MANUAL_SAMPLE',
      'DE_HUMMER_60HZ_AMERICA_50HZ_EUROPE',
      'SAMPLE_LEVEL_CLICK_REPAIR',
      'VALIDATE_LUFS_AND_PEAKS_NO_CLIPPING'
    ],
    summary:
      'Organização estrita em 6 stems no DaVinci Fairlight (Narrador, Tripulação, Torre, Ambiência, SFX, Trilha a -20dB com ducking). Tratamento via Voice Isolation, De-Hummer de rede elétrica e edição no nível de sample.'
  },
  2: {
    title: 'Módulo II — Estratégia Contrariana de Conteúdo (Vá na Contramão)',
    domain: 'CONTRARIAN_STRATEGY',
    fileBase: 'aula_02_va_na_contramao',
    principles: [
      'WHEN_CROWD_BUYS_SHORT_BUILD_DENSE',
      'YOUTUBE_LONG_AND_PODCASTS_CREATE_PERENNIAL_EQUITY',
      'SHORTS_ARE_DISPOSABLE_TIME_KILLERS',
      'AUTORITY_DEMANDS_TIME_IN_VIEWER_MIND',
      'AVOID_MASS_AI_SUPERFICIAL_LISTICLES'
    ],
    summary:
      'Vitória digital pertence a quem rejeita vídeos rasos de 15 segundos. Conteúdos longos (>15 min) e podcasts constroem conexão humana profunda e autoridade perene.'
  },
  3: {
    title: 'Módulo III — Neurociência & Psicologia da Atenção (Captura e Retenção)',
    domain: 'ATTENTION_PSYCHOLOGY',
    fileBase: 'aula_03_psicologia_da_atencao',
    principles: [
      'SPECIFIC_NUMERICAL_ANCHOR',
      'PATTERN_INTERRUPT_VISUAL_AND_TEXT',
      'NEGATIVITY_BIAS_PAIN_AVOIDANCE',
      'DIRECT_TRIBE_CALLOUT',
      'PRECISE_PAIN_IDENTIFICATION',
      'CLEAR_NON_NEGOTIABLE_BENEFIT',
      'ZEIGARNIK_EFFECT_OPEN_CURIOSITY_LOOPS',
      'STRUCTURED_SCRIPT_RELEASES_VOCAL_ENERGY'
    ],
    summary:
      'Captura e retenção através das 7 alavancas psicológicas de título e clique, abertura de loops de curiosidade (Efeito Zeigarnik) e obrigatoriedade de roteiro estruturado para libertar a presença vocal.'
  },
  4: {
    title: 'Módulo IV — Arquitetura Temática & Funil de Nicho (Sobre o que Falar)',
    domain: 'NICHE_AND_TOPIC',
    fileBase: 'aula_04_sobre_o_que_falar',
    principles: [
      'ZERO_VIDEO_ELIMINATES_EXPERT_PARALYSIS',
      'CASE_STUDY_BORROWS_ESTABLISHED_AUTHORITY',
      'TOP_OF_FUNNEL_BROAD_APPEAL',
      'BOTTOM_OF_FUNNEL_ULTRA_SPECIFIC_DEPTH',
      'CONNECT_TECHNICAL_SYSTEM_TO_HUMAN_CONSEQUENCE'
    ],
    summary:
      'Estratégia temática para vencer a síndrome do impostor: Vídeo Zero como explorador público, método de estudo de caso ancorado em ícones consolidados e funil com amplitude no YouTube e profundidade no fundo.'
  },
  5: {
    title: 'Módulo V — Engenharia Cognitiva & Produtividade Zen (Criatividade vs Execução)',
    domain: 'COGNITIVE_PRODUCTIVITY',
    fileBase: 'aula_05_criatividade_vs_produtividade',
    principles: [
      'BRAIN_BANDWIDTH_LIMITATION_11M_BITS',
      'FOCUS_MODE_NARROW_EXECUTION',
      'DEFAULT_MODE_NETWORK_HOLISTIC_INSIGHTS',
      'MENTAL_OFFLOADING_TEM_QUE_LIST',
      'DAILY_TASK_SELECTION_2_TO_4_ITEMS',
      'CREATIVE_LEISURE_PROTOCOL_MORNING_EVENING'
    ],
    summary:
      'Alternância deliberada entre Rede Foco (execução estreita de roteiro/edição) e Rede Padrão Inativa (DMN / ócio criativo para conexões subconscientes). Protocolo de Despejo Mental com lista Tem-que.'
  }
};

/**
 * Constrói o snapshot completo do RAG Abraham a partir do diretório raiz DOCS ABRAHAM.
 */
export function buildAbrahamRagSnapshot(docsRoot: string): AbrahamRagSnapshot {
  const kbPath = path.join(docsRoot, 'KNOWLEDGE_BASE_CRIADOR_ZEN.md');
  const transcriptionsDir = path.join(docsRoot, 'transcriptions');

  if (!fs.existsSync(kbPath)) {
    throw new Error(`HSL_ABRAHAM_KB_REQUIRED:${kbPath}`);
  }
  if (!fs.existsSync(transcriptionsDir)) {
    throw new Error(`HSL_ABRAHAM_TRANSCRIPTIONS_REQUIRED:${transcriptionsDir}`);
  }

  const kbRaw = fs.readFileSync(kbPath, 'utf8');
  const allFingerprints = new Set<string>();
  phraseFingerprints(kbRaw).forEach((fp) => allFingerprints.add(fp));

  const chunks: AbrahamRagChunk[] = [];

  // 1. Extração estruturada de seções do KNOWLEDGE_BASE_CRIADOR_ZEN.md
  chunks.push(
    {
      chunk_id: 'abraham_kb_pilar_central',
      domain: 'CONTRARIAN_STRATEGY',
      module_id: 2,
      module_title: MODULE_DEFINITIONS[2].title,
      section_title: '1. Visão Geral e Filosofia Operacional - Antifrágil & Contrariano',
      source_file: 'KNOWLEDGE_BASE_CRIADOR_ZEN.md',
      principles: [
        'ANTIFRAGILE_CONTRARIAN_CORE',
        'HUMAN_CONNECTION_OVER_ALGORITHMIC_NOISE',
        'PERENNIAL_AUTHORITY_BY_DEPTH'
      ],
      actionable_rules: [
        'Rejeite vídeos curtos e descartáveis sem alma',
        'Construa autoridade perene através de conteúdo denso, reflexivo e de alta fidelidade técnica',
        'Priorize os 3 pilares: Profundidade Técnica, Psicologia Cognitiva e Equilíbrio Neural'
      ],
      content:
        'O Princípio Central do Criador Zen: No mercado digital e na economia de atenção, a vitória pertence àqueles que operam na contramão da manada. Enquanto criadores medíocres produzem conteúdo rápido, superficial, algorítmico e descartável (15-60s), o Criador Zen constrói autoridade perene, marcas pessoais sólidas e conexões humanas profundas com conteúdo denso, estruturado e de alta fidelidade.',
      keywords: ['contrariano', 'antifragil', 'densidade', 'autoridade', 'conexao humana', 'criador zen']
    },
    {
      chunk_id: 'abraham_kb_audio_stems_fairlight',
      domain: 'AUDIO_ENGINEERING',
      module_id: 1,
      module_title: MODULE_DEFINITIONS[1].title,
      section_title: '2.1 Estrutura de Stems e Monitoramento (DaVinci Fairlight)',
      source_file: 'KNOWLEDGE_BASE_CRIADOR_ZEN.md',
      principles: [
        'SEPARATE_AUDIO_INTO_6_STEMS',
        'NARRATOR_STEM_PRIMARY_GAIN',
        'AMBIENCE_BED_MASKS_CUTS',
        'MUSIC_BED_MINUS_20DB_WITH_DUCKING'
      ],
      actionable_rules: [
        'Pista 1: Narrador (Voz principal - ganho no topo, faixa amarela, sem clipping > 0 dB)',
        'Pista 2: Tripulação / Diálogo Secundário (Efeitos de modulação/rádio)',
        'Pista 3: Torre de Comando / Entrevistado (Voz secundária com tratamento espacial)',
        'Pista 4: Ambiente / Ambience Bed (Textura contínua usada para mascarar cortes e respirações)',
        'Pista 5: SFX / Frequências Dinâmicas (Efeitos sonoros pontuais)',
        'Pista 6: Trilha Sonora / Music Bed (Nível padrão em ~ -20 dB, com automação/ducking sob diálogos)'
      ],
      content:
        'Nunca trabalhe com áudio achatado em pista única. Organize o projeto rigorosamente em 6 stems dedicados. Monitore LUFS (Loudness Meter), use Dim Button para escuta de referência e controle o Bus de submixagem.',
      keywords: ['stems', 'fairlight', 'davinci', 'narrador', 'ambience bed', 'ducking', 'lufs', 'pistas']
    },
    {
      chunk_id: 'abraham_kb_audio_noise_restoration',
      domain: 'AUDIO_ENGINEERING',
      module_id: 1,
      module_title: MODULE_DEFINITIONS[1].title,
      section_title: '2.2 Tratamento de Ruídos e Restauração de Sinal',
      source_file: 'KNOWLEDGE_BASE_CRIADOR_ZEN.md',
      principles: [
        'AI_VOICE_ISOLATION_AND_DIALOG_LEVELER',
        'NOISE_REDUCTION_MANUAL_LEARN_SAMPLE',
        'DE_HUMMER_FREQUENCY_REMOVAL_60HZ_50HZ',
        'SAMPLE_LEVEL_CLICK_EDITING'
      ],
      actionable_rules: [
        'Voice Isolation & Dialog Leveler da DaVinci Neural Engine para isolar voz e nivelar dinâmicas',
        'Noise Reduction Fairlight FX: Manual Learn Mode coletando trecho de ruído ambiente puro',
        'De-Hummer: 60 Hz para rede elétrica Brasil/EUA; 50 Hz para Europa/Ásia; Frequency Sweep em harmônicos',
        'Correção de cliques digitais no nível de amostras (dots/samples) com zoom máximo'
      ],
      content:
        'Tratamento de ruído vocal e restauração: Voice Isolation AI, Noise Reduction com amostragem manual limpa, De-Hummer 60Hz/50Hz para remover zumbidos elétricos e restauração sample-level para eliminação de cliques digitais causados por jitter.',
      keywords: ['noise reduction', 'de-hummer', 'voice isolation', '60hz', '50hz', 'cliques', 'sample level']
    },
    {
      chunk_id: 'abraham_kb_audio_effects_modulation',
      domain: 'POST_PRODUCTION',
      module_id: 1,
      module_title: MODULE_DEFINITIONS[1].title,
      section_title: '2.3 Modulação de Voz, Estilização e Automações',
      source_file: 'KNOWLEDGE_BASE_CRIADOR_ZEN.md',
      principles: ['PITCH_SHIFT_AUTHORITY', 'DISTORTION_MEGAPHONE_RADIO', 'RANGE_MODE_DUCKING_AUTOMATION'],
      actionable_rules: [
        'Pitch Shift grave para autoridade/narração documental',
        'Distortion / Megaphone Filter para simulação de rádio/comunicação de cockpit',
        'Range Mode (tecla R) para automação precisa de keyframing de ganho sob a fala (audio ducking)'
      ],
      content:
        'Modulações de voz e automação de áudio: Pitch shift para calibrar autoridade e profundidade vocal, Megaphone/Bandpass para efeitos de comunicação remota e ducking com range mode (tecla R) para atenuar trilha sonora sob narração.',
      keywords: ['pitch shift', 'megaphone', 'ducking', 'keyframing', 'range mode', 'automação']
    },
    {
      chunk_id: 'abraham_kb_contrarian_platforms',
      domain: 'CONTRARIAN_STRATEGY',
      module_id: 2,
      module_title: MODULE_DEFINITIONS[2].title,
      section_title: '3. Estratégia Contrariana & Plataformas (YouTube Long vs Shorts)',
      source_file: 'KNOWLEDGE_BASE_CRIADOR_ZEN.md',
      principles: [
        'YOUTUBE_LONG_BUILDS_PERENNIAL_EQUITY',
        'SHORTS_AND_TIKTOK_ZERO_CONNECTION_VALUE',
        'SATURATION_IS_ILLUSION_FOR_DEEP_CREATORS'
      ],
      actionable_rules: [
        'Vídeos longos no YouTube (> 15 min) e Podcasts Spotify: geram patrimônio, autoridade e confiança inabalável',
        'TikTok/Reels/Shorts: passatempo descartável com retenção anestésica; use apenas como recorte secundário para branding',
        'Quando a manada corre para conteúdos rasos gerados por IA, diferencie-se pela densidade, autenticidade e raciocínio estruturado'
      ],
      content:
        'Mercado em bolha de vídeos curtos: o valor da atenção desaba para zero quando todos produzem dicas rápidas. O YouTube e Podcasts longos ocupam espaço real na mente. Quem passa 30 minutos ouvindo uma voz cria familiaridade e autoridade.',
      keywords: ['youtube longo', 'shorts', 'tiktok', 'contrariano', 'manada', 'podcast', 'densidade']
    },
    {
      chunk_id: 'abraham_kb_attention_7_levers',
      domain: 'ATTENTION_PSYCHOLOGY',
      module_id: 3,
      module_title: MODULE_DEFINITIONS[3].title,
      section_title: '4.1 As 7 Alavancas Psicológicas de Clique e Título',
      source_file: 'KNOWLEDGE_BASE_CRIADOR_ZEN.md',
      principles: [
        'SPECIFIC_NUMERICAL_ANCHOR',
        'PATTERN_INTERRUPT',
        'NEGATIVITY_BIAS',
        'TRIBE_CALLOUT',
        'PAIN_IDENTIFICATION',
        'CLEAR_BENEFIT',
        'ZEIGARNIK_CURIOSITY_LOOPS'
      ],
      actionable_rules: [
        '1. Especificidade Numérica Extrema: Números exatos e incomuns geram credibilidade cognitiva imediata (ex: 8 Regras, 27 Dias)',
        '2. Quebra de Padrão (Pattern Interrupt): Elemento discordante no feed que força interrupção da rolagem passiva',
        '3. Viés da Negatividade (Negativity Bias): Prioridade primitiva de aversão à perda e dor antes do ganho',
        '4. Chamada Direta de Tribo: Segmentação explícita que ativa a identidade social',
        '5. Chamada para a Dor/Problema Preciso: Descrição cirúrgica de frustração compartilhada',
        '6. Benefício Claro e Inegociável: Promessa tangível',
        '7. Abertura de Curiosity Loops (Efeito Zeigarnik): Perguntas críticas abertas no início, respondidas no clímax'
      ],
      content:
        'As 7 alavancas neuropsicológicas para títulos, thumbnails e introduções de alto clique e retenção inabalável: Especificidade Numérica, Quebra de Padrão, Viés de Negatividade, Chamada de Tribo, Chamada para Dor, Benefício Claro e Abertura de Curiosity Loops.',
      keywords: ['7 alavancas', 'zeigarnik', 'curiosity loops', 'vies negativo', 'quebra de padrao', 'especificidade', 'titulos']
    },
    {
      chunk_id: 'abraham_kb_scriptwriting_vs_improv',
      domain: 'SCRIPTWRITING',
      module_id: 3,
      module_title: MODULE_DEFINITIONS[3].title,
      section_title: '4.2 Autoridade pela Roteirização vs Improviso',
      source_file: 'KNOWLEDGE_BASE_CRIADOR_ZEN.md',
      principles: ['NEVER_RECORD_WITHOUT_SCRIPT', 'SCRIPT_LIBERATES_VOCAL_ENERGY_AND_MODULATION'],
      actionable_rules: [
        'Regra de Ouro: Nunca grave ou produza sem roteiro estruturado',
        'O improviso desperdiça energia cognitiva na busca de palavras gerando hesitação',
        'O roteiro prévio libera 100% da mente para modular: tom, pausas dramáticas, energia e convicção'
      ],
      content:
        'Roteiro vs Improviso: O improviso causa perda de convicção vocal e vícios de linguagem. O roteiro detalhado é o alicerce que permite controle dramático absoluto, modulação vocal e clareza cirúrgica.',
      keywords: ['roteiro', 'improviso', 'energia vocal', 'pausas dramaticas', 'conviccao', 'estruturacao']
    },
    {
      chunk_id: 'abraham_kb_niche_topic_funnel',
      domain: 'NICHE_AND_TOPIC',
      module_id: 4,
      module_title: MODULE_DEFINITIONS[4].title,
      section_title: '5. Arquitetura Temática & Funil de Nicho (Vídeo Zero e Estudos de Caso)',
      source_file: 'KNOWLEDGE_BASE_CRIADOR_ZEN.md',
      principles: [
        'VIDEO_ZERO_EXPLORER_POSITIONING',
        'CASE_STUDY_AUTHORITY_TRANSFER',
        'TOP_FUNNEL_BROAD_BOTTOM_FUNNEL_DEEP'
      ],
      actionable_rules: [
        'Vídeo Zero: Quebra a síndrome do impostor assumindo a posição de aprendiz / explorador público',
        'Estudo de Caso: Analise ícones reconhecidos para transferir autoridade consolidada para o seu conteúdo',
        'Funil: YouTube deve ter temas amplos com apelo de massa; Fundo de funil (produtos/comunidades) deve ter profundidade técnica'
      ],
      content:
        'Definição de temas e funil: O Vídeo Zero estabelece a jornada do explorador. O método de Estudo de Caso ancora narrativas em figuras de autoridade inquestionável. O funil equilibra apelo de massa no YouTube com sofisticação técnica no ecossistema.',
      keywords: ['video zero', 'estudo de caso', 'funil de nicho', 'sindrome do impostor', 'amplitude de topo']
    },
    {
      chunk_id: 'abraham_kb_cognitive_productivity_zen',
      domain: 'COGNITIVE_PRODUCTIVITY',
      module_id: 5,
      module_title: MODULE_DEFINITIONS[5].title,
      section_title: '6. Engenharia Cognitiva & Produtividade Zen (Foco vs DMN & Despejo Mental)',
      source_file: 'KNOWLEDGE_BASE_CRIADOR_ZEN.md',
      principles: [
        'FOCUS_MODE_ACTIVE_NARROW_VIEW',
        'DEFAULT_MODE_NETWORK_HOLISTIC_INSIGHTS',
        'MENTAL_OFFLOADING_PROTOCOL',
        'CREATIVE_LEISURE_SCHEDULE'
      ],
      actionable_rules: [
        'Rede Ativa (Modo Foco): visão estreita de 1 tarefa por vez (roteiro, gravação, edição)',
        'Rede Inativa (DMN - Default Mode Network): visão holística que conecta dados dispersos e gera insights geniais no repouso',
        'Despejo Mental: anote tudo imediatamente na lista "Tem-que" para desocupar a memória de trabalho do cérebro (~11M bits/s)',
        'Selecione apenas 2 a 4 itens críticos para a lista "Tarefas do Dia"',
        'Intercale blocos de foco com 10-15 minutos de descompressão e ócio criativo'
      ],
      content:
        'Engenharia Cognitiva e Ócio Criativo: A criatividade de altíssimo nível depende da alternância entre o Modo Foco e a DMN (Default Mode Network). Protocolo de Despejo Mental para eliminar ansiedade cognitiva e manter foco puro na execução.',
      keywords: ['modo foco', 'dmn', 'default mode network', 'despejo mental', 'ocio criativo', 'produtividade zen', 'tem-que']
    }
  );

  // 2. Extração dos blocos temáticos das 5 transcrições detalhadas
  const lessonFiles: Array<{
    moduleId: AbrahamModuleId;
    fileName: string;
    domain: AbrahamDomain;
  }> = [
    {
      moduleId: 1,
      fileName: 'aula_01_trabalhando_com_audio.json',
      domain: 'AUDIO_ENGINEERING'
    },
    {
      moduleId: 2,
      fileName: 'aula_02_va_na_contramao.json',
      domain: 'CONTRARIAN_STRATEGY'
    },
    {
      moduleId: 3,
      fileName: 'aula_03_psicologia_da_atencao.json',
      domain: 'ATTENTION_PSYCHOLOGY'
    },
    {
      moduleId: 4,
      fileName: 'aula_04_sobre_o_que_falar.json',
      domain: 'NICHE_AND_TOPIC'
    },
    {
      moduleId: 5,
      fileName: 'aula_05_criatividade_vs_produtividade.json',
      domain: 'COGNITIVE_PRODUCTIVITY'
    }
  ];

  for (const lesson of lessonFiles) {
    const jsonPath = path.join(transcriptionsDir, lesson.fileName);
    if (!fs.existsSync(jsonPath)) continue;

    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as {
      text?: string;
      segments?: Array<{
        id: number;
        start: number;
        end: number;
        text: string;
        no_speech_prob?: number;
        compression_ratio?: number;
        avg_logprob?: number;
      }>;
    };

    if (parsed.text) {
      phraseFingerprints(parsed.text).forEach((fp) => allFingerprints.add(fp));
    }

    const segments = (parsed.segments || []).filter(
      (s) => (s.no_speech_prob ?? 0) < 0.5 && (s.compression_ratio ?? 1) <= 2.4 && (s.avg_logprob ?? 0) >= -1
    );

    // Agrupa em blocos temáticos de aproximadamente 120-180 segundos
    const GROUP_WINDOW_SECONDS = 150;
    let currentGroup: typeof segments = [];
    let groupStart = 0;
    let chunkIndex = 1;

    for (const seg of segments) {
      if (currentGroup.length === 0) {
        groupStart = seg.start;
      }
      currentGroup.push(seg);

      if (seg.end - groupStart >= GROUP_WINDOW_SECONDS || seg === segments[segments.length - 1]) {
        const chunkText = currentGroup.map((s) => s.text.trim()).join(' ');
        const timeEnd = seg.end;
        const chunkId = `abraham_transcription_m${lesson.moduleId}_c${chunkIndex}`;

        chunks.push({
          chunk_id: chunkId,
          domain: lesson.domain,
          module_id: lesson.moduleId,
          module_title: MODULE_DEFINITIONS[lesson.moduleId].title,
          section_title: `Aula 0${lesson.moduleId} - Segmento [${Math.floor(groupStart / 60)}m${Math.floor(groupStart % 60)}s - ${Math.floor(timeEnd / 60)}m${Math.floor(timeEnd % 60)}s]`,
          source_file: lesson.fileName,
          time_start_seconds: Math.round(groupStart),
          time_end_seconds: Math.round(timeEnd),
          principles: MODULE_DEFINITIONS[lesson.moduleId].principles,
          actionable_rules: [
            `Referência auditiva e diretiva da Aula 0${lesson.moduleId}`,
            `Janela temporal: ${Math.floor(groupStart)}s a ${Math.floor(timeEnd)}s`
          ],
          content: chunkText,
          keywords: tokenize(chunkText).slice(0, 15)
        });

        chunkIndex += 1;
        currentGroup = [];
      }
    }
  }

  const modulesList: AbrahamRagModuleSummary[] = (
    [1, 2, 3, 4, 5] as AbrahamModuleId[]
  ).map((id) => {
    const def = MODULE_DEFINITIONS[id];
    const matchingChunks = chunks.filter((c) => c.module_id === id);
    return {
      module_id: id,
      title: def.title,
      domain: def.domain,
      chunk_count: matchingChunks.length,
      principles: def.principles,
      core_summary: def.summary
    };
  });

  const systemPrompts: Record<string, string> = {
    criador_zen_roteirista: `Você é o Agente Criador Zen, especialista em engenharia de conteúdo denso, psicologia da atenção e pós-produção audiovisual de altíssimo impacto.
Sua missão é produzir roteiros, estratégias e análises que sigam rigorosamente as leis da profundidade, autenticidade e storytelling ancestral.

Suas Leis Inegociáveis:
1. REJEITE A SUPERFICIALIDADE: Nunca crie listas rasas de 5 dicas rápidas ou estilo TikTok. Desenvolva teses completas, analogias fortes e reflexões filosóficas.
2. VÁ NA CONTRAMÃO: Desafie os mitos da manada digital com argumentos lógicos e dados empíricos.
3. DOMINE A ATENÇÃO: Abra loops de curiosidade (Zeigarnik Effect) no início e nunca termine sem gerar antecipação do próximo passo.
4. LINGUAGEM FIRME: Elimine hesitações, termos dúbios ou frases fracas. Escreva com convicção absoluta e clareza cirúrgica.
5. CONSCIÊNCIA DE ÁUDIO: Toda cena sugerida deve antecipar sua ambientação sonora, modulação de voz e trilha em harmonia dinâmica.`,

    fairlight_audio_director: `Você é o Diretor de Engenharia de Áudio Fairlight do Criador Zen.
Sua função é garantir conformidade acústica absoluta:
- 6 Stems Isolados: 1 Narrador (faixa amarela, sem clipar), 2 Tripulação, 3 Torre, 4 Ambiência contínua, 5 SFX, 6 Trilha (-20dB).
- Mascaramento: Ambiência sempre presente sob respirações e cortes secos.
- Ducking: Atenue a trilha sonora sob toda fala usando range mode / keyframing.
- Limpeza: De-Hummer em 60Hz (BR/EUA) ou 50Hz (EUR), Noise Reduction e eliminação de cliques no nível de amostra.`,

    estrategista_conteudo: `Você é o Estrategista Contrariano de Conteúdo do Criador Zen.
Sua diretriz:
- YouTube Longo (>15min) e Podcasts são construtores de autoridade e patrimônio.
- Rejeite a armadilha algorítmica de vídeos rasos de 15 segundos.
- Estruture funis com Vídeo Zero e Estudos de Caso ancorados em grandes ícones.`
  };

  const jsonSchemas: Record<string, Record<string, unknown>> = {
    CriadorZenContentSpec: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: 'CriadorZenContentSpec',
      type: 'object',
      required: [
        'titulo',
        'alavanca_psicologica',
        'loop_abertura',
        'amplitude_tema',
        'estrutura_roteiro'
      ],
      properties: {
        titulo: {
          type: 'string',
          description: 'Título do vídeo aplicando número específico, viés negativo ou quebra de padrão.'
        },
        alavanca_psicologica: {
          type: 'string',
          enum: [
            'especificidade_numerica',
            'quebra_de_padrao',
            'vies_negativo',
            'chamada_tribo',
            'chamada_dor',
            'beneficio_claro'
          ]
        },
        loop_abertura: {
          type: 'string',
          description: 'Pergunta instigante ou mistério aberto na introdução que só é respondido no clímax do vídeo.'
        },
        amplitude_tema: {
          type: 'string',
          description: 'Como o tema conecta o interesse específico a um contexto amplo de interesse geral.'
        },
        duracao_estimada_minutos: {
          type: 'integer',
          minimum: 15,
          description: 'Duração do vídeo no YouTube (mínimo 15 minutos para profundidade).'
        },
        estrutura_roteiro: {
          type: 'object',
          properties: {
            hook: { type: 'string' },
            introducao_com_loop: { type: 'string' },
            desenvolvimento_ancestral: { type: 'string' },
            antitese_mercado: { type: 'string' },
            resolucao_e_fechamento_loop: { type: 'string' },
            novo_loop_final: { type: 'string' }
          },
          required: [
            'hook',
            'introducao_com_loop',
            'desenvolvimento_ancestral',
            'resolucao_e_fechamento_loop',
            'novo_loop_final'
          ]
        }
      }
    }
  };

  return {
    schema: 'hsl.editorial.abraham-rag-index.v1',
    schema_version: '1.0.0',
    reference_only: true,
    generated_at: new Date().toISOString(),
    source_directory_label: 'DOCS ABRAHAM',
    source_docs_sha256: sha256(kbRaw),
    total_chunks: chunks.length,
    modules: modulesList,
    chunks,
    phrase_fingerprints: [...allFingerprints].sort(),
    system_prompts: systemPrompts,
    json_schemas: jsonSchemas
  };
}

/**
 * Salva o snapshot indexado do RAG Abraham no caminho de destino.
 */
export function syncAbrahamRagSnapshot(docsRoot: string, outputPath: string): AbrahamRagSnapshot {
  const snapshot = buildAbrahamRagSnapshot(docsRoot);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const tmpPath = `${outputPath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  fs.renameSync(tmpPath, outputPath);
  return snapshot;
}

/**
 * Ingestão do Snapshot local salvo.
 */
export class AbrahamRagIngestAgent {
  constructor(
    private readonly snapshotPath = path.resolve(
      process.cwd(),
      'assets/editorial-references/abraham/abraham-rag-index.json'
    )
  ) {}

  run(): AbrahamRagSnapshot {
    if (!fs.existsSync(this.snapshotPath)) {
      throw new Error(`HSL_ABRAHAM_RAG_INDEX_REQUIRED:${this.snapshotPath}`);
    }
    const snapshot = JSON.parse(fs.readFileSync(this.snapshotPath, 'utf8')) as AbrahamRagSnapshot;
    if (snapshot.schema !== 'hsl.editorial.abraham-rag-index.v1' || snapshot.reference_only !== true) {
      throw new Error('HSL_ABRAHAM_RAG_INDEX_INVALID');
    }
    return snapshot;
  }
}

/**
 * Agente de Recuperação RAG (Retrieval Agent) com cálculo de similaridade e relevância.
 */
export class AbrahamRagRetrievalAgent {
  query(snapshot: Readonly<AbrahamRagSnapshot>, options: AbrahamQueryOptions): AbrahamRetrievalResult {
    const queryTokens = tokenize(options.query.toLowerCase());
    const topK = options.top_k ?? 4;
    const minScore = options.min_score ?? 0.05;

    const scored: AbrahamScoredChunk[] = [];

    for (const chunk of snapshot.chunks) {
      if (options.domain && chunk.domain !== options.domain) {
        continue;
      }
      if (options.module_id && chunk.module_id !== options.module_id) {
        continue;
      }

      let score = 0;
      const matchedTerms = new Set<string>();

      const chunkText = `${chunk.section_title} ${chunk.content} ${chunk.keywords.join(' ')} ${chunk.principles.join(' ')} ${chunk.actionable_rules.join(' ')}`.toLowerCase();

      // Correspondência exata da query
      if (chunkText.includes(options.query.toLowerCase().trim())) {
        score += 3.0;
        matchedTerms.add(options.query.trim());
      }

      // Pontuação por tokens
      for (const token of queryTokens) {
        if (chunk.section_title.toLowerCase().includes(token)) {
          score += 1.5;
          matchedTerms.add(token);
        }
        if (chunk.keywords.some((k) => k.toLowerCase().includes(token))) {
          score += 1.2;
          matchedTerms.add(token);
        }
        if (chunk.principles.some((p) => p.toLowerCase().includes(token))) {
          score += 1.0;
          matchedTerms.add(token);
        }
        if (chunk.content.toLowerCase().includes(token)) {
          score += 0.8;
          matchedTerms.add(token);
        }
      }

      // Boost para chunks estruturados da base de conhecimento KB
      if (chunk.chunk_id.startsWith('abraham_kb_')) {
        score *= 1.3;
      }

      if (score >= minScore) {
        scored.push({
          chunk,
          score: Math.round(score * 100) / 100,
          matched_terms: [...matchedTerms]
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const topChunks = scored.slice(0, topK);

    const principles = [...new Set(topChunks.flatMap((s) => s.chunk.principles))];
    const rules = [...new Set(topChunks.flatMap((s) => s.chunk.actionable_rules))];

    const contextParts = topChunks.map((sc, i) => {
      return `[FONTE ${i + 1}: ${sc.chunk.module_title} -> ${sc.chunk.section_title} (Relevância: ${sc.score})]
${sc.chunk.content}
REGRAS E HEURÍSTICAS:
${sc.chunk.actionable_rules.map((r) => `- ${r}`).join('\n')}`;
    });

    const augmentedContext = contextParts.join('\n\n---\n\n');

    return {
      schema: 'hsl.editorial.abraham-retrieval.v1',
      query: options.query,
      domain_filter: options.domain,
      module_filter: options.module_id,
      total_matches: scored.length,
      scored_chunks: topChunks,
      principles,
      actionable_rules: rules,
      augmented_context: augmentedContext
    };
  }
}
