import fs from 'fs';
import path from 'path';
import {AgentTelemetryAdapter} from '../../adapters/agentTelemetryAdapter';
import {EventBus} from '../../event-hub/eventBus';
import {HslOverlaySpecV1, VisualSceneType} from '../types/overlaySpec';

export type DocumentaryTechnique =
  | 'PARALLAX_RACK_FOCUS_2_5D'
  | 'CYBER_MAP_TRACE_3D'
  | 'LASER_SCAN_DOSSIER'
  | 'ANAMORPHIC_CINEMATIC_OVERLAY'
  | 'DOCUMENTARY_TEXT_TYPOGRAPHY'
  | 'ON_SCREEN_RESEARCH_LAPSE'
  | 'TECHNICAL_CUTAWAY_SCHEMATIC'
  | 'VLF_SUBMARINE_ANTENNA_TRACE';

export interface DocumentaryScenePlan {
  sceneId: string;
  shotId: string;
  narrativeFunction: string;
  visualSubject: string;
  recommendedTechnique: DocumentaryTechnique;
  startFramePromptFormula: string;
  overlayConfig: {
    letterbox: boolean;
    brackets: boolean;
    filmGrain: boolean;
    horizontalFlare: boolean;
  };
  componentProps: Record<string, unknown>;
}

export interface DocumentaryEditPackage {
  schema: string;
  productionId: string;
  generatedAt: string;
  aesthetic: string;
  totalScenes: number;
  scenes: DocumentaryScenePlan[];
  masterStartFramePromptTemplate: string;
}

export class DocumentaryEditorAgent {
  private readonly ragIndexPath: string;
  private readonly telemetry: AgentTelemetryAdapter;

  constructor(ragIndexPath?: string) {
    this.ragIndexPath =
      ragIndexPath ||
      path.join(process.cwd(), 'assets', 'editorial-references', 'editor', 'editor-rag-index.json');
    this.telemetry = AgentTelemetryAdapter.getInstance();
  }

  public getKnowledgeBase(): Record<string, unknown> {
    if (!fs.existsSync(this.ragIndexPath)) {
      throw new Error(`EDITOR_RAG_INDEX_NOT_FOUND: ${this.ragIndexPath}`);
    }
    return JSON.parse(fs.readFileSync(this.ragIndexPath, 'utf8'));
  }

  public generateMasterStartFramePrompt(subject: string): string {
    return (
      `Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, ` +
      `${subject}, monumental scale, atmospheric chiaroscuro lighting, deep carbon blacks (#060709), ` +
      `illuminated by glowing sodium-vapor amber reflections (#FF5500) and sharp cyan laser telemetry lights (#00F0FF), ` +
      `dense volumetric fog and steam, wet reflective ground, shallow depth of field, creamy anamorphic bokeh, ` +
      `filmic texture, raw realistic industrial photography, 8k, no text, no human faces --ar 16:9`
    );
  }

  /**
   * Camada 1A: Blueprint Visual para o Remotion (com textos, HUD e layout de referência)
   */
  public generateBlueprintPrompt(subject: string, title: string, subtitle?: string): string {
    return (
      `Cinematic documentary visual layout blueprint, Industrial X-Ray style, ` +
      `scene: ${subject}. Title overlay: "${title.toUpperCase()}" ${subtitle ? `with subtitle "${subtitle}"` : ''}. ` +
      `Deep carbon black (#060709) background with bright orange laser (#FF5500) split line, ` +
      `cyan telemetry coordinates (#00F0FF), latency monitors, latency curve graph, system stress indicator, ` +
      `O Outro Lado official branding, 4k editorial layout graphic design --ar 16:9`
    );
  }

  /**
   * Camada 1B: Frame Cinematográfico 100% Limpo para o Firefly Video
   * (ZERO texto, ZERO números, ZERO HUD, ZERO logo, ZERO laser)
   */
  public generateCleanFireflyPrompt(subject: string): string {
    return (
      `Cinematic 35mm photograph of ${subject}, monumental industrial scale, ` +
      `dramatic chiaroscuro low-key lighting, dense volumetric atmospheric haze and steam, ` +
      `wet reflective floor, subtle amber glow and soft cyan environmental accent lights, ` +
      `creamy anamorphic bokeh, photorealistic physical cinema, 8k, ` +
      `NO TEXT, NO NUMBERS, NO HUD, NO GRAPHICS, NO LOGOS, NO LASER LINES, NO LABELS, NO HUMAN FACES --ar 16:9`
    );
  }

