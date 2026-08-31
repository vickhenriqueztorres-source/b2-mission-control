import React from 'react';
import { CinematicEpisode } from './cinema/CinematicEpisode';
import { EPISODE_DRONES_AGRO_NOTURNOS_CALCULATED_TIMELINE } from './episodeDronesAgroNoturnosTimelineData';

export const EpisodeDronesAgroNoturnos: React.FC = () => {
  return (
    <CinematicEpisode
      timeline={EPISODE_DRONES_AGRO_NOTURNOS_CALCULATED_TIMELINE}
      accentColor="#FF5500"
      telemetryColor="#00F0FF"
      runId="DRONES-AGRO-NOTURNOS"
    />
  );
};
