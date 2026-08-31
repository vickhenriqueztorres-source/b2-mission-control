import scenesData from '../contracts/episodes/drones-agro-noturnos.scenes.json';
import {
  DroneAgroCanonCategory,
  droneAgroComponentFor,
  droneAgroMediaContract,
} from '../contracts/droneAgroVisualContract';
import {
  CalculatedTimeline,
  TimelineContractInput,
  parseAndCalculateTimeline,
} from '../contracts/timelineContract';

interface DroneScene {
  sceneId: string;
  voiceover: string;
  visualSubject: string;
  visual_must_include: string[];
  visual_must_not: string[];
  required_category: DroneAgroCanonCategory;
  take_type: 'CINEMATIC_TAKE' | 'KEYFRAME_DOSSIER';
  targetSeconds: number;
  chapter: string;
  title: string;
  subtitle: string;
  telemetryLine: string;
  evidenceLine: string;
  mechanismLine: string;
}

export const EPISODE_DRONES_AGRO_NOTURNOS_FPS = 30;

const scenes = scenesData as DroneScene[];

export function buildDronesAgroNoturnosTimelineContract(): TimelineContractInput {
  return {
    episodeId: 'drones-agro-noturnos',
    fps: EPISODE_DRONES_AGRO_NOTURNOS_FPS,
    coldOpen: { sceneIds: ['DAN_001', 'DAN_002'] },
    actBreaks: [8, 16, 25, 34],
    hudWindows: [
      {
        id: 'night_ops_status',
        componentName: 'AtomicStopwatch',
        zone: 'top_center',
        props: { label: 'ALTITUDE 2.5M // 28 KM/H // AUTONOMO' },
        appearances: [
          { startScene: 10, seconds: 7 },
          { startScene: 28, seconds: 7 },
          { startScene: 43, seconds: 7 },
        ],
      },
    ],
    audio: {
      musicBed: 'episodes/drones-agro-noturnos/audio/music/bed.mp3',
      voiceoverTrack: 'episodes/drones-agro-noturnos/audio/narration/narration.mp3',
      roomTone: 'episodes/drones-agro-noturnos/audio/music/roomtone.mp3',
      sfxBed: 'episodes/drones-agro-noturnos/audio/sfx/soundfx-bed.wav',
      musicVolume: 0.24,
      voiceoverVolume: 1.0,
      sfxVolume: 0.42,
      ducking: true,
      duckedVolume: 0.09,
    },
    scenes: scenes.map((scene, index) => {
      const media = droneAgroMediaContract(
        'drones-agro-noturnos',
        scene.sceneId,
        scene.required_category,
      );
      return {
        id: scene.sceneId,
        name: scene.visualSubject,
        chapterTitle: scene.chapter,
        component: droneAgroComponentFor(scene.required_category),
        take_type: scene.take_type,
        durationSeconds: scene.targetSeconds,
        transition: 'crossfade',
        camera: scene.required_category === 'matter'
          ? 'pushIn'
          : scene.required_category === 'maps'
            ? 'panRight'
            : scene.required_category === 'reveal'
              ? 'pushIn'
              : 'drift',
        voiceoverText: scene.voiceover,
        mediaFile: media.mediaFile,
        visualSubject: scene.visualSubject,
        props: {
          title: scene.title,
          subtitle: scene.subtitle,
          canonCategory: scene.required_category,
          telemetryLine: scene.telemetryLine,
          evidenceLine: scene.evidenceLine,
          mechanismLine: scene.mechanismLine,
          hectareProgress: (index + 1) / scenes.length,
          imageSrc: media.imageSrc,
        },
      };
    }),
  };
}

export const DRONES_AGRO_NOTURNOS_TIMELINE_CONTRACT = buildDronesAgroNoturnosTimelineContract();
export const EPISODE_DRONES_AGRO_NOTURNOS_CALCULATED_TIMELINE: CalculatedTimeline =
  parseAndCalculateTimeline(DRONES_AGRO_NOTURNOS_TIMELINE_CONTRACT);
export const EPISODE_DRONES_AGRO_NOTURNOS_TOTAL_FRAMES =
  EPISODE_DRONES_AGRO_NOTURNOS_CALCULATED_TIMELINE.totalDurationFrames;
