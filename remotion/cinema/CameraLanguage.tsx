import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';
import { CameraMotionType } from '../../contracts/timelineContract';

export interface CameraLanguageProps {
  children: React.ReactNode;
  motion?: CameraMotionType;
  durationInFrames: number;
  sceneIndex?: number;
}

/**
 * Calcula o vetor de movimento de câmera em um frame determinístico
 */
export function calculateCameraTransform(
  frame: number,
  durationInFrames: number,
  motion: CameraMotionType = 'pushIn',
  sceneIndex: number = 0
): { scale: number; translateX: number; translateY: number; transformStyle: string } {
  // 1. Estático absoluto (Apenas se explicitamente declarado)
  if (motion === 'static') {
    return {
      scale: 1.0,
      translateX: 0,
      translateY: 0,
      transformStyle: 'none'
    };
  }

  // 2. Tension: Micro-shake / Vibração de tensão dramática por seed determinístico
  if (motion === 'tension') {
    const scale = 1.04;
    // Jitter determinístico baseado em senos combinados de frame
    const jitterX = Math.sin(frame * 1.8) * 1.6 + Math.cos(frame * 3.1) * 0.8;
    const jitterY = Math.cos(frame * 2.2) * 1.4 + Math.sin(frame * 4.3) * 0.7;

    return {
      scale,
      translateX: jitterX,
      translateY: jitterY,
      transformStyle: `scale(${scale.toFixed(4)}) translate3d(${jitterX.toFixed(2)}px, ${jitterY.toFixed(2)}px, 0)`
    };
  }

  // 3. Drift: Flutuação diagonal 1-2% com REGRA DE DIREÇÃO ALTERNADA (cena N vs N+1)
  if (motion === 'drift') {
    const isEven = sceneIndex % 2 === 0;
    const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.06], {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp'
    });

    // Direções opostas entre cenas adjacentes
    const startX = isEven ? -16 : 16;
    const endX = isEven ? 16 : -16;
    const startY = isEven ? 8 : -8;
    const endY = isEven ? -8 : 8;

    const translateX = interpolate(frame, [0, durationInFrames], [startX, endX], {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp'
    });

    const translateY = interpolate(frame, [0, durationInFrames], [startY, endY], {
      easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp'
    });

    return {
      scale,
      translateX,
      translateY,
      transformStyle: `scale(${scale.toFixed(4)}) translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0)`
    };
  }

  // 4. PushIn: Avanço linear canônico (1.00 -> 1.06)
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.06], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp'
  });

  return {
    scale,
    translateX: 0,
    translateY: 0,
    transformStyle: `scale(${scale.toFixed(4)})`
  };
}

/**
 * 🎥 CameraLanguage: Micro-movimento cinematográfico contínuo
 * Garante que NENHUM plano fique estático na tela, aplicando movimento
 * de câmera sutil e orgânico de 35mm.
 */
export const CameraLanguage: React.FC<CameraLanguageProps> = ({
  children,
  motion = 'pushIn',
  durationInFrames,
  sceneIndex = 0
}) => {
  const frame = useCurrentFrame();

  const { transformStyle } = calculateCameraTransform(
    frame,
    durationInFrames,
    motion,
    sceneIndex
  );

  return (
    <AbsoluteFill
      style={{
        transform: transformStyle,
        transformOrigin: 'center center',
        willChange: 'transform'
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
