import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { parseEpisodeContract } from '../contracts/episodeContract';
import { buildSceneContracts, RawSceneInput } from '../contracts/buildSceneContracts';
import { buildNarrationPlan } from '../contracts/buildNarrationPlan';
import { runNarrationDispatch, validateNarrationBatch } from '../scripts/dispatchNarrationBatch';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES DO PLANO DE NARRAÇÃO & GATE DE LOCUÇÃO');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

async function runTests() {
  let allPassed = true;

  const contractPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.episode.json');
  const scenesPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.scenes.json');

  const episodeContract = parseEpisodeContract(contractPath);
  const rawScenes: RawSceneInput[] = JSON.parse(fs.readFileSync(scenesPath, 'utf8'));
  const sceneContracts = buildSceneContracts(episodeContract, rawScenes);

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 1: 30 cenas, soma >= 324s no plano de narração
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1/5] Validando plano de narração para as 30 cenas (Duração >= 324s)...');
  try {
    const plan = buildNarrationPlan(episodeContract, sceneContracts, 'TEST_NARRATION_PLAN');

    const totalScenes = plan.totalScenes;
    const totalDuration = plan.totalTargetSeconds;
    const minRequired = plan.minDurationSeconds;

    if (totalScenes === 30 && totalDuration >= 324 && totalDuration >= minRequired) {
      console.log(`✅ TESTE 1 PASSOU: 30 cenas cobertas somando ${totalDuration.toFixed(1)}s (mínimo ${minRequired.toFixed(1)}s, ${plan.totalWords} palavras).`);
    } else {
      console.error('❌ FALHA NO TESTE 1: Plano de narração inválido:', { totalScenes, totalDuration, minRequired });
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 1:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 2: Voiceover curta (< 8 palavras) lança VOICEOVER_TOO_SHORT
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/5] Validando rejeição de voiceover muito curta (< 8 palavras)...');
  try {
    let threw = false;
    const corruptedScenes = sceneContracts.map(sc => {
      if (sc.sceneId === 'GAS_001') {
        return { ...sc, voiceover: 'Bomba de gasolina ligada.' }; // 4 palavras
      }
      return sc;
    });

    try {
      buildNarrationPlan(episodeContract, corruptedScenes, 'TEST_SHORT_VO');
    } catch (err: any) {
      threw = true;
      if (err.message.includes('VOICEOVER_TOO_SHORT:GAS_001')) {
        console.log(`✅ TESTE 2 PASSOU: Voiceover curta rejeitada com sucesso: "${err.message}"`);
      } else {
        console.error('❌ FALHA NO TESTE 2: Mensagem de erro incorreta:', err.message);
        allPassed = false;
      }
    }

    if (!threw) {
      console.error('❌ FALHA NO TESTE 2: Voiceover de 4 palavras não lançou erro!');
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 2:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 3: Dry-run NÃO cria arquivos .mp3
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/5] Validando que dry-run de narração não cria arquivos .mp3...');
  try {
    const testRunId = 'TEST_DRY_RUN_NO_MP3';
    const testDir = path.join(process.cwd(), 'runs', 'gasolina-adulterada', testRunId);

    const { plan, wordStatus } = await runNarrationDispatch({ runId: testRunId, forceDispatch: false });

    const narrationAudioDir = path.join(testDir, 'audio', 'narration');
    const mp3Files = fs.existsSync(narrationAudioDir)
      ? fs.readdirSync(narrationAudioDir).filter(f => f.endsWith('.mp3'))
      : [];

    // Limpeza
    fs.rmSync(testDir, { recursive: true, force: true });

    if (mp3Files.length === 0 && wordStatus === 'NARRATION_DRY_ONLY') {
      console.log(`✅ TESTE 3 PASSOU: Dry-run executou sem sintetizar arquivos de áudio (${wordStatus}).`);
    } else {
      console.error('❌ FALHA NO TESTE 3: Arquivos foram criados em dry-run:', mp3Files);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 3:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 4: Gatekeeper sem MP3 acusa MISSING_STAGE: narration
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4/5] Validando detecção de MISSING_STAGE: narration no gatekeeper...');
  try {
    const testRunId = 'TEST_EMPTY_NARRATION_GATE';
    const testDir = path.join(process.cwd(), 'runs', 'gasolina-adulterada', testRunId);
    fs.mkdirSync(testDir, { recursive: true });

    const audit = PipelineContractGate.auditRun({
      runId: testRunId,
      runsDir: path.join(process.cwd(), 'runs', 'gasolina-adulterada'),
      contract: episodeContract,
      sceneContracts
    });

    // Limpeza
    fs.rmSync(testDir, { recursive: true, force: true });

    const hasMissingNarration = audit.failures.some(f => f.reason?.includes('MISSING_STAGE: narration'));

    if (!audit.passed && hasMissingNarration) {
      console.log(`✅ TESTE 4 PASSOU: Gatekeeper barrou com sucesso ausência de locução (MISSING_STAGE: narration).`);
    } else {
      console.error('❌ FALHA NO TESTE 4: Gatekeeper não acusou ausência de narração:', audit.failures);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 4:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 5: Fixture de 30 MP3s somando 360s aprova stage narration, mas master segue reprovado
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5/5] Validando fixture com 30 MP3s: stage narration passa, mas episódio segue reprovado...');
  try {
    const fixtureRunId = 'TEST_FIXTURE_30_MP3S';
    const fixtureRunDir = path.join(process.cwd(), 'runs', 'gasolina-adulterada', fixtureRunId);
    const audioNarrationDir = path.join(fixtureRunDir, 'audio', 'narration');
    fs.mkdirSync(audioNarrationDir, { recursive: true });

    // Cria 30 arquivos mp3 de teste não-vazios (cabeçalho ID3)
    const dummyId3 = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    for (const sc of sceneContracts) {
      fs.writeFileSync(path.join(audioNarrationDir, `${sc.sceneId}.mp3`), dummyId3);
    }

    const narrationValidation = validateNarrationBatch(fixtureRunId, fixtureRunDir);

    const audit = PipelineContractGate.auditRun({
      runId: fixtureRunId,
      runsDir: path.join(process.cwd(), 'runs', 'gasolina-adulterada'),
      contract: episodeContract,
      sceneContracts
    });

    // Limpeza
    fs.rmSync(fixtureRunDir, { recursive: true, force: true });

    const narrationStageFailed = audit.failures.some(f => f.reason?.includes('MISSING_STAGE: narration'));
    const episodeStillFailed = audit.passed === false; // Deve reprovar porque faltam visuals, SFX, music e render

    if (narrationValidation.passed && !narrationStageFailed && episodeStillFailed) {
      console.log(`✅ TESTE 5 PASSOU: Stage narration aprovado na fixture (${narrationValidation.existingCount}/30 MP3s, ${narrationValidation.totalDurationSeconds}s), e Gate de episódio manteve o master global reprovado como esperado.`);
    } else {
      console.error('❌ FALHA NO TESTE 5:', {
        narrationPassed: narrationValidation.passed,
        narrationStageFailed,
        episodeStillFailed,
        failures: audit.failures
      });
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 5:', err.message);
    allPassed = false;
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES DO PLANO DE NARRAÇÃO PASSARAM COM SUCESSO DETERMINÍSTICO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES DO PLANO DE NARRAÇÃO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

runTests();
