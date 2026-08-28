import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export interface LaserRevealWipeProps {
  baseMedia: React.ReactNode;
  xrayMedia: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  splitPosition?: number; // 0.0 to 1.0 (default 0.5)
  animateSweep?: boolean;
  sweepStartFrame?: number;
  sweepDurationFrames?: number;
  laserColor?: string;
  lineWidth?: number;
  showLaserLine?: boolean;
}

/**
 * Componente LaserRevealWipe — O Efeito Central da Identidade Industrial X-Ray
 * Executa uma máscara matemática perfeita entre a base física limpa (Firefly) e
 * a camada interna de raio-x, acompanhando o feixe laser laranja (#FF5500).
 */
export const LaserRevealWipe: React.FC<LaserRevealWipeProps> = ({
  baseMedia,
  xrayMedia,
  direction = 'vertical',
  splitPosition = 0.5,
  animateSweep = false,
  sweepStartFrame = 15,
  sweepDurationFrames = 60,
  laserColor = '#FF5500',
  lineWidth = 4,
  showLaserLine = true
}) => {
  const frame = useCurrentFrame();

  // Posição do corte (fixa ou animada em varredura suave)
  let currentPosition = splitPosition;
  if (animateSweep) {
    currentPosition = interpolate(
      frame - sweepStartFrame,
      [0, sweepDurationFrames],
      [0, splitPosition],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      }
    );
  }

  const percent = Math.max(0, Math.min(100, currentPosition * 100));

  // Máscaras de recorte matemáticas (clip-path)
  const isVertical = direction === 'vertical';
  const baseClipPath = isVertical
    ? `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`
    : `polygon(0 0, 100% 0, 100% ${percent}%, 0 ${percent}%)`;

  const xrayClipPath = isVertical
    ? `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`
    : `polygon(0 ${percent}%, 100% ${percent}%, 100% 100%, 0 100%)`;

  return (
    <AbsoluteFill style={{backgroundColor: '#060709', overflow: 'hidden'}}>
      {/* Camada 1: Base Física Limpa (Normal) */}
      <AbsoluteFill style={{clipPath: baseClipPath, WebkitClipPath: baseClipPath}}>
        {baseMedia}
      </AbsoluteFill>

      {/* Camada 2: Interior Revelado em Raio-X */}
      <AbsoluteFill style={{clipPath: xrayClipPath, WebkitClipPath: xrayClipPath}}>
        {xrayMedia}
      </AbsoluteFill>

      {/* Camada 3: Feixe Laser Laranja (#FF5500) com Glow */}
      {showLaserLine ? (
        isVertical ? (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${percent}%`,
              width: lineWidth,
              backgroundColor: '#FFFFFF',
              boxShadow: `0 0 12px 2px ${laserColor}, 0 0 35px 8px ${laserColor}`,
              transform: 'translateX(-50%)',
              zIndex: 50,
              pointerEvents: 'none'
            }}
          >
            {/* Ponto de emissão central concentrado */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                boxShadow: `0 0 25px 8px ${laserColor}`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${percent}%`,
              height: lineWidth,
              backgroundColor: '#FFFFFF',
              boxShadow: `0 0 12px 2px ${laserColor}, 0 0 35px 8px ${laserColor}`,
              transform: 'translateY(-50%)',
              zIndex: 50,
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                boxShadow: `0 0 25px 8px ${laserColor}`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
        )
      ) : null}
    </AbsoluteFill>
  );
};
