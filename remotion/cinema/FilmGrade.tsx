import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

export interface FilmGradeProps {
  children: React.ReactNode;
  contrast?: number;
  saturate?: number;
  grainOpacity?: number;
  enableVignette?: boolean;
  enableGrain?: boolean;
  /** Legacy compatibility. The global identity no longer uses permanent letterbox. */
  enableLetterbox?: boolean;
  /** Legacy compatibility. Global cyan/teal split tone is forbidden. */
  enableTealShadows?: boolean;
  isColdOpenOrClimax?: boolean;
}

/** Global Documentario de Campo Investigativo treatment. */
export const FilmGrade: React.FC<FilmGradeProps> = ({
  children,
  contrast = 1.03,
  saturate = 0.92,
  grainOpacity = 0.025,
  enableVignette = true,
  enableGrain = true,
}) => {
  const frame = useCurrentFrame();
  const deterministicSeed = (frame % 250) + 1;
  const grainFrequency = (0.72 + (frame % 10) * 0.008).toFixed(3);

  return (
    <AbsoluteFill style={{backgroundColor: '#060709', overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          filter: `contrast(${contrast}) saturate(${saturate}) brightness(1.0)`,
        }}
      >
        {children}
      </AbsoluteFill>

      {enableVignette && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, rgba(6,7,9,0) 62%, rgba(6,7,9,0.18) 88%, rgba(6,7,9,0.38) 100%)',
            mixBlendMode: 'multiply',
          }}
        />
      )}

      {enableGrain && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            opacity: grainOpacity,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${grainFrequency}' seed='${deterministicSeed}' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'soft-light',
          }}
        />
      )}
    </AbsoluteFill>
  );
};
