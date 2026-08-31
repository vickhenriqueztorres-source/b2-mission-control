import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CameraMotionType} from '../../contracts/timelineContract';

export interface CameraLanguageProps {
  children: React.ReactNode;
  motion?: CameraMotionType;
  durationInFrames: number;
  sceneIndex?: number;
}

export function calculateCameraTransform(
  frame: number,
  durationInFrames: number,
  motion: CameraMotionType = 'pushIn',
  sceneIndex: number = 0,
): {scale: number; translateX: number; translateY: number; transformStyle: string} {
  if (motion === 'static') {
    return {scale: 1, translateX: 0, translateY: 0, transformStyle: 'none'};
  }

  const safeDuration = Math.max(1, durationInFrames);
  const progress = Math.min(1, Math.max(0, frame / safeDuration));
  const direction = sceneIndex % 2 === 0 ? 1 : -1;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  if (motion === 'tension') {
    scale = 1.006;
    translateX = Math.sin(frame * 0.73) * 0.35 + Math.cos(frame * 0.31) * 0.18;
    translateY = Math.cos(frame * 0.61) * 0.3;
  } else if (motion === 'drift') {
    scale = 1.008 + Math.sin(progress * Math.PI) * 0.003;
    translateX = interpolate(progress, [0, 1], [-5 * direction, 5 * direction]);
    translateY = interpolate(progress, [0, 0.5, 1], [2, -1, 1]);
  } else if (motion === 'panRight' || motion === 'panLeft') {
    const panDirection = motion === 'panRight' ? 1 : -1;
    scale = 1.014;
    translateX = interpolate(progress, [0, 1], [-8 * panDirection, 8 * panDirection]);
    translateY = Math.sin(progress * Math.PI) * 1.5;
  } else if (motion === 'pullOut') {
    scale = interpolate(progress, [0, 1], [1.012, 1.002]);
    translateY = interpolate(progress, [0, 1], [-2, 1]);
  } else {
    // Legacy pushIn/take default becomes an observational shoulder correction,
    // returning to scale 1 instead of applying a permanent digital zoom.
    scale = 1 + Math.sin(progress * Math.PI) * 0.004;
    translateX = Math.sin(progress * Math.PI * 2) * 1.2 * direction;
    translateY = Math.sin(progress * Math.PI) * -0.8;
  }

  return {
    scale,
    translateX,
    translateY,
    transformStyle: `scale(${scale.toFixed(4)}) translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0)`,
  };
}

/** Restrained on-location camera correction; never a Ken Burns substitute. */
export const CameraLanguage: React.FC<CameraLanguageProps> = ({
  children,
  motion = 'pushIn',
  durationInFrames,
  sceneIndex = 0,
}) => {
  const frame = useCurrentFrame();
  const {transformStyle} = calculateCameraTransform(frame, durationInFrames, motion, sceneIndex);

  return (
    <AbsoluteFill
      style={{
        transform: transformStyle,
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
