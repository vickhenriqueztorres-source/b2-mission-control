import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { HSL_FPS } from '../spec/hsl-spec';

export type SceneTransitionType = 'crossfade' | 'dipToBlack' | 'laserWipe' | 'wipe' | 'cut';
export type CameraMotionType = 'pushIn' | 'drift' | 'pullOut' | 'panRight' | 'panLeft';

export const SceneTransitionEnum = z.enum(['crossfade', 'dipToBlack', 'laserWipe', 'wipe', 'cut']);
export const CameraMotionEnum = z.enum(['pushIn', 'drift', 'pullOut', 'panRight', 'panLeft']);

export const TimelineCalloutSchema = z.object({
  categoryText: z.string().min(1),
  mainText: z.string().min(1),
  subText: z.string().min(1),
  position: z.enum(['center', 'bottom_left', 'bottom_right', 'top_left', 'top_right']).optional().default('bottom_left')
});

export const TimelineSceneItemSchema = z.object({
  id: z.string().min(1, "O campo 'id' da cena não pode ser vazio."),
  name: z.string().optional(),
  chapterId: z.string().optional(),
  chapterTitle: z.string().optional(),
  component: z.string().min(1, "O campo 'component' da cena deve ser especificado."),
  props: z.record(z.string(), z.any()).optional().default({}),
  durationSeconds: z.number().positive("A duração da cena em segundos deve ser um número positivo."),
  transition: SceneTransitionEnum.optional().default('crossfade'),
  camera: CameraMotionEnum.optional(),
  take_type: z.enum(['CINEMATIC_TAKE', 'KEYFRAME_DOSSIER']).optional().default('CINEMATIC_TAKE'),
  voiceoverFile: z.string().optional(),
  voiceoverText: z.string().optional(),
  sfxFile: z.string().optional(),
  mediaFile: z.string().optional(),
  visualSubject: z.string().optional(),
  callout: TimelineCalloutSchema.optional(),
  integratedText: z.string().optional()
}).transform((scene) => {
  // Atribui câmera padrão inteligente de acordo com o tipo de cena se não foi especificada
  const camera = scene.camera || (scene.take_type === 'KEYFRAME_DOSSIER' ? 'drift' : 'pushIn');
  // Garante que a transição padrão seja sempre crossfade
  const transition = scene.transition || 'crossfade';
  return {
    ...scene,
    camera,
    transition
  };
});

export type TimelineSceneItem = z.infer<typeof TimelineSceneItemSchema>;

export const HudWindowSchema = z.object({
  id: z.string().min(1),
  component: z.string().min(1),
  props: z.record(z.string(), z.any()).optional().default({}),
  startSeconds: z.number().nonnegative(),
  durationSeconds: z.number().positive()
});

export type HudWindow = z.infer<typeof HudWindowSchema>;

export const AudioManifestSchema = z.object({
  musicBed: z.string().min(1, "O caminho da trilha musical (musicBed) é obrigatório."),
  musicVolume: z.number().min(0).max(1).optional().default(0.22),
  voiceoverVolume: z.number().min(0).max(1).optional().default(1.0),
  sfxVolume: z.number().min(0).max(1).optional().default(0.45),
  ducking: z.boolean().optional().default(true),
  duckedVolume: z.number().min(0).max(1).optional().default(0.12),
  voiceoverTrack: z.string().optional()
});

export type AudioManifest = z.infer<typeof AudioManifestSchema>;

export const TimelineContractSchema = z.object({
  episodeId: z.string().min(1, "O campo 'episodeId' é obrigatório."),
  fps: z.number().int().positive().optional().default(HSL_FPS),
  scenes: z.array(TimelineSceneItemSchema).min(1, "O timeline deve conter pelo menos uma cena."),
  hudWindows: z.array(HudWindowSchema).optional().default([]),
  actBreaks: z.array(z.number().int().nonnegative()).optional().default([]),
  audio: AudioManifestSchema.optional()
}).superRefine((data, ctx) => {
  // ─────────────────────────────────────────────────────────────────────────
  // REGRA DE RITMO MANDATÓRIA (RECURSO EDITORIAL DOUTORAL)
  // Reprova timelines onde mais de 5 cenas consecutivas tenham a mesma duração (+-10%)
  // ─────────────────────────────────────────────────────────────────────────
  const scenes = data.scenes;
  if (scenes.length >= 6) {
    let streakCount = 1;
    let streakStartIdx = 0;

    for (let i = 1; i < scenes.length; i++) {
      const prevDur = scenes[i - 1].durationSeconds;
      const currDur = scenes[i].durationSeconds;
      const deltaRatio = Math.abs(currDur - prevDur) / prevDur;

      if (deltaRatio <= 0.10) {
        streakCount++;
        if (streakCount > 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `RHYTHM_VIOLATION_MONOTONOUS_CADENCE: Mais de 5 cenas consecutivas (índices ${streakStartIdx} a ${i}, cenas '${scenes[streakStartIdx].id}' a '${scenes[i].id}') possuem a mesma duração de ~${currDur.toFixed(1)}s (+-10%). Varie o ritmo do roteiro alternando respiração (cenas mais longas) e aceleração/revelação (cenas mais curtas).`,
            path: ['scenes', i]
          });
          break;
        }
      } else {
        streakCount = 1;
        streakStartIdx = i;
      }
    }
  }
});

