export interface HslCinematicFlags {
  pipelineV1Enabled: boolean;
  shadowModeEnabled: boolean;
  shouldRunShadow: boolean;
}

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on', 'enabled']);

function enabled(value: string | undefined): boolean {
  return value !== undefined && TRUE_VALUES.has(value.trim().toLowerCase());
}

export function getHslCinematicFlags(env: NodeJS.ProcessEnv = process.env): HslCinematicFlags {
  const pipelineV1Enabled = enabled(env.HSL_CINEMATIC_PIPELINE_V1);
  const shadowModeEnabled = enabled(env.HSL_CINEMATIC_SHADOW_MODE);

  return {
    pipelineV1Enabled,
    shadowModeEnabled,
    shouldRunShadow: pipelineV1Enabled && shadowModeEnabled
  };
}
