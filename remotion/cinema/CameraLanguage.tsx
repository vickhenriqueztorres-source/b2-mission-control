import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { CameraMotionType } from '../../contracts/timelineContract';

export interface CameraLanguageProps {
  children: React.ReactNode;
  motion?: CameraMotionType;
  durationInFrames: number;
}

/**
 * 🎥 CameraLanguage: Micro-movimento cinematográfico contínuo
 * Garante que NENHUM plano fique estático na tela, aplicando movimento
 * de câmera sutil e orgânico de 35mm.
 */
export const CameraLanguage: React.FC<CameraLanguageProps> = ({
  children,
  motion = 'pushIn',
  durationInFrames
}) => {
  const frame = useCurrentFrame();

  let transformStyle = '';

  switch (motion) {
    case 'pushIn': {
      // Avanço lento e dramático (1.0 -> 1.10)
      const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.09], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp'
      });
      transformStyle = `scale(${scale})`;
      break;
    }

    case 'pullOut': {
      // Recuo revelador (1.10 -> 1.0)
      const scale = interpolate(frame, [0, durationInFrames], [1.10, 1.0], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp'
      });
      transformStyle = `scale(${scale})`;
      break;
    }

    case 'drift': {
      // Flutuação diagonal sutil (típica de blueprints e dossiês técnicos)
      const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.06], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp'
      });
      const translateX = interpolate(frame, [0, durationInFrames], [-8, 8], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp'
      });
      const translateY = interpolate(frame, [0, durationInFrames], [4, -4], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp'
      });
      transformStyle = `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`;
      break;
    }

    case 'panRight': {
      const scale = 1.05;
      const translateX = interpolate(frame, [0, durationInFrames], [-20, 20], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp'
      });
      transformStyle = `scale(${scale}) translate3d(${translateX}px, 0, 0)`;
      break;
    }

    case 'panLeft': {
      const scale = 1.05;
      const translateX = interpolate(frame, [0, durationInFrames], [20, -20], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp'
      });
      transformStyle = `scale(${scale}) translate3d(${translateX}px, 0, 0)`;
      break;
    }

    default: {
      const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.08], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp'
      });
      transformStyle = `scale(${scale})`;
      break;
    }
  }

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
