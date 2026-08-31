import scenesData from '../contracts/episodes/drones-agro.scenes.json';
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

export const EPISODE_DRONES_AGRO_FPS = 30;
export const EPISODE_DRONES_AGRO_TOTAL_SECONDS = 245.0;
export const EPISODE_DRONES_AGRO_TOTAL_FRAMES = 7350;

export const SCENE_COMPONENT_MAP: Record<string, string> = {
  AGRO_003: 'CinematicKeyframeDossier',
  AGRO_005: 'LaserScanDossier',
  AGRO_008: 'CyberMapTrace',
  AGRO_010: 'TechnicalCutawaySchematic',
  AGRO_012: 'VelocityPhysicsCalculationHUD',
  AGRO_016: 'FlowDiscrepancyHUD',
  AGRO_018: 'IndustrialXRayHUD',
  AGRO_020: 'BgpFailoverInspector',
  AGRO_022: 'InfraredPlateScanner3D'
};

export const CHAPTER_NAMES: Record<number, string> = {
  1: 'CAPÍTULO 1: O VOO FANTASMA DA MEIA-NOITE',
  2: 'CAPÍTULO 2: A MÁQUINA DE CARBONO',
  3: 'CAPÍTULO 3: O RADAR CEGO À LUZ',
  4: 'CAPÍTULO 4: A FÍSICA DO DOWNWASH E EFEITO SOLO',
  5: 'CAPÍTULO 5: O ENXAME EM MALHA RTK',
  6: 'CAPÍTULO 6: A AGRICULTURA ALGORÍTMICA'
};

export function buildDronesAgroTimeline(
  sceneContracts?: SceneVisualContract[],
  runId: string = 'latest'
): SceneTimelineItem[] {
  const raw: RawSceneInput[] = (sceneContracts && sceneContracts.length === 24)
    ? (sceneContracts as unknown as RawSceneInput[])
    : (scenesData as RawSceneInput[]);

  let accumulatedFrames = 0;
  const timeline: SceneTimelineItem[] = [];

  for (let i = 0; i < raw.length; i++) {
    const sc = raw[i];
    const durationSeconds = sc.targetSeconds || (i === 0 ? 8.0 : (i === 1 ? 9.0 : 10.0));
    const durationFrames = Math.round(durationSeconds * EPISODE_DRONES_AGRO_FPS);
    const startFrame = accumulatedFrames;
    const endFrame = startFrame + durationFrames;
    accumulatedFrames = endFrame;

    const chapterIdx = Math.min(6, Math.floor(i / 4) + 1);

    timeline.push({
      sceneId: sc.sceneId,
      order: i + 1,
      chapterId: `CH_0${chapterIdx}`,
      chapterTitle: CHAPTER_NAMES[chapterIdx] || 'DOCUMENTÁRIO INVESTIGATIVO',
      name: `Cena ${sc.sceneId} - ${(sc.visualSubject || '').slice(0, 30)}`,
      voiceover: sc.voiceover,
      visualSubject: sc.visualSubject || '',
      take_type: (sc.take_type === 'KEYFRAME_DOSSIER' ? 'KEYFRAME_DOSSIER' : 'CINEMATIC_TAKE') as 'KEYFRAME_DOSSIER' | 'CINEMATIC_TAKE',
      allowed_sources: sc.take_type === 'KEYFRAME_DOSSIER' ? ['dossier'] : ['firefly', 'bank'],
      durationSeconds,
      durationFrames,
      startFrame,
      endFrame,
      audioFile: `episodes/drones-agro/audio/narration/${sc.sceneId}.mp3`,
      sfxFile: `episodes/drones-agro/audio/sfx/${sc.sceneId}.mp3`,
      videoFile: `episodes/drones-agro/takes/${sc.sceneId}.mp4`,
      integratedText: `TELEMETRIA FLUIDODINÂMICA // ${sc.sceneId}`,
      calloutMain: sc.visualSubject ? sc.visualSubject.split(' ').slice(0, 3).join(' ').toUpperCase() : 'OCTOCÓPTERO AGRO',
      calloutSub: `SISTEMA AUTÔNOMO 100KG // ${sc.sceneId}`,
      calloutCategory: sc.take_type === 'KEYFRAME_DOSSIER' ? 'DOSSIÊ TÉCNICO' : 'TELEMETRIA',
      motionMode: i % 2 === 0 ? 'slow_push_in' : 'cinematic_drift'
    });
  }

  return timeline;
}

export const EPISODE_DRONES_AGRO_TIMELINE: SceneTimelineItem[] = buildDronesAgroTimeline();