export type TimelineContractInput = z.input<typeof TimelineContractSchema>;
export type TimelineContract = z.infer<typeof TimelineContractSchema>;

export interface CalculatedTimelineScene extends TimelineSceneItem {
  order: number;
  startFrame: number;
  durationFrames: number;
  endFrame: number;
  isActBreak: boolean;
}

export interface CalculatedTimeline {
  episodeId: string;
  fps: number;
  totalDurationSeconds: number;
  totalDurationFrames: number;
  scenes: CalculatedTimelineScene[];
  hudWindows: Array<HudWindow & { startFrame: number; durationFrames: number; endFrame: number }>;
  actBreaks: number[];
  audio: AudioManifest;
}

/**
 * Valida e calcula os timings exatos de frame de uma TimelineContract
 */
export function parseAndCalculateTimeline(rawInput: unknown): CalculatedTimeline {
  const parsed = TimelineContractSchema.parse(rawInput);
  const fps = parsed.fps || HSL_FPS;
  const actBreaksSet = new Set(parsed.actBreaks || []);

  let accumulatedFrames = 0;
  const calculatedScenes: CalculatedTimelineScene[] = [];

  parsed.scenes.forEach((sc, index) => {
    const durationFrames = Math.round(sc.durationSeconds * fps);
    const startFrame = accumulatedFrames;
    const endFrame = startFrame + durationFrames;
    accumulatedFrames = endFrame;

    const isActBreak = actBreaksSet.has(index);

    // Se for uma virada de ato e não tiver transição explícita especial, aplica dipToBlack automaticamente
    let transition = sc.transition;
    if (isActBreak && transition === 'crossfade') {
      transition = 'dipToBlack';
    }

    calculatedScenes.push({
      ...sc,
      order: index + 1,
      startFrame,
      durationFrames,
      endFrame,
      transition,
      isActBreak
    });
  });

  const calculatedHudWindows = (parsed.hudWindows || []).map((hud) => {
    const startFrame = Math.round(hud.startSeconds * fps);
    const durationFrames = Math.round(hud.durationSeconds * fps);
    return {
      ...hud,
      startFrame,
      durationFrames,
      endFrame: startFrame + durationFrames
    };
  });

  const totalDurationFrames = accumulatedFrames;
  const totalDurationSeconds = totalDurationFrames / fps;

  const defaultAudio: AudioManifest = parsed.audio || {
    musicBed: `episodes/${parsed.episodeId}/audio/music/bed.mp3`,
    musicVolume: 0.22,
    voiceoverVolume: 1.0,
    sfxVolume: 0.45,
    ducking: true,
    duckedVolume: 0.12
  };

  return {
    episodeId: parsed.episodeId,
    fps,
    totalDurationSeconds,
    totalDurationFrames,
    scenes: calculatedScenes,
    hudWindows: calculatedHudWindows,
    actBreaks: parsed.actBreaks || [],
    audio: defaultAudio
  };
}

/**
 * Lê e parseia um arquivo de timeline JSON ou TypeScript
 */
export function loadTimelineContract(filePathOrData: string | unknown): CalculatedTimeline {
  if (typeof filePathOrData === 'string') {
    const resolvedPath = path.isAbsolute(filePathOrData)
      ? filePathOrData
      : path.resolve(process.cwd(), filePathOrData);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`TIMELINE_CONTRACT_FILE_NOT_FOUND: O arquivo '${resolvedPath}' não foi encontrado.`);
    }

    const content = fs.readFileSync(resolvedPath, 'utf8');
    const rawData = JSON.parse(content);
    return parseAndCalculateTimeline(rawData);
  }

  return parseAndCalculateTimeline(filePathOrData);
}
