import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export interface ParallaxRackFocusProps {
  foregroundMedia?: React.ReactNode;
  backgroundVideo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  focusDelayFrames?: number;
  accentColor?: string;
}

/**
 * Módulo 1: Switch Focus (Rack Focus 2.5D Automatizado)
 * Traduz o efeito de troca de foco de Johnny Harris/Vox em curvas de mola do Remotion.
 */
export const ParallaxRackFocus: React.FC<ParallaxRackFocusProps> = ({
  foregroundMedia,
  backgroundVideo,
  title,
  subtitle,
  focusDelayFrames = 15,
  accentColor = '#FF5500'
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Curva de física cinematográfica suave
  const progress = spring({
    frame: Math.max(0, frame - focusDelayFrames),
    fps,
    config: {damping: 18, stiffness: 60}
  });

  const bgBlur = interpolate(progress, [0, 1], [0, 14]);
  const bgScale = interpolate(progress, [0, 1], [1.0, 1.08]);
  const fgBlur = interpolate(progress, [0, 1], [10, 0]);
  const fgOpacity = interpolate(progress, [0, 1], [0.2, 1.0]);
  const fgScale = interpolate(progress, [0, 1], [0.96, 1.0]);

  return (
    <AbsoluteFill style={{backgroundColor: '#060709', overflow: 'hidden'}}>
      {/* Camada 1: Vídeo de Fundo Gerado por I.A. (Kling/Firefly) */}
      <AbsoluteFill
        style={{
          filter: `blur(${bgBlur}px)`,
          transform: `scale(${bgScale})`,
          transformOrigin: 'center center'
        }}
      >
        {backgroundVideo}
      </AbsoluteFill>

      {/* Camada 2: Elemento de Destaque / Card X-Ray Translúcido */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: `blur(${fgBlur}px)`,
          opacity: fgOpacity,
          transform: `scale(${fgScale})`,
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        {foregroundMedia || (
          <div
            style={{
              padding: '24px 36px',
              backgroundColor: 'rgba(6, 7, 9, 0.82)',
              border: `1px solid ${accentColor}`,
              borderRadius: 4,
              boxShadow: `0 0 30px rgba(255, 85, 0, 0.25)`,
              maxWidth: 720,
              textAlign: 'center'
            }}
          >
            {title ? (
              <div
                style={{
                  fontFamily: 'JetBrains Mono, Arial',
                  fontWeight: 900,
                  fontSize: 32,
                  color: '#F4F4F0',
                  letterSpacing: 2
                }}
              >
                {title}
              </div>
            ) : null}
            {subtitle ? (
              <div
                style={{
                  marginTop: 12,
                  fontFamily: 'JetBrains Mono',
                  fontSize: 16,
                  color: accentColor,
                  letterSpacing: 1
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
