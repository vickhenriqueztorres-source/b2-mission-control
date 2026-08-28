import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export interface KenBurnsCinematicFrameProps {
  children: React.ReactNode;
  mode?: 'push_in' | 'pull_out' | 'pan_right' | 'pan_left';
  durationInFrames: number;
  maxScale?: number;
}

export const KenBurnsCinematicFrame: React.FC<KenBurnsCinematicFrameProps> = ({
  children,
  mode = 'push_in',
  durationInFrames,
  maxScale = 1.12
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;

  if (mode === 'push_in') {
    scale = interpolate(progress, [0, 1], [1.0, maxScale]);
    translateY = interpolate(progress, [0, 1], [0, -10]);
  } else if (mode === 'pull_out') {
    scale = interpolate(progress, [0, 1], [maxScale, 1.0]);
    translateY = interpolate(progress, [0, 1], [-10, 0]);
  } else if (mode === 'pan_right') {
    scale = 1.08;
    translateX = interpolate(progress, [0, 1], [-20, 20]);
  } else if (mode === 'pan_left') {
    scale = 1.08;
    translateX = interpolate(progress, [0, 1], [20, -20]);
  }

  // Micro respiração analógica (35mm camera breath)
  const breathY = Math.sin(frame * 0.05) * 2;
  const breathX = Math.cos(frame * 0.04) * 1.5;

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        transform: `scale(${scale}) translate(${translateX + breathX}px, ${translateY + breathY}px)`,
        transformOrigin: 'center center'
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
