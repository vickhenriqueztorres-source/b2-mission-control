import path from 'path';
import {
  AbrahamDomain,
  AbrahamModuleId,
  AbrahamQueryOptions,
  AbrahamRagChunk,
  AbrahamRagIngestAgent,
  AbrahamRagRetrievalAgent,
  AbrahamRagSnapshot,
  AbrahamRetrievalResult
} from './abrahamRagRuntime';

export interface ScriptValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export class AbrahamRagService {
  private static instance: AbrahamRagService | null = null;
  private cachedSnapshot: AbrahamRagSnapshot | null = null;
  private readonly ingestAgent: AbrahamRagIngestAgent;
  private readonly retrievalAgent: AbrahamRagRetrievalAgent;

  constructor(
    snapshotPath = path.resolve(
      process.cwd(),
      'assets/editorial-references/abraham/abraham-rag-index.json'
    )
  ) {
    this.ingestAgent = new AbrahamRagIngestAgent(snapshotPath);
    this.retrievalAgent = new AbrahamRagRetrievalAgent();
  }

  public static getInstance(snapshotPath?: string): AbrahamRagService {
    if (!AbrahamRagService.instance) {
      AbrahamRagService.instance = new AbrahamRagService(snapshotPath);
    }
    return AbrahamRagService.instance;
  }

  /**
   * Obtém o snapshot indexado do RAG (com cache em memória).
   */
  public getSnapshot(): AbrahamRagSnapshot {
    if (!this.cachedSnapshot) {
      this.cachedSnapshot = this.ingestAgent.run();
    }
    return this.cachedSnapshot;
  }

  /**
   * Executa busca semântica/lexical no RAG.
   */
  public query(options: AbrahamQueryOptions): AbrahamRetrievalResult {
    const snapshot = this.getSnapshot();
    return this.retrievalAgent.query(snapshot, options);
  }

  /**
   * Recupera chunks e diretrizes de um domínio específico.
   */
  public getDirectives(domain: AbrahamDomain, topK = 5): AbrahamRetrievalResult {
    return this.query({
      query: domain.toLowerCase().replace(/_/g, ' '),
      domain,
      top_k: topK
    });
  }

  /**
   * Diretrizes diretas de Engenharia de Áudio (Fairlight, 6 Stems, Ducking, LUFS).
   */
  public getAudioDirectives(): {
    readonly stems: readonly { readonly id: number; readonly name: string; readonly spec: string }[];
    readonly fairlightRules: readonly string[];
    readonly lufsTarget: string;
    readonly duckingSpec: string;
  } {
    return {
      stems: [
        { id: 1, name: 'Narrador (Principal)', spec: 'Ganho no topo, faixa amarela (-6dB a -3dB), sem clipping > 0 dB' },
        { id: 2, name: 'Tripulação / Secundário', spec: 'Vozes de contexto com modulação / filtros de rádio' },
        { id: 3, name: 'Torre de Comando / Entrevistados', spec: 'Voz secundária com tratamento espacial / reverb controlado' },
        { id: 4, name: 'Ambiência Contínua (Ambience Bed)', spec: 'Textura ininterrupta usada para mascarar cortes e respirações' },
        { id: 5, name: 'SFX / Efeitos Pontuais', spec: 'Frequências dinâmicas alinhadas aos cortes visuais' },
        { id: 6, name: 'Trilha Sonora (Music Bed)', spec: 'Nível em repouso ~ -20 dB, com automação/ducking de ganho sob narração' }
      ],
      fairlightRules: [
        'Voice Isolation neural engine ativado no narrador',
        'Noise Reduction com manual learn mode em amostra pura sem fala',
        'De-Hummer 60 Hz (Américas) ou 50 Hz (Europa)',
        'Sample-level editing para reparo de cliques e estalos elétricos'
      ],
      lufsTarget: '-14 LUFS integrado para YouTube / Podcasts (-1.0 dB True Peak)',
      duckingSpec: 'Automação via Range Mode (tecla R) atenuando -6dB a -10dB na trilha sob cada fala'
    };
  }

  /**
   * Diretrizes diretas de Copywriting e Psicologia da Atenção (7 Alavancas, Loops Zeigarnik).
   */
  public getCopywritingDirectives(): {
    readonly levers: readonly { readonly lever: string; readonly rule: string; readonly example: string }[];
    readonly loopGuidance: string;
    readonly scriptRule: string;
  } {
    return {
      levers: [
        { lever: 'Especificidade Numérica', rule: 'Números exatos e incomuns geram autoridade imediata', example: '8 Regras Exatas, 27 Dias' },
        { lever: 'Quebra de Padrão', rule: 'Elemento visual ou conceitual discordante que trava a rolagem', example: 'A mentira dos vídeos curtos' },
        { lever: 'Viés da Negatividade', rule: 'Aversão à perda ativa o cérebro reptiliano antes do ganho', example: 'Você nunca mais será pobre vs Seja rico' },
        { lever: 'Chamada Direta de Tribo', rule: 'Segmentação explícita que ativa a identidade social', example: 'Criadores antes dos 30' },
        { lever: 'Chamada para a Dor', rule: 'Descrição cirúrgica do sintoma ou frustração', example: 'Exaustão mental e paralisia criativa' },
        { lever: 'Benefício Claro', rule: 'Promessa tangível e inegociável sem floreios conceituais', example: 'Domine a retenção no YouTube' },
        { lever: 'Abertura de Curiosity Loops', rule: 'Pergunta instigante no início cuja resolução só vem no clímax', example: 'Efeito Zeigarnik estruturado' }
      ],
      loopGuidance: 'Abra um mistério/loop no Hook (primeiros 30s) e feche no clímax (payoff - Efeito Zeigarnik), abrindo imediatamente um novo loop para a próxima reflexão.',
      scriptRule: 'Nunca grave ou dirija sem roteiro estruturado; o roteiro prévio libera a mente para modular presença vocal e pausas dramáticas.'
    };
  }

