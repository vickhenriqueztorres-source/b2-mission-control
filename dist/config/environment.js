"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentConfig = void 0;
const productionSafetyGuard_1 = require("./productionSafetyGuard");
class EnvironmentConfig {
    static getCurrentEnvironment() {
        const env = (process.env.NODE_ENV || 'development').toLowerCase();
        if (env === 'production' || env === 'prod')
            return 'production';
        if (env === 'staging' || env === 'stage')
            return 'staging';
        return 'development';
    }
    static isProduction() {
        return this.getCurrentEnvironment() === 'production';
    }
    static isStaging() {
        return this.getCurrentEnvironment() === 'staging';
    }
    static assertNoChaosInProduction() {
        productionSafetyGuard_1.ProductionSafetyGuard.assertSafeForProduction();
    }
    static assertSafeForProduction() {
        productionSafetyGuard_1.ProductionSafetyGuard.assertSafeForProduction();
    }
}
exports.EnvironmentConfig = EnvironmentConfig;
