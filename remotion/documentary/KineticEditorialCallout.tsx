import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';

export interface KineticEditorialCalloutProps {
  mainText?: string;
  text?: string;
  subText?: string;
  categoryText?: string;
  startFrame?: number;
  durationFrames?: number;
  durationInFrames?: number;
  position?: 'center' | 'bottom_left' | 'top_right' | 'center_left';
  accentColor?: string;
  telemetryColor?: string;
  scaleIntensity?: number;
}

/**
 * Componente de Tipografia Cinética Editorial Oficial (O Outro Lado / HSL Design System)
 * Usa a tipografia padrão do projeto (Inter + JetBrains Mono) com animação de impacto físico,
 * expansão de tracking, highlight bar e glow cinematográfico.
 */
export const KineticEditorialCallout: React.FC<KineticEditorialCalloutProps> = ({
  mainText,
  text,
  subText,
  categoryText,
  startFrame = 15,
  durationFrames = 75,
  position = 'center',
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  scaleIntensity = 1.0
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const displayText = mainText || text || '';
  if (!displayText) {
    return null;
  }

  const activeFrame = frame - startFrame;
  if (activeFrame < 0 || activeFrame > durationFrames) {
    return null;
  }

  // Animação de entrada com física de mola (Spring)
  const enterSpring = spring({
    frame: activeFrame,
    fps,
    config: {damping: 12, mass: 0.6, stiffness: 140}
  });

  // Animação de saída (Fade out suave no final)
  const exitProgress = interpolate(
    activeFrame,
    [durationFrames - 15, durationFrames],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const opacity = interpolate(enterSpring, [0, 0.4, 1], [0, 0.8, 1]) * exitProgress;
  const scale = (0.94 + enterSpring * 0.06) * scaleIntensity;
  const letterSpacing = interpolate(activeFrame, [0, durationFrames], [1, 4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  // Largura da barra de destaque animada
  const barWidth = interpolate(activeFrame, [0, 20], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  // Posicionamento
  const getContainerStyle = (): React.CSSProperties => {
    switch (position) {
      case 'bottom_left':
        return {bottom: 120, left: 100, alignItems: 'flex-start', textAlign: 'left'};
      case 'top_right':
        return {top: 120, right: 100, alignItems: 'flex-end', textAlign: 'right'};
      case 'center_left':
        return {top: '42%', left: 120, alignItems: 'flex-start', textAlign: 'left'};
      case 'center':
      default:
        return {top: '42%', left: 0, right: 0, margin: '0 auto', alignItems: 'center', textAlign: 'center'};
    }
  };

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50
      }}
    >
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          ...getContainerStyle()
        }}
      >
        {categoryText && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', Menlo, Consolas, monospace",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 3,
              color: accentColor,
              textTransform: 'uppercase',
              marginBottom: 6,
              textShadow: `0 0 16px ${accentColor}80`
            }}
          >
            {categoryText}
          </div>
        )}

        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: displayText.length > 25 ? 36 : 46,
            fontWeight: 900,
            letterSpacing: `${letterSpacing}px`,
            color: '#F4F4F0',
            textTransform: 'uppercase',
            lineHeight: 1.15,
            textShadow: '0 4px 24px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.8)'
          }}
        >
          {displayText}
        </div>

        {/* Barra de destaque colorida */}
        <div
          style={{
            height: 3,
            width: `${barWidth}%`,
            maxWidth: 180,
            backgroundColor: accentColor,
            marginTop: 10,
            boxShadow: `0 0 12px ${accentColor}`,
            alignSelf: position === 'center' ? 'center' : 'flex-start'
          }}
        />

        {subText && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', Menlo, Consolas, monospace",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 1.5,
              color: telemetryColor,
              marginTop: 10,
              textTransform: 'uppercase',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)'
            }}
          >
            {subText}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
