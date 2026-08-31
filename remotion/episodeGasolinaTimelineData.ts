import scenesData from '../contracts/episodes/gasolina-adulterada.scenes.json';
import type { SceneVisualContract } from '../contracts/sceneVisualContract';
import type { RawSceneInput } from '../contracts/buildSceneContracts';
import {
  CalculatedTimeline,
  TimelineContractInput,
  parseAndCalculateTimeline
} from '../contracts/timelineContract';

export interface SceneTimelineItem {
  sceneId: string;
  order: number;
  chapterId: string;
  chapterTitle: string;
  name: string;
  voiceover: string;
  visualSubject: string;
  take_type: 'KEYFRAME_DOSSIER' | 'CINEMATIC_TAKE';
  allowed_sources: Array<'firefly' | 'bank' | 'dossier'>;
  durationSeconds: number;
  durationFrames: number;
  startFrame: number;
  endFrame: number;
  audioFile: string;
  sfxFile: string;
  videoFile: string;
  integratedText?: string;
  calloutMain?: string;
  calloutSub?: string;
  calloutCategory?: string;
  motionMode?: 'slow_push_in' | 'crash_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift';
}

export const EPISODE_GASOLINA_FPS = 30;
export const EPISODE_GASOLINA_TOTAL_SECONDS = 360.0;
export const EPISODE_GASOLINA_TOTAL_FRAMES = 10800;

export const DOSSIER_SCENE_IDS = [
  'GAS_004',
  'GAS_005',
  'GAS_008',
  'GAS_013',
  'GAS_015',
  'GAS_016',
  'GAS_021',
  'GAS_026',
  'GAS_027'
] as const;

export const SCENE_COMPONENT_MAP: Record<string, string> = {
  GAS_004: 'FlowMeterPulserSchematicHUD',
  GAS_005: 'TechnicalCutawaySchematic',
  GAS_008: 'FlowMeterPulserSchematicHUD',
  GAS_013: 'Iso20022PacketInspector',
  GAS_015: 'FlowDiscrepancyHUD',
  GAS_016: 'OnScreenResearchLapse',
  GAS_021: 'LaserRevealWipe',
  GAS_026: 'InfraredPlateScanner3D',
  GAS_027: 'LaserScanDossier'
};

/**
 * Constrói a lista determinística de 30 cenas para a timeline do Remotion.
 */
export function buildGasolinaTimeline(
  sceneContracts?: SceneVisualContract[],
  runId: string = 'latest'
): SceneTimelineItem[] {
  let scenesToUse: Array<{
    sceneId: string;
    voiceover: string;
    visualSubject?: string;
    take_type: 'KEYFRAME_DOSSIER' | 'CINEMATIC_TAKE';
    allowed_sources?: Array<'firefly' | 'bank' | 'dossier'>;
    targetSeconds: number;
  }>;

  if (sceneContracts && sceneContracts.length === 30) {
    scenesToUse = sceneContracts;
  } else {
    const raw: RawSceneInput[] = scenesData as RawSceneInput[];
    scenesToUse = raw.map(r => ({
      sceneId: r.sceneId,
      voiceover: r.voiceover,
      visualSubject: r.visualSubject,
      take_type: (r.take_type === 'KEYFRAME_DOSSIER' ? 'KEYFRAME_DOSSIER' : 'CINEMATIC_TAKE') as 'KEYFRAME_DOSSIER' | 'CINEMATIC_TAKE',
      allowed_sources: r.take_type === 'KEYFRAME_DOSSIER' ? ['dossier'] : ['firefly', 'bank'],
      targetSeconds: r.sceneId === 'GAS_001' ? 8.0 : (r.sceneId === 'GAS_002' ? 9.0 : (r.targetSeconds || 12.0))
    }));
  }

  let accumulatedFrames = 0;
  const timeline: SceneTimelineItem[] = [];

  for (let i = 0; i < scenesToUse.length; i++) {
    const sc = scenesToUse[i];
    const durationSeconds = sc.sceneId === 'GAS_001' ? 8.0 : (sc.sceneId === 'GAS_002' ? 9.0 : (sc.targetSeconds || 12.0));
    const durationFrames = Math.round(durationSeconds * EPISODE_GASOLINA_FPS);
    const startFrame = accumulatedFrames;
    const endFrame = startFrame + durationFrames;
    accumulatedFrames = endFrame;

    const chapterNum = Math.floor(i / 5) + 1;
    const chapterTitles = [
      'O EFEITO COTIDIANO',
      'A MÁQUINA OCULTA',
      'O MECANISMO DA FRAUDE',
      'A FÍSICA DA FRAUDE',
      'O PONTO DE TENSÃO',
      'O VEREDITO CAUSAL'
    ];

    timeline.push({
      sceneId: sc.sceneId,
      order: i + 1,
      chapterId: `CH_0${chapterNum}`,
      chapterTitle: chapterTitles[chapterNum - 1] || 'INVESTIGAÇÃO FORENSE',
      name: sc.visualSubject ? sc.visualSubject.slice(0, 40) : `Cena ${sc.sceneId}`,
      voiceover: sc.voiceover,
      visualSubject: sc.visualSubject || '',
      take_type: sc.take_type,
      allowed_sources: sc.allowed_sources || (sc.take_type === 'KEYFRAME_DOSSIER' ? ['dossier'] : ['firefly', 'bank']),
      durationSeconds,
      durationFrames,
      startFrame,
      endFrame,
      audioFile: `episodes/gasolina-adulterada/audio/narration/${sc.sceneId}.mp3`,
      sfxFile: `episodes/gasolina-adulterada/audio/sfx/${sc.sceneId}.mp3`,
      videoFile: `episodes/gasolina-adulterada/takes/${sc.sceneId}.mp4`,
      integratedText: `AUDITORIA METROLÓGICA // ${sc.sceneId}`,
      calloutMain: sc.visualSubject ? sc.visualSubject.split(' ')[0].toUpperCase() : 'EVIDÊNCIA',
      calloutSub: `REGISTRO FORENSE ${sc.sceneId}`,
      calloutCategory: sc.take_type === 'KEYFRAME_DOSSIER' ? 'DOSSIÊ' : 'CINEMATOGRÁFICO',
      motionMode: i % 2 === 0 ? 'slow_push_in' : 'cinematic_drift'
    });
  }

  return timeline;
}

