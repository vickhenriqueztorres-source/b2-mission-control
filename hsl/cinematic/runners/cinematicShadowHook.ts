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
): Promise<CinematicShadowHookResult> {
  const flags = input.flags || getHslCinematicFlags();
  if (!flags.shouldRunShadow) return {executed: false, success: true};

  const runner = input.runner || new (await import('./cinematicDirectionShadowRunner')).CinematicDirectionShadowRunner();
  try {
    const result = await runner.run({
      productionId: input.productionId,
      editorialPackagePath: input.editorialPackagePath,
      expectedEpisodeId: input.expectedEpisodeId
    });
    return {executed: true, success: true, result};
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    Logger.error(
      'CinematicDirectionShadowHook',
      `Shadow failure recorded without changing production truth: ${message}`
    );
    return {executed: true, success: false, error: message};
  }
}
