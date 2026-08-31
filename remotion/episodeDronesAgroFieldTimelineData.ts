import {
  CalculatedTimeline,
  TimelineContractInput,
  parseAndCalculateTimeline,
} from '../contracts/timelineContract';
import {
  DRONES_AGRO_TIMELINE_CONTRACT,
  EPISODE_DRONES_AGRO_FPS,
  EPISODE_DRONES_AGRO_TOTAL_FRAMES,
} from './episodeDronesAgroTimelineData';

const FIELD_IMAGES = [
  'assets/visual_identity/documentary-field-v4/observational-field.png',
  'assets/visual_identity/documentary-field-v4/field-reportage.png',
  'assets/visual_identity/documentary-field-v4/physical-evidence.png',
  'assets/visual_identity/documentary-field-v4/operational-scale.png',
] as const;

const FIELD_MODES = ['row_walk', 'lateral_track', 'macro_rack', 'slow_crane'] as const;

const EVIDENCE_LABELS = [
  'CAMERA ENTRE AS FILEIRAS',
  'OPERACAO REAL',
  'EVIDENCIA MACRO',
  'ESCALA DA LAVOURA',
] as const;

export const EPISODE_DRONES_AGRO_FIELD_TOTAL_FRAMES = EPISODE_DRONES_AGRO_TOTAL_FRAMES;

export function buildDronesAgroFieldTimelineContract(): TimelineContractInput {
  return {
    ...DRONES_AGRO_TIMELINE_CONTRACT,
    episodeId: 'drones-agro',
    fps: EPISODE_DRONES_AGRO_FPS,
    hudWindows: [],
    audio: {
      musicBed: 'episodes/drones-agro/audio/music/bed.mp3',
      musicVolume: 0.24,
      voiceoverVolume: 1.0,
      sfxVolume: 0.55,
      ducking: true,
      duckedVolume: 0.11,
    },
    scenes: DRONES_AGRO_TIMELINE_CONTRACT.scenes.map((scene, index) => {
      const group = index % FIELD_IMAGES.length;
      const isMacro = group === 2;
      const isScale = group === 3;
      const callout = scene.callout
        ? {
            ...scene.callout,
            categoryText: isMacro
              ? 'EVIDENCIA DE CAMPO'
              : isScale
                ? 'ESCALA OPERACIONAL'
                : 'MATERIA OBSERVACIONAL',
            position: scene.callout.position === 'center' ? 'bottom_left' : scene.callout.position,
          }
        : undefined;

      return {
        ...scene,
        component: 'FieldDocumentaryScene',
        take_type: 'CINEMATIC_TAKE' as const,
        mediaFile: undefined,
        camera: FIELD_MODES[group] === 'slow_crane' ? 'pullOut' : FIELD_MODES[group] === 'lateral_track' ? 'panRight' : 'drift',
        transition: scene.transition === 'cut' || scene.transition === 'hardCut' ? 'crossfade' : scene.transition,
        callout,
        props: {
          sceneId: scene.id,
          imageSrc: FIELD_IMAGES[group],
          fieldMode: FIELD_MODES[group],
          evidenceLabel: EVIDENCE_LABELS[group],
          durationInFrames: Math.round(scene.durationSeconds * EPISODE_DRONES_AGRO_FPS),
        },
      };
    }),
  };
}

export const DRONES_AGRO_FIELD_TIMELINE_CONTRACT: TimelineContractInput = buildDronesAgroFieldTimelineContract();
export const EPISODE_DRONES_AGRO_FIELD_CALCULATED_TIMELINE: CalculatedTimeline =
  parseAndCalculateTimeline(DRONES_AGRO_FIELD_TIMELINE_CONTRACT);
