import React from 'react';
import { Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { AudioManifest, CalculatedTimelineScene } from '../../contracts/timelineContract';

export interface CinematicAudioMixProps {
  audio: AudioManifest;
  scenes: CalculatedTimelineScene[];
  totalFrames: number;
}

/**
 * Calcula o volume determinístico da música em um frame específico
 */
export function calculateMusicVolumeAtFrame(
  frame: number,
  totalFrames: number,
  scenes: CalculatedTimelineScene[],
  actBreaks: number[] = [],
  options: {
    baseMusicVol?: number;
    duckedMusicVol?: number;
    swellMusicVol?: number;
    isDuckingEnabled?: boolean;
  } = {}
): number {
  const baseMusicVol = options.baseMusicVol ?? 0.30;
  const duckedMusicVol = options.duckedMusicVol ?? 0.12;
  const swellMusicVol = options.swellMusicVol ?? 0.40;
  const isDuckingEnabled = options.isDuckingEnabled !== false;

  // 1. Fade-in estrutural de abertura (45 frames) e Fade-out final (60 frames)
  let masterFadeFactor = 1.0;
  if (frame < 45) {
    masterFadeFactor = interpolate(frame, [0, 45], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
  } else if (frame > totalFrames - 60) {
    masterFadeFactor = interpolate(frame, [totalFrames - 60, totalFrames], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
  }

  // 2. Identifica se estamos em swell de clímax antes de um actBreak (60-90 frames antes)
  const actBreakFrames = actBreaks
    .map((idx) => (idx < scenes.length ? scenes[idx].startFrame : -1))
    .filter((f) => f > 0);

  let isSwellActive = false;
  let swellFactor = 0;
  for (const abFrame of actBreakFrames) {
    const swellStart = abFrame - 75; // ~2.5s antes
    const swellEnd = abFrame;
    if (frame >= swellStart && frame < swellEnd) {
      isSwellActive = true;
      const progress = (frame - swellStart) / 75;
      swellFactor = Math.sin(progress * Math.PI); // pico no clímax
      break;
    }
  }

  // 3. Identifica cena ativa e status de narração (Ducking: attack 8 frames, release 15 frames)
  let currentScene: CalculatedTimelineScene | undefined;
  for (const sc of scenes) {
    if (frame >= sc.startFrame && frame < sc.endFrame) {
      currentScene = sc;
      break;
    }
  }

  let sceneDuckingVol = baseMusicVol;

  if (isDuckingEnabled && currentScene && (currentScene.voiceoverFile || currentScene.voiceoverText)) {
    const localFrame = frame - currentScene.startFrame;
    const attackFrames = 8;
    const releaseFrames = 15;

    if (localFrame < attackFrames) {
      // Attack: transição rápida de base para ducked (8 frames)
      sceneDuckingVol = interpolate(
        localFrame,
        [0, attackFrames],
        [baseMusicVol, duckedMusicVol],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
    } else if (localFrame > currentScene.durationFrames - releaseFrames) {
      // Release: transição suave de ducked para base (15 frames)
      sceneDuckingVol = interpolate(
        localFrame,
        [currentScene.durationFrames - releaseFrames, currentScene.durationFrames],
        [duckedMusicVol, baseMusicVol],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
    } else {
      sceneDuckingVol = duckedMusicVol;
    }
  }

  // Se houver swell de clímax, interpola para swellMusicVol (0.40)
  let finalVol = isSwellActive
    ? interpolate(swellFactor, [0, 1], [sceneDuckingVol, swellMusicVol])
    : sceneDuckingVol;

  return finalVol * masterFadeFactor;
}

/**
 * Calcula o envelope de volume de SFX (Attack 4 frames, Release 10 frames)
 */
export function calculateSfxVolumeAtFrame(
  localFrame: number,
  durationInFrames: number,
  maxVol: number = 0.45
): number {
  const attackFrames = 4;
  const releaseFrames = 10;

  if (localFrame < 0 || localFrame >= durationInFrames) {
    return 0;
  }

  if (localFrame < attackFrames) {
    return interpolate(localFrame, [0, attackFrames], [0, maxVol], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
  }

  if (localFrame > durationInFrames - releaseFrames) {
    return interpolate(
      localFrame,
      [durationInFrames - releaseFrames, durationInFrames],
      [maxVol, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  }

  return maxVol;
}

/**
 * 🎧 CinematicAudioMix: Mixagem Master de Áudio com Ducking Inteligente
 * Gerencia a trilha musical, narração, efeitos sonoros (SFX) e room tone
 * com curvas dinâmicas contínuas (volume={(f) => ...}).
 */
export const CinematicAudioMix: React.FC<CinematicAudioMixProps> = ({
  audio,
  scenes,
  totalFrames
}) => {
  const frame = useCurrentFrame();

  const musicBed = audio.musicBed;
  const baseMusicVol = audio.musicVolume ?? 0.30;
  const duckedMusicVol = audio.duckedVolume ?? 0.12;
  const sfxBaseVol = audio.sfxVolume ?? 0.45;
  const isDuckingEnabled = audio.ducking !== false;

  const actBreaks = scenes.filter((s) => s.isActBreak).map((s) => s.order - 1);

  // Calcula volume do frame atual da trilha sonora musical
  const musicVolumeForFrame = calculateMusicVolumeAtFrame(
    frame,
    totalFrames,
    scenes,
    actBreaks,
    {
      baseMusicVol,
      duckedMusicVol,
      isDuckingEnabled
    }
  );

  return (
    <>
      {/* 1. Trilha Sonora Musical com Curvas Dinâmicas de Ducking & Fades */}
      {musicBed && (
        <Audio
          src={staticFile(musicBed)}
          volume={(f) =>
            calculateMusicVolumeAtFrame(f, totalFrames, scenes, actBreaks, {
              baseMusicVol,
              duckedMusicVol,
              isDuckingEnabled
            })
          }
        />
      )}

      {/* 2. Room Tone Atmosférico Contínuo (-30dB / 0.032) */}
      {audio.roomTone && (
        <Audio
          src={staticFile(audio.roomTone)}
          volume={(f) =>
            interpolate(
              f,
              [0, 45, totalFrames - 60, totalFrames],
              [0, 0.032, 0.032, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            )
          }
        />
      )}

      {/* 3. Locução Master Contínua (se especificada no manifesto) */}
      {audio.voiceoverTrack && (
        <Audio
          src={staticFile(audio.voiceoverTrack)}
          volume={audio.voiceoverVolume ?? 1.0}
        />
      )}

      {/* 4. Faixa narrativa de SFX aprovada e sincronizada à timeline */}
      {audio.sfxBed && (
        <Audio
          src={staticFile(audio.sfxBed)}
          volume={(f) => calculateSfxVolumeAtFrame(f, totalFrames, sfxBaseVol)}
        />
      )}

      {/* 5. Stems de Narração e SFX com Envelope e J-CUT nos Act Breaks */}
      {scenes.map((scene) => {
        // J-CUT: em viradas de ato, a locução pode entrar 12 frames antes da imagem
        const jCutOffset = scene.isActBreak ? -12 : 0;
        const voiceoverStartFrame = Math.max(0, scene.startFrame + jCutOffset);
        const voiceoverDuration = scene.durationFrames + Math.abs(jCutOffset);

        return (
          <React.Fragment key={`audio_group_${scene.id}`}>
            {/* Locução por cena (intocada em 1.0) */}
            {scene.voiceoverFile && !audio.voiceoverTrack && (
              <Sequence
                from={voiceoverStartFrame}
                durationInFrames={voiceoverDuration}
                name={`VO_${scene.id}`}
              >
                <Audio
                  src={staticFile(scene.voiceoverFile)}
                  volume={audio.voiceoverVolume ?? 1.0}
                />
              </Sequence>
            )}

            {/* SFX por cena com envelope Attack 4 / Release 10 */}
            {scene.sfxFile && (
              <Sequence
                from={scene.startFrame}
                durationInFrames={scene.durationFrames}
                name={`SFX_${scene.id}`}
              >
                <Audio
                  src={staticFile(scene.sfxFile)}
                  volume={(f) =>
                    calculateSfxVolumeAtFrame(f, scene.durationFrames, sfxBaseVol)
                  }
                />
              </Sequence>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
