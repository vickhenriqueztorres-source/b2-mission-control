import fs from 'fs';
import path from 'path';
import { BaseAdapter } from './baseAdapter';
import { ProductionTruthGuard } from '../config/productionTruthGuard';
import { EventBus } from '../event-hub/eventBus';
import { Logger } from '../event-hub/logger';
import {HslEditorialRuntime} from '../hsl/editorial/editorialRuntime';
import {HslEpisodeSeed} from '../hsl/editorial/types/editorial';
import {HslPostproductionRuntime} from '../hsl/postproduction/postproductionRuntime';

type HslIntegrationErrorCode =
  | 'HSL_PROJECT_NOT_FOUND'
  | 'HSL_EDITORIAL_RUNTIME_MISSING'
  | 'HSL_REMOTION_RUNTIME_MISSING';

export class HiddenSystemsLabIntegrationError extends Error {
  constructor(
    public readonly code: HslIntegrationErrorCode,
    public readonly productionId: string,
    message: string
  ) {
    super(message);
    this.name = 'HiddenSystemsLabIntegrationError';
  }
}

export class HiddenSystemsLabAdapter extends BaseAdapter {
  private readonly projectRoot: string;

  constructor(projectRoot: string = process.env.HSL_PROJECT_ROOT || 'C:\\B2-AI-STUDIO\\links\\hidden-systems-lab') {
    super('HiddenSystemsLabAdapter');
    this.projectRoot = path.resolve(projectRoot);
  }

  public async initialize(): Promise<void> {
    const root = this.resolveSourceRoot();
    if (!this.hasEditorialSourceShape(root)) {
      throw new HiddenSystemsLabIntegrationError(
        'HSL_PROJECT_NOT_FOUND',
        'SYSTEM',
        `Hidden Systems Lab source package not found at ${root}`
      );
    }
    Logger.info(this.name, `Connected to Hidden Systems Lab source package: ${root}`);
  }

  public async checkHealth(): Promise<boolean> {
    return this.hasEditorialSourceShape(this.resolveSourceRoot());
  }

  public async runPreproduction(
    productionId: string,
    briefingText: string
  ): Promise<{success: boolean; episodePackagePath: string}> {
    const root = this.resolveSourceRoot();
    ProductionTruthGuard.assertNoScaffoldingMarkers({
      productionId,
      stage: 'HSL_EDITORIAL_PREPRODUCTION',
      artifactKind: 'briefing'
    }, briefingText);

    this.emit(productionId, 'STEP_STARTED', {
      status: 'HSL_EDITORIAL_RUNTIME_DISCOVERY_STARTED',
      project_root: root
    });
    this.assertSourceAvailable(productionId, root);

    const outputDirectory = path.join('C:\\B2-AI-STUDIO\\productions', productionId, 'editorial');
    let seed: HslEpisodeSeed | undefined;
    const briefingCandidate = path.resolve(briefingText);
    if (fs.existsSync(briefingCandidate) && fs.statSync(briefingCandidate).isFile()) {
      seed = JSON.parse(fs.readFileSync(briefingCandidate, 'utf8')) as HslEpisodeSeed;
    } else if (briefingText.trim().startsWith('{')) {
      seed = JSON.parse(briefingText) as HslEpisodeSeed;
    }
    const result = new HslEditorialRuntime().run(productionId, outputDirectory, seed);
    this.emit(productionId, 'STEP_STARTED', {
      status: 'HSL_EDITORIAL_RUNTIME_COMPLETED',
      episode_package_path: result.episodePackagePath
    });
    return {success: true, episodePackagePath: result.episodePackagePath};
  }

  public async runPostproduction(
    productionId: string,
    intakeManifestPath: string
  ): Promise<{success: boolean; finalVideoPath: string}> {
    const root = this.resolveSourceRoot();
    this.assertSourceAvailable(productionId, root);
    if (!fs.existsSync(intakeManifestPath)) {
      this.fail(productionId, 'HSL_REMOTION_RUNTIME_MISSING', `Kling intake manifest not found: ${intakeManifestPath}`, {
        intake_manifest_path: intakeManifestPath
      });
    }

    const productionRoot = path.join('C:\\B2-AI-STUDIO\\productions', productionId);
    const executionPlanPath = path.join(productionRoot, 'editorial', 'execution', 'episode.execution.json');
    if (!fs.existsSync(executionPlanPath)) {
      this.fail(productionId, 'HSL_REMOTION_RUNTIME_MISSING', `Execution plan not found: ${executionPlanPath}`, {execution_plan_path: executionPlanPath});
    }
    const result = await new HslPostproductionRuntime().run({
      productionId,
      executionPlanPath,
      intakeManifestPath,
      licensedAssetManifestPath: process.env.HSL_LICENSED_ASSET_MANIFEST,
      narrationPath: process.env.HSL_NARRATION_PATH,
      outputDirectory: path.join(productionRoot, 'postproduction')
    });
    return {success: true, finalVideoPath: result.finalVideoPath};
  }

  private resolveSourceRoot(): string {
    if (this.hasEditorialSourceShape(this.projectRoot)) return this.projectRoot;
    const sourceRoot = 'C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\1 - HIDDEN SYSTEMS LABS';
    return this.hasEditorialSourceShape(sourceRoot) ? sourceRoot : this.projectRoot;
  }

  private hasEditorialSourceShape(candidate: string): boolean {
    return [
      'brifieng .md',
      'Briefing de segurança do canal.md',
      'Manual de Identidade Visual.md',
      'identidade visual.md',
      'identidade visual.png',
      'logo.png'
    ].every((name) => fs.existsSync(path.join(candidate, name)));
  }

  private assertSourceAvailable(productionId: string, root: string): void {
    if (this.hasEditorialSourceShape(root)) return;
    this.fail(productionId, 'HSL_PROJECT_NOT_FOUND', `Hidden Systems Lab source package not found at ${root}`, {
      project_root: root
    });
  }

  private findRunner(root: string, hints: string[]): string | null {
    const candidates = [root, path.join(root, 'runtime'), path.join(root, 'remotion'), path.join(root, 'studio')];
    for (const candidate of candidates) {
      const packagePath = path.join(candidate, 'package.json');
      if (!fs.existsSync(packagePath)) continue;
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as {scripts?: Record<string, string>};
      for (const [name, command] of Object.entries(pkg.scripts || {})) {
        const normalized = `${name} ${command}`.toLowerCase();
        if (hints.some((hint) => normalized.includes(hint)) && !/(test|mock|fixture)/.test(normalized)) {
          return `npm run ${name}`;
        }
      }
    }
    return null;
  }

  private fail(
    productionId: string,
    code: HslIntegrationErrorCode,
    message: string,
    details: Record<string, unknown>
  ): never {
    this.emit(productionId, 'ERROR', {status: code, message, ...details});
    throw new HiddenSystemsLabIntegrationError(code, productionId, message);
  }

  private emit(productionId: string, eventType: 'STEP_STARTED' | 'ERROR', payload: Record<string, unknown>): void {
    EventBus.getInstance().emitEvent({
      production_id: productionId,
      source: 'HIDDEN_SYSTEMS_LAB',
      agent_name: 'HiddenSystemsLabAdapter',
      event_type: eventType,
      payload
    });
  }
}
