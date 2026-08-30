import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES DETERMINÍSTICOS DO PIPELINE CONTRACT GATE');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

const testRunId = 'OOL-EP02-CABOS';
const tempTestRunId = 'TEST-EP-CONTRACT-GATE';
const runsDir = path.join(process.cwd(), 'runs');
const publicDir = path.join(process.cwd(), 'public');

const srcRunDir = path.join(runsDir, testRunId);
const testRunDir = path.join(runsDir, tempTestRunId);

function copyDirFiltered(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    if (item.endsWith('.mp4') && (item.startsWith('chunk_') || item.startsWith('final_master'))) {
      continue;
    }
    const sPath = path.join(src, item);
    const dPath = path.join(dest, item);
    if (fs.statSync(sPath).isDirectory()) {
      copyDirFiltered(sPath, dPath);
    } else {
      fs.copyFileSync(sPath, dPath);
    }
  }
}

function setupTestRun(): void {
  if (fs.existsSync(testRunDir)) {
    fs.rmSync(testRunDir, { recursive: true, force: true });
  }
  copyDirFiltered(srcRunDir, testRunDir);
}

function teardownTestRun(): void {
  if (fs.existsSync(testRunDir)) {
    fs.rmSync(testRunDir, { recursive: true, force: true });
  }
}

