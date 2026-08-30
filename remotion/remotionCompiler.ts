import fs from 'fs';
import path from 'path';
import { HSL_FPS, HSL_VIDEO_RESOLUTION } from '../spec/hsl-spec';
import { Logger } from '../event-hub/logger';

export interface SceneTimelineInput {
  sceneId: string;
  name: string;
  durationSeconds: number;
  durationFrames?: number;
  startFrame?: number;
  narrationSnippet?: string;
  visualDescription?: string;
  takeType?: 'CINEMATIC_TAKE' | 'KEYFRAME_DOSSIER';
  integratedText?: string;
  callout?: {
    categoryText: string;
    mainText: string;
    subText: string;
    position?: 'center' | 'bottom_left' | 'bottom_right' | 'top_left';
  };
  motionMode?: 'crash_push_in' | 'slow_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift';
}

export interface EpisodeCompilationInput {
  episodeId: string; // e.g. 'OOL-EP05-RADAR-ASFALTO'
  compositionId: string; // e.g. 'Episode05RadarAsfalto'
  title: string;
  categoryTitle?: string;
  fps?: number;
  width?: number;
  height?: number;
  audioSubfolder?: string;
  scenes: SceneTimelineInput[];
}

export class RemotionCompiler {
  private static readonly loggerName = 'RemotionCompiler';

  /**
   * Compila automaticamente a timeline, o componente do episódio e registra no Root.tsx
   */
  public static compileEpisode(input: EpisodeCompilationInput): {
    timelineDataFile: string;
    episodeComponentFile: string;
    totalDurationFrames: number;
    totalDurationSeconds: number;
  } {
    const remotionDir = path.join(process.cwd(), 'remotion');
    const fps = input.fps || HSL_FPS;
    const category = input.categoryTitle || 'INVESTIGAÇÃO DOCUMENTAL // O OUTRO LADO';

    Logger.info(this.loggerName, `Compilando composição Remotion para ${input.episodeId} (${input.compositionId})...`);

    // 1. Calcular Timings contínuos
    let currentFrame = 0;
    const compiledScenes = input.scenes.map((sc, idx) => {
      const durFrames = sc.durationFrames || Math.round(sc.durationSeconds * fps);
      const start = currentFrame;
      currentFrame += durFrames;

      return {
        sceneId: sc.sceneId,
        name: sc.name || `Cena ${idx + 1}`,
        startFrame: start,
        durationFrames: durFrames,
        durationSeconds: durFrames / fps,
        takeType: sc.takeType || 'CINEMATIC_TAKE',
        integratedText: sc.integratedText || '',
        motionMode: sc.motionMode || (sc.takeType === 'KEYFRAME_DOSSIER' ? 'slow_push_in' : 'cinematic_drift'),
        callout: sc.callout
      };
    });

    const totalDurationFrames = currentFrame;
    const totalDurationSeconds = totalDurationFrames / fps;

    // 2. Gerar arquivo de Timeline Data: episodeXXTimelineData.ts
    const timelineVarName = `${input.compositionId.toUpperCase()}_TIMELINE`;
    const totalFramesVarName = `${input.compositionId.toUpperCase()}_TOTAL_FRAMES`;
    const timelineDataFilename = `${input.compositionId.charAt(0).toLowerCase() + input.compositionId.slice(1)}TimelineData.ts`;
    const timelineDataPath = path.join(remotionDir, timelineDataFilename);

    const timelineDataCode = `// Arquivo gerado automaticamente pelo RemotionCompiler via CinematicEpisode
import { TimelineContract, CalculatedTimeline, parseAndCalculateTimeline } from '../contracts/timelineContract';

export const ${totalFramesVarName} = ${totalDurationFrames};

export const ${timelineVarName}_CONTRACT: TimelineContract = {
  episodeId: '${input.episodeId}',
  fps: ${fps},
  audio: {
    musicBed: 'episodes/${input.episodeId}/audio/music/bed.mp3',
    musicVolume: 0.22,
    voiceoverVolume: 1.0,
    sfxVolume: 0.45,
    ducking: true,
    duckedVolume: 0.12
  },
  scenes: ${JSON.stringify(compiledScenes.map(sc => ({
    id: sc.sceneId,
    name: sc.name,
    component: sc.takeType === 'KEYFRAME_DOSSIER' ? 'CinematicKeyframeDossier' : 'DynamicDocumentaryMedia',
    durationSeconds: sc.durationSeconds,
    transition: 'crossfade',
    camera: sc.takeType === 'KEYFRAME_DOSSIER' ? 'drift' : 'pushIn',
    callout: sc.callout,
    take_type: sc.takeType,
    mediaFile: `episodes/${input.episodeId}/takes/\${sc.sceneId}.mp4`,
    voiceoverFile: `episodes/${input.episodeId}/audio/narration/\${sc.sceneId}.mp3`,
    sfxFile: `episodes/${input.episodeId}/audio/sfx/\${sc.sceneId}.mp3`,
    props: {
      sceneId: sc.sceneId,
      name: sc.name,
      integratedText: sc.integratedText,
      motionMode: sc.motionMode,
      zoomIntensity: 1.15
    }
  })), null, 2)}
};

export const ${timelineVarName}_CALCULATED: CalculatedTimeline = parseAndCalculateTimeline(${timelineVarName}_CONTRACT);
`;

    fs.writeFileSync(timelineDataPath, timelineDataCode, 'utf8');
    Logger.info(this.loggerName, `Timeline data gerada em: ${timelineDataPath}`);

    // 3. Gerar arquivo do Componente Remotion usando CinematicEpisode
    const componentPath = path.join(remotionDir, `${input.compositionId}.tsx`);

    const componentCode = `import React from 'react';
import { CinematicEpisode } from './cinema/CinematicEpisode';
import { ${timelineVarName}_CALCULATED, ${totalFramesVarName} } from './${timelineDataFilename.replace('.ts', '')}';

export interface ${input.compositionId}Props {
  accentColor?: string;
  telemetryColor?: string;
  runId?: string;
}

export const ${input.compositionId}: React.FC<${input.compositionId}Props> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  runId = 'latest'
}) => {
  return (
    <CinematicEpisode
      timeline={${timelineVarName}_CALCULATED}
      accentColor={accentColor}
      telemetryColor={telemetryColor}
      runId={runId}
    />
  );
};
`;

    fs.writeFileSync(componentPath, componentCode, 'utf8');
    Logger.info(this.loggerName, `Componente do episódio gerado em: ${componentPath}`);

    // 4. Injetar / Registrar automaticamente a Composição dentro do Root.tsx
    this.registerInRoot(input.compositionId, totalFramesVarName, timelineDataFilename.replace('.ts', ''));

    return {
      timelineDataFile: timelineDataPath,
      episodeComponentFile: componentPath,
      totalDurationFrames,
      totalDurationSeconds
    };
  }