  /**
   * Camada 1C: Camada Interna / Raio-X
   */
  public generateXRayPrompt(subject: string): string {
    return (
      `Internal mechanical cross-section cutaway and technical X-Ray diagram of ${subject}, ` +
      `illuminated in glowing sodium-vapor amber (#FF5500) and sharp cyan wireframe (#00F0FF), ` +
      `carbon black backdrop (#060709), high contrast internal engineering components, 8k, no text --ar 16:9`
    );
  }

  /**
   * Camada 2: Prompt de Movimento Físico para o Firefly Video
   */
  public generateFireflyMotionPrompt(sceneType: string): string {
    if (sceneType === 'industrial_xray') {
      return (
        `Slow cinematic dolly forward, subtle camera drift, blinking server rack LED lights, ` +
        `gentle atmospheric fog drifting, smooth physical motion, no camera whip, no text, no UI`
      );
    }
    if (sceneType === 'map_data') {
      return (
        `Gentle 3D aerial perspective drift over dark terrain, subtle glowing fiber routes, ` +
        `smooth continuous tracking, high quality cinematic motion`
      );
    }
    return (
      `Slow cinematic push-in, subtle natural atmospheric movement, shallow depth of field, ` +
      `cinematic lighting, smooth camera track, no fast panning`
    );
  }

  /**
   * Camada 3: Compilador de Especificação de Overlay Remotion (overlay_spec.json)
   */
  public createSceneOverlaySpec(scene: {
    sceneId: string;
    title: string;
    subtitle?: string;
    visualType?: VisualSceneType;
    latencyMs?: number;
    stressPercent?: number;
  }): HslOverlaySpecV1 {
    const visualType = scene.visualType || 'industrial_xray';
    return {
      schema: 'hsl.overlay.spec.v1',
      sceneId: scene.sceneId,
      visualType,
      title: scene.title,
      subtitle: scene.subtitle || 'MILHÕES DE TRANSAÇÕES. UM ÚNICO GARGALO.',
      chapterTag: `CENA ${scene.sceneId.replace(/[^0-9]/g, '').padStart(2, '0') || '01'}`,
      laser: {
        direction: 'vertical',
        position: 0.5,
        color: '#FF5500',
        startFrame: 20,
        sweepDurationFrames: 50
      },
      telemetry: [
        {
          type: 'metric',
          label: 'LATÊNCIA ATUAL',
          value: scene.latencyMs || 132,
          unit: 'ms',
          idealThreshold: 'IDEAL < 100ms',
          accentColor: '#FF5500'
        },
        {
          type: 'stress',
          label: 'ESTRESSE DO SISTEMA',
          value: scene.stressPercent || 89,
          unit: '%',
          accentColor: '#FF5500'
        },
        {
          type: 'status',
          label: 'STATUS: SOB CARGA',
          value: 'CAMADA: ANTI-FRAUDE',
          accentColor: '#00F0FF'
        }
      ],
      verificationFlow: [
        {id: '1', label: 'RECEBIDO', status: 'completed'},
        {id: '2', label: 'ANÁLISE', status: 'completed'},
        {id: '3', label: 'VERIFICAÇÃO', status: 'active'},
        {id: '4', label: 'DECISÃO', status: 'pending'}
      ],
      regulatorySource: {
        sourceName: 'BANCO CENTRAL DO BRASIL',
        documentTitle: 'RELATÓRIO DE INFRAESTRUTURA PIX',
        timestamp: '24/05/2026 22:47:31'
      },
      branding: {
        showLogo: true,
        showTagline: true,
        channelHandle: 'YOUTUBE.COM/0OUTROLADO',
        taglineText: 'INVESTIGAR. REVELAR. COMPREENDER.'
      },
      targetResolution: {
        width: 1920,
        height: 1080,
        aspectRatio: '16:9'
      }
    };
  }