export const EPISODE_GASOLINA_TIMELINE: SceneTimelineItem[] = buildGasolinaTimeline();

/**
 * Constrói o contrato de timeline canônico para o compositor CinematicEpisode
 */
export function buildGasolinaTimelineContract(): TimelineContractInput {
  const scenes = buildGasolinaTimeline();

  return {
    episodeId: 'gasolina-adulterada',
    fps: EPISODE_GASOLINA_FPS,
    coldOpen: {
      sceneIds: ['GAS_001', 'GAS_002']
    },
    actBreaks: [5, 15, 25], // 3 viradas de ato estruturais
    hudWindows: [
      {
        componentName: 'AtomicStopwatch',
        props: { label: 'CRONÔMETRO DE VAZÃO // MEDIÇÃO FORENSE' },
        appearances: [
          { startScene: 3, seconds: 8 },
          { startScene: 12, seconds: 8 },
          { startScene: 22, seconds: 8 }
        ]
      }
    ],
    audio: {
      musicBed: 'episodes/gasolina-adulterada/audio/music/bed.mp3',
      musicVolume: 0.30,
      voiceoverVolume: 1.0,
      sfxVolume: 0.45,
      ducking: true,
      duckedVolume: 0.12
    },
    scenes: scenes.map((s) => ({
      id: s.sceneId,
      name: s.name,
      chapterTitle: s.chapterTitle,
      component: SCENE_COMPONENT_MAP[s.sceneId] || 'DynamicDocumentaryMedia',
      take_type: s.take_type,
      durationSeconds: s.durationSeconds,
      transition: s.order === 6 || s.order === 16 || s.order === 26 ? 'dipToBlack' : 'crossfade',
      camera: s.take_type === 'KEYFRAME_DOSSIER' ? 'drift' : 'pushIn',
      voiceoverFile: s.audioFile,
      sfxFile: s.sfxFile,
      mediaFile: s.videoFile,
      callout: s.calloutMain ? {
        categoryText: s.calloutCategory || 'INVESTIGAÇÃO',
        mainText: s.calloutMain,
        subText: s.calloutSub || '',
        position: s.sceneId === 'GAS_030' ? 'center' : 'bottom_left'
      } : undefined,
      props: {
        sceneNumber: s.sceneId,
        title: s.name.toUpperCase(),
        subtitle: s.chapterTitle,
        latencyMs: s.sceneId === 'GAS_008' ? 40 : 120,
        transactionsPerSec: s.sceneId === 'GAS_004' ? '200 p/L' : '1.000 L/s',
        systemStressPercent: s.sceneId === 'GAS_015' ? 98 : 42,
        sourceText: 'FONTE: INMETRO // PORTARIA 559 METROLOGIA LEGAL',
        dateText: 'TELEMETRIA: BOMBA DE COMBUSTÍVEL DIGITAL',
        meterTitle: 'BLOCO MEDIDOR DE DESLOCAMENTO POSITIVO 250ML',
        systemTitle: 'SISTEMA HIDRÁULICO DA BOMBA DE COMBUSTÍVEL',
        compartmentName: 'CÂMARA DE PISTÕES MECÂNICOS',
        pulserCount: '200 PULSOS POR LITRO',
        card1Title: 'DESVIO METROLÓGICO (-8.4%)',
        headerTitle: 'AUDITORIA METROLÓGICA INMETRO',
        documentTitle: 'LAUDO TÉCNICO DE CALIBRAÇÃO',
        criticalClause: 'PORTARIA INMETRO 559 // ERRO MÁXIMO TOLERADO ±0.5%',
        kenBurns: s.motionMode || 'slow_push_in',
        zoomIntensity: 1.15,
        isDossierTake: s.take_type === 'KEYFRAME_DOSSIER',
        dossierTag: `EVIDÊNCIA FORENSE // ${s.sceneId}`
      }
    }))
  };
}

export const GASOLINA_TIMELINE_CONTRACT: TimelineContractInput = buildGasolinaTimelineContract();
export const EPISODE_GASOLINA_CALCULATED_TIMELINE: CalculatedTimeline = parseAndCalculateTimeline(GASOLINA_TIMELINE_CONTRACT);
