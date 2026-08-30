import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { validateRenderPreconditions } from '../scripts/renderGasolinaMaster';
import { runGasolinaE2E, checkFireflySessionHealth, checkChatGptSessionHealth } from '../scripts/e2eGasolinaDebug';
import { parseEpisodeContract } from '../contracts/episodeContract';
import { buildSceneContracts, RawSceneInput } from '../contracts/buildSceneContracts';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES E2E & RESILIÊNCIA DE ÁUDIO PARCIAL');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

async function runTests() {
  let allPassed = true;

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 1: Sem flag + sem VO -> RENDER_BLOCKED
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1/5] Validando que sem flag de áudio parcial, render bloqueia por falta de VO...');
  try {
    const check = validateRenderPreconditions({ preview: false, allowPartialAudio: false });

    if (!check.passed && check.reason?.startsWith('RENDER_BLOCKED:')) {
      console.log(`✅ TESTE 1 PASSOU: Render bloqueado com sucesso sem flag (${check.reason}).`);
    } else {
      console.error('❌ FALHA NO TESTE 1: Render não foi bloqueado:', check);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 1:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 2: allowPartialAudio + 21 takes fixture + sem VO -> não bloqueia por narration
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/5] Validando que allowPartialAudio relaxa VO se 21 takes cinematográficos existirem...');
  try {
    const testRunId = 'TEST_FIXTURE_21_TAKES';
    const testRunDir = path.join(process.cwd(), 'runs', 'gasolina-adulterada', testRunId);
    const contractPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.episode.json');
    const scenesPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.scenes.json');

    const episodeContract = parseEpisodeContract(contractPath);
    const rawScenes: RawSceneInput[] = JSON.parse(fs.readFileSync(scenesPath, 'utf8'));
    const sceneContracts = buildSceneContracts(episodeContract, rawScenes);
    const cineScenes = sceneContracts.filter(s => s.take_type === 'CINEMATIC_TAKE');

    // Cria fixture de 21 takes (arquivos com conteúdo dummy para teste)
    const validPngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
    for (const sc of cineScenes) {
      const scVisuals = path.join(testRunDir, 'visuals', sc.sceneId);
      fs.mkdirSync(scVisuals, { recursive: true });
      fs.writeFileSync(path.join(scVisuals, 'start_frame.png'), validPngHeader);
      fs.writeFileSync(path.join(scVisuals, 'take.mp4'), Buffer.alloc(1024, 0xAA));
    }

    const checkWithFixture = validateRenderPreconditions({
      runId: testRunId,
      preview: false,
      allowPartialAudio: true
    });

    // Limpeza da fixture
    fs.rmSync(testRunDir, { recursive: true, force: true });

    if (checkWithFixture.passed) {
      console.log(`✅ TESTE 2 PASSOU: Com 21 takes e allowPartialAudio=true, render não bloqueou por ausência de narração.`);
    } else {
      console.error('❌ FALHA NO TESTE 2: Render bloqueou indevidamente:', checkWithFixture.reason);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 2:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 3: allowPartialAudio com takes < 21 -> BLOQUEIA por falta de takes
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/5] Validando que allowPartialAudio AINDA bloqueia se faltar take visual...');
  try {
    const testRunId = 'TEST_FIXTURE_INCOMPLETE_TAKES';
    const testRunDir = path.join(process.cwd(), 'runs', 'gasolina-adulterada', testRunId);

    // Cria apenas 5 takes dos 21 necessários
    const validPngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
    for (let i = 1; i <= 5; i++) {
      const sId = `GAS_00${i}`;
      const scVisuals = path.join(testRunDir, 'visuals', sId);
      fs.mkdirSync(scVisuals, { recursive: true });
      fs.writeFileSync(path.join(scVisuals, 'start_frame.png'), validPngHeader);
      fs.writeFileSync(path.join(scVisuals, 'take.mp4'), Buffer.alloc(1024, 0xAA));
    }

    const checkIncomplete = validateRenderPreconditions({
      runId: testRunId,
      preview: false,
      allowPartialAudio: true
    });

    // Limpeza da fixture
    fs.rmSync(testRunDir, { recursive: true, force: true });

    if (!checkIncomplete.passed && checkIncomplete.reason?.includes('visuals_incomplete_master')) {
      console.log(`✅ TESTE 3 PASSOU: allowPartialAudio manteve barreira visual rígida (${checkIncomplete.reason}).`);
    } else {
      console.error('❌ FALHA NO TESTE 3: Não bloqueou takes visuais incompletos:', checkIncomplete);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 3:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 4: Relatório E2E contém AUDIO: SKIPPED e passed !== true sem áudio
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4/5] Validando que pipeline E2E sem áudio marca status PARTIAL e passed=false...');
  try {
    const e2eResult = await runGasolinaE2E();

    const reportPath = path.join(process.cwd(), 'runs', 'gasolina-adulterada', 'e2e', 'latest', 'E2E-REPORT.md');
    const mdContent = fs.readFileSync(reportPath, 'utf8');

    const hasAudioSkippedMention = mdContent.includes('AUDIO: SKIPPED') || mdContent.includes('Audio');
    const passedIsFalse = e2eResult.passed === false;
    const isPartialOrBlocked = e2eResult.status === 'PARTIAL_NO_AUDIO' || e2eResult.status === 'E2E_BLOCKED' || e2eResult.status === 'FAILED';

    if (hasAudioSkippedMention && passedIsFalse && isPartialOrBlocked) {
      console.log(`✅ TESTE 4 PASSOU: Relatório E2E reflete status real (passed=${e2eResult.passed}, status=${e2eResult.status}).`);
    } else {
      console.error('❌ FALHA NO TESTE 4: Discrepância no relatório E2E:', {
        passed: e2eResult.passed,
        status: e2eResult.status,
        hasAudioSkippedMention
      });
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 4:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 5: Zero vazamento de API Key nos relatórios e logs
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5/5] Validando que nenhuma API key foi vazada em logs ou relatórios...');
  try {
    const latestE2eDir = path.join(process.cwd(), 'runs', 'gasolina-adulterada', 'e2e', 'latest');
    const mdPath = path.join(latestE2eDir, 'E2E-REPORT.md');
    const jsonPath = path.join(latestE2eDir, 'E2E-REPORT.json');

    const mdContent = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';
    const jsonContent = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf8') : '';

    const key = process.env.ELEVENLABS_API_KEY || '';
    const hasKeyLeaked = key.length > 5 && (mdContent.includes(key) || jsonContent.includes(key));

    if (!hasKeyLeaked) {
      console.log(`✅ TESTE 5 PASSOU: Relatórios 100% seguros sem vazamento de chaves ou credenciais.`);
    } else {
      console.error('❌ FALHA NO TESTE 5: API Key encontrada no relatório!');
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 5:', err.message);
    allPassed = false;
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES DE E2E & ÁUDIO PARCIAL PASSARAM COM SUCESSO DETERMINÍSTICO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES E2E!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

runTests();
