import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { SceneTransitionType } from '../../contracts/timelineContract';

export interface SceneTransitionProps {
  children: React.ReactNode;
  transitionType?: SceneTransitionType;
  durationInFrames: number;
  transitionDurationFrames?: number;
  isFirstScene?: boolean;
  isLastScene?: boolean;
}

/**
 * ⚡ SceneTransition: Transição Cinematográfica Integrada
 * Garante que cortes secos nunca ocorram por omissão, aplicando crossfade
 * por padrão ou dipToBlack em viradas de ato.
 */
export const SceneTransition: React.FC<SceneTransitionProps> = ({
  children,
  transitionType = 'crossfade',
  durationInFrames,
  transitionDurationFrames = 15,
  isFirstScene = false,
  isLastScene = false
}) => {
  const frame = useCurrentFrame();
  const transitionLen = Math.min(transitionDurationFrames, Math.floor(durationInFrames / 3));

  // Opacidade de Entrada (Fade In / Crossfade)
  let entryOpacity = 1;
  if (!isFirstScene) {
    entryOpacity = interpolate(frame, [0, transitionLen], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
  }

  // Opacidade de Saída (Fade Out / Crossfade)
  let exitOpacity = 1;
  if (!isLastScene) {
    exitOpacity = interpolate(
      frame,
      [durationInFrames - transitionLen, durationInFrames],
      [1, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      }
    );
  }

  // Comportamento específico por tipo de transição
  if (transitionType === 'cut') {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  if (transitionType === 'dipToBlack') {
    // Dip to black escurece mais profundamente na transição
    const dipOpacity = Math.min(entryOpacity, exitOpacity);
    return (
      <AbsoluteFill style={{ backgroundColor: '#060709' }}>
        <AbsoluteFill style={{ opacity: dipOpacity }}>{children}</AbsoluteFill>
      </AbsoluteFill>
    );
  }

  if (transitionType === 'laserWipe' || transitionType === 'wipe') {
    const wipeProgress = interpolate(frame, [0, transitionLen], [0, 100], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
    const clipPath = `polygon(0% 0%, ${wipeProgress}% 0%, ${wipeProgress}% 100%, 0% 100%)`;

    return (
      <AbsoluteFill style={{ backgroundColor: '#060709' }}>
        <AbsoluteFill style={{ clipPath }}>{children}</AbsoluteFill>
        {wipeProgress < 100 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${wipeProgress}%`,
              width: '3px',
              backgroundColor: '#00F0FF',
              boxShadow: '0 0 12px #00F0FF, 0 0 24px #00F0FF'
            }}
          />
        )}
      </AbsoluteFill>
    );
  }

  // Padrão Absoluto: Crossfade
  const combinedOpacity = Math.min(entryOpacity, exitOpacity);

  return (
    <AbsoluteFill style={{ backgroundColor: '#060709' }}>
      <AbsoluteFill style={{ opacity: combinedOpacity }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
