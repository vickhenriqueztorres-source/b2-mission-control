import React from 'react';
import { CinematicEpisode } from './cinema/CinematicEpisode';
import { EPISODE_GPS_CALCULATED_TIMELINE } from './episodeGpsTimelineData';

export interface EpisodeGpsProps {
  runId?: string;
  accentColor?: string;
  telemetryColor?: string;
}

/**
 * 🛰️ EpisodeGps: Episódio Oficial da Física do Tempo & Relatividade
 * Monta automaticamente o episódio inteiro através de dados e do CinematicEpisode.
 */
export const EpisodeGps: React.FC<EpisodeGpsProps> = ({
  runId = 'latest',
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  return (
    <CinematicEpisode
      timeline={EPISODE_GPS_CALCULATED_TIMELINE}
      accentColor={accentColor}
      telemetryColor={telemetryColor}
      runId={runId}
    />
  );
};
