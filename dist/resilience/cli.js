"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scenarioRunner_1 = require("./scenarioRunner");
async function main() {
    const args = process.argv.slice(2);
    let scenarioId = null;
    let batchNum = null;
    let runAll = false;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--scenario' && args[i + 1]) {
            scenarioId = args[i + 1];
            i++;
        }
        else if (args[i] === '--batch' && args[i + 1]) {
            batchNum = parseInt(args[i + 1], 10);
            i++;
        }
        else if (args[i] === '--all') {
            runAll = true;
        }
    }
    console.log('====================================================================');
    console.log('🔬 B2 MISSION CONTROL — RESILIENCE LAB & CHAOS ENGINEERING');
    console.log('====================================================================\n');
    let targetScenarios = [];
    if (scenarioId) {
        targetScenarios = [scenarioId];
    }
    else if (batchNum === 1) {
        targetScenarios = ['CHAOS-001', 'CHAOS-002', 'CHAOS-003', 'CHAOS-004', 'CHAOS-005'];
    }
    else if (batchNum === 2) {
        targetScenarios = ['CHAOS-006', 'CHAOS-007', 'CHAOS-008', 'CHAOS-009', 'CHAOS-010'];
    }
    else if (runAll) {
        targetScenarios = [
            'CHAOS-001', 'CHAOS-002', 'CHAOS-003', 'CHAOS-004', 'CHAOS-005',
            'CHAOS-006', 'CHAOS-007', 'CHAOS-008', 'CHAOS-009', 'CHAOS-010',
            'CHAOS-011', 'CHAOS-012', 'CHAOS-013', 'CHAOS-014', 'CHAOS-015'
        ];
    }
    else {
        console.log('Uso: npx ts-node resilience/cli.ts [--scenario CHAOS-XXX] [--batch 1|2] [--all]');
        process.exit(1);
    }
    let totalPassed = 0;
    let totalFailed = 0;
    for (const id of targetScenarios) {
        console.log(`▶ Executando Cenário de Caos: ${id}...`);
        try {
            const res = await scenarioRunner_1.ScenarioRunner.runScenario(id);
            if (res.all_passed) {
                console.log(`  ✅ ${id}: APROVADO (PASS)`);
                totalPassed++;
            }
            else {
                console.log(`  ❌ ${id}: REPROVADO (FAIL)`);
                res.invariants.filter(i => !i.passed).forEach(i => console.log(`     - ${i.invariant}: ${i.message}`));
                totalFailed++;
            }
        }
        catch (err) {
            console.log(`  ❌ ${id}: EXCEÇÃO — ${err.message}`);
            totalFailed++;
        }
    }
    console.log('\n====================================================================');
    console.log(`RESUMO DO RESILIENCE LAB: ${totalPassed} PASSED | ${totalFailed} FAILED | TOTAL: ${targetScenarios.length}`);
    console.log('====================================================================');
    if (totalFailed > 0) {
        process.exit(1);
    }
}
main();
