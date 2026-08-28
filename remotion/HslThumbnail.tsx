import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

export interface HslThumbnailProps extends Record<string, unknown> {
  readonly baseImageSrc: string;
  readonly headlineLines: readonly string[];
  readonly categoryBadge?: string;
  readonly subheadline?: string;
  readonly textSide?: 'LEFT' | 'RIGHT';
  readonly accentColor?: string;
  readonly telemetryColor?: string;
  readonly revealPercentage?: number;
  readonly coordinates?: string;
  readonly sourcesCount?: number;
  readonly documentsCount?: number;
}

/**
 * THUMBNAIL OFICIAL 4K — O OUTRO LADO (3840x2160)
 * Direção Aprovada: INDUSTRIAL X-RAY (Opção 2)
 * Denis Villeneuve 35mm Anamorphic, Laranja Vapor de Sódio (#FF5500),
 * Ciano Laser (#00F0FF), Carbon Black (#060709), Tipografia Bebas/Druk.
 */
export const HslThumbnail: React.FC<HslThumbnailProps> = ({
  baseImageSrc,
  headlineLines = ['O QUE', 'ESTÁ POR', 'DENTRO?'],
  categoryBadge = 'ANÁLISE // O OUTRO LADO',
  subheadline = 'A VERDADE ESCONDIDA SOB A SUPERFÍCIE.',
  textSide = 'LEFT',
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  revealPercentage = 73,
  coordinates = '22.9042° S, 43.1729° W',
  sourcesCount = 7,
  documentsCount = 4
}) => {
  const isLeft = textSide === 'LEFT';

  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', color: '#F4F4F0', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      {/* 1. Imagem de Fundo 35mm com Tratamento Chiaroscuro */}
      <Img
        src={staticFile(baseImageSrc)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'contrast(1.18) brightness(0.82) saturate(1.10)'
        }}
      />

      {/* 2. Gradiente Villeneuve e Iluminação Volumétrica */}
      <AbsoluteFill
        style={{
          background: isLeft
            ? 'linear-gradient(90deg, rgba(6,7,9,0.96) 0%, rgba(6,7,9,0.88) 38%, rgba(6,7,9,0.35) 65%, rgba(6,7,9,0) 85%)'
            : 'linear-gradient(270deg, rgba(6,7,9,0.96) 0%, rgba(6,7,9,0.88) 38%, rgba(6,7,9,0.35) 65%, rgba(6,7,9,0) 85%)'
        }}
      />

      {/* 3. Brilho e Névoa Atmosférica Laranja + Ciano */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: isLeft ? '55%' : '15%',
          width: 1400,
          height: 1400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}25 0%, ${telemetryColor}12 45%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}
      />

      {/* 4. Cantoneiras de Enquadramento Cinematográfico [ ] */}
      <div style={{ position: 'absolute', top: 90, left: 90, width: 60, height: 60, borderTop: '4px solid rgba(244,244,240,0.4)', borderLeft: '4px solid rgba(244,244,240,0.4)' }} />
      <div style={{ position: 'absolute', top: 90, right: 90, width: 60, height: 60, borderTop: '4px solid rgba(244,244,240,0.4)', borderRight: '4px solid rgba(244,244,240,0.4)' }} />
      <div style={{ position: 'absolute', bottom: 90, left: 90, width: 60, height: 60, borderBottom: '4px solid rgba(244,244,240,0.4)', borderLeft: '4px solid rgba(244,244,240,0.4)' }} />
      <div style={{ position: 'absolute', bottom: 90, right: 90, width: 60, height: 60, borderBottom: '4px solid rgba(244,244,240,0.4)', borderRight: '4px solid rgba(244,244,240,0.4)' }} />

      {/* 5. Bloco Principal da Headline (Industrial X-Ray) */}
      <div
        style={{
          position: 'absolute',
          top: 240,
          bottom: 240,
          left: isLeft ? 180 : undefined,
          right: isLeft ? undefined : 180,
          width: 1800,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: isLeft ? 'flex-start' : 'flex-end',
          zIndex: 10
        }}
      >
        {/* Cantoneira superior de caixa de texto */}
        <div style={{ width: 40, height: 40, borderTop: '3px solid rgba(244,244,240,0.6)', borderLeft: '3px solid rgba(244,244,240,0.6)', marginBottom: 20 }} />

        {/* Linhas da Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, lineHeight: 0.92 }}>
          {headlineLines.map((line, idx) => {
            const isLast = idx === headlineLines.length - 1;
            return (
              <span
                key={idx}
                style={{
                  fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                  fontSize: 270,
                  fontWeight: 900,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  color: isLast ? accentColor : '#F4F4F0',
                  textShadow: isLast
                    ? `0 0 50px ${accentColor}80, 0 10px 40px rgba(0,0,0,0.9)`
                    : '0 10px 40px rgba(0,0,0,0.9)',
                  transform: 'scaleY(1.08)'
                }}
              >
                {line}
              </span>
            );
          })}
        </div>

        {/* Subheadline em Ciano com Barra Decorativa */}
        {subheadline && (
          <div
            style={{
              marginTop: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 20
            }}
          >
            <div style={{ width: 8, height: 44, backgroundColor: telemetryColor, boxShadow: `0 0 16px ${telemetryColor}` }} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: 3,
                color: telemetryColor,
                textTransform: 'uppercase',
                textShadow: `0 0 20px ${telemetryColor}90`
              }}
            >
              {subheadline}
            </span>
          </div>
        )}

        {/* Cantoneira inferior de caixa de texto */}
        <div style={{ width: 40, height: 40, borderBottom: '3px solid rgba(244,244,240,0.6)', borderLeft: '3px solid rgba(244,244,240,0.6)', marginTop: 30 }} />
      </div>

      {/* 6. Selo Circular de Auditoria Técnica (Canto Inferior Direito) */}
      <div
        style={{
          position: 'absolute',
          bottom: 240,
          right: isLeft ? 260 : undefined,
          left: isLeft ? undefined : 260,
          width: 480,
          height: 480,
          borderRadius: '50%',
          border: `3px solid ${telemetryColor}80`,
          boxShadow: `0 0 40px ${telemetryColor}30, inset 0 0 40px ${telemetryColor}20`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          backgroundColor: 'rgba(6,7,9,0.75)',
          backdropFilter: 'blur(10px)',
          zIndex: 12
        }}
      >
        <div style={{ position: 'absolute', width: 440, height: 440, borderRadius: '50%', border: `1.5px dashed ${telemetryColor}50` }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 800, letterSpacing: 4, color: telemetryColor }}>ANÁLISE</span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, fontWeight: 900, letterSpacing: 3, color: '#F4F4F0', margin: '4px 0' }}>O OUTRO LADO</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, letterSpacing: 2, color: 'rgba(244,244,240,0.7)' }}>INVESTIGAÇÃO</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 800, letterSpacing: 3, color: accentColor }}>TÉCNICA</span>
      </div>

      {/* 7. Barra Inferior com Identidade e Accents de Telemetria */}
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          left: 180,
          right: 180,
          height: 70,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 26,
          color: 'rgba(244,244,240,0.75)',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          paddingTop: 15,
          zIndex: 10
        }}
      >
        {/* Logo Lockup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', border: `4px solid ${accentColor}`, borderRightColor: 'transparent' }} />
          <span style={{ fontWeight: 900, letterSpacing: 3 }}><strong style={{ color: accentColor }}>O</strong> OUTRO LADO</span>
        </div>

        {/* Coordenadas */}
        <div style={{ letterSpacing: 2, color: 'rgba(244,244,240,0.6)' }}>
          COORDENADAS // <span style={{ color: telemetryColor }}>{coordinates}</span>
        </div>

        {/* Dial de Revelação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 14, height: 14, backgroundColor: accentColor, borderRadius: '50%', boxShadow: `0 0 10px ${accentColor}` }} />
          <span style={{ fontWeight: 800, color: '#F4F4F0' }}>REVELAÇÃO: <strong style={{ color: accentColor }}>{revealPercentage}%</strong></span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
