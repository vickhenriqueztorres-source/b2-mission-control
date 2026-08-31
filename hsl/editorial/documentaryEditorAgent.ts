import fs from 'fs';
import path from 'path';
import {AgentTelemetryAdapter} from '../../adapters/agentTelemetryAdapter';
import {EventBus} from '../../event-hub/eventBus';
import {buildFireflyPrompt} from '../../contracts/buildFireflyPrompt';
import {HSL_COLOR_TOKENS} from '../../config/visualIdentity';
import {HslOverlaySpecV1, VisualSceneType} from '../types/overlaySpec';

export type DocumentaryTechnique =
  | 'OBSERVATIONAL_FIELD_TAKE'
  | 'CARTOGRAPHIC_ROUTE_2D'
  | 'DOCUMENT_EVIDENCE_DESK'
  | 'DOCUMENTARY_TEXT_TYPOGRAPHY'
  | 'ON_SCREEN_RESEARCH_LAPSE'
  | 'PHYSICAL_CUTAWAY_EVIDENCE'
  | 'LOCATION_SIGNAL_TRACE';

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
    this.ragIndexPath = ragIndexPath || path.join(
      process.cwd(),
      'assets',
      'editorial-references',
      'editor',
      'editor-rag-index.json',
    );
    this.telemetry = AgentTelemetryAdapter.getInstance();
  }

  public getKnowledgeBase(): Record<string, unknown> {
    if (!fs.existsSync(this.ragIndexPath)) {
      throw new Error(`EDITOR_RAG_INDEX_NOT_FOUND: ${this.ragIndexPath}`);
    }
    return JSON.parse(fs.readFileSync(this.ragIndexPath, 'utf8'));
  }

  public generateMasterStartFramePrompt(subject: string): string {
    return buildFireflyPrompt({
      sceneId: 'MASTER_START_FRAME',
      visualSubject: subject,
      visual_must_include: [subject],
      visual_must_not: [],
      required_category: 'matter',
      domainTags: ['present-day', 'on-location', 'documentary'],
    }).prompt;
  }

  public generateBlueprintPrompt(subject: string, title: string, subtitle?: string): string {
    return [
      'Contemporary investigative documentary layout blueprint',
      `real photographed scene: ${subject}`,
      `small editorial title: "${title.toUpperCase()}"`,
      subtitle ? `small supporting line: "${subtitle}"` : '',
      'white typography placed over naturally dark negative space',
      'one thin sodium-orange evidence mark',
      'flat cartographic annotation only when factual',
      'no permanent black bar, no HUD, no glow, no futuristic interface',
      '--ar 16:9',
    ].filter(Boolean).join(', ');
  }

  public generateCleanFireflyPrompt(subject: string): string {
    return this.generateMasterStartFramePrompt(subject);
  }

  public generateXRayPrompt(subject: string): string {
    return buildFireflyPrompt({
      sceneId: 'PHYSICAL_CUTAWAY',
      visualSubject: `physical cutaway evidence of ${subject}, real components exposed or arranged for inspection`,
      visual_must_include: [subject, 'commercially plausible components', 'observable material evidence'],
      visual_must_not: ['glowing wireframe', 'holographic x-ray', 'invented internal mechanism'],
      required_category: 'reveal',
      domainTags: ['engineering', 'physical-evidence', 'documentary'],
    }).prompt;
  }

  public generateFireflyMotionPrompt(sceneType: string): string {
    if (sceneType === 'evidence') {
      return 'Real macro rack focus from the physical component to its observable effect, subtle operator breathing, natural subject motion, no digital zoom, no text, no UI';
    }
    if (sceneType === 'map_data') {
      return 'Slow elevated documentary camera movement over the real location, physical geography and infrastructure remain legible, no glowing route, no hologram, no UI';
    }
    return 'On-location observational camera, restrained shoulder drift and human reframing while the real operation moves, practical light behavior, no permanent push-in, no text, no UI';
  }

  public createSceneOverlaySpec(scene: {
    sceneId: string;
    title: string;
    subtitle?: string;
    visualType?: VisualSceneType;
    latencyMs?: number;
    stressPercent?: number;
  }): HslOverlaySpecV1 {
    const telemetry = [];
    if (scene.latencyMs !== undefined) {
      telemetry.push({
        type: 'metric' as const,
        label: 'LATENCIA',
        value: scene.latencyMs,
        unit: 'ms',
        accentColor: HSL_COLOR_TOKENS.LASER_CYAN,
      });
    }
    if (scene.stressPercent !== undefined) {
      telemetry.push({
        type: 'stress' as const,
        label: 'CARGA MEDIDA',
        value: scene.stressPercent,
        unit: '%',
        accentColor: HSL_COLOR_TOKENS.SODIUM_ORANGE,
      });
    }

    return {
      schema: 'hsl.overlay.spec.v1',
      sceneId: scene.sceneId,
      visualType: scene.visualType || 'cinematic_real',
      title: scene.title,
      subtitle: scene.subtitle,
      chapterTag: `CENA ${scene.sceneId.replace(/[^0-9]/g, '').padStart(2, '0') || '01'}`,
      telemetry,
      branding: {showLogo: false, showTagline: false},
      targetResolution: {width: 1920, height: 1080, aspectRatio: '16:9'},
    };
  }

  public planScene(scene: {
    sceneId: string;
    shotId: string;
    narrativeFunction: string;
    visualSubject: string;
  }): DocumentaryScenePlan {
    const text = `${scene.narrativeFunction} ${scene.visualSubject}`.toLowerCase();
    let technique: DocumentaryTechnique = 'OBSERVATIONAL_FIELD_TAKE';

    if (/antena|vlf|submarino|oceano|profundidade|onda eletromagnetica|trailing wire/i.test(text)) {
      technique = 'LOCATION_SIGNAL_TRACE';
    } else if (/corte transversal|cutaway|x-ray|chassis|fuselagem|motor|turbina|compartimento|esquema tecnico/i.test(text)) {
      technique = 'PHYSICAL_CUTAWAY_EVIDENCE';
    } else if (/map|rota|trajeto|cabo|fibra|duto|geografia|cidade|subterrane/i.test(text)) {
      technique = 'CARTOGRAPHIC_ROUTE_2D';
    } else if (/document|relat|contrat|banco central|bacen|regul|lei|clausula|portaria|anp/i.test(text)) {
      technique = 'DOCUMENT_EVIDENCE_DESK';
    } else if (/pesquis|dado|codigo|log|ip|servidor|terminal|query|busca/i.test(text)) {
      technique = 'ON_SCREEN_RESEARCH_LAPSE';
    } else if (/tese|frase|impacto|revel|conclus|aviso|segredo/i.test(text)) {
      technique = 'DOCUMENTARY_TEXT_TYPOGRAPHY';
    }

    return {
      sceneId: scene.sceneId,
      shotId: scene.shotId,
      narrativeFunction: scene.narrativeFunction,
      visualSubject: scene.visualSubject,
      recommendedTechnique: technique,
      startFramePromptFormula: this.generateCleanFireflyPrompt(scene.visualSubject),
      overlayConfig: {
        letterbox: false,
        brackets: false,
        filmGrain: true,
        horizontalFlare: false,
      },
      componentProps: {
        accentColor: HSL_COLOR_TOKENS.SODIUM_ORANGE,
        telemetryColor: HSL_COLOR_TOKENS.LASER_CYAN,
        overlayMaximumFrameRatio: 0.12,
      },
    };
  }

  public compileDocumentaryPackage(
    productionId: string,
    scenes: Array<{sceneId: string; shotId: string; narrativeFunction: string; visualSubject: string}>,
    outputDirectory: string,
  ): DocumentaryEditPackage {
    EventBus.getInstance().emit('AGENT_STARTED', {agentName: 'DocumentaryEditorAgent', productionId});
    const plannedScenes = scenes.map((scene) => this.planScene(scene));

    for (const scene of plannedScenes) {
      const sceneDir = path.join(outputDirectory, scene.sceneId);
      fs.mkdirSync(sceneDir, {recursive: true});
      const isMap = scene.recommendedTechnique === 'CARTOGRAPHIC_ROUTE_2D' || scene.recommendedTechnique === 'LOCATION_SIGNAL_TRACE';
      const isEvidence = scene.recommendedTechnique === 'DOCUMENT_EVIDENCE_DESK' || scene.recommendedTechnique === 'PHYSICAL_CUTAWAY_EVIDENCE';
      const overlaySpec = this.createSceneOverlaySpec({
        sceneId: scene.sceneId,
        title: scene.visualSubject.slice(0, 45).toUpperCase(),
        subtitle: scene.narrativeFunction.replace(/_/g, ' ').toUpperCase(),
        visualType: isMap ? 'map_data' : isEvidence ? 'document_evidence' : 'cinematic_real',
      });
      fs.writeFileSync(path.join(sceneDir, 'overlay_spec.json'), JSON.stringify(overlaySpec, null, 2), 'utf8');
      fs.writeFileSync(
        path.join(sceneDir, 'firefly_motion_prompt.txt'),
        this.generateFireflyMotionPrompt(isMap ? 'map_data' : isEvidence ? 'evidence' : 'matter'),
        'utf8',
      );
    }

    const editPackage: DocumentaryEditPackage = {
      schema: 'hsl.documentary.edit-package.v1',
      productionId,
      generatedAt: new Date().toISOString(),
      aesthetic: 'Documentario de Campo Investigativo v4.0',
      totalScenes: plannedScenes.length,
      scenes: plannedScenes,
      masterStartFramePromptTemplate: this.generateMasterStartFramePrompt('[SUBJECT]'),
    };

    fs.mkdirSync(outputDirectory, {recursive: true});
    const packagePath = path.join(outputDirectory, 'documentary-edit-package.json');
    fs.writeFileSync(packagePath, JSON.stringify(editPackage, null, 2), 'utf8');
    EventBus.getInstance().emit('AGENT_COMPLETED', {agentName: 'DocumentaryEditorAgent', productionId, artifactPath: packagePath});
    return editPackage;
  }
}
