import React from 'react';
import { CinematicEpisode } from './cinema/CinematicEpisode';
import { EPISODE_DRONES_AGRO_FIELD_CALCULATED_TIMELINE } from './episodeDronesAgroFieldTimelineData';

export interface EpisodeDronesAgroFieldCutProps {
  runId?: string;
  accentColor?: string;
  telemetryColor?: string;
}

export const EpisodeDronesAgroFieldCut: React.FC<EpisodeDronesAgroFieldCutProps> = ({
  runId = 'latest',
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
}) => (
  <CinematicEpisode
    timeline={EPISODE_DRONES_AGRO_FIELD_CALCULATED_TIMELINE}
    accentColor={accentColor}
    telemetryColor={telemetryColor}
    runId={runId}
  />
);
