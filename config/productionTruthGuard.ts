import fs from 'fs';

export type ProductionTruthViolationCode =
  | 'PRODUCTION_SCAFFOLDING_FORBIDDEN'
  | 'CRITICAL_FAKE_PATH_FORBIDDEN';

export type ProductionTruthContext = {
  productionId: string;
  stage: string;
  artifactKind: string;
  artifactPath?: string;
  detail?: string;
};

export class ProductionTruthError extends Error {
  public readonly code: ProductionTruthViolationCode;
  public readonly context: ProductionTruthContext;

  constructor(code: ProductionTruthViolationCode, context: ProductionTruthContext) {
    super(`${code}: ${context.stage}/${context.artifactKind} is not allowed to complete from scaffolded evidence.`);
    this.name = 'ProductionTruthError';
    this.code = code;
    this.context = context;
  }
}

export class ProductionTruthGuard {
  private static readonly markerPattern = /\b(dummy|placeholder|fixture|fake|sample|hardcoded|for_verification|verification_only|test_video)\b/i;

  public static assertNoScaffoldingMarkers(context: ProductionTruthContext, candidate: unknown, env: NodeJS.ProcessEnv = process.env): void {
    if (!this.isProduction(env)) {
      return;
    }

    const serialized = typeof candidate === 'string' ? candidate : JSON.stringify(candidate);
    if (serialized && this.markerPattern.test(serialized)) {
      throw new ProductionTruthError('PRODUCTION_SCAFFOLDING_FORBIDDEN', context);
    }
  }

  public static assertRealFinalMedia(context: ProductionTruthContext, env: NodeJS.ProcessEnv = process.env): void {
    if (!this.isProduction(env)) {
      return;
    }

    if (!context.artifactPath || !fs.existsSync(context.artifactPath)) {
      throw new ProductionTruthError('CRITICAL_FAKE_PATH_FORBIDDEN', context);
    }

    const stat = fs.statSync(context.artifactPath);
    if (stat.size <= 0 || context.artifactPath.toLowerCase().endsWith('.part')) {
      throw new ProductionTruthError('CRITICAL_FAKE_PATH_FORBIDDEN', context);
    }

    this.assertNoScaffoldingMarkers(context, context.artifactPath, env);
  }

  private static isProduction(env: NodeJS.ProcessEnv): boolean {
    const value = (env.NODE_ENV || '').trim().toLowerCase();
    return value === 'production' || value === 'prod';
  }
}
