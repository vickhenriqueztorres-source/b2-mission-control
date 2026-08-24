import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {ContinuityDirectorAgent} from '../agents/continuityDirectorAgent';
import {NarrativeBeatDirectorAgent} from '../agents/narrativeBeatDirectorAgent';
import {CinematicShotDirectorAgent} from '../agents/cinematicShotDirectorAgent';
import {CinematicArtifactStore, CinematicBatchArtifact} from '../services/cinematicArtifactStore';
import {buildCinematicContinuitySceneViews} from '../services/cinematicContinuityContextBuilder';
import {existingClaimIds, narrativeBeatInputForScene} from '../services/narrativeBeatInputExtractor';
import {cinematicShotInputForScene} from '../services/cinematicShotInputExtractor';
import {AgentTelemetryCinematicSink, CinematicTelemetryPort} from '../telemetry/cinematicTelemetry';
import {
  CINEMATIC_EPISODE_SCHEMA,
  CINEMATIC_EPISODE_SCHEMA_VERSION,
  CINEMATIC_RULESET,
  CINEMATIC_SCENE_SCHEMA,
  CINEMATIC_SCENE_SCHEMA_VERSION,
  CinematicEditorialPackageView,
  CinematicEditorialSceneView,
  CinematicEpisodePlanV1,
  CinematicScenePlanV1,
  CinematicShadowRunInput,
  CinematicShadowRunResult,
  CinematicShotDirectorInput,
  NarrativeBeatSceneInput
} from '../types/cinematicPlans';
import {validateContinuityOwnership} from '../validators/cinematicContinuityValidator';
import {
  approvedSceneIds,
  CinematicValidationError,
  validateCinematicEpisodePlan,
  validateCinematicScenePlan,
  validateEditorialPackage
} from '../validators/cinematicPlanValidator';

type ProvisionalScenePlan = Omit<
  CinematicScenePlanV1,
  'continuity' | 'cinematic_plan_revision' | 'generated_at'
>;

interface SceneWork {
  readonly editorialScene: Readonly<CinematicEditorialSceneView>;
  readonly beatInput: Readonly<NarrativeBeatSceneInput>;
  readonly shotInput: Readonly<CinematicShotDirectorInput>;
  readonly provisionalPlan: Readonly<ProvisionalScenePlan>;
}

