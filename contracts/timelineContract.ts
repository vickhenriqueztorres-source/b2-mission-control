import { z } from 'zod';
import { HSL_FPS } from '../spec/hsl-spec';
import { isRegisteredComponent } from '../remotion/cinema/componentRegistry';

export type SceneTransitionType = 'crossfade' | 'dipToBlack' | 'whipPan' | 'hardCut' | 'laserWipe' | 'wipe' | 'cut';
export type CameraMotionType = 'pushIn' | 'drift' | 'tension' | 'static' | 'pullOut' | 'panRight' | 'panLeft';

export const SceneTransitionEnum = z.enum(['crossfade', 'dipToBlack', 'whipPan', 'hardCut', 'laserWipe', 'wipe', 'cut']);
export const CameraMotionEnum = z.enum(['pushIn', 'drift', 'tension', 'static', 'pullOut', 'panRight', 'panLeft']);

export const TimelineCalloutSchema = z.object({
  categoryText: z.string().min(1),
  mainText: z.string().min(1),
  subText: z.string().min(1),
  position: z.enum(['center', 'bottom_left', 'bottom_right', 'top_left', 'top_right', 'center_left']).optional().default('bottom_left')
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
}).transform((scene, ctx) => {
  // Valida existência do componente no registro oficial
  if (!isRegisteredComponent(scene.component)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `TIMELINE_UNKNOWN_COMPONENT: O componente '${scene.component}' na cena '${scene.id}' não foi encontrado no registro oficial.`,
      path: ['component']
    });
  }

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

export const HudAppearanceSchema = z.object({
  startScene: z.number().int().nonnegative().optional(),
  startSeconds: z.number().nonnegative().optional(),
  seconds: z.number().min(6).max(10, "Cada aparição de HUD deve ter entre 6s e 10s.")
});

export const HudWindowSchema = z.object({
  id: z.string().optional(),
  componentName: z.string().optional(),
  component: z.string().optional(),
  props: z.record(z.string(), z.any()).optional().default({}),
  appearances: z.array(HudAppearanceSchema).max(3, "Máximo de 3 aparições por HUD.").optional(),
  startSeconds: z.number().nonnegative().optional(),
  durationSeconds: z.number().min(6).max(10).optional()
}).transform((hud) => {
  const comp = hud.componentName || hud.component || 'HudWindow';
  const id = hud.id || comp;
  return {
    ...hud,
    id,
    component: comp,
    componentName: comp
  };
});

export type HudWindow = z.infer<typeof HudWindowSchema>;

export const ColdOpenSchema = z.object({
  sceneIds: z.array(z.string().min(1)).min(1, "O cold open deve conter pelo menos uma cena.")
});

export type ColdOpen = z.infer<typeof ColdOpenSchema>;

export const AudioManifestSchema = z.object({
  musicBed: z.string().min(1, "O caminho da trilha musical (musicBed) é obrigatório."),
  musicVolume: z.number().min(0).max(1).optional().default(0.22),
  voiceoverVolume: z.number().min(0).max(1).optional().default(1.0),
  sfxVolume: z.number().min(0).max(1).optional().default(0.45),
  ducking: z.boolean().optional().default(true),
  duckedVolume: z.number().min(0).max(1).optional().default(0.12),
  voiceoverTrack: z.string().optional(),
  roomTone: z.string().optional()
});

export type AudioManifest = z.infer<typeof AudioManifestSchema>;

