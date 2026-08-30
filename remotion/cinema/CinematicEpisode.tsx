import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import {
  CalculatedTimeline,
  TimelineContract,
  AudioManifest,
  parseAndCalculateTimeline
} from '../../contracts/timelineContract';
import { FilmGrade } from './FilmGrade';
import { HudDirector } from './HudDirector';
import { SceneTransition } from './SceneTransition';
import { CameraLanguage } from './CameraLanguage';
import { CinematicAudioMix } from './CinematicAudioMix';
import { resolveSceneComponent } from './SceneRegistry';
import { DynamicSpotlightFocus } from '../documentary/DynamicSpotlightFocus';
import { KineticEditorialCallout } from '../documentary/KineticEditorialCallout';

export interface CinematicEpisodeProps {
  timeline: CalculatedTimeline | TimelineContract;
  audio?: AudioManifest;
  accentColor?: string;
  telemetryColor?: string;
  runId?: string;
}

/**
 * 👑 CinematicEpisode: Compositor Genérico Master de Episódios
 * Padrão Único e Inegociável de Composição para o canal "O Outro Lado".
 * Monta automaticamente qualquer episódio a partir de dados com:
 * FilmGrade > HudDirector > [cenas com SceneTransition + CameraLanguage] + CinematicAudioMix.
 */
export const CinematicEpisode: React.FC<CinematicEpisodeProps> = ({
  timeline,
  audio,
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  runId = 'latest'
}) => {
  // Normaliza e calcula os timings da timeline se necessário
  const calculatedTimeline: CalculatedTimeline =
    'totalDurationFrames' in timeline && Array.isArray((timeline as CalculatedTimeline).scenes)
      ? (timeline as CalculatedTimeline)
      : parseAndCalculateTimeline(timeline);

  const audioManifest: AudioManifest = audio || calculatedTimeline.audio;
  const scenes = calculatedTimeline.scenes;

  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', color: '#FFFFFF' }}>
      {/* 1. Master Film Grade 35mm (Chiaroscuro, Grão, Vinheta, Letterbox 2.39:1) */}
      <FilmGrade>
        {/* 2. Diretor de HUDs Persistentes e Telemetria de Topo */}
        <HudDirector
          totalFrames={calculatedTimeline.totalDurationFrames}
          hudWindows={calculatedTimeline.hudWindows}
          accentColor={accentColor}
          telemetryColor={telemetryColor}
        >
          {/* 3. Sequenciador Canônico de Cenas com Transições e Câmera */}
          {scenes.map((scene, index) => {
            const SceneComponent = resolveSceneComponent(scene.component);
            const isFirst = index === 0;
            const isLast = index === scenes.length - 1;

            // Props mescladas da cena
            const mergedProps = {
              sceneId: scene.id,
              name: scene.name,
              chapterTitle: scene.chapterTitle,
              durationInFrames: scene.durationFrames,
              accentColor,
              telemetryColor,
              mediaPath: scene.mediaFile || scene.props?.mediaPath,
              ...scene.props
            };

            return (
              <Sequence
                key={scene.id}
                from={scene.startFrame}
                durationInFrames={scene.durationFrames}
                name={`${scene.id}_${scene.name || scene.component}`}
              >
                <AbsoluteFill style={{ backgroundColor: '#060709' }}>
                  {/* Transição Cinematográfica (Crossfade por padrão, DipToBlack em Act Breaks) */}
                  <SceneTransition
                    transitionType={scene.transition}
                    durationInFrames={scene.durationFrames}
                    isFirstScene={isFirst}
                    isLastScene={isLast}
                  >
                    {/* Micro-movimento de Câmera 35mm (PushIn para vídeo, Drift para dossiês) */}
                    <CameraLanguage
                      motion={scene.camera}
                      durationInFrames={scene.durationFrames}
                    >
                      <SceneComponent {...mergedProps} />
                    </CameraLanguage>

                    {/* Spotlight Chiaroscuro Denis Villeneuve */}
                    <DynamicSpotlightFocus
                      durationInFrames={scene.durationFrames}
                      intensity={0.28}
                    />

                    {/* Tipografia Editorial Cinética Opcional */}
                    {scene.callout && (
                      <KineticEditorialCallout
                        mainText={scene.callout.mainText}
                        subText={scene.callout.subText}
                        categoryText={scene.callout.categoryText}
                        startFrame={15}
                        durationFrames={Math.max(60, scene.durationFrames - 20)}
                        position={scene.callout.position || 'bottom_left'}
                        accentColor={accentColor}
                        telemetryColor={telemetryColor}
                      />
                    )}
                  </SceneTransition>
                </AbsoluteFill>
              </Sequence>
            );
          })}
        </HudDirector>
      </FilmGrade>

      {/* 4. Mixagem Master de Áudio com Ducking Inteligente */}
      <CinematicAudioMix
        audio={audioManifest}
        scenes={scenes}
        totalFrames={calculatedTimeline.totalDurationFrames}
      />
    </AbsoluteFill>
  );
};
