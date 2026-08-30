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
 * ⚡ SceneTransition: Transições Cinematográficas Denis Villeneuve
 * Aplica crossfade orgânico com overlap, dipToBlack em viradas de ato,
 * whipPan direcional ou corte seco apenas quando estritamente declarado.
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

  // 1. Corte Seco (Apenas quando explicitamente declarado no timeline)
  if (transitionType === 'hardCut' || transitionType === 'cut') {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  // 2. Dip to Black (20-30 frames nos Act Breaks)
  if (transitionType === 'dipToBlack') {
    const dipLen = Math.min(24, Math.floor(durationInFrames / 3));
    let dipOpacity = 1.0;

    if (!isFirstScene && frame < dipLen) {
      // Fade in a partir do preto absoluto (#060709)
      dipOpacity = interpolate(frame, [0, dipLen], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      });
    } else if (!isLastScene && frame > durationInFrames - dipLen) {
      // Fade out para o preto absoluto (#060709)
      dipOpacity = interpolate(
        frame,
        [durationInFrames - dipLen, durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
    }

    return (
      <AbsoluteFill style={{ backgroundColor: '#060709' }}>
        <AbsoluteFill style={{ opacity: dipOpacity }}>{children}</AbsoluteFill>
      </AbsoluteFill>
    );
  }

  // 3. Whip Pan (6-8 frames de blur direcional e translação rápida)
  if (transitionType === 'whipPan') {
    const whipLen = 7;
    let blurPx = 0;
    let translateX = 0;
    let opacity = 1.0;

    if (!isFirstScene && frame < whipLen) {
      blurPx = interpolate(frame, [0, whipLen], [18, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      });
      translateX = interpolate(frame, [0, whipLen], [-120, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      });
      opacity = interpolate(frame, [0, whipLen], [0.4, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      });
    } else if (!isLastScene && frame > durationInFrames - whipLen) {
      blurPx = interpolate(
        frame,
        [durationInFrames - whipLen, durationInFrames],
        [0, 18],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
      translateX = interpolate(
        frame,
        [durationInFrames - whipLen, durationInFrames],
        [0, 120],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
      opacity = interpolate(
        frame,
        [durationInFrames - whipLen, durationInFrames],
        [1, 0.4],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
    }

    return (
      <AbsoluteFill style={{ backgroundColor: '#060709', overflow: 'hidden' }}>
        <AbsoluteFill
          style={{
            opacity,
            filter: blurPx > 0 ? `blur(${blurPx.toFixed(1)}px)` : undefined,
            transform: translateX !== 0 ? `translate3d(${translateX.toFixed(1)}px, 0, 0)` : undefined
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  // 4. Laser Wipe (Corte tecnológico industrial ciano)
  if (transitionType === 'laserWipe' || transitionType === 'wipe') {
    const wipeProgress = interpolate(frame, [0, transitionLen], [0, 100], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
    const clipPath = `polygon(0% 0%, ${wipeProgress}% 0%, ${wipeProgress}% 100%, 0% 100%)`;

    return (
      <AbsoluteFill style={{ backgroundColor: '#060709' }}>
        <AbsoluteFill style={{ clipPath }}>{children}</AbsoluteFill>
        {wipeProgress < 100 && wipeProgress > 0 && (
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

  // 5. Crossfade Canônico (12-18 frames com overlap orgânico)
  let entryOpacity = 1;
  if (!isFirstScene) {
    entryOpacity = interpolate(frame, [0, transitionLen], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
  }

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

  const combinedOpacity = Math.min(entryOpacity, exitOpacity);

  return (
    <AbsoluteFill style={{ backgroundColor: '#060709' }}>
      <AbsoluteFill style={{ opacity: combinedOpacity }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
