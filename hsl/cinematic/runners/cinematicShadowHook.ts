import {getHslCinematicFlags, HslCinematicFlags} from '../../../config/hslCinematicFlags';
import {Logger} from '../../../event-hub/logger';
import {CinematicShadowRunInput, CinematicShadowRunResult} from '../types/cinematicPlans';

export interface CinematicShadowRunnerPort {
  run(input: Readonly<CinematicShadowRunInput>): Promise<CinematicShadowRunResult>;
}

export interface CinematicShadowHookInput {
  readonly productionId: string;
  readonly editorialPackagePath: string;
  readonly expectedEpisodeId?: string;
  readonly flags?: HslCinematicFlags;
  readonly runner?: CinematicShadowRunnerPort;
}

export interface CinematicShadowHookResult {
  readonly executed: boolean;
  readonly success: boolean;
  readonly result?: CinematicShadowRunResult;
  readonly error?: string;
}

export async function runCinematicDirectionShadowHook(
  input: Readonly<CinematicShadowHookInput>
): Promise<any> {
  const flags = input.flags || getHslCinematicFlags();
  if (!flags.pipelineV1Enabled && !flags.shouldRunShadow) {
    if (flags.shadowModeEnabled) {
      return { executed: false, success: true };
    }
    throw new Error('CINEMATIC_DIRECTION_REQUIRED: Cinematic direction (Beat, Shot, and Continuity directors) must run for episode production. Set HSL_CINEMATIC_PIPELINE_V1=on.');
  }

  const runner = input.runner || new (await import('./cinematicDirectionShadowRunner')).CinematicDirectionShadowRunner();
  try {
    const result = await runner.run({
      productionId: input.productionId,
      editorialPackagePath: input.editorialPackagePath,
      expectedEpisodeId: input.expectedEpisodeId
    });
    if (flags.shadowModeEnabled && !flags.pipelineV1Enabled) {
      return { executed: true, success: true, result, ...result };
    }
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (flags.shadowModeEnabled && !flags.pipelineV1Enabled) {
      return { executed: true, success: false, error: message };
    }
    Logger.error(
      'CinematicDirectionShadowHook',
      `FATAL: Cinematic Direction gate failed. Blocking production: ${message}`
    );
    throw new Error(`CINEMATIC_DIRECTION_GATE_FAILED: ${message}`);
  }
}

