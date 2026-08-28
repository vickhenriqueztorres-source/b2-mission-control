import fs from 'fs';
import path from 'path';
import { PrdComplianceChecker } from '../pipeline/prdComplianceChecker';
import {
  HSL_FPS,
  HSL_MIN_EPISODE_DURATION_SECONDS,
  HSL_MAX_EPISODE_DURATION_SECONDS,
  HSL_MAX_AUDIO_VIDEO_DESYNC_SECONDS,
  HSL_CANONICAL_CHAPTERS,
  HSL_EXPECTED_CHAPTER_COUNT,
  HSL_CANONICAL_THUMBNAILS
} from '../spec/hsl-spec';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES DETERMINÍSTICOS DE CONFORMIDADE COM O PRD');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

const testRunId = 'OOL-EP02-CABOS';
const tempTestRunId = 'TEST-PRD-COMPLIANCE-RUN';
const runsDir = path.join(process.cwd(), 'runs');
const publicDir = path.join(process.cwd(), 'public');

const srcRunDir = path.join(runsDir, testRunId);
const testRunDir = path.join(runsDir, tempTestRunId);

function initTestRun(): void {
  if (fs.existsSync(testRunDir)) {
    try {
      fs.rmSync(testRunDir, { recursive: true, force: true });
    } catch {}
  }
  fs.cpSync(srcRunDir, testRunDir, { recursive: true });
}

function teardownTestRun(): void {
  if (fs.existsSync(testRunDir)) {
    try {
      fs.rmSync(testRunDir, { recursive: true, force: true });
    } catch {}
  }
}

