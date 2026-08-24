import fs from 'fs';
import path from 'path';
import {CinematicValidationError} from '../validators/cinematicValidationError';

export interface CinematicBatchArtifact<T = unknown> {
  readonly filePath: string;
  readonly value: T;
  readonly validate: (candidate: unknown) => void;
}

export class CinematicArtifactStore {
  public readJsonIfPresent<T>(filePath: string): T | null {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  }

  public writeJsonAtomic<T>(
    filePath: string,
    value: T,
    validate: (candidate: unknown) => void
  ): void {
    validate(value);
    const directory = path.dirname(filePath);
    fs.mkdirSync(directory, {recursive: true});

    const tempPath = path.join(
      directory,
      `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`
    );

    try {
      fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, {encoding: 'utf8', flag: 'wx'});
      const persistedCandidate = JSON.parse(fs.readFileSync(tempPath, 'utf8')) as unknown;
      validate(persistedCandidate);
      fs.renameSync(tempPath, filePath);
    } catch (error) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw error;
    }
  }

  public writeJsonBatchAtomic(artifacts: readonly CinematicBatchArtifact[]): void {
    const targets = artifacts.map((artifact) => path.resolve(artifact.filePath));
    if (new Set(targets).size !== targets.length) {
      throw new CinematicValidationError('CINEMATIC_BATCH_COMMIT_FAILED', 'duplicate batch target');
    }
    for (const artifact of artifacts) artifact.validate(artifact.value);

    const token = `${process.pid}.${Date.now()}`;
    const staged = artifacts.map((artifact, index) => {
      const target = targets[index];
      const directory = path.dirname(target);
      fs.mkdirSync(directory, {recursive: true});
      return {
        artifact,
        target,
        temp: path.join(directory, `.${path.basename(target)}.${token}.${index}.tmp`),
        backup: path.join(directory, `.${path.basename(target)}.${token}.${index}.bak`),
        backedUp: false,
        promoted: false
      };
    });

    try {
      for (const item of staged) {
        fs.writeFileSync(item.temp, `${JSON.stringify(item.artifact.value, null, 2)}\n`, {encoding: 'utf8', flag: 'wx'});
        item.artifact.validate(JSON.parse(fs.readFileSync(item.temp, 'utf8')));
      }
      for (const item of staged) {
        if (fs.existsSync(item.target)) {
          fs.renameSync(item.target, item.backup);
          item.backedUp = true;
        }
        fs.renameSync(item.temp, item.target);
        item.promoted = true;
      }
    } catch (error) {
      for (const item of [...staged].reverse()) {
        if (item.promoted && fs.existsSync(item.target)) fs.unlinkSync(item.target);
        if (item.backedUp && fs.existsSync(item.backup)) fs.renameSync(item.backup, item.target);
        if (fs.existsSync(item.temp)) fs.unlinkSync(item.temp);
      }
      throw error instanceof CinematicValidationError
        ? error
        : new CinematicValidationError(
          'CINEMATIC_BATCH_COMMIT_FAILED',
          error instanceof Error ? error.message : String(error)
        );
    }
    for (const item of staged) {
      if (!item.backedUp || !fs.existsSync(item.backup)) continue;
      try {
        fs.unlinkSync(item.backup);
      } catch {
        // A stale backup is safer than rolling back an already committed batch.
      }
    }
  }
}
