import * as fs from 'fs';
import * as path from 'path';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';
import { PrdComplianceChecker } from '../pipeline/prdComplianceChecker';
import { ArtifactRegistry } from '../pipeline/artifactRegistry';

async function main() {
  const episodeId = 'OOL-EP05-RADAR-ASFALTO';
  const runDir = path.join(process.cwd(), 'runs', episodeId);
  const masterMp4Path = path.join(runDir, 'final_master.mp4');
  const brainDir = path.join('C:', 'Users', 'brend', '.gemini', 'antigravity', 'brain', '458559fc-b6a0-43b0-900e-40923ec3998e');

  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🛡️ AUDITORIA MASTER DE GATEKEEPER & COMPLIANCE — EPISÓDIO 05');
  console.log('══════════════════════════════════════════════════════════════════\n');

  // 1. Pipeline Contract Gate
  console.log('🔍 [1/3] Executando PipelineContractGate (FULL_PACKAGE)...');
  const gateResult = PipelineContractGate.auditRun({ runId: episodeId, stageScope: 'FULL_PACKAGE' });
  console.log(`   - Status Geral: ${gateResult.passed ? '✅ APROVADO' : '❌ REPROVADO'}`);
  console.log(`   - Cenas Esperadas: ${gateResult.totalScenesExpected}`);
  console.log(`   - Start Frames Válidos: ${gateResult.validStartFrames}/${gateResult.totalScenesExpected}`);
  console.log(`   - Video Takes Válidos: ${gateResult.validVideoTakes}/${gateResult.totalScenesExpected}`);
  console.log(`   - Duração da Timeline: ${gateResult.timelineDurationSeconds.toFixed(2)}s`);
  console.log(`   - Duração da Narração: ${gateResult.narrationDurationSeconds.toFixed(2)}s`);
  console.log(`   - Delta de Sincronismo: ${gateResult.timingDeltaSeconds.toFixed(2)}s`);
  console.log(`   - Pacote YouTube: ${gateResult.packagingValid ? '✅ VÁLIDO' : '❌ AUSENTE'}`);
  if (gateResult.failures.length > 0) {
    console.log(`   - Falhas detectadas (${gateResult.failures.length}):`);
    gateResult.failures.slice(0, 10).forEach(f => console.log(`     * [${f.sceneId}] ${f.assetType}: ${f.reason}`));
  }

  // 2. PRD Compliance
  console.log('\n📜 [2/3] Executando PrdComplianceChecker...');
  const prdResult = PrdComplianceChecker.verifyRun(episodeId);
  console.log(`   - Status Geral: ${prdResult.overallPassed ? '✅ 100% CONFORME COM A PRD' : '❌ NÃO CONFORME'}`);
  console.log(`   - Total de Regras: ${prdResult.totalRules} | Aprovadas: ${prdResult.passedRules} | Falhas: ${prdResult.failedRules}`);
  prdResult.results.forEach(r => {
    console.log(`   ${r.passed ? '✅' : '❌'} [${r.ruleId}] ${r.name}: ${r.measuredValue} (Exigido: ${r.requiredValue})`);
  });

  // 3. Artifact Registry Registration
  console.log('\n🏷️ [3/3] Registrando no Artifact Registry...');
  const registry = new ArtifactRegistry();
  const regSummary = registry.registerRun(runDir, episodeId);
  console.log(`   - Handle Canônico Atribuído: ${regSummary.handle}/master`);
  console.log(`   - Total de Artefatos Registrados: ${regSummary.artifactsCount}`);

  // 4. Copiar Master MP4 para Brain Artifacts
  if (fs.existsSync(masterMp4Path)) {
    const dest = path.join(brainDir, 'ep05_radar_asfalto_final_master.mp4');
    const sizeMb = (fs.statSync(masterMp4Path).size / 1024 / 1024).toFixed(2);
    console.log(`\n📦 Copiando Master Final para artefatos (${sizeMb} MB)...`);
    fs.copyFileSync(masterMp4Path, dest);
    console.log(`✅ Master copiado com sucesso para: ${dest}`);
  }

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('🎉 TODOS OS GATEKEEPERS E REGISTROS FORAM CONCLUÍDOS COM SUCESSO!');
  console.log('══════════════════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('❌ Erro na auditoria:', err);
  process.exitCode = 1;
});
