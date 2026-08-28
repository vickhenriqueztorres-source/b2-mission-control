import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export interface AnamorphicCinematicOverlayProps {
  showLetterbox?: boolean;
  showFramingBrackets?: boolean;
  showFilmGrain?: boolean;
  showHorizontalFlare?: boolean;
  flareTriggerFrame?: number;
  accentColor?: string;
}

/**
 * Módulo 4: Camada de Textura Anamórfica Global (Acabamento Villeneuve)
 * 1. Grão de película 35mm em screen blend (0.06 opacidade).
 * 2. Letterbox 2.39:1 com cantoneiras de enquadramento discretas [ ].
 * 3. Lens Flare Horizontal em Laranja Vapor de Sódio (#FF5500) nas transições.
 */
export const AnamorphicCinematicOverlay: React.FC<AnamorphicCinematicOverlayProps> = ({
  showLetterbox = true,
  showFramingBrackets = true,
  showFilmGrain = true,
  showHorizontalFlare = false,
  flareTriggerFrame = 0,
  accentColor = '#FF5500'
}) => {
  const frame = useCurrentFrame();

  const flareOpacity = interpolate(
    frame - flareTriggerFrame,
    [0, 8, 22],
    [0, 0.75, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 100}}>
      {/* 1. Letterbox Anamórfico 2.39:1 (Barras Pretas no Topo e Base) */}
      {showLetterbox ? (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '7.5%',
              backgroundColor: '#000000'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '7.5%',
              backgroundColor: '#000000'
            }}
          />
        </>
      ) : null}

      {/* 2. Cantoneiras de Enquadramento Cinematográfico [ ] */}
      {showFramingBrackets ? (
        <div style={{position: 'absolute', inset: '9%', pointerEvents: 'none'}}>
          {/* Top-Left Bracket */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 24,
              height: 24,
              borderTop: '2px solid rgba(244, 244, 240, 0.4)',
              borderLeft: '2px solid rgba(244, 244, 240, 0.4)'
            }}
          />
          {/* Top-Right Bracket */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 24,
              height: 24,
              borderTop: '2px solid rgba(244, 244, 240, 0.4)',
              borderRight: '2px solid rgba(244, 244, 240, 0.4)'
            }}
          />
          {/* Bottom-Left Bracket */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 24,
              height: 24,
              borderBottom: '2px solid rgba(244, 244, 240, 0.4)',
              borderLeft: '2px solid rgba(244, 244, 240, 0.4)'
            }}
          />
          {/* Bottom-Right Bracket */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 24,
              height: 24,
              borderBottom: '2px solid rgba(244, 244, 240, 0.4)',
              borderRight: '2px solid rgba(244, 244, 240, 0.4)'
            }}
          />
        </div>
      ) : null}

      {/* 3. Lens Flare Horizontal Anamórfico */}
      {showHorizontalFlare && flareOpacity > 0 ? (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: accentColor,
            boxShadow: `0 0 45px 8px ${accentColor}`,
            opacity: flareOpacity,
            transform: 'translateY(-50%)'
          }}
        />
      ) : null}

      {/* 4. Grão de Película Sutil 35mm (SVG Noise Procedural) */}
      {showFilmGrain ? (
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.055,
            mixBlendMode: 'screen',
            pointerEvents: 'none'
          }}
        >
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
