import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export interface CinematicParallaxMotionProps {
  children: React.ReactNode;
  durationInFrames: number;
  mode?: 'crash_push_in' | 'slow_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift';
  zoomIntensity?: number; // padrão 1.28
}

/**
 * Sistema de Câmera 2.5D Cinematográfica Denis Villeneuve 35mm
 * Aplica curvas de aceleração reais, zoom perceptível (1.0 -> 1.28) e micro-oscilações de operador real,
 * eliminando a sensação estática de fotografias.
 */
export const CinematicParallaxMotion: React.FC<CinematicParallaxMotionProps> = ({
  children,
  durationInFrames,
  mode = 'slow_push_in',
  zoomIntensity = 1.26
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;

  if (mode === 'crash_push_in') {
    // Zoom rápido no primeiro 1.5s que depois desacelera suavemente
    const crashProgress = interpolate(progress, [0, 0.3, 1], [0, 0.7, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
    scale = interpolate(crashProgress, [0, 1], [1.02, zoomIntensity + 0.05]);
    translateY = interpolate(crashProgress, [0, 1], [0, -35]);
  } else if (mode === 'slow_push_in') {
    scale = interpolate(progress, [0, 1], [1.0, zoomIntensity]);
    translateY = interpolate(progress, [0, 1], [0, -25]);
    translateX = interpolate(progress, [0, 1], [-15, 15]);
  } else if (mode === 'dramatic_pull_out') {
    scale = interpolate(progress, [0, 1], [zoomIntensity + 0.05, 1.0]);
    translateY = interpolate(progress, [0, 1], [-30, 0]);
  } else if (mode === 'pan_right') {
    scale = 1.18;
    translateX = interpolate(progress, [0, 1], [-60, 60]);
    translateY = interpolate(progress, [0, 1], [-10, 10]);
  } else if (mode === 'pan_left') {
    scale = 1.18;
    translateX = interpolate(progress, [0, 1], [60, -60]);
    translateY = interpolate(progress, [0, 1], [10, -10]);
  } else if (mode === 'cinematic_drift') {
    scale = interpolate(progress, [0, 0.5, 1], [1.05, 1.22, 1.18]);
    translateX = interpolate(progress, [0, 1], [-30, 40]);
    translateY = interpolate(progress, [0, 1], [-20, 20]);
  }

  // Micro-respiração e vibração orgânica de câmera 35mm no ombro
  const handheldShakeX = Math.sin(frame * 0.08) * 3.5 + Math.cos(frame * 0.15) * 1.5;
  const handheldShakeY = Math.cos(frame * 0.07) * 4.0 + Math.sin(frame * 0.12) * 2.0;

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        transform: `scale(${scale}) translate(${translateX + handheldShakeX}px, ${translateY + handheldShakeY}px)`,
        transformOrigin: 'center center'
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
