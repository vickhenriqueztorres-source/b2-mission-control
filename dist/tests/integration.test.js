"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../database/db");
const productionRunner_1 = require("../orchestrator/productionRunner");
const stateMachine_1 = require("../orchestrator/stateMachine");
const motionToFirefly_1 = require("../production-bridge/motionToFirefly");
const fireflyToIntake_1 = require("../production-bridge/fireflyToIntake");
async function runTests() {
    console.log('============================================================');
    console.log('SUÍTE DE TESTES DE INTEGRAÇÃO — B2 MISSION CONTROL');
    console.log('============================================================\n');
    const ajv = new ajv_1.default({ allErrors: true });
    (0, ajv_formats_1.default)(ajv);
    // 1. Validar Schemas JSON
    console.log('[TESTE 1] Carregando e validando esquemas em shared-contracts/...');
    const contractsDir = path_1.default.resolve(__dirname, '../../shared-contracts');
    const schemaFiles = [
        'production.schema.json',
        'generation-request.schema.json',
        'generation-result.schema.json',
        'agent-event.schema.json',
        'artifact.schema.json'
    ];
    for (const file of schemaFiles) {
        const filePath = path_1.default.join(contractsDir, file);
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error(`FALHA NO TESTE: Arquivo de schema não encontrado: ${filePath}`);
        }
        const schemaObj = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
        ajv.addSchema(schemaObj, file);
        console.log(`  ✓ Schema ${file} carregado e compilado com sucesso.`);
    }
    // 2. Testar Máquina de Estados Global e Bloqueios
    console.log('\n[TESTE 2] Testando Máquina de Estados e bloqueios de transição...');
    const testProdId = 'test-prod-uuid-0000-1111';
    // Inserir registro no SQLite para satisfazer Foreign Keys de eventos
    const db = (0, db_1.getDatabase)();
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO productions (production_id, project_name, status)
    VALUES (?, 'Rafa Lobo Test', 'IDLE')
  `);
    stmt.run(testProdId);
    const sm = new stateMachine_1.ProductionStateMachine(testProdId, 'IDLE');
    sm.transitionTo('BRIEFING_RECEIVED');
    sm.transitionTo('RAFA_LOBO_PRE_KLING_RUNNING');
    sm.transitionTo('MOTION_PACKAGE_READY');
    try {
        // Tentar transição inválida (pular direto para FINAL_VIDEO_RENDERED)
        sm.transitionTo('FINAL_VIDEO_RENDERED');
        throw new Error('ERRO: A máquina de estados deveria ter bloqueado a transição inválida!');
    }
    catch (err) {
        if (err.message.includes('INVALID_STATE_TRANSITION')) {
            console.log('  ✓ Bloqueio de transição inválida funcionou perfeitamente.');
        }
        else {
            throw err;
        }
    }
    // 3. Testar Production Bridge (Conversores)
    console.log('\n[TESTE 3] Testando Production Bridge (Kling Motion Package -> Firefly Guide -> Intake)...');
    const tempDir = path_1.default.resolve(__dirname, '../runs/test_run');
    if (!fs_1.default.existsSync(tempDir)) {
        fs_1.default.mkdirSync(tempDir, { recursive: true });
    }
    const sampleMotionPackage = path_1.default.join(tempDir, 'kling_package.json');
    const sampleFireflyGuide = path_1.default.join(tempDir, 'firefly_guide.json');
    const sampleIntakeManifest = path_1.default.join(tempDir, 'intake_manifest.json');
    fs_1.default.writeFileSync(sampleMotionPackage, JSON.stringify([
        {
            shot_id: 'SHOT_01',
            take_id: 'TAKE_01',
            prompt: 'Prompt de teste de animação',
            start_frame_path: path_1.default.join(tempDir, 'frame1.png')
        }
    ], null, 2));
    const guide = motionToFirefly_1.MotionToFireflyBridge.convert(sampleMotionPackage, sampleFireflyGuide);
    console.log(`  ✓ MotionToFireflyBridge converteu ${guide.length} item(ns).`);
    const intake = fireflyToIntake_1.FireflyToIntakeBridge.convert(testProdId, [
        {
            name: 'SHOT_REAL_E2E_001_TAKE_01',
            output_path: 'C:\\B2-AI-STUDIO\\links\\firefly-automation\\saida\\SHOT_REAL_E2E_001_TAKE_01.mp4'
        }
    ], sampleIntakeManifest);
    console.log(`  ✓ FireflyToIntakeBridge gerou manifesto de clipe único em: ${intake.video_path}.`);
    // 4. Executar Ciclo Completo End-to-End
    console.log('\n[TESTE 4] Executando ciclo completo no ProductionRunner...');
    const runner = new productionRunner_1.ProductionRunner();
    await runner.initialize();
    const result = await runner.runFullProduction('Briefing Oficial de Validação do B2 Mission Control');
    if (result.success && fs_1.default.existsSync(result.finalVideoPath)) {
        console.log(`  ✓ Ciclo End-to-End concluído com SUCESSO! Vídeo gerado em: ${result.finalVideoPath}`);
    }
    else {
        throw new Error('FALHA NO TESTE: O ciclo End-to-End não produziu o vídeo final esperado.');
    }
    console.log('\n============================================================');
    console.log('TODOS OS TESTES DE INTEGRAÇÃO PASSARAM COM 100% DE SUCESSO!');
    console.log('============================================================');
}
runTests().catch((err) => {
    console.error('\n❌ FALHA NOS TESTES DE INTEGRAÇÃO:', err);
    process.exit(1);
});
