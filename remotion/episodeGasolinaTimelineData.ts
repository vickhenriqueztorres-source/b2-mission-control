import scenesData from '../contracts/episodes/gasolina-adulterada.scenes.json';
import { SceneVisualContract } from '../contracts/sceneVisualContract';
import { RawSceneInput } from '../contracts/buildSceneContracts';

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
      targetSeconds: r.targetSeconds || 12.0
    }));
  }

  let accumulatedFrames = 0;
  const timeline: SceneTimelineItem[] = [];

  for (let i = 0; i < scenesToUse.length; i++) {
    const sc = scenesToUse[i];
    const durationSeconds = sc.targetSeconds || 12.0;
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
