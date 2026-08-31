import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

type FieldMotionMode = 'row_walk' | 'lateral_track' | 'macro_rack' | 'slow_crane';

export interface FieldDocumentarySceneProps {
  sceneId: string;
  imageSrc: string;
  durationInFrames: number;
  fieldMode?: FieldMotionMode;
  evidenceLabel?: string;
  accentColor?: string;
  telemetryColor?: string;
}

function easeInOut(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * FieldDocumentaryScene keeps real farm imagery dominant while adding only
 * restrained documentary motion and small evidence marks.
 */
export const FieldDocumentaryScene: React.FC<FieldDocumentarySceneProps> = ({
  sceneId,
  imageSrc,
  durationInFrames,
  fieldMode = 'row_walk',
  evidenceLabel = 'REGISTRO DE CAMPO',
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const eased = easeInOut(progress);
  const breath = Math.sin(frame * 0.055) * 2.4;
  const handX = Math.sin(frame * 0.091) * 1.8 + Math.cos(frame * 0.037) * 1.1;
  const handY = Math.cos(frame * 0.073) * 1.6;

  const motionByMode: Record<FieldMotionMode, { scale: number; x: number; y: number }> = {
    row_walk: {
      scale: interpolate(eased, [0, 1], [1.08, 1.18]),
      x: interpolate(eased, [0, 1], [-26, 18]),
      y: interpolate(eased, [0, 1], [12, -22]),
    },
    lateral_track: {
      scale: 1.16,
      x: interpolate(eased, [0, 1], [-54, 50]),
      y: interpolate(eased, [0, 1], [4, -6]),
    },
    macro_rack: {
      scale: interpolate(eased, [0, 1], [1.18, 1.31]),
      x: interpolate(eased, [0, 1], [20, -22]),
      y: interpolate(eased, [0, 1], [-12, 10]),
    },
    slow_crane: {
      scale: interpolate(eased, [0, 1], [1.04, 1.14]),
      x: interpolate(eased, [0, 1], [12, -18]),
      y: interpolate(eased, [0, 1], [24, -18]),
    },
  };

  const motion = motionByMode[fieldMode];
  const focusSweep = interpolate(progress, [0.12, 0.42, 0.72], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sprayPulse = interpolate(progress, [0, 0.5, 1], [0.08, 0.22, 0.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          transform: `scale(${motion.scale}) translate(${motion.x + handX}px, ${motion.y + handY + breath}px)`,
          transformOrigin: 'center center',
        }}
      >
        <Img
          src={staticFile(imageSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'contrast(1.05) saturate(0.9) brightness(0.92)',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(6,7,9,0.10) 0%, rgba(6,7,9,0.00) 38%, rgba(6,7,9,0.32) 100%)',
          mixBlendMode: 'multiply',
        }}
      />

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.04), transparent 38%), radial-gradient(circle at 10% 90%, rgba(255,85,0,0.10), transparent 28%)',
          opacity: 0.85,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#F4F4F0',
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: 17,
          letterSpacing: 0,
          textShadow: '0 2px 16px rgba(0,0,0,0.75)',
          opacity: 0.82,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            backgroundColor: accentColor,
            boxShadow: `0 0 18px ${accentColor}`,
          }}
        />
        <span>{evidenceLabel}</span>
        <span style={{ color: 'rgba(244,244,240,0.48)' }}>//</span>
        <span style={{ color: telemetryColor }}>{sceneId}</span>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 76,
          top: 90,
          width: 220,
          height: 1,
          backgroundColor: telemetryColor,
          opacity: 0.18 + focusSweep * 0.42,
          transform: `translateX(${interpolate(eased, [0, 1], [-12, 18])}px)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: `${interpolate(eased, [0, 1], [20, 72])}%`,
          top: '18%',
          width: 1,
          height: '68%',
          background: `linear-gradient(180deg, transparent, ${accentColor}, transparent)`,
          opacity: fieldMode === 'macro_rack' ? 0.24 : 0.12,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.020) 0px, rgba(255,255,255,0.020) 1px, transparent 1px, transparent 4px)',
          opacity: 0.18,
          mixBlendMode: 'soft-light',
        }}
      />

      {fieldMode === 'macro_rack' && (
        <div
          style={{
            position: 'absolute',
            left: '22%',
            top: '44%',
            width: 410,
            height: 138,
            border: `1px solid rgba(255,85,0,${0.18 + sprayPulse})`,
            borderRadius: 3,
            boxShadow: `0 0 ${24 + sprayPulse * 40}px rgba(255,85,0,0.12)`,
            opacity: 0.62,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
