/**
 * Removed production path.
 *
 * Masters for data-driven episodes must be rendered by CinematicEpisode. A
 * direct FFmpeg slideshow bypasses transitions, camera language, HUD direction,
 * film grade and the cinematic audio mix, so this entrypoint is fail-closed.
 */
throw new Error(
  [
    'FAST_MASTER_ASSEMBLY_FORBIDDEN',
    'Render EpisodeDronesAgroNoturnos through scripts/renderDronesAgroNoturnosMaster.ts.',
    'No FFmpeg slideshow or still-image fallback is allowed.',
  ].join(': '),
);
