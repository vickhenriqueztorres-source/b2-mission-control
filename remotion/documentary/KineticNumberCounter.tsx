import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export interface KineticNumberCounterProps {
  startValue?: number;
  endValue: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  sublabel?: string;
  color?: string;
  accentColor?: string;
  durationInFrames?: number;
  formatNumber?: boolean;
}

export const KineticNumberCounter: React.FC<KineticNumberCounterProps> = ({
  startValue = 0,
  endValue,
  prefix = '',
  suffix = '',
  label = '',
  sublabel = '',
  color = '#FFFFFF',
  accentColor = '#FF5500',
  durationInFrames = 45,
  formatNumber = true
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const easedProgress = Math.pow(progress, 0.5);
  const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress);

  const formattedValue = formatNumber
    ? currentValue.toLocaleString('pt-BR')
    : currentValue.toString();

  const scale = spring({
    frame,
    fps,
    config: {damping: 14, stiffness: 120}
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: 'rgba(6, 7, 9, 0.88)',
          padding: '40px 60px',
          border: '1px solid rgba(255, 85, 0, 0.4)',
          borderRadius: 8,
          boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 40px rgba(255, 85, 0, 0.2)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {label && (
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '0.25em',
              color: accentColor,
              marginBottom: 16,
              textTransform: 'uppercase'
            }}
          >
            {label}
          </div>
        )}

        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            color,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 0 30px rgba(255,255,255,0.25)'
          }}
        >
          <span style={{color: accentColor, marginRight: 4}}>{prefix}</span>
          {formattedValue}
          <span style={{color: '#00F0FF', marginLeft: 8, fontSize: 48}}>{suffix}</span>
        </div>

        {sublabel && (
          <div
            style={{
              marginTop: 16,
              fontSize: 18,
              color: '#8A8D9F',
              letterSpacing: '0.05em',
              maxWidth: 550
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
