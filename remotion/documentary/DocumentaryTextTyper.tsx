import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export interface DocumentaryTextTyperProps {
  text: string;
  emphasisWord?: string;
  accentColor?: string;
  durationFrames?: number;
}

/**
 * Módulo 5: Tipografia Investigativa & Text Animations
 * Revelação cadenciada inspirada em Johnny Harris / Magnates Media.
 */
export const DocumentaryTextTyper: React.FC<DocumentaryTextTyperProps> = ({
  text,
  emphasisWord,
  accentColor = '#FF5500',
  durationFrames = 60
}) => {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 120px'
      }}
    >
      <div
        style={{
          fontFamily: 'Times New Roman, Georgia, serif',
          fontWeight: 900,
          fontSize: 64,
          lineHeight: 1.15,
          color: '#F4F4F0',
          maxWidth: 1400,
          textShadow: '0 4px 20px rgba(0,0,0,0.9)'
        }}
      >
        {words.map((word, index) => {
          const startFrame = 6 + index * Math.max(2, Math.floor(durationFrames / (words.length + 2)));
          const wordReveal = interpolate(
            frame,
            [startFrame, startFrame + 8],
            [0, 1],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );
          const isEmphasis = emphasisWord
            ? word.toLowerCase().includes(emphasisWord.toLowerCase())
            : index === Math.floor(words.length / 2);

          return (
            <span
              key={`${word}-${index}`}
              style={{
                display: 'inline-block',
                marginRight: 16,
                color: isEmphasis ? accentColor : '#F4F4F0',
                opacity: wordReveal,
                transform: `translateY(${(1 - wordReveal) * 20}px)`,
                textShadow: isEmphasis && wordReveal > 0.8 ? `0 0 16px ${accentColor}` : 'none'
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
