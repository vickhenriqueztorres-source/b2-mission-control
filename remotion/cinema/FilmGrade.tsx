import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export interface FilmGradeProps {
  children: React.ReactNode;
  contrast?: number;
  saturate?: number;
  grainOpacity?: number;
  enableVignette?: boolean;
  enableGrain?: boolean;
  enableLetterbox?: boolean;
  enableTealShadows?: boolean;
  isColdOpenOrClimax?: boolean;
}

/**
 * 🎬 Master Film Grade: Denis Villeneuve 35mm Cyber-Industrial Look
 * Aplica color grade chiaroscuro, sombras teal, highlights quentes,
 * vinheta atmosférica 15-18%, grão de película determinístico e letterbox 2.39:1.
 */
export const FilmGrade: React.FC<FilmGradeProps> = ({
  children,
  contrast = 1.06,
  saturate = 1.08,
  grainOpacity = 0.035,
  enableVignette = true,
  enableGrain = true,
  enableLetterbox = true,
  enableTealShadows = true,
  isColdOpenOrClimax = true
}) => {
  const frame = useCurrentFrame();

  // Grão SVG determinístico: seed varia por frame sem Math.random
  const deterministicSeed = (frame % 250) + 1;
  const grainFrequency = (0.75 + (frame % 10) * 0.01).toFixed(3);

  // Letterbox animado em coldOpen e clímax
  const letterboxHeight = isColdOpenOrClimax
    ? interpolate(frame, [0, 20], [0, 84], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      })
    : 84;

  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', overflow: 'hidden' }}>
      {/* 1. Camada de Conteúdo Visual com Grade 35mm */}
      <AbsoluteFill
        style={{
          filter: `contrast(${contrast}) saturate(${saturate}) brightness(0.98)`
        }}
      >
        {children}
      </AbsoluteFill>

      {/* 2. Sombras Teal & Highlights Quentes (Cyber-Industrial Split Tone) */}
      {enableTealShadows && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background:
              'linear-gradient(135deg, rgba(0, 32, 40, 0.12) 0%, rgba(6, 7, 9, 0) 50%, rgba(255, 170, 102, 0.04) 100%)',
            mixBlendMode: 'color-dodge'
          }}
        />
      )}

      {/* 3. Vinheta Atmosférica Chiaroscuro 15-18% */}
      {enableVignette && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse at center, rgba(6,7,9,0) 50%, rgba(6,7,9,0.72) 90%, rgba(6,7,9,0.92) 100%)',
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* 4. Textura de Grão de Película 35mm SVG Determinístico (Opacity 0.035) */}
      {enableGrain && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            opacity: grainOpacity,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${grainFrequency}' seed='${deterministicSeed}' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay'
          }}
        />
      )}

      {/* 5. Letterbox Anamórfico 2.39:1 Cinematográfico Master */}
      {enableLetterbox && letterboxHeight > 0 && (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 900 }}>
          {/* Barra Superior */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: `${letterboxHeight}px`,
              backgroundColor: '#060709',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          />

          {/* Barra Inferior */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${letterboxHeight}px`,
              backgroundColor: '#060709',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          />

          {/* Retículas e Mira de Telemetria */}
          <div
            style={{
              position: 'absolute',
              top: `${Math.max(10, letterboxHeight + 8)}px`,
              left: '32px',
              fontSize: '9px',
              fontFamily: 'monospace',
              letterSpacing: '1.5px',
              color: '#8A8D9F',
              opacity: 0.75,
              textTransform: 'uppercase'
            }}
          >
            OOL // 35MM ANAMORPHIC RAW // 2.39:1
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
