"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionRunner = void 0;
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../database/db");
const stateMachine_1 = require("./stateMachine");
const motionToFirefly_1 = require("../production-bridge/motionToFirefly");
const fireflyToIntake_1 = require("../production-bridge/fireflyToIntake");
const rafaLoboAdapter_1 = require("../adapters/rafaLoboAdapter");
const fireflyAdapter_1 = require("../adapters/fireflyAdapter");
const antigravityAdapter_1 = require("../adapters/antigravityAdapter");
const codexAdapter_1 = require("../adapters/codexAdapter");
const logger_1 = require("../event-hub/logger");
const productionSafetyGuard_1 = require("../config/productionSafetyGuard");
class ProductionRunner {
    rafaAdapter;
    fireflyAdapter;
    builderAdapter;
    reviewerAdapter;
    constructor() {
        this.rafaAdapter = new rafaLoboAdapter_1.RafaLoboAdapter();
        this.fireflyAdapter = new fireflyAdapter_1.FireflyAdapter();
        this.builderAdapter = new antigravityAdapter_1.AntigravityAdapter();
        this.reviewerAdapter = new codexAdapter_1.CodexAdapter();
    }
    async initialize() {
        productionSafetyGuard_1.ProductionSafetyGuard.assertSafeForProduction();
        await this.rafaAdapter.initialize();
        await this.fireflyAdapter.initialize();
        await this.builderAdapter.initialize();
        await this.reviewerAdapter.initialize();
    }
    async runFullProduction(briefingText) {
        productionSafetyGuard_1.ProductionSafetyGuard.assertSafeForProduction();
        const productionId = crypto_1.default.randomUUID();
        logger_1.Logger.info('ProductionRunner', `Iniciando Produção Completa. GUID: ${productionId}`);
        // Inserir registro inicial da produção no SQLite WAL
        const db = (0, db_1.getDatabase)();
        const stmt = db.prepare(`
      INSERT INTO productions (production_id, project_name, status, current_step, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
        stmt.run(productionId, 'Rafa Lobo', 'IDLE', 1);
        const sm = new stateMachine_1.ProductionStateMachine(productionId, 'IDLE');
        try {
            // Step 1: Submeter briefing
            sm.transitionTo('BRIEFING_RECEIVED', { briefing: briefingText });
            // Step 2: Executar Fase 1 do Rafa Lobo
            sm.transitionTo('RAFA_LOBO_PRE_KLING_RUNNING');
            const phase1Result = await this.rafaAdapter.runPhase1(productionId, briefingText);
            // Step 3: Motion Package Pronto (Trava de Handoff Manual 20 atingida)
            sm.transitionTo('MOTION_PACKAGE_READY', { motionPackagePath: phase1Result.motionPackagePath });
            // Step 4: Converter para Guia do Firefly via Production Bridge
            sm.transitionTo('FIREFLY_INGESTION_PENDING');
            const prodDir = path_1.default.join('C:\\B2-AI-STUDIO\\productions', productionId);
            const fireflyGuidePath = path_1.default.join(prodDir, 'firefly_production_guide.json');
            motionToFirefly_1.MotionToFireflyBridge.convert(phase1Result.motionPackagePath, fireflyGuidePath);
            // Step 5: Executar geração de vídeos no Firefly
            sm.transitionTo('FIREFLY_GENERATION_RUNNING');
            const fireflyResult = await this.fireflyAdapter.feedGuideAndRun(productionId, fireflyGuidePath);
            // Step 6: Conclusão do Firefly
            sm.transitionTo('FIREFLY_GENERATION_COMPLETED');
            // Step 7: Converter mídias para Manifesto de Ingestão da Fase 3 do Rafa Lobo
            sm.transitionTo('RAFA_LOBO_POST_KLING_RUNNING');
            const intakeManifestPath = path_1.default.join(prodDir, 'manual_kling_clip_intake.json');
            fireflyToIntake_1.FireflyToIntakeBridge.convert(productionId, fireflyResult.completedJobs, intakeManifestPath);
            // Step 8: Executar Fase 3 do Rafa Lobo
            const phase3Result = await this.rafaAdapter.runPhase3(productionId, intakeManifestPath);
            // Step 9: Render Final de Vídeo concluído!
            sm.transitionTo('FINAL_VIDEO_RENDERED', { finalVideoPath: phase3Result.finalVideoPath });
            logger_1.Logger.info('ProductionRunner', `SUCESSO TOTAL! Vídeo renderizado e publicado em: ${phase3Result.finalVideoPath}`);
            return {
                success: true,
                productionId,
                finalVideoPath: phase3Result.finalVideoPath
            };
        }
        catch (err) {
            logger_1.Logger.error('ProductionRunner', `FALHA NA PRODUÇÃO ${productionId}: ${err.message}`);
            try {
                sm.transitionTo('PRODUCTION_FAILED', { error: err.message });
            }
            catch (e) {
                // Estado de erro capturado
            }
            throw err;
        }
    }
}
exports.ProductionRunner = ProductionRunner;
// Permitir execução direta via CLI se chamado diretamente
if (require.main === module) {
    const runner = new ProductionRunner();
    runner.initialize().then(() => {
        runner.runFullProduction('Briefing de Exemplo para Teste de Integração B2 Mission Control');
    }).catch((err) => {
        console.error('Erro na execução:', err);
    });
}
