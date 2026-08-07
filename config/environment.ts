import { ProductionSafetyGuard } from './productionSafetyGuard';

export type EnvironmentType = 'development' | 'staging' | 'production';

export class EnvironmentConfig {
  public static getCurrentEnvironment(): EnvironmentType {
    const env = (process.env.NODE_ENV || 'development').toLowerCase();
    if (env === 'production' || env === 'prod') return 'production';
    if (env === 'staging' || env === 'stage') return 'staging';
    return 'development';
  }

  public static isProduction(): boolean {
    return this.getCurrentEnvironment() === 'production';
  }

  public static isStaging(): boolean {
    return this.getCurrentEnvironment() === 'staging';
  }

  public static assertNoChaosInProduction(): void {
    ProductionSafetyGuard.assertSafeForProduction();
  }

  public static assertSafeForProduction(): void {
    ProductionSafetyGuard.assertSafeForProduction();
  }
}