export const TimelineContractSchema = z.object({
  episodeId: z.string().min(1, "O campo 'episodeId' é obrigatório."),
  fps: z.number().int().positive().optional().default(HSL_FPS),
  scenes: z.array(TimelineSceneItemSchema).min(1, "O timeline deve conter pelo menos uma cena."),
  actBreaks: z.array(z.number().int().nonnegative()).optional(),
  coldOpen: ColdOpenSchema.optional(),
  hudWindows: z.array(HudWindowSchema).optional().default([]),
  audio: AudioManifestSchema.optional()
}).superRefine((data, ctx) => {
  const scenes = data.scenes;

  // 1. TIMELINE_NO_ACT_STRUCTURE (mín 2, máx 4 viradas de ato)
  if (!data.actBreaks || data.actBreaks.length < 2 || data.actBreaks.length > 4) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `TIMELINE_NO_ACT_STRUCTURE: O timeline deve declarar entre 2 e 4 actBreaks (viradas estruturais de ato). Encontrado: ${data.actBreaks?.length || 0}.`,
      path: ['actBreaks']
    });
  }

  // 2. TIMELINE_NO_COLD_OPEN (Cold open obrigatório de 15s a 20s)
  if (!data.coldOpen || !data.coldOpen.sceneIds || data.coldOpen.sceneIds.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `TIMELINE_NO_COLD_OPEN: O episódio deve conter uma declaração de coldOpen com sceneIds antes de qualquer título.`,
      path: ['coldOpen']
    });
  } else {
    const coldOpenSceneSet = new Set(data.coldOpen.sceneIds);
    const coldOpenDuration = scenes
      .filter((s) => coldOpenSceneSet.has(s.id))
      .reduce((acc, s) => acc + s.durationSeconds, 0);

    if (coldOpenDuration < 14.5 || coldOpenDuration > 20.5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `TIMELINE_NO_COLD_OPEN: A duração somada do coldOpen deve estar entre 15s e 20s. Atual: ${coldOpenDuration.toFixed(1)}s.`,
        path: ['coldOpen']
      });
    }
  }

  // 3. TIMELINE_FLAT_PACING (>5 cenas consecutivas com duração ±10% igual)
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
            message: `TIMELINE_FLAT_PACING: Mais de 5 cenas consecutivas (índices ${streakStartIdx} a ${i}, cenas '${scenes[streakStartIdx].id}' a '${scenes[i].id}') possuem a mesma duração de ~${currDur.toFixed(1)}s (variação <= 10%). Varie o ritmo do roteiro alternando respiração e revelação.`,
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

  // 4. TIMELINE_NO_CLIMAX_BREATH (rajada de cenas < 3s deve ser seguida de cena com respiração >= 6s)
  for (let i = 0; i < scenes.length - 1; i++) {
    if (scenes[i].durationSeconds < 3 && scenes[i + 1].durationSeconds < 3) {
      // Encontrou início de rajada (<3s)
      let burstEndIdx = i + 1;
      while (burstEndIdx < scenes.length && scenes[burstEndIdx].durationSeconds < 3) {
        burstEndIdx++;
      }

      // Se a rajada terminou e a cena seguinte não tem respiro (duração < 6s)
      if (burstEndIdx < scenes.length) {
        const breathScene = scenes[burstEndIdx];
        if (breathScene.durationSeconds < 6.0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `TIMELINE_NO_CLIMAX_BREATH: Uma sequência de clímax acelerado (cenas <3s nos índices ${i} a ${burstEndIdx - 1}) deve ser obrigatoriamente seguida por uma cena de respiro com duração >= 6s. A cena seguinte '${breathScene.id}' tem apenas ${breathScene.durationSeconds.toFixed(1)}s.`,
            path: ['scenes', burstEndIdx]
          });
          break;
        }
      }
      i = burstEndIdx;
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
  hudWindows: Array<{
    id: string;
    component: string;
    props: Record<string, any>;
    startFrame: number;
    durationFrames: number;
    endFrame: number;
  }>;
  actBreaks: number[];
  coldOpen?: ColdOpen;
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

  // Expande janelas de HUD (tanto por aparições em cenas quanto por startSeconds)
  const calculatedHudWindows: Array<{
    id: string;
    component: string;
    props: Record<string, any>;
    startFrame: number;
    durationFrames: number;
    endFrame: number;
  }> = [];

  (parsed.hudWindows || []).forEach((hud, hudIdx) => {
    if (hud.appearances && hud.appearances.length > 0) {
      hud.appearances.forEach((app, appIdx) => {
        let startSec = app.startSeconds || 0;
        if (app.startScene !== undefined && app.startScene < calculatedScenes.length) {
          startSec = calculatedScenes[app.startScene].startFrame / fps;
        }
        const startFrame = Math.round(startSec * fps);
        const durationFrames = Math.round(app.seconds * fps);
        calculatedHudWindows.push({
          id: `${hud.id}_app_${appIdx + 1}`,
          component: hud.component,
          props: hud.props || {},
          startFrame,
          durationFrames,
          endFrame: startFrame + durationFrames
        });
      });
    } else if (hud.startSeconds !== undefined && hud.durationSeconds !== undefined) {
      const startFrame = Math.round(hud.startSeconds * fps);
      const durationFrames = Math.round(hud.durationSeconds * fps);
      calculatedHudWindows.push({
        id: hud.id || `hud_${hudIdx + 1}`,
        component: hud.component,
        props: hud.props || {},
        startFrame,
        durationFrames,
        endFrame: startFrame + durationFrames
      });
    }
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
    coldOpen: parsed.coldOpen,
    audio: defaultAudio
  };
}

/**
 * Lê e parseia um arquivo de timeline JSON ou TypeScript
 */
export function loadTimelineContract(filePathOrData: string | unknown): CalculatedTimeline {
  if (typeof filePathOrData === 'string') {
    const nodePath = require('path');
    const nodeFs = require('fs');

    const resolvedPath = nodePath.isAbsolute(filePathOrData)
      ? filePathOrData
      : nodePath.resolve(process.cwd(), filePathOrData);

    if (!nodeFs.existsSync(resolvedPath)) {
      throw new Error(`TIMELINE_CONTRACT_FILE_NOT_FOUND: O arquivo '${resolvedPath}' não foi encontrado.`);
    }

    const content = nodeFs.readFileSync(resolvedPath, 'utf8');
    const rawData = JSON.parse(content);
    return parseAndCalculateTimeline(rawData);
  }

  return parseAndCalculateTimeline(filePathOrData);
}