  /**
   * Garante que a composição do episódio esteja importada e registrada em remotion/Root.tsx
   */
  public static registerInRoot(compositionId: string, totalFramesVarName: string, timelineModuleName: string): void {
    const rootPath = path.join(process.cwd(), 'remotion', 'Root.tsx');
    if (!fs.existsSync(rootPath)) return;

    let rootContent = fs.readFileSync(rootPath, 'utf8');

    // 1. Verificar se a importação do componente já existe
    if (!rootContent.includes(`import {${compositionId}}`) && !rootContent.includes(`import { ${compositionId} }`)) {
      // Inserir importação do componente
      rootContent = `import {${compositionId}} from './${compositionId}';\n` + rootContent;
    }

    // 2. Verificar se a importação do total de frames já existe
    if (!rootContent.includes(totalFramesVarName)) {
      rootContent = `import {${totalFramesVarName}} from './${timelineModuleName}';\n` + rootContent;
    }

    // 3. Verificar se a Composition está na árvore JSX
    if (!rootContent.includes(`id="${compositionId}"`)) {
      const compositionSnippet = `  <Composition
    id="${compositionId}"
    component={${compositionId}}
    durationInFrames={${totalFramesVarName}}
    fps={HSL_FPS}
    width={HSL_VIDEO_RESOLUTION.WIDTH}
    height={HSL_VIDEO_RESOLUTION.HEIGHT}
  />\n`;

      // Inserir logo antes de </>;
      const closingIndex = rootContent.lastIndexOf('</>');
      if (closingIndex !== -1) {
        rootContent = rootContent.slice(0, closingIndex) + compositionSnippet + rootContent.slice(closingIndex);
      }
    }

    fs.writeFileSync(rootPath, rootContent, 'utf8');
    Logger.info(this.loggerName, `Composição '${compositionId}' registrada com sucesso em remotion/Root.tsx!`);
  }
}
