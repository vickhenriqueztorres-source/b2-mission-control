import scenesData from '../contracts/episodes/gps-tempo.scenes.json';
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
}

export const EPISODE_GPS_FPS = 30;
export const EPISODE_GPS_TOTAL_SECONDS = 360.0;
export const EPISODE_GPS_TOTAL_FRAMES = 10800;

export const GPS_SCENE_COMPONENT_MAP: Record<string, string> = {
  GPS_004: 'VelocityPhysicsCalculationHUD',
  GPS_005: 'TechnicalCutawaySchematic',
  GPS_008: 'CyberMapTrace',
  GPS_013: 'VelocityPhysicsCalculationHUD',
  GPS_015: 'FlowMeterPulserSchematicHUD',
  GPS_016: 'VelocityPhysicsCalculationHUD',
  GPS_021: 'VelocityPhysicsCalculationHUD',
  GPS_026: 'VelocityPhysicsCalculationHUD',
  GPS_027: 'LaserScanDossier'
};

export function buildGpsTimeline(): SceneTimelineItem[] {
  const raw: RawSceneInput[] = scenesData as RawSceneInput[];
  let accumulatedFrames = 0;
  const timeline: SceneTimelineItem[] = [];

  for (let i = 0; i < raw.length; i++) {
    const sc = raw[i];
    const durationSeconds = sc.targetSeconds || 12.0;
    const durationFrames = Math.round(durationSeconds * EPISODE_GPS_FPS);
    const startFrame = accumulatedFrames;
    const endFrame = startFrame + durationFrames;
    accumulatedFrames = endFrame;

    const chapterNum = Math.floor(i / 5) + 1;
    const chapterTitles = [
      'O EFEITO COTIDIANO',
      'A MÁQUINA OCULTA',
      'O CORAÇÃO DE CÉSIO',
      'A FÍSICA DA TRIANGULAÇÃO',
      'O PARADOXO DE EINSTEIN',
      'O VEREDITO DO TEMPO'
    ];

    const isDossier = sc.take_type === 'KEYFRAME_DOSSIER';

    timeline.push({
      sceneId: sc.sceneId,
      order: i + 1,
      chapterId: `CH_0${chapterNum}`,
      chapterTitle: chapterTitles[chapterNum - 1] || 'FÍSICA DO TEMPO',
      name: sc.visualSubject ? sc.visualSubject.slice(0, 40) : `Cena ${sc.sceneId}`,
      voiceover: sc.voiceover,
      visualSubject: sc.visualSubject || '',
      take_type: (isDossier ? 'KEYFRAME_DOSSIER' : 'CINEMATIC_TAKE') as 'KEYFRAME_DOSSIER' | 'CINEMATIC_TAKE',
      allowed_sources: isDossier ? ['dossier'] : ['firefly', 'bank'],
      durationSeconds,
      durationFrames,
      startFrame,
      endFrame,
      audioFile: `episodes/gps-tempo/audio/narration/${sc.sceneId}.mp3`,
      sfxFile: `episodes/gps-tempo/audio/sfx/${sc.sceneId}.mp3`,
      videoFile: `episodes/gps-tempo/takes/${sc.sceneId}.mp4`,
      integratedText: `TELEMETRIA ORBITAL // ${sc.sceneId}`,
      calloutMain: sc.visualSubject ? sc.visualSubject.split(' ')[0].toUpperCase() : 'TELEMETRIA',
      calloutSub: `RELATÓRIO DE ÓRBITA ${sc.sceneId}`,
      calloutCategory: isDossier ? 'DOSSIÊ' : 'CINEMATOGRÁFICO'
    });
  }

  return timeline;
}

export const EPISODE_GPS_TIMELINE: SceneTimelineItem[] = buildGpsTimeline();

export function buildGpsTimelineContract(): TimelineContractInput {
  const scenes = buildGpsTimeline();

  return {
    episodeId: 'gps-tempo',
    fps: EPISODE_GPS_FPS,
    coldOpen: {
      sceneIds: ['GPS_001', 'GPS_002']
    },
    actBreaks: [5, 15, 25],
    hudWindows: [
      {
        componentName: 'AtomicStopwatch',
        appearances: [
          { startScene: 3, seconds: 8 },
          { startScene: 12, seconds: 8 },
          { startScene: 22, seconds: 8 }
        ]
      }
    ],
    audio: {
      musicBed: 'episodes/gps-tempo/audio/music/bed.mp3',
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
      component: GPS_SCENE_COMPONENT_MAP[s.sceneId] || 'DynamicDocumentaryMedia',
      take_type: s.take_type,
      durationSeconds: s.durationSeconds,
      transition: s.order === 6 || s.order === 16 || s.order === 26 ? 'dipToBlack' : 'crossfade',
      camera: s.take_type === 'KEYFRAME_DOSSIER' ? 'drift' : 'pushIn',
      voiceoverFile: s.audioFile,
      sfxFile: s.sfxFile,
      mediaFile: s.videoFile,
      callout: s.calloutMain ? {
        categoryText: s.calloutCategory || 'RELATÓRIO RELATIVÍSTICO',
        mainText: s.calloutMain,
        subText: s.calloutSub || '',
        position: s.sceneId === 'GPS_030' ? 'center' : 'bottom_left'
      } : undefined,
      props: {
        sceneNumber: s.sceneId,
        title: s.name.toUpperCase(),
        subtitle: s.chapterTitle,
        sourceText: 'FONTE: US SPACE FORCE // NIST TIME FREQUENCY DIVISION',
        dateText: 'TELEMETRIA: CONSTELAÇÃO GPS BLOCK III',
        zoomIntensity: 1.12,
        isDossierTake: s.take_type === 'KEYFRAME_DOSSIER',
        dossierTag: `EVIDÊNCIA RELATIVÍSTICA // ${s.sceneId}`
      }
    }))
  };
}

export const GPS_TIMELINE_CONTRACT: TimelineContractInput = buildGpsTimelineContract();
export const EPISODE_GPS_CALCULATED_TIMELINE: CalculatedTimeline = parseAndCalculateTimeline(GPS_TIMELINE_CONTRACT);
