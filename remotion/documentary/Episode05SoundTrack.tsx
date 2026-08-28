import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';

export const Episode05SoundTrack: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  return (
    <>
      {/* 1. Trilha Sonora Contínua de Tensão Industrial Subterrânea */}
      <Sequence from={0} durationInFrames={totalFrames}>
        <Audio
          src={staticFile('audio/music/cinematic/suspense/suspense_unseen_horrors.mp3')}
          volume={0.12} // Subterrâneo sutil para manter o destaque total na locução Chris
          loop
        />
      </Sequence>

      {/* 2. Impactos Sutis nos Capítulos Principais */}
      {/* Cap 2: 01:02 (Frame 1860) */}
      <Sequence from={1860} durationInFrames={90}>
        <Audio
          src={staticFile('audio/sfx/cinematic/impacts/impact_strike_01.wav')}
          volume={0.25}
        />
      </Sequence>

      {/* Cap 3: 02:04 (Frame 3720) */}
      <Sequence from={3720} durationInFrames={90}>
        <Audio
          src={staticFile('audio/sfx/cinematic/impacts/impact_strike_02.wav')}
          volume={0.25}
        />
      </Sequence>

      {/* Cap 4: 03:15 (Frame 5850) */}
      <Sequence from={5850} durationInFrames={90}>
        <Audio
          src={staticFile('audio/sfx/cinematic/impacts/impact_strike_03.wav')}
          volume={0.25}
        />
      </Sequence>

      {/* Cap 5: 04:17 (Frame 7710) */}
      <Sequence from={7710} durationInFrames={90}>
        <Audio
          src={staticFile('audio/sfx/cinematic/impacts/impact_strike_04.wav')}
          volume={0.25}
        />
      </Sequence>

      {/* Cap 6: 05:27 (Frame 9810) */}
      <Sequence from={9810} durationInFrames={90}>
        <Audio
          src={staticFile('audio/sfx/cinematic/impacts/impact_strike_05.wav')}
          volume={0.25}
        />
      </Sequence>
    </>
  );
};