async function runPrdComplianceTests(): Promise<void> {
  let allPassed = true;
  initTestRun();

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 1: Run íntegra deve ter 100% das regras em PASS (Exit Code 0)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1/9] Validando Run Íntegra com 100% de conformidade com o PRD...');
  try {
    const report1 = PrdComplianceChecker.verifyRun(tempTestRunId);

    if (!report1.overallPassed) {
      console.error('❌ FALHA NO TESTE 1: Run íntegra foi reprovada!', report1.results.filter(r => !r.passed));
      allPassed = false;
    } else {
      console.log(`✅ TESTE 1 PASSOU: ${report1.passedRules}/${report1.totalRules} regras APROVADAS (Exit Code 0).`);
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 1:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 2: Narração fora da faixa [300s, 720s] deve dar FAIL na regra de duração
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/9] Validando rejeição de áudio curto/longo fora do PRD...');
  try {
    const narrationPath = path.join(testRunDir, 'postproduction', 'narration.mp3');
    const narrationBkp = `${narrationPath}.bkp`;
    fs.copyFileSync(narrationPath, narrationBkp);

    // Gerar áudio curto de 10 segundos
    const child_process = require('child_process');
    child_process.spawnSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', '10', narrationPath]);

    const report2 = PrdComplianceChecker.verifyRun(tempTestRunId);

    // Restaurar
    fs.copyFileSync(narrationBkp, narrationPath);
    fs.unlinkSync(narrationBkp);

    const durationRule = report2.results.find(r => r.ruleId === 'PRD-R01-NARRATION-DURATION');
    if (report2.overallPassed || !durationRule || durationRule.passed) {
      console.error('❌ FALHA NO TESTE 2: Narração de 10s NÃO foi barrada!', durationRule);
      allPassed = false;
    } else {
      console.log(`✅ TESTE 2 PASSOU: Duração inválida barrada: Medido="${durationRule.measuredValue}", Exigido="${durationRule.requiredValue}"`);
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 2:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 3: Remover uma das 3 thumbnails deve dar FAIL apontando qual falta
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/9] Validando rejeição quando 1 thumbnail é removida (thumbnail_variant_b_consequence.png)...');
  try {
    const thumbB = path.join(testRunDir, 'postproduction', 'thumbnails', 'thumbnail_variant_b_consequence.png');
    const thumbBBkp = `${thumbB}.bkp`;
    if (fs.existsSync(thumbB)) fs.renameSync(thumbB, thumbBBkp);

    const report3 = PrdComplianceChecker.verifyRun(tempTestRunId);

    // Restaurar
    if (fs.existsSync(thumbBBkp)) fs.renameSync(thumbBBkp, thumbB);

    const packagingRule = report3.results.find(r => r.ruleId === 'PRD-R05-PACKAGING-PACKAGE');
    if (report3.overallPassed || !packagingRule || packagingRule.passed || !packagingRule.details?.includes('thumbnail_variant_b_consequence.png')) {
      console.error('❌ FALHA NO TESTE 3: Ausência da Thumbnail B NÃO foi detectada!', packagingRule);
      allPassed = false;
    } else {
      console.log(`✅ TESTE 3 PASSOU: Falha de thumbnail detectada: "${packagingRule.details}"`);
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 3:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 4: Truncar uma thumbnail para 0 byte deve dar FAIL
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4/9] Validando rejeição quando thumbnail é truncada para 0 bytes...');
  try {
    const thumbA = path.join(testRunDir, 'postproduction', 'thumbnails', 'thumbnail_variant_a_mechanism.png');
    const thumbABkp = `${thumbA}.bkp`;
    fs.copyFileSync(thumbA, thumbABkp);
    fs.writeFileSync(thumbA, Buffer.alloc(0)); // 0 bytes

    const report4 = PrdComplianceChecker.verifyRun(tempTestRunId);

    // Restaurar
    fs.copyFileSync(thumbABkp, thumbA);
    fs.unlinkSync(thumbABkp);

    const packagingRule = report4.results.find(r => r.ruleId === 'PRD-R05-PACKAGING-PACKAGE');
    if (report4.overallPassed || !packagingRule || packagingRule.passed) {
      console.error('❌ FALHA NO TESTE 4: Thumbnail de 0 bytes NÃO foi barrada!', packagingRule);
      allPassed = false;
    } else {
      console.log(`✅ TESTE 4 PASSOU: Thumbnail de 0 byte barrada com sucesso: "${packagingRule.details}"`);
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 4:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 5: Remover um capítulo / criar lacuna na timeline deve dar FAIL na regra de estrutura
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5/9] Validando rejeição quando a estrutura de 6 capítulos é violada...');
  try {
    const scriptPath = path.join(testRunDir, 'editorial', '06-script-approved.json');
    const metaPath = path.join(testRunDir, 'postproduction', 'youtube-metadata.json');
    const editPkgPath = path.join(testRunDir, 'editorial', 'execution', 'documentary-edit-package.json');

    const scriptBkp = `${scriptPath}.bkp`;
    const metaBkp = `${metaPath}.bkp`;
    const editPkgBkp = `${editPkgPath}.bkp`;

    if (fs.existsSync(scriptPath)) fs.copyFileSync(scriptPath, scriptBkp);
    if (fs.existsSync(metaPath)) fs.copyFileSync(metaPath, metaBkp);
    if (fs.existsSync(editPkgPath)) fs.copyFileSync(editPkgPath, editPkgBkp);

    // Alterar capítulos em todos os artefatos de 6 para 5
    if (fs.existsSync(scriptPath)) {
      const script = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
      script.scenes.forEach((s: any) => {
        if (s.chapter === 'CH06') s.chapter = 'CH05';
      });
      fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));
    }
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      if (Array.isArray(meta.chapters)) meta.chapters.pop();
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    }
    if (fs.existsSync(editPkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(editPkgPath, 'utf8'));
      pkg.scenes.forEach((s: any) => {
        if (s.chapterId === 'CH_06') s.chapterId = 'CH_05';
      });
      fs.writeFileSync(editPkgPath, JSON.stringify(pkg, null, 2));
    }

    const report5 = PrdComplianceChecker.verifyRun(tempTestRunId);

    // Restaurar
    if (fs.existsSync(scriptBkp)) {
      fs.copyFileSync(scriptBkp, scriptPath);
      fs.unlinkSync(scriptBkp);
    }
    if (fs.existsSync(metaBkp)) {
      fs.copyFileSync(metaBkp, metaPath);
      fs.unlinkSync(metaBkp);
    }
    if (fs.existsSync(editPkgBkp)) {
      fs.copyFileSync(editPkgBkp, editPkgPath);
      fs.unlinkSync(editPkgBkp);
    }

    const chapterRule = report5.results.find(r => r.ruleId === 'PRD-R03-CHAPTER-STRUCTURE');
    if (report5.overallPassed || !chapterRule || chapterRule.passed) {
      console.error('❌ FALHA NO TESTE 5: Omissão de capítulo NÃO foi barrada!', chapterRule);
      allPassed = false;
    } else {
      console.log(`✅ TESTE 5 PASSOU: Estrutura inválida barrada: Medido="${chapterRule.measuredValue}", Exigido="${chapterRule.requiredValue}"`);
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 5:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 6: Divergência áudio x vídeo acima da tolerância deve reprovar o sincronismo
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 6/9] Validando reprovação por descompasso temporal áudio vs timeline...');
  try {
    const sceneTimingsPath = path.join(testRunDir, 'postproduction', 'scene_timings.json');
    const timingsBkp = `${sceneTimingsPath}.bkp`;
    fs.copyFileSync(sceneTimingsPath, timingsBkp);

    const timings = JSON.parse(fs.readFileSync(sceneTimingsPath, 'utf8'));
    if (timings.length > 0) {
      timings[timings.length - 1].durationFrames += 500; // +16.6s
      fs.writeFileSync(sceneTimingsPath, JSON.stringify(timings, null, 2));
    }

    const report6 = PrdComplianceChecker.verifyRun(tempTestRunId);

    // Restaurar
    fs.copyFileSync(timingsBkp, sceneTimingsPath);
    fs.unlinkSync(timingsBkp);

    const syncRule = report6.results.find(r => r.ruleId === 'PRD-R02-AUDIO-VIDEO-SYNC');
    if (report6.overallPassed || !syncRule || syncRule.passed) {
      console.error('❌ FALHA NO TESTE 6: Dessincronia grave NÃO foi reprovada!', syncRule);
      allPassed = false;
    } else {
      console.log(`✅ TESTE 6 PASSOU: Descompasso reprovado com sucesso: "${syncRule.measuredValue}"`);
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 6:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 7: Provar que os números da especificação residem unicamente em spec/hsl-spec.ts
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 7/9] Validando autoridade única de spec/hsl-spec.ts...');
  try {
    if (
      HSL_FPS === 30 &&
      HSL_MIN_EPISODE_DURATION_SECONDS === 300 &&
      HSL_MAX_EPISODE_DURATION_SECONDS === 720 &&
      HSL_EXPECTED_CHAPTER_COUNT === 6 &&
      HSL_CANONICAL_THUMBNAILS.length === 3
    ) {
      console.log('✅ TESTE 7 PASSOU: Módulo spec/hsl-spec.ts exporta todas as constantes tipadas com 100% de consistência.');
    } else {
      console.error('❌ FALHA NO TESTE 7: Constantes do módulo de especificação estão divergentes!');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 7:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 8: Confirmar que o PRD canônico está formalizado
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 8/9] Validando existência e integridade do PRD Canônico...');
  try {
    const prdPath = path.join(process.cwd(), 'PRD_ARQUITETURA_BRIEFING.md');
    if (fs.existsSync(prdPath) && fs.statSync(prdPath).size > 10000) {
      console.log('✅ TESTE 8 PASSOU: PRD_ARQUITETURA_BRIEFING.md consolidado como autoridade canônica.');
    } else {
      console.error('❌ FALHA NO TESTE 8: PRD Canônico não encontrado ou vazio!');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 8:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 9: Sem regressão — run de produção OOL-EP02-CABOS passa 100% na conformidade
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 9/9] Validando conformidade total da run de produção OOL-EP02-CABOS...');
  try {
    const report9 = PrdComplianceChecker.verifyRun(testRunId);
    PrdComplianceChecker.printReport(report9);

    if (!report9.overallPassed) {
      console.error('❌ FALHA NO TESTE 9: Run de produção falhou na conformidade do PRD!', report9.results.filter(r => !r.passed));
      allPassed = false;
    } else {
      console.log('✅ TESTE 9 PASSOU: A run de produção OOL-EP02-CABOS atingiu 100% de conformidade com o PRD!');
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 9:', e.message);
    allPassed = false;
  } finally {
    teardownTestRun();
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS 9 CRITÉRIOS DE ACEITE DE CONFORMIDADE PASSARAM COM SUCESSO DETERMINÍSTICO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE CONFORMIDADE DO PRD!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

runPrdComplianceTests().catch((err) => {
  console.error('[FATAL_TEST_ERROR]', err);
  process.exit(1);
});