export function buildDronesAgroTimelineContract(): TimelineContractInput {
  const scenes = buildDronesAgroTimeline();

  const specificCallouts: Record<string, { categoryText: string; mainText: string; subText: string }> = {
    AGRO_001: { categoryText: 'COLD OPEN', mainText: 'DECOLAGEM NOTURNA', subText: 'CERRADO BRASILEIRO // 100KG' },
    AGRO_002: { categoryText: 'TELEMETRIA', mainText: 'ALTITUDE 2.5M // 28 KM/H', subText: '40 HECTARES / HORA' },
    AGRO_003: { categoryText: 'MATÉRIA BRUTA', mainText: 'FIBRA DE CARBONO 2.5M', subText: 'CHASSI TUBULAR AEROESPACIAL' },
    AGRO_004: { categoryText: 'PROPULSÃO', mainText: '8 MOTORES BRUSHLESS', subText: '25 KG DE EMPUXO POR ROTOR' },
    AGRO_005: { categoryText: 'ENERGIA', mainText: 'BATERIAS 30.000 MAH', subText: 'TROCA EM 90 SEGUNDOS' },
    AGRO_006: { categoryText: 'PULVERIZAÇÃO', mainText: 'BICOS CENTRÍFUGOS', subText: '20.000 RPM // 150 MÍCRONS' },
    AGRO_007: { categoryText: 'NAVEGAÇÃO', mainText: 'SISTEMA SENSORIAL NOTURNO', subText: 'ZERO DEPENDÊNCIA HUMANA' },
    AGRO_008: { categoryText: 'RADAR MILIMÉTRICO', mainText: 'VARREDURA 200 HZ', subText: 'ABERTURA SINTÉTICA SAR' },
    AGRO_009: { categoryText: 'LIDAR 360°', mainText: 'LASER INFRAVERMELHO 905NM', subText: 'NUVEM DE PONTOS TRIDIMENSIONAL' },
    AGRO_010: { categoryText: 'ALTIMETRIA', mainText: 'MALHA TOPOGRÁFICA REAL-TIME', subText: 'PRECISÃO CENTIMÉTRICA' },
    AGRO_011: { categoryText: 'EVASÃO', mainText: 'DETECÇÃO DE CABOS E MOURÕES', subText: 'RESPOSTA EM 20 MILISSEGUNDOS' },
    AGRO_012: { categoryText: 'FÍSICA APLICADA', mainText: 'AERODINÂMICA DO DOWNWASH', subText: 'COLUNA DE VENTO DESCENDENTE' },
    AGRO_013: { categoryText: 'VORTICIDADE', mainText: 'HÉLICES DE 50 POLEGADAS', subText: 'PRESSÃO SOBRE O DOSSEL' },
    AGRO_014: { categoryText: 'EFEITO SOLO', mainText: 'ABERTURA DA FOLHAGEM', subText: 'PENETRAÇÃO NA COPA DA SOJA' },
    AGRO_015: { categoryText: 'ABSORÇÃO', mainText: 'FIXAÇÃO ABAXIAL', subText: 'MICROGOTAS NO VERSO DA FOLHA' },
    AGRO_016: { categoryText: 'GARGALO FÍSICO', mainText: 'TOLERÂNCIA DE DERIVA 0.5M', subText: 'ESTABILIDADE CRÍTICA' },
    AGRO_017: { categoryText: 'FORMAÇÃO', mainText: 'ENXAME ESCALONADO', subText: 'VOO COORDENADO EM MALHA' },
    AGRO_018: { categoryText: 'GEOREFERÊNCIA', mainText: 'BASE GNSS RTK UHF', subText: 'CORREÇÃO DIFERENCIAL 5 DRONES' },
    AGRO_019: { categoryText: 'PRECISÃO', mainText: 'MARGEM DE ERRO 2.5 CM', subText: 'ZERO SOBREPOSIÇÃO DE DOSE' },
    AGRO_020: { categoryText: 'REDE MESH', mainText: 'COMPENSAÇÃO DE VENTO REAL-TIME', subText: 'AJUSTE COLETIVO DE ALTURA' },
    AGRO_021: { categoryText: 'AUTONOMIA', mainText: 'RETORNO AUTOMÁTICO 10% CARGA', subText: 'GEO-TIMESTAMP DE RETOMADA' },
    AGRO_022: { categoryText: 'EFICIÊNCIA', mainText: 'ZERO COMPACTAÇÃO DE SOLO', subText: '-90% CONSUMO HÍDRICO' },
    AGRO_023: { categoryText: 'ESCALA', mainText: 'AGRICULTURA ALGORÍTMICA', subText: 'A TERRA OBSERVADA DO ESPAÇO' },
    AGRO_024: { categoryText: 'ENCERRAMENTO', mainText: 'O OUTRO LADO DO AGRO', subText: 'INVESTIGAR. REVELAR. COMPREENDER.' }
  };

  const specificProps: Record<string, Record<string, any>> = {
    AGRO_003: {
      title: 'CHASSI TUBULAR EM FIBRA DE CARBONO',
      dossierTitle: 'ESTRUTURA AEROESPACIAL 2.5M',
      systemTitle: 'OCTOCÓPTERO AGRO 100KG',
      sourceText: 'ESPECIFICAÇÃO ESTRUTURAL AEROESPACIAL',
      dateText: 'ENVERGADURA: 2.5 METROS'
    },
    AGRO_005: {
      documentTitle: 'ESTAÇÃO MÓVEL DE CARGA RÁPIDA',
      criticalClause: 'BATERIAS POLÍMERO DE LÍTIO 30.000 mAh // CICLO 90S',
      dateText: 'BATERIAS POLÍMERO DE LÍTIO 30.000 mAh',
      sourceText: 'GERADOR DIESEL MÓVEL // CICLO DE 90S'
    },
    AGRO_008: {
      routeTitle: 'VARREDURA RADAR DE ONDAS MILIMÉTRICAS',
      originName: 'EMISSOR SAR DIANTEIRO',
      destinationName: 'PERFIL DE TERRENO',
      distanceText: 'FREQUÊNCIA: 77 GHZ // 200 HZ'
    },
    AGRO_010: {
      systemTitle: 'MALHA TOPOGRÁFICA 3D LIDAR',
      compartmentName: 'PERFIL DE ELEVAÇÃO CENTIMÉTRICO'
    },
    AGRO_012: {
      circuitTitle: 'VORTICIDADE E EFEITO SOLO',
      headerFormula: 'T = 2 \\rho A v_i^2 \\quad (EFEITO \\, SOLO)',
      systemTitle: 'DINÂMICA DE FLUIDOS: VORTICIDADE E DOWNWASH'
    },
    AGRO_016: {
      card1Title: 'DERIVA LATERAL (ALTITUDE > 3.0M)',
      card2Title: 'FLUXO DOWNWASH EFETIVO (2.5M)'
    },
    AGRO_018: {
      title: 'BASE GNSS CINEMÁTICA EM TEMPO REAL (RTK)',
      systemTitle: 'BASE GNSS CINEMÁTICA EM TEMPO REAL (RTK)'
    },
    AGRO_020: {
      title: 'REDE EM MALHA DINÂMICA INTER-DRONE (MESH)',
      inspectorTitle: 'REDE EM MALHA DINÂMICA INTER-DRONE (MESH)'
    },
    AGRO_022: {
      headerTitle: 'ANÁLISE DE IMPACTO ECOLÓGICO E COMPACTAÇÃO ZERO'
    }
  };

  return {
    episodeId: 'drones-agro',
    fps: EPISODE_DRONES_AGRO_FPS,
    coldOpen: {
      sceneIds: ['AGRO_001', 'AGRO_002']
    },
    actBreaks: [5, 11, 16, 21],
    hudWindows: [
      {
        componentName: 'AtomicStopwatch',
        props: { label: 'TELEMETRIA DE VOO // DOWNWASH & LIDAR' },
        appearances: [
          { startScene: 3, seconds: 7 },
          { startScene: 9, seconds: 8 },
          { startScene: 17, seconds: 8 }
        ]
      }
    ],
    audio: {
      musicBed: 'episodes/drones-agro/audio/music/bed.mp3',
      musicVolume: 0.30,
      voiceoverVolume: 1.0,
      sfxVolume: 0.45,
      ducking: true,
      duckedVolume: 0.12
    },
    scenes: scenes.map((s, idx) => {
      const compName = SCENE_COMPONENT_MAP[s.sceneId] || 'DynamicDocumentaryMedia';
      const calloutData = specificCallouts[s.sceneId] || {
        categoryText: 'TELEMETRIA',
        mainText: s.calloutMain || 'OCTOCÓPTERO',
        subText: s.calloutSub || ''
      };
      const customProps = specificProps[s.sceneId] || {};

      return {
        id: s.sceneId,
        name: s.name,
        chapterTitle: s.chapterTitle,
        component: compName,
        take_type: s.take_type,
        durationSeconds: s.durationSeconds,
        transition: (idx === 5 || idx === 11 || idx === 16 || idx === 21) ? 'dipToBlack' : 'crossfade',
        camera: s.take_type === 'KEYFRAME_DOSSIER' ? 'drift' : 'pushIn',
        voiceoverFile: s.audioFile,
        sfxFile: s.sfxFile,
        mediaFile: s.videoFile,
        callout: {
          categoryText: calloutData.categoryText,
          mainText: calloutData.mainText,
          subText: calloutData.subText,
          position: s.sceneId === 'AGRO_024' ? 'center' : 'bottom_left'
        },
        props: {
          sceneNumber: s.sceneId,
          title: s.name.toUpperCase(),
          subtitle: s.chapterTitle,
          kenBurns: s.motionMode || 'slow_push_in',
          zoomIntensity: 1.15,
          isDossierTake: s.take_type === 'KEYFRAME_DOSSIER',
          dossierTag: `TELEMETRIA FORENSE // ${s.sceneId}`,
          ...customProps
        }
      };
    })
  };
}

export const DRONES_AGRO_TIMELINE_CONTRACT: TimelineContractInput = buildDronesAgroTimelineContract();
export const EPISODE_DRONES_AGRO_CALCULATED_TIMELINE: CalculatedTimeline = parseAndCalculateTimeline(DRONES_AGRO_TIMELINE_CONTRACT);
