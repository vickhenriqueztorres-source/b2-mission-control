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

    const timelineDataCode = `// Arquivo gerado automaticamente pelo RemotionCompiler
export interface CompiledSceneItem {
  sceneId: string;
  name: string;
  startFrame: number;
  durationFrames: number;
  durationSeconds: number;
  takeType: 'CINEMATIC_TAKE' | 'KEYFRAME_DOSSIER';
  integratedText?: string;
  motionMode: 'crash_push_in' | 'slow_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift';
  callout?: {
    categoryText: string;
    mainText: string;
    subText: string;
    position?: 'center' | 'bottom_left' | 'bottom_right' | 'top_left';
  };
}

export const ${totalFramesVarName} = ${totalDurationFrames};

export const ${timelineVarName}: CompiledSceneItem[] = ${JSON.stringify(compiledScenes, null, 2)};
`;

    fs.writeFileSync(timelineDataPath, timelineDataCode, 'utf8');
    Logger.info(this.loggerName, `Timeline data gerada em: ${timelineDataPath}`);

    // 3. Gerar arquivo do Componente Remotion: EpisodeXX<Name>.tsx
    const componentPath = path.join(remotionDir, `${input.compositionId}.tsx`);
    const audioFolder = input.audioSubfolder || `postproduction_${input.episodeId.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;

    const componentCode = `import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  AnamorphicCinematicOverlay,
  AtomicStopwatch,
  CinematicKeyframeDossier,
  DynamicDocumentaryMedia,
  DynamicSpotlightFocus,
  Episode02SoundTrack,
  IndustrialXRayHUD,
  KineticEditorialCallout,
  KineticNumberCounter
} from './documentary';
import { ${timelineVarName}, ${totalFramesVarName} } from './${timelineDataFilename.replace('.ts', '')}';

export interface ${input.compositionId}Props {
  accentColor?: string;
  telemetryColor?: string;
}

export const ${input.compositionId}: React.FC<${input.compositionId}Props> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', color: '#FFFFFF' }}>
      {/* 1. Trilha Sonora Master & Sound Design */}
      <Episode02SoundTrack />

      {/* 2. Áudio da Narração Master Sincronizado */}
      <Audio src={staticFile('postproduction/narration.mp3')} volume={1.0} />

      {/* 3. Cronômetro Atômico de Telemetria no Topo */}
      <AtomicStopwatch totalFrames={${totalFramesVarName}} />

      {/* 4. Sequência das ${compiledScenes.length} Cenas com Motion Graphics */}
      {${timelineVarName}.map((scene) => {
        return (
          <Sequence
            key={scene.sceneId}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
            name={\`\${scene.sceneId}_\${scene.name}\`}
          >
            <AbsoluteFill style={{ backgroundColor: '#060709' }}>
              {/* CENA CINEMATOGRÁFICA 35MM (Firefly Take ou Keyframe Dossier 2.5D) */}
              <DynamicDocumentaryMedia
                sceneId={scene.sceneId}
                kenBurns={scene.motionMode}
                zoomIntensity={1.22}
                durationInFrames={scene.durationFrames}
                isDossierTake={scene.takeType === 'KEYFRAME_DOSSIER'}
                dossierTag={\`TELEMETRIA // \${scene.sceneId}\`}
              />

              {/* Spotlight Chiaroscuro */}
              <DynamicSpotlightFocus
                durationInFrames={scene.durationFrames}
                intensity={0.38}
              />

              {/* HUD Industrial de Telemetria X-Ray */}
              <IndustrialXRayHUD
                sceneId={scene.sceneId}
                title={scene.name}
                category="${category}"
                accentColor={accentColor}
                telemetryColor={telemetryColor}
              />

              {/* Tipografia Editorial Dinâmica / Callout */}
              {scene.callout && (
                <KineticEditorialCallout
                  mainText={scene.callout.mainText}
                  subText={scene.callout.subText}
                  categoryText={scene.callout.categoryText}
                  startFrame={12}
                  durationFrames={Math.max(60, scene.durationFrames - 20)}
                  position={scene.callout.position || 'bottom_left'}
                  accentColor={accentColor}
                />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* 5. Overlay Cinematográfico 35mm Master (Letterbox 2.39:1 + Grão + Retículas) */}
      <AnamorphicCinematicOverlay />
    </AbsoluteFill>
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