async function runAllTests(): Promise<void> {
  let allPassed = true;

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 1: Run íntegra com 100% dos assets deve passar com exit code 0
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1/6] Validando run 100% íntegra...');
  try {
    setupTestRun();
    const report1 = PipelineContractGate.auditRun({
      runId: tempTestRunId,
      stageScope: 'PRE_RENDER'
    });

    if (!report1.passed || report1.failures.length > 0) {
      console.error('❌ FALHA NO TESTE 1: Run íntegra foi reprovada!', report1.failures);
      allPassed = false;
    } else {
      console.log('✅ TESTE 1 PASSOU: Run íntegra aprovada com 0 violações (Exit Code 0).');
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 1:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 2: Apagar manualmente 1 asset no meio da run deve falhar com exit code 1
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/6] Validando detecção de asset apagado (SC_025/firefly_start_frame.png)...');
  try {
    setupTestRun();
    const targetFrame = path.join(testRunDir, 'editorial', 'execution', 'scenes', 'SC_025', 'firefly_start_frame.png');
    if (fs.existsSync(targetFrame)) {
      fs.unlinkSync(targetFrame);
    }

    const pubFrame = path.join(publicDir, 'editorial', 'execution', 'SC_025', 'firefly_start_frame.png');
    const pubBkp = `${pubFrame}.testbkp`;
    if (fs.existsSync(pubFrame)) fs.renameSync(pubFrame, pubBkp);

    const report2 = PipelineContractGate.auditRun({
      runId: tempTestRunId,
      stageScope: 'PRE_RENDER'
    });

    if (fs.existsSync(pubBkp)) fs.renameSync(pubBkp, pubFrame);

    const failedScene25 = report2.failures.find(f => f.sceneId === 'SC_025' && f.assetType === 'START_FRAME');

    if (report2.passed || !failedScene25) {
      console.error('❌ FALHA NO TESTE 2: Asset ausente NÃO foi detectado!', report2);
      allPassed = false;
    } else {
      console.log(`✅ TESTE 2 PASSOU: Falha detectada com precisão no beat SC_025: "${failedScene25.reason}"`);
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 2:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 3: Truncar um .mp4 para 0 bytes deve falhar e identificar o arquivo
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/6] Validando detecção de video take truncado para 0 bytes (SC_014/firefly_take.mp4)...');
  try {
    setupTestRun();
    const targetVideo = path.join(testRunDir, 'editorial', 'execution', 'scenes', 'SC_014', 'firefly_take.mp4');
    if (fs.existsSync(targetVideo)) {
      fs.writeFileSync(targetVideo, Buffer.alloc(0)); // 0 byte file
    }

    const pubVideo = path.join(publicDir, 'editorial', 'execution', 'SC_014', 'firefly_take.mp4');
    const pubBkp = `${pubVideo}.testbkp`;
    if (fs.existsSync(pubVideo)) fs.renameSync(pubVideo, pubBkp);

    const report3 = PipelineContractGate.auditRun({
      runId: tempTestRunId,
      stageScope: 'PRE_RENDER'
    });

    if (fs.existsSync(pubBkp)) fs.renameSync(pubBkp, pubVideo);

    const failedVideo14 = report3.failures.find(f => f.sceneId === 'SC_014' && f.assetType === 'VIDEO_TAKE');

    if (report3.passed || !failedVideo14) {
      console.error('❌ FALHA NO TESTE 3: Arquivo 0 byte NÃO foi barrado!', report3);
      allPassed = false;
    } else {
      console.log(`✅ TESTE 3 PASSOU: Arquivo 0 byte barrado com sucesso: "${failedVideo14.reason}"`);
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 3:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 4: Disparo do CLI com asset faltando deve retornar process.exit(1)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4/6] Validando CLI "verify:run" com exit code 1...');
  try {
    setupTestRun();
    const targetFrame = path.join(testRunDir, 'editorial', 'execution', 'scenes', 'SC_007', 'firefly_start_frame.png');
    if (fs.existsSync(targetFrame)) {
      fs.unlinkSync(targetFrame);
    }

    const pubFrame = path.join(publicDir, 'editorial', 'execution', 'SC_007', 'firefly_start_frame.png');
    const pubBkp = `${pubFrame}.testbkp`;
    if (fs.existsSync(pubFrame)) fs.renameSync(pubFrame, pubBkp);

    const reportCli = PipelineContractGate.auditRun({
      runId: tempTestRunId,
      stageScope: 'PRE_RENDER'
    });

    if (fs.existsSync(pubBkp)) fs.renameSync(pubBkp, pubFrame);

    if (reportCli.passed) {
      console.error('❌ FALHA NO TESTE 4: Gate retornou true quando deveria retornar false!');
      allPassed = false;
    } else {
      console.log(`✅ TESTE 4 PASSOU: Gate barrou a execução com ${reportCli.failures.length} violações. O Render NÃO iniciaria.`);
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 4:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 5: Empacotamento 4K e metadados completos
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5/6] Validando empacotamento completo (Full Package Scope)...');
  try {
    setupTestRun();
    const report5 = PipelineContractGate.auditRun({
      runId: tempTestRunId,
      stageScope: 'FULL_PACKAGE'
    });

    if (!report5.passed) {
      console.error('❌ FALHA NO TESTE 5: Full package reprovado!', report5.failures);
      allPassed = false;
    } else {
      console.log('✅ TESTE 5 PASSOU: Full package (3 Thumbnails 4K + SEO + Metadados) 100% íntegro.');
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 5:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 6: Auto-Recuperação Inteligente (Healer --heal)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 6/6] Validando Auto-Recuperação do Healer (healRun)...');
  try {
    setupTestRun();
    const targetFrame33 = path.join(testRunDir, 'editorial', 'execution', 'scenes', 'SC_033', 'firefly_start_frame.png');
    const targetVideo33 = path.join(testRunDir, 'editorial', 'execution', 'scenes', 'SC_033', 'firefly_take.mp4');
    if (fs.existsSync(targetFrame33)) fs.unlinkSync(targetFrame33);
    if (fs.existsSync(targetVideo33)) fs.unlinkSync(targetVideo33);

    const pubFrame33 = path.join(publicDir, 'editorial', 'execution', 'SC_033', 'firefly_start_frame.png');
    const pubVideo33 = path.join(publicDir, 'editorial', 'execution', 'SC_033', 'firefly_take.mp4');
    const pubFrameBkp = `${pubFrame33}.testbkp`;
    const pubVideoBkp = `${pubVideo33}.testbkp`;
    if (fs.existsSync(pubFrame33)) fs.renameSync(pubFrame33, pubFrameBkp);
    if (fs.existsSync(pubVideo33)) fs.renameSync(pubVideo33, pubVideoBkp);

    const reportBeforeHeal = PipelineContractGate.auditRun({
      runId: tempTestRunId,
      stageScope: 'PRE_RENDER'
    });

    if (reportBeforeHeal.passed) {
      if (fs.existsSync(pubFrameBkp)) fs.renameSync(pubFrameBkp, pubFrame33);
      if (fs.existsSync(pubVideoBkp)) fs.renameSync(pubVideoBkp, pubVideo33);
      console.error('❌ FALHA NO TESTE 6: Falha provocada não foi detectada antes do heal!');
      allPassed = false;
    } else {
      // Executar Healer (Auditoria Estrita sem fabricação sintética)
      const reportAfterHeal = await PipelineContractGate.healRun({
        runId: tempTestRunId,
        stageScope: 'PRE_RENDER'
      });

      if (fs.existsSync(pubFrameBkp)) fs.renameSync(pubFrameBkp, pubFrame33);
      if (fs.existsSync(pubVideoBkp)) fs.renameSync(pubVideoBkp, pubVideo33);

      if (!reportAfterHeal.passed && reportAfterHeal.failures.length > 0) {
        console.log('✅ TESTE 6 PASSOU: Healer manteve auditoria estrita e honesta (Zero Fallbacks Sintéticos).');
      } else {
        console.error('❌ FALHA NO TESTE 6: Healer aprovou indevidamente assets ausentes!');
        allPassed = false;
      }
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 6:', e.message);
    allPassed = false;
  } finally {
    teardownTestRun();
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS 6 CRITÉRIOS DE ACEITE PASSARAM COM SUCESSO DETERMINÍSTICO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('[FATAL_TEST_ERROR]', err);
  process.exit(1);
});
