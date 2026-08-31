import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CinematicParallaxMotion} from './CinematicParallaxMotion';
import {DynamicSpotlightFocus} from './DynamicSpotlightFocus';

export interface CinematicKeyframeDossierProps {
  imageSrc: string;
  durationInFrames: number;
  motionMode?: 'crash_push_in' | 'slow_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift';
  zoomIntensity?: number;
  showScanline?: boolean;
  scanlineColor?: string;
  accentColor?: string;
  telemetryColor?: string;
  tagText?: string;
}

/**
 * CinematicKeyframeDossier — Componente Oficial para "Keyframe Dossier Takes"
 */
export const CinematicKeyframeDossier: React.FC<CinematicKeyframeDossierProps> = ({
  imageSrc,
  durationInFrames,
  motionMode = 'slow_push_in',
  zoomIntensity = 1.25,
  showScanline = true,
  scanlineColor = '#FF5500',
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  tagText = ''
}) => {
  const frame = useCurrentFrame();

  const scanlineY = interpolate(
    (frame * 1.5) % durationInFrames,
    [0, durationInFrames],
    [-10, 110],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const scanlineOpacity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.35, 0.75]
  );

  const resolvedSrc = imageSrc ? staticFile(imageSrc) : staticFile('identity/logo.png');

  return (
    <AbsoluteFill style={{backgroundColor: '#060709', overflow: 'hidden'}}>
      {/* 1. Imagem 4K em Movimento Parallax 2.5D */}
      <CinematicParallaxMotion
        mode={motionMode}
        durationInFrames={durationInFrames}
        zoomIntensity={zoomIntensity}
      >
        <img
          src={resolvedSrc}
          alt="dossier"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* 2. Spotlight Chiaroscuro Volumétrico */}
        <DynamicSpotlightFocus
          durationInFrames={durationInFrames}
          intensity={0.35}
        />

        {/* 3. Feixe de Laser Scanline Holográfica */}
        {showScanline && (
          <div
            style={{
              position: 'absolute',
              top: `${scanlineY}%`,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, transparent 0%, ${scanlineColor} 30%, #FFFFFF 50%, ${scanlineColor} 70%, transparent 100%)`,
              boxShadow: `0 0 16px ${scanlineColor}, 0 0 32px ${scanlineColor}`,
              opacity: scanlineOpacity,
              pointerEvents: 'none'
            }}
          />
        )}
      </CinematicParallaxMotion>

      {/* 4. Retícula & Carimbo de Dossiê Técnico */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          right: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 16px',
          backgroundColor: 'rgba(6,7,9,0.75)',
          border: `1px solid ${telemetryColor}40`,
          borderRadius: 4,
          backdropFilter: 'blur(8px)',
          zIndex: 40
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: accentColor,
            boxShadow: `0 0 10px ${accentColor}`
          }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
            color: '#F4F4F0',
            textTransform: 'uppercase'
          }}
        >
          {tagText}
        </span>
      </div>
    </AbsoluteFill>
  );
};
