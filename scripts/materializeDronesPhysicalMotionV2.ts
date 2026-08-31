/**
 * Removed production path.
 *
 * A still image is not a video take. This command intentionally fails so an
 * interrupted production cannot turn PNG files into MP4 containers and later
 * pass them off as Firefly footage.
 */
throw new Error(
  [
    'STATIC_TAKE_MATERIALIZATION_FORBIDDEN',
    'PNG files cannot be promoted to CINEMATIC_TAKE with ffmpeg -loop.',
    'Generate a real Adobe Firefly Video take or keep the scene as an explicit Remotion dossier category.',
  ].join(': '),
);