  public planScene(scene: {
    sceneId: string;
    shotId: string;
    narrativeFunction: string;
    visualSubject: string;
  }): DocumentaryScenePlan {
    const text = `${scene.narrativeFunction} ${scene.visualSubject}`.toLowerCase();
    let technique: DocumentaryTechnique = 'PARALLAX_RACK_FOCUS_2_5D';

    if (/antena|vlf|submarino|oceano|profundidade|onda eletromagnetica|trailing wire/i.test(text)) {
      technique = 'VLF_SUBMARINE_ANTENNA_TRACE';
    } else if (/corte transversal|cutaway|x-ray|chassis|fuselagem|motor|turbina|interior do aviao|compartimento|esquema tecnico/i.test(text)) {
      technique = 'TECHNICAL_CUTAWAY_SCHEMATIC';
    } else if (/map|rota|trajeto|cabo|fibra|duto|geografia|cidade|sp|barueri|brasilia|subterrane/i.test(text)) {
      technique = 'CYBER_MAP_TRACE_3D';
    } else if (/document|relat|contrat|banco central|bacen|regul|lei|clausula|portaria|anp/i.test(text)) {
      technique = 'LASER_SCAN_DOSSIER';
    } else if (/pesquis|dado|codigo|log|ip|servidor|terminal|query|busca/i.test(text)) {
      technique = 'ON_SCREEN_RESEARCH_LAPSE';
    } else if (/tese|frase|impacto|revel|conclus|aviso|segredo/i.test(text)) {
      technique = 'DOCUMENTARY_TEXT_TYPOGRAPHY';
    } else {
      technique = 'PARALLAX_RACK_FOCUS_2_5D';
    }

    const startFramePrompt = this.generateCleanFireflyPrompt(scene.visualSubject);

    return {
      sceneId: scene.sceneId,
      shotId: scene.shotId,
      narrativeFunction: scene.narrativeFunction,
      visualSubject: scene.visualSubject,
      recommendedTechnique: technique,
      startFramePromptFormula: startFramePrompt,
      overlayConfig: {
        letterbox: true,
        brackets: true,
        filmGrain: true,
        horizontalFlare: /reveal|climax|impact/i.test(scene.narrativeFunction)
      },
      componentProps: {
        accentColor: '#FF5500',
        telemetryColor: '#00F0FF'
      }
    };
  }

  public compileDocumentaryPackage(
    productionId: string,
    scenes: Array<{sceneId: string; shotId: string; narrativeFunction: string; visualSubject: string}>,
    outputDirectory: string
  ): DocumentaryEditPackage {
    EventBus.getInstance().emit('AGENT_STARTED', {
      agentName: 'DocumentaryEditorAgent',
      productionId
    });

    const plannedScenes = scenes.map((s) => this.planScene(s));

    // Gera o pacote individual de cada cena seguindo a arquitetura em 3 camadas
    for (const scene of plannedScenes) {
      const sceneDir = path.join(outputDirectory, scene.sceneId);
      fs.mkdirSync(sceneDir, {recursive: true});

      // 1. Gera o arquivo de especificação Remotion (overlay_spec.json)
      const overlaySpec = this.createSceneOverlaySpec({
        sceneId: scene.sceneId,
        title: scene.visualSubject.slice(0, 45).toUpperCase(),
        subtitle: scene.narrativeFunction.replace(/_/g, ' ').toUpperCase()
      });
      fs.writeFileSync(
        path.join(sceneDir, 'overlay_spec.json'),
        JSON.stringify(overlaySpec, null, 2),
        'utf8'
      );

      // 2. Gera a instrução de movimento limpo do Firefly (firefly_motion_prompt.txt)
      const motionPrompt = this.generateFireflyMotionPrompt(
        scene.recommendedTechnique === 'CYBER_MAP_TRACE_3D' ? 'map_data' : 'industrial_xray'
      );
      fs.writeFileSync(
        path.join(sceneDir, 'firefly_motion_prompt.txt'),
        motionPrompt,
        'utf8'
      );
    }

    const editPackage: DocumentaryEditPackage = {
      schema: 'hsl.documentary.edit-package.v1',
      productionId,
      generatedAt: new Date().toISOString(),
      aesthetic: 'Villeneuve Cyber-Industrial (Denis Villeneuve 35mm Anamorphic)',
      totalScenes: plannedScenes.length,
      scenes: plannedScenes,
      masterStartFramePromptTemplate: this.generateMasterStartFramePrompt('[SUBJECT]')
    };

    fs.mkdirSync(outputDirectory, {recursive: true});
    const packagePath = path.join(outputDirectory, 'documentary-edit-package.json');
    fs.writeFileSync(packagePath, JSON.stringify(editPackage, null, 2), 'utf8');

    EventBus.getInstance().emit('AGENT_COMPLETED', {
      agentName: 'DocumentaryEditorAgent',
      productionId,
      artifactPath: packagePath
    });

    return editPackage;
  }
}

