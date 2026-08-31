export type DroneAgroCanonCategory = 'matter' | 'evidence' | 'maps' | 'reveal';

export const DRONE_AGRO_COMPONENT_BY_CATEGORY = {
  matter: 'DroneAgroMatterScene',
  evidence: 'DroneAgroEvidenceScene',
  maps: 'DroneAgroRouteMapScene',
  reveal: 'DroneAgroTechnicalRevealScene',
} as const satisfies Record<DroneAgroCanonCategory, string>;

export function droneAgroComponentFor(category: DroneAgroCanonCategory): string {
  return DRONE_AGRO_COMPONENT_BY_CATEGORY[category];
}

export function droneAgroMediaContract(
  episodeId: string,
  sceneId: string,
  category: DroneAgroCanonCategory,
): {mediaFile?: string; imageSrc?: string} {
  if (category === 'matter') {
    return {mediaFile: `episodes/${episodeId}/takes/${sceneId}.mp4`};
  }
  return {imageSrc: `episodes/${episodeId}/images/${sceneId}.png`};
}
