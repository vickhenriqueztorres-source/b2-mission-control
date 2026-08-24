import {CinematicValidationError} from '../validators/cinematicValidationError';

export interface CinematicScenePlanMigrationInspection {
  readonly readable: true;
  readonly sourceVersion: '1.1.0' | '1.2.0' | '1.3.0';
  readonly targetVersion: '1.3.0';
  readonly requiresRegeneration: boolean;
  readonly strategy: 'none' | 'regenerate_from_approved_editorial_package';
}

export function inspectCinematicScenePlanMigration(value: unknown): CinematicScenePlanMigrationInspection {
  if (!value || typeof value !== 'object' || (value as any).schema !== 'hsl.cinematic.scene.v1') {
    throw new CinematicValidationError('CINEMATIC_SCHEMA_INVALID', 'not an HSL cinematic scene sidecar');
  }
  const version = (value as any).schema_version;
  if (version === '1.3.0') {
    return {readable: true, sourceVersion: version, targetVersion: '1.3.0', requiresRegeneration: false, strategy: 'none'};
  }
  if (version === '1.1.0' || version === '1.2.0') {
    return {
      readable: true,
      sourceVersion: version,
      targetVersion: '1.3.0',
      requiresRegeneration: true,
      strategy: 'regenerate_from_approved_editorial_package'
    };
  }
  throw new CinematicValidationError('CINEMATIC_SCHEMA_INVALID', `unsupported cinematic scene version: ${String(version)}`);
}
