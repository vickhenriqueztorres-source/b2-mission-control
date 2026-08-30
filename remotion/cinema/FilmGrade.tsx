import React from 'react';
import { AbsoluteFill } from 'remotion';

export interface FilmGradeProps {
  children: React.ReactNode;
  aspectRatio?: string; // default '2.39:1' anamorphic
  enableGrain?: boolean;
  enableVignette?: boolean;
  enableLetterbox?: boolean;
}

/**
 * 🎬 Master Film Grade: Denis Villeneuve 35mm Cyber-Industrial Look
 * Aplica color grade chiaroscuro, pretos profundos (#060709),
 * vinheta atmosférica, grão de película e letterbox anamórfico 2.39:1.
 */
export const FilmGrade: React.FC<FilmGradeProps> = ({
  children,
  enableGrain = true,
  enableVignette = true,
  enableLetterbox = true
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', overflow: 'hidden' }}>
      {/* 1. Camada de Conteúdo Visual */}
      <AbsoluteFill style={{ filter: 'contrast(1.08) brightness(0.98) saturate(1.05)' }}>
        {children}
      </AbsoluteFill>

      {/* 2. Vinheta Atmosférica Chiaroscuro */}
      {enableVignette && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, rgba(6,7,9,0) 45%, rgba(6,7,9,0.78) 95%, rgba(6,7,9,0.95) 100%)',
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* 3. Textura de Grão de Película 35mm (Noise SVG Procedural) */}
      {enableGrain && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            opacity: 0.055,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay'
          }}
        />
      )}

      {/* 4. Letterbox Anamórfico 2.39:1 Cinematográfico Master */}
      {enableLetterbox && (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 900 }}>
          {/* Barra Superior */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '84px', // Letterbox padrão 1920x1080 -> 1920x803 (2.39:1)
              backgroundColor: '#060709',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          />

          {/* Barra Inferior */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '84px',
              backgroundColor: '#060709',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          />

          {/* Retículas e Mira de Telemetria de Canto */}
          <div
            style={{
              position: 'absolute',
              top: '92px',
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

          <div
            style={{
              position: 'absolute',
              top: '92px',
              right: '32px',
              fontSize: '9px',
              fontFamily: 'monospace',
              letterSpacing: '1.5px',
              color: '#00F0FF',
              opacity: 0.85,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#FF5500', borderRadius: '50%' }} />
            OPTICAL FEED ACTIVE
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
