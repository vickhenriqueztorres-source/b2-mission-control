import React from 'react';
import { CinematicEpisode } from './cinema/CinematicEpisode';
import { EPISODE_GASOLINA_CALCULATED_TIMELINE } from './episodeGasolinaTimelineData';

export interface EpisodeGasolinaProps {
  runId?: string;
  accentColor?: string;
  telemetryColor?: string;
}

/**
 * ⛽ EpisodeGasolina: Piloto Oficial do Compositor Genérico CinematicEpisode
 * Monta automaticamente o episódio inteiro através de dados e do CinematicEpisode,
 * eliminando montagens artesanais de Sequences, garantindo transições, ducking e grade.
 */
export const EpisodeGasolina: React.FC<EpisodeGasolinaProps> = ({
  runId = 'latest',
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  return (
    <CinematicEpisode
      timeline={EPISODE_GASOLINA_CALCULATED_TIMELINE}
      accentColor={accentColor}
      telemetryColor={telemetryColor}
      runId={runId}
    />
  );
};
