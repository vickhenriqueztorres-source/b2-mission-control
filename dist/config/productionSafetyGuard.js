"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionSafetyGuard = exports.ProductionSafetyError = void 0;
class ProductionSafetyError extends Error {
    code;
    violation;
    constructor(violation) {
        super(`${violation.code}: ${violation.variable}=${violation.value} is forbidden when NODE_ENV=production.`);
        this.name = 'ProductionSafetyError';
        this.code = violation.code;
        this.violation = violation;
    }
}
exports.ProductionSafetyError = ProductionSafetyError;
class ProductionSafetyGuard {
    static truthyValues = new Set(['1', 'true', 'yes', 'on', 'enabled']);
    static assertSafeForProduction(env = process.env) {
        const violation = this.firstViolation(env);
        if (violation) {
            throw new ProductionSafetyError(violation);
        }
    }
    static firstViolation(env = process.env) {
        if (!this.isProduction(env)) {
            return null;
        }
        const checks = [
            this.truthyViolation(env, 'CHAOS_MODE', 'CHAOS_MODE_FORBIDDEN_IN_PRODUCTION'),
            this.truthyViolation(env, 'FAULT_INJECTOR', 'FAULT_INJECTOR_FORBIDDEN_IN_PRODUCTION'),
            this.truthyViolation(env, 'MOCK_PROVIDER', 'MOCK_PROVIDER_FORBIDDEN_IN_PRODUCTION'),
            this.truthyViolation(env, 'SIMULATED_EVENTS', 'SIMULATED_EVENT_FORBIDDEN_IN_PRODUCTION'),
            this.stagingPathViolation(env, ['STAGING_DATABASE', 'DATABASE_PATH', 'MISSION_CONTROL_DB_PATH'], 'STAGING_DATABASE_FORBIDDEN_IN_PRODUCTION'),
            this.stagingPathViolation(env, ['STAGING_CHROME_PROFILE', 'CHROME_PROFILE', 'FIREFLY_CHROME_PROFILE_DIR'], 'STAGING_CHROME_PROFILE_FORBIDDEN_IN_PRODUCTION'),
            this.stagingPathViolation(env, ['STAGING_OUTPUT_DIRECTORY', 'OUTPUT_DIR', 'FIREFLY_OUTPUT_DIR', 'MEDIA_OUTPUT_DIR'], 'STAGING_OUTPUT_FORBIDDEN_IN_PRODUCTION')
        ];
        return checks.find((violation) => violation !== null) ?? null;
    }
    static isProduction(env) {
        const value = (env.NODE_ENV || '').trim().toLowerCase();
        return value === 'production' || value === 'prod';
    }
    static truthyViolation(env, variable, code) {
        const raw = env[variable];
        if (raw && this.truthyValues.has(raw.trim().toLowerCase())) {
            return { code, variable, value: raw };
        }
        return null;
    }
    static stagingPathViolation(env, variables, code) {
        for (const variable of variables) {
            const raw = env[variable];
            if (!raw)
                continue;
            const normalized = raw.trim().toLowerCase().replace(/\\/g, '/');
            if (this.truthyValues.has(normalized) ||
                normalized.includes('/staging/') ||
                normalized.includes('-staging') ||
                normalized.includes('_staging')) {
                return { code, variable, value: raw };
            }
        }
        return null;
    }
}
exports.ProductionSafetyGuard = ProductionSafetyGuard;
