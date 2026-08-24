import {
  CinematicContinuitySceneView,
  CinematicSequenceMemory
} from '../types/cinematicPlans';

const MEMORY_WINDOW = 6;

function runLength<T>(values: readonly T[]): number {
  const current = values.at(-1);
  if (current === undefined) return 0;
  let count = 0;
  for (let index = values.length - 1; index >= 0 && values[index] === current; index -= 1) count += 1;
  return count;
}

export function buildCinematicSequenceMemory(
  orderedScenes: readonly CinematicContinuitySceneView[],
  currentIndex: number
): CinematicSequenceMemory {
  if (currentIndex < 0 || currentIndex >= orderedScenes.length) {
    throw new RangeError(`continuity currentIndex out of range: ${currentIndex}`);
  }
  const recent = orderedScenes.slice(Math.max(0, currentIndex - MEMORY_WINDOW + 1), currentIndex + 1);
  const shotTypeCounts: Record<string, number> = {};
  for (const scene of recent) {
    shotTypeCounts[scene.shot.shot_type] = (shotTypeCounts[scene.shot.shot_type] || 0) + 1;
  }
  const shotSizes = recent.map((scene) => scene.shot.shot_size);
  const cameraMovements = recent.map((scene) => scene.camera.movement);
  const compositions = recent.map((scene) => scene.shot.composition);
  const shotTypes = recent.map((scene) => scene.shot.shot_type);
  return {
    last_n_scenes: recent.length,
    shot_type_counts: shotTypeCounts,
    shot_size_sequence: shotSizes,
    camera_sequence: cameraMovements,
    composition_sequence: compositions,
    same_shot_type_run: runLength(shotTypes),
    same_shot_size_run: runLength(shotSizes),
    same_camera_movement_run: runLength(cameraMovements),
    same_composition_run: runLength(compositions)
  };
}
