import React from 'react';
import { Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { AudioManifest, CalculatedTimelineScene } from '../../contracts/timelineContract';

export interface CinematicAudioMixProps {
  audio: AudioManifest;
  scenes: CalculatedTimelineScene[];
  totalFrames: number;
}

/**
 * 🎧 CinematicAudioMix: Mixagem Master de Áudio com Ducking Inteligente
 * Gerencia a trilha musical, narração e efeitos sonoros (SFX) com ducking
 * automático e dinâmico, evitando mascaramento de frequência na locução.
 */
export const CinematicAudioMix: React.FC<CinematicAudioMixProps> = ({
  audio,
  scenes,
  totalFrames
}) => {
  const frame = useCurrentFrame();

  const musicBed = audio.musicBed;
  const baseMusicVol = audio.musicVolume ?? 0.22;
  const duckedMusicVol = audio.duckedVolume ?? 0.12;
  const isDuckingEnabled = audio.ducking !== false;

  // Determina se o frame atual está em uma zona de locução ativa ou transição
  let currentScene: CalculatedTimelineScene | undefined;
  for (const sc of scenes) {
    if (frame >= sc.startFrame && frame < sc.endFrame) {
      currentScene = sc;
      break;
    }
  }

  let calculatedMusicVolume = baseMusicVol;

  if (isDuckingEnabled && currentScene) {
    const sceneLocalFrame = frame - currentScene.startFrame;
    const transitionFrames = 15;

    // Atenua a música durante a locução da cena
    if (currentScene.voiceoverFile) {
      // Entrada e saída suave de ducking
      if (sceneLocalFrame < transitionFrames) {
        calculatedMusicVolume = interpolate(
          sceneLocalFrame,
          [0, transitionFrames],
          [baseMusicVol, duckedMusicVol],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
      } else if (sceneLocalFrame > currentScene.durationFrames - transitionFrames) {
        calculatedMusicVolume = interpolate(
          sceneLocalFrame,
          [currentScene.durationFrames - transitionFrames, currentScene.durationFrames],
          [duckedMusicVol, baseMusicVol],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
      } else {
        calculatedMusicVolume = duckedMusicVol;
      }
    }
  }

  return (
    <>
      {/* 1. Trilha Sonora Musical com Volume Dinâmico */}
      {musicBed && (
        <Audio
          src={staticFile(musicBed)}
          volume={calculatedMusicVolume}
        />
      )}

      {/* 2. Locução Master Contínua (se especificada no manifesto) */}
      {audio.voiceoverTrack && (
        <Audio
          src={staticFile(audio.voiceoverTrack)}
          volume={audio.voiceoverVolume ?? 1.0}
        />
      )}

      {/* 3. Stems de Narração e SFX por Cena */}
      {scenes.map((scene) => {
        return (
          <Sequence
            key={`audio_${scene.id}`}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
            name={`AUDIO_${scene.id}`}
          >
            {scene.voiceoverFile && !audio.voiceoverTrack && (
              <Audio
                src={staticFile(scene.voiceoverFile)}
                volume={audio.voiceoverVolume ?? 1.0}
              />
            )}

            {scene.sfxFile && (
              <Audio
                src={staticFile(scene.sfxFile)}
                volume={audio.sfxVolume ?? 0.45}
              />
            )}
          </Sequence>
        );
      })}
    </>
  );
};