  /**
   * Diretrizes de Estratégia de Conteúdo e Nicho.
   */
  public getContentStrategyDirectives(): {
    readonly contrarianLaw: string;
    readonly videoZeroProtocol: string;
    readonly caseStudyMethod: string;
    readonly funnelStructure: string;
  } {
    return {
      contrarianLaw: 'Enquanto a manada produz vídeos curtos de 15 segundos sem alma, o Criador Zen constrói patrimônio com vídeos longos (>15m) e podcasts densos.',
      videoZeroProtocol: 'Vídeo Zero: Elimina a síndrome do impostor assumindo a posição de explorador/aprendiz público com ambição clara.',
      caseStudyMethod: 'Estudos de Caso: Análise de grandes ícones consolidados para transferir autoridade ao criador.',
      funnelStructure: 'Topo de funil (YouTube): Temas amplos de apelo de massa. Fundo de funil (Produtos): Soluções ultra-específicas.'
    };
  }

  /**
   * Diretrizes de Engenharia Cognitiva e Produtividade Zen.
   */
  public getProductivityDirectives(): {
    readonly dualNetworks: string;
    readonly mentalOffloading: string;
    readonly dailySelection: string;
  } {
    return {
      dualNetworks: 'Alterne intencionalmente entre a Rede Foco (visão estreita de 1 tarefa) e a DMN (Default Mode Network - insights holísticos no repouso).',
      mentalOffloading: 'Despejo Mental: Anote imediatamente na lista "Tem-que" qualquer pendência para liberar a memória de trabalho (11M bits/s).',
      dailySelection: 'Selecione apenas 2 a 4 itens críticos para o dia. Intercale blocos com 10-15 minutos de descompressão.'
    };
  }

  /**
   * Enriquece qualquer prompt base com contexto relevante e regras do Criador Zen.
   */
  public augmentPrompt(basePrompt: string, domainOrQuery: AbrahamDomain | string): string {
    const retrieval = this.query({
      query: typeof domainOrQuery === 'string' ? domainOrQuery : '',
      domain: typeof domainOrQuery === 'string' && domainOrQuery.toUpperCase() in ['AUDIO_ENGINEERING', 'CONTRARIAN_STRATEGY', 'ATTENTION_PSYCHOLOGY', 'NICHE_AND_TOPIC', 'COGNITIVE_PRODUCTIVITY', 'SCRIPTWRITING', 'POST_PRODUCTION'] ? (domainOrQuery as AbrahamDomain) : undefined,
      top_k: 3
    });

    return `${basePrompt}

---
### 🧠 DIRETRIZES E HEURÍSTICAS DO CRIADOR ZEN (ABRAHAM RAG)
${retrieval.augmented_context}

PRINCÍPIOS CHAVE APLICÁVEIS:
${retrieval.principles.map((p) => `- ${p}`).join('\n')}

LEIS OBRIGATÓRIAS:
${retrieval.actionable_rules.map((r) => `- ${r}`).join('\n')}
---`;
  }

  /**
   * Retorna um System Prompt pronto e calibrado para uma função específica.
   */
  public getSystemPrompt(role: 'criador_zen_roteirista' | 'fairlight_audio_director' | 'estrategista_conteudo' | string): string {
    const snapshot = this.getSnapshot();
    const prompt = snapshot.system_prompts[role];
    if (prompt) return prompt;
    return snapshot.system_prompts['criador_zen_roteirista'];
  }

  /**
   * Valida a estrutura de um roteiro segundo os critérios do Criador Zen.
   */
  public validateScriptStructure(script: {
    title?: string;
    hook?: string;
    loop_opened?: boolean;
    duration_minutes?: number;
    scenes_count?: number;
  }): ScriptValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (!script.title || script.title.trim().length < 5) {
      errors.push('Título obrigatório e com extensão suficiente para ancoragem.');
    }

    if (script.duration_minutes !== undefined && script.duration_minutes < 10) {
      warnings.push(`Duração estimada (${script.duration_minutes}m) abaixo do padrão de profundidade (> 15m recomendado para construção de patrimônio).`);
    }

    if (!script.loop_opened) {
      warnings.push('Nenhum Curiosity Loop explícito foi registrado na introdução (Efeito Zeigarnik).');
      recommendations.push('Abra uma pergunta instigante ou mistério no primeiro minuto e prometa responder no clímax.');
    }

    if (!script.hook || script.hook.trim().length < 10) {
      errors.push('Hook inicial é obrigatório para quebra de padrão nos primeiros 15 segundos.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }
}

export const abrahamRag = AbrahamRagService.getInstance();
