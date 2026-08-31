import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export interface AtomicStopwatchProps {
  startMs?: number;
  endMs?: number;
  durationInFrames?: number;
  totalFrames?: number;
  label?: string;
  sublabel?: string;
}

export const AtomicStopwatch: React.FC<AtomicStopwatchProps> = ({
  startMs = 0,
  endMs = 1000,
  durationInFrames = 60,
  label = '',
  sublabel = ''
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const currentMs = Math.round(startMs + (endMs - startMs) * progress);
  const seconds = (currentMs / 1000).toFixed(2);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'JetBrains Mono, Menlo, monospace'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(6, 7, 9, 0.9)',
          padding: '36px 64px',
          border: '1px solid #FF5500',
          borderRadius: 8,
          boxShadow: '0 0 50px rgba(255, 85, 0, 0.25)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div style={{color: '#FF5500', fontSize: 15, fontWeight: 800, letterSpacing: '0.2em', marginBottom: 12}}>
          {label}
        </div>

        <div style={{fontSize: 96, fontWeight: 900, color: '#F4F4F0', letterSpacing: '-0.02em'}}>
          {seconds}
          <span style={{fontSize: 48, color: '#00F0FF', marginLeft: 8}}>s</span>
        </div>

        <div style={{color: '#8A8D9F', fontSize: 15, marginTop: 12, letterSpacing: '0.05em'}}>
          {sublabel}
        </div>
      </div>
    </AbsoluteFill>
  );
};
