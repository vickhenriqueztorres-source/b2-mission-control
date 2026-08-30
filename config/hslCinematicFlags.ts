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
  const pipelineV1Enabled = enabled(env.HSL_CINEMATIC_PIPELINE_V1) || env.NODE_ENV === 'production';
  const shadowModeEnabled = enabled(env.HSL_CINEMATIC_SHADOW_MODE);

  return {
    pipelineV1Enabled,
    shadowModeEnabled,
    shouldRunShadow: pipelineV1Enabled && shadowModeEnabled
  };
}

export function assertCinematicPipelineActive(isMasterRender: boolean = true, env: NodeJS.ProcessEnv = process.env): void {
  const flags = getHslCinematicFlags(env);
  if (isMasterRender && !flags.pipelineV1Enabled) {
    throw new Error('HSL_CINEMATIC_PIPELINE_V1_REQUIRED: Master production requires active cinematic direction pipeline (NarrativeBeat, Shot, and Continuity directors). Set HSL_CINEMATIC_PIPELINE_V1=on.');
  }
}

