import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export interface DynamicSpotlightFocusProps {
  durationInFrames: number;
  focalPointX?: string; // ex: '50%', '35%', '65%'
  focalPointY?: string; // ex: '50%', '40%', '60%'
  intensity?: number;
  pulseSpeed?: number;
}

/**
 * Efeito de Iluminação Focal Volumétrica (Spotlight Chiaroscuro)
 * Escurece as bordas externas e ilumina o ponto central da cena onde a atenção deve se concentrar.
 */
export const DynamicSpotlightFocus: React.FC<DynamicSpotlightFocusProps> = ({
  durationInFrames,
  focalPointX = '50%',
  focalPointY = '48%',
  intensity = 0.55,
  pulseSpeed = 0.05
}) => {
  const frame = useCurrentFrame();

  const pulse = Math.sin(frame * pulseSpeed) * 0.06;
  const radius = interpolate(frame, [0, durationInFrames], [45, 55], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: `radial-gradient(ellipse ${radius + pulse * 100}% ${radius + pulse * 80}% at ${focalPointX} ${focalPointY}, rgba(0,0,0,0) 0%, rgba(6,7,9,${intensity + pulse}) 100%)`,
        mixBlendMode: 'multiply'
      }}
    />
  );
};
