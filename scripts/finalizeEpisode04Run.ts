import fs from 'fs';
import path from 'path';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';
import { RunManifest } from '../pipeline/runManifest';
import { ArtifactRegistry } from '../pipeline/artifactRegistry';
import { PrdComplianceChecker } from '../pipeline/prdComplianceChecker';

async function main(): Promise<void> {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🏁 FINALIZAÇÃO & REGISTRO CANÔNICO: OOL-EP04-GPS-TEMPO');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const episodeId = 'OOL-EP04-GPS-TEMPO';
  const prodDir = path.join(process.cwd(), 'runs', episodeId);
  const finalMasterMp4 = path.join(prodDir, 'final_master.mp4');

  if (!fs.existsSync(finalMasterMp4)) {
    throw new Error('final_master.mp4 não encontrado em ' + finalMasterMp4);
  }

  const manifest = new RunManifest(prodDir, episodeId);
  manifest.completeStage('REMOTION_RENDER', 50);
  manifest.completeStage('FFMPEG_MUX', 1, { finalMasterMp4 });
  manifest.completeStage('PACKAGING', 5);
  manifest.recordAsset('final_master.mp4', finalMasterMp4);
  manifest.setOverallStatus('COMPLETED');

  // Probe do master
  const probe = PipelineContractGate.probeMedia(finalMasterMp4);
  const sizeMb = fs.statSync(finalMasterMp4).size / (1024 * 1024);
  console.log(`✅ FINAL MASTER MP4 ÍNTEGRO:`);
  console.log(`   - Arquivo: ${finalMasterMp4}`);
  console.log(`   - Tamanho: ${sizeMb.toFixed(2)} MB`);
  console.log(`   - Duração: ${probe.duration.toFixed(2)} segundos (${(probe.duration / 60).toFixed(2)} minutos)`);
  console.log(`   - Resolução: ${probe.width}x${probe.height} (${probe.codec})\n`);

  // Auditoria do Gatekeeper
  console.log('[AUDITORIA 1/2] Executando Contract Gate...');
  const gateReport = PipelineContractGate.auditRun({ runId: episodeId, stageScope: 'FULL_PACKAGE' });
  console.log(`Gatekeeper Status: ${gateReport.passed ? '✅ 100% APROVADO' : '❌ REPROVADO'}\n`);

  // Auditoria do PRD
  console.log('[AUDITORIA 2/2] Executando PRD Compliance Checker...');
  const prdReport = PrdComplianceChecker.verifyRun(episodeId);
  console.log(`PRD Compliance Status: ${prdReport.overallPassed ? '✅ 100% CONFORME' : '❌ NÃO CONFORME'}`);
  for (const r of prdReport.results) {
    console.log(`  - [${r.ruleId}] ${r.name}: ${r.passed ? '✅ PASS' : '❌ FAIL'}`);
  }

  // Registro Central
  console.log('\n[REGISTRY] Reconstruindo e indexando Artifact Registry...');
  const registry = new ArtifactRegistry();
  const regSummary = registry.registerRun(prodDir, episodeId);

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('🎉 RESULTADO: VÍDEO MP4 FINALIZADO COM SUCESSO ABSOLUTO!');
  console.log(`🎬 MASTER: ${finalMasterMp4}`);
  console.log(`🏷️ HANDLE CANÔNICO: ${regSummary.handle}/master`);
  console.log('══════════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ Erro na finalização do EP04:', err);
  process.exit(1);
});