function sha256(value: Buffer | string): string {
  return `sha256_${crypto.createHash('sha256').update(value).digest('hex')}`;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

function sourceAvailable(
  editorialPackage: CinematicEditorialPackageView,
  packageDirectory: string,
  names: readonly string[]
): boolean {
  return names.some((name) => {
    const value = editorialPackage[name];
    if (value === null || value === undefined) return false;
    if (name.endsWith('_path') && typeof value === 'string') {
      const candidate = path.isAbsolute(value) ? value : path.resolve(packageDirectory, value);
      return fs.existsSync(candidate);
    }
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return typeof value === 'object';
  });
}

function preservedTimestamp<T extends {generated_at?: unknown; cinematic_plan_revision?: unknown}>(
  existing: T | null,
  revision: string
): string {
  if (
    existing?.cinematic_plan_revision === revision &&
    typeof existing.generated_at === 'string' &&
    !Number.isNaN(Date.parse(existing.generated_at))
  ) return existing.generated_at;
  return new Date().toISOString();
}

export class CinematicDirectionShadowRunner {
  constructor(
    private readonly telemetry: CinematicTelemetryPort = new AgentTelemetryCinematicSink(),
    private readonly store: CinematicArtifactStore = new CinematicArtifactStore()
  ) {}

  public async run(input: Readonly<CinematicShadowRunInput>): Promise<CinematicShadowRunResult> {
    let episodeId = input.expectedEpisodeId || 'UNRESOLVED_EPISODE';
    let startedEmitted = false;
    if (input.expectedEpisodeId) {
      this.telemetry.emit('cinematic.shadow.started', {productionId: input.productionId, episodeId});
      startedEmitted = true;
    }

    try {
      const packagePath = path.resolve(input.editorialPackagePath);
      if (!fs.existsSync(packagePath)) {
        throw new CinematicValidationError(
          'CINEMATIC_SOURCE_PACKAGE_INVALID',
          `editorial package not found: ${packagePath}`
        );
      }
      const sourceBytes = fs.readFileSync(packagePath);
      let parsed: unknown;
      try {
        parsed = JSON.parse(sourceBytes.toString('utf8'));
      } catch (error) {
        throw new CinematicValidationError(
          'CINEMATIC_SOURCE_PACKAGE_INVALID',
          `editorial package is not valid JSON: ${(error as Error).message}`
        );
      }

      validateEditorialPackage(parsed, input.expectedEpisodeId);
      const editorialPackage = deepFreeze(parsed) as Readonly<CinematicEditorialPackageView>;
      episodeId = editorialPackage.episode_id;
      if (!startedEmitted) {
        this.telemetry.emit('cinematic.shadow.started', {productionId: input.productionId, episodeId});
        startedEmitted = true;
      }

      const approvedIds = approvedSceneIds(editorialPackage);
      const approvedScenes = editorialPackage.scenes.filter((scene) => approvedIds.has(scene.scene_id));
      const claimIds = existingClaimIds(editorialPackage);
      const beatDirector = new NarrativeBeatDirectorAgent(this.telemetry);
      const shotDirector = new CinematicShotDirectorAgent(this.telemetry);
      const continuityDirector = new ContinuityDirectorAgent(this.telemetry);
      const sourceRevision = sha256(sourceBytes);
      const outputDirectory = path.join(path.dirname(packagePath), 'cinematic');

      const sceneWork: SceneWork[] = approvedScenes.map((scene) => {
        const beatInput = narrativeBeatInputForScene(
          input.productionId,
          editorialPackage,
          scene,
          path.dirname(packagePath),
          claimIds
        );
        const beatResult = beatDirector.run(beatInput);
        const shotInput = cinematicShotInputForScene(input.productionId, episodeId, scene, beatResult);
        const shotResult = shotDirector.run(shotInput);
        const sourceSceneRevision = typeof scene.source_scene_revision === 'string'
          ? scene.source_scene_revision
          : typeof scene.revision === 'string' ? scene.revision : undefined;
        const provisionalPlan: ProvisionalScenePlan = {
          schema: CINEMATIC_SCENE_SCHEMA,
          schema_version: CINEMATIC_SCENE_SCHEMA_VERSION,
          ruleset: CINEMATIC_RULESET,
          episode_id: episodeId,
          scene_id: scene.scene_id,
          source_revision: sourceRevision,
          ...(sourceSceneRevision ? {source_scene_revision: sourceSceneRevision} : {}),
          beats: beatResult.beats,
          direction: {
            narrative_intent: beatResult.narrativeIntent,
            energy: null,
            focus_target: shotResult.focusTarget
          },
          shot: shotResult.shot,
          camera: shotResult.camera,
          decision_reason: shotResult.decisionReason,
          micro_events: [],
          transition: {type: null, motivation: null},
          remotion_choreography: [],
          mode: 'shadow'
        };
        return {editorialScene: scene, beatInput, shotInput, provisionalPlan};
      });

      const continuityScenes = buildCinematicContinuitySceneViews(sceneWork.map((work) => ({
        editorialScene: work.editorialScene,
        provisionalPlan: work.provisionalPlan
      })));
      const continuityResult = continuityDirector.runEpisode({
        productionId: input.productionId,
        episodeId,
        scenes: continuityScenes
      });

      const scenePlanPaths: string[] = [];
      const scenePlanReferences: string[] = [];
      const finalPlans: CinematicScenePlanV1[] = [];
      const sceneArtifacts: CinematicBatchArtifact<CinematicScenePlanV1>[] = [];
      sceneWork.forEach((work, index) => {
        const continuity = continuityResult.decisions[index].continuity;
        const planSeed = {...work.provisionalPlan, continuity};
        const cinematicPlanRevision = sha256(canonicalJson(planSeed));
        const scenePlanPath = path.join(outputDirectory, `${work.provisionalPlan.scene_id}.cinematic.json`);
        const existing = this.store.readJsonIfPresent<Partial<CinematicScenePlanV1>>(scenePlanPath);
        const scenePlan: CinematicScenePlanV1 = {
          ...planSeed,
          cinematic_plan_revision: cinematicPlanRevision,
          generated_at: preservedTimestamp(existing, cinematicPlanRevision)
        };
        validateContinuityOwnership(work.provisionalPlan, scenePlan);
        const validationContext = {
          episodeId,
          existingSceneIds: approvedIds,
          narrativeBeatContext: {
            sceneId: work.beatInput.sceneId,
            approvedScriptText: work.beatInput.approvedScriptText,
            existingClaimIds: work.beatInput.existingClaimIds,
            narrationAlignment: work.beatInput.narrationAlignment
          },
          shotDirectorInput: work.shotInput,
          continuityContext: {
            currentScene: continuityScenes[index],
            previousScene: continuityScenes[index - 1] || null,
            nextScene: continuityScenes[index + 1] || null,
            existingSceneIds: approvedIds
          }
        };
        validateCinematicScenePlan(scenePlan, validationContext);
        sceneArtifacts.push({
          filePath: scenePlanPath,
          value: scenePlan,
          validate: (candidate) => validateCinematicScenePlan(candidate, validationContext)
        });
        finalPlans.push(scenePlan);
        scenePlanPaths.push(scenePlanPath);
        scenePlanReferences.push(`cinematic/${path.basename(scenePlanPath)}`);
      });

      const packageDirectory = path.dirname(packagePath);
      const episodeSeed = {
        schema: CINEMATIC_EPISODE_SCHEMA,
        schema_version: CINEMATIC_EPISODE_SCHEMA_VERSION,
        ruleset: CINEMATIC_RULESET,
        episode_id: episodeId,
        source: {
          script_available: true,
          visual_plan_available: sourceAvailable(editorialPackage, packageDirectory, ['visual_plan', 'visual_plan_path']),
          claim_registry_available: sourceAvailable(editorialPackage, packageDirectory, ['claim_registry', 'claim_registry_path']),
          source_revision: sourceRevision
        },
        scene_plans: scenePlanReferences,
        status: 'shadow_generated' as const
      };
      const cinematicPlanRevision = sha256(canonicalJson({
        ...episodeSeed,
        scenePlanRevisions: finalPlans.map((plan) => plan.cinematic_plan_revision)
      }));
      const episodePlanPath = path.join(outputDirectory, 'episode.cinematic.json');
      const existingEpisode = this.store.readJsonIfPresent<Partial<CinematicEpisodePlanV1>>(episodePlanPath);
      const episodePlan: CinematicEpisodePlanV1 = {
        ...episodeSeed,
        cinematic_plan_revision: cinematicPlanRevision,
        generated_at: preservedTimestamp(existingEpisode, cinematicPlanRevision)
      };
      validateCinematicEpisodePlan(episodePlan, episodeId);
      this.store.writeJsonBatchAtomic([
        ...sceneArtifacts,
        {
          filePath: episodePlanPath,
          value: episodePlan,
          validate: (candidate) => validateCinematicEpisodePlan(candidate, episodeId)
        }
      ]);

      scenePlanPaths.forEach((artifactPath, index) => {
        this.telemetry.emit('cinematic.shadow.scene_plan_created', {
          productionId: input.productionId,
          episodeId,
          sceneId: continuityScenes[index].scene_id,
          artifactPath
        });
      });
      this.telemetry.emit('cinematic.shadow.episode_plan_created', {
        productionId: input.productionId, episodeId, artifactPath: episodePlanPath
      });
      this.telemetry.emit('cinematic.shadow.completed', {
        productionId: input.productionId, episodeId, artifactPath: episodePlanPath
      });
      return {
        mode: 'shadow', episodeId, sourceRevision, outputDirectory,
        episodePlanPath, scenePlanPaths
      };
    } catch (error) {
      if (error instanceof CinematicValidationError) {
        this.telemetry.emit('cinematic.shadow.validation_failed', {
          productionId: input.productionId, episodeId, errorCode: error.code, message: error.message
        });
      }
      this.telemetry.emit('cinematic.shadow.failed', {
        productionId: input.productionId,
        episodeId,
        errorCode: error instanceof CinematicValidationError ? error.code : 'CINEMATIC_SHADOW_RUN_FAILED',
        message: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}
