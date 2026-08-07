export type ProductionSafetyViolationCode =
  | 'CHAOS_MODE_FORBIDDEN_IN_PRODUCTION'
  | 'FAULT_INJECTOR_FORBIDDEN_IN_PRODUCTION'
  | 'MOCK_PROVIDER_FORBIDDEN_IN_PRODUCTION'
  | 'SIMULATED_EVENT_FORBIDDEN_IN_PRODUCTION'
  | 'STAGING_DATABASE_FORBIDDEN_IN_PRODUCTION'
  | 'STAGING_CHROME_PROFILE_FORBIDDEN_IN_PRODUCTION'
  | 'STAGING_OUTPUT_FORBIDDEN_IN_PRODUCTION';

export type ProductionSafetyViolation = {
  code: ProductionSafetyViolationCode;
  variable: string;
  value: string;
};

export class ProductionSafetyError extends Error {
  public readonly code: ProductionSafetyViolationCode;
  public readonly violation: ProductionSafetyViolation;

  constructor(violation: ProductionSafetyViolation) {
    super(`${violation.code}: ${violation.variable}=${violation.value} is forbidden when NODE_ENV=production.`);
    this.name = 'ProductionSafetyError';
    this.code = violation.code;
    this.violation = violation;
  }
}

export class ProductionSafetyGuard {
  private static readonly truthyValues = new Set(['1', 'true', 'yes', 'on', 'enabled']);

  public static assertSafeForProduction(env: NodeJS.ProcessEnv = process.env): void {
    const violation = this.firstViolation(env);
    if (violation) {
      throw new ProductionSafetyError(violation);
    }
  }

  public static firstViolation(env: NodeJS.ProcessEnv = process.env): ProductionSafetyViolation | null {
    if (!this.isProduction(env)) {
      return null;
    }

    const checks: Array<ProductionSafetyViolation | null> = [
      this.truthyViolation(env, 'CHAOS_MODE', 'CHAOS_MODE_FORBIDDEN_IN_PRODUCTION'),
      this.truthyViolation(env, 'FAULT_INJECTOR', 'FAULT_INJECTOR_FORBIDDEN_IN_PRODUCTION'),
      this.truthyViolation(env, 'MOCK_PROVIDER', 'MOCK_PROVIDER_FORBIDDEN_IN_PRODUCTION'),
      this.truthyViolation(env, 'SIMULATED_EVENTS', 'SIMULATED_EVENT_FORBIDDEN_IN_PRODUCTION'),
      this.stagingPathViolation(env, ['STAGING_DATABASE', 'DATABASE_PATH', 'MISSION_CONTROL_DB_PATH'], 'STAGING_DATABASE_FORBIDDEN_IN_PRODUCTION'),
      this.stagingPathViolation(env, ['STAGING_CHROME_PROFILE', 'CHROME_PROFILE', 'FIREFLY_CHROME_PROFILE_DIR'], 'STAGING_CHROME_PROFILE_FORBIDDEN_IN_PRODUCTION'),
      this.stagingPathViolation(env, ['STAGING_OUTPUT_DIRECTORY', 'OUTPUT_DIR', 'FIREFLY_OUTPUT_DIR', 'MEDIA_OUTPUT_DIR'], 'STAGING_OUTPUT_FORBIDDEN_IN_PRODUCTION')
    ];

    return checks.find((violation): violation is ProductionSafetyViolation => violation !== null) ?? null;
  }

  private static isProduction(env: NodeJS.ProcessEnv): boolean {
    const value = (env.NODE_ENV || '').trim().toLowerCase();
    return value === 'production' || value === 'prod';
  }

  private static truthyViolation(
    env: NodeJS.ProcessEnv,
    variable: string,
    code: ProductionSafetyViolationCode
  ): ProductionSafetyViolation | null {
    const raw = env[variable];
    if (raw && this.truthyValues.has(raw.trim().toLowerCase())) {
      return { code, variable, value: raw };
    }
    return null;
  }

  private static stagingPathViolation(
    env: NodeJS.ProcessEnv,
    variables: string[],
    code: ProductionSafetyViolationCode
  ): ProductionSafetyViolation | null {
    for (const variable of variables) {
      const raw = env[variable];
      if (!raw) continue;

      const normalized = raw.trim().toLowerCase().replace(/\\/g, '/');
      if (
        this.truthyValues.has(normalized) ||
        normalized.includes('/staging/') ||
        normalized.includes('-staging') ||
        normalized.includes('_staging')
      ) {
        return { code, variable, value: raw };
      }
    }
    return null;
  }
}
