import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { runFireflyBatchDispatch, validateVisualBatch, BATCH_1_SCENE_IDS } from '../scripts/dispatchFireflyBatch';
import { VideoRepositoryMatcher } from '../hsl/media/videoRepositoryMatcher';
import { buildFireflyPrompt } from '../contracts/buildFireflyPrompt';
import { parseEpisodeContract } from '../contracts/episodeContract';
import { buildSceneContracts, RawSceneInput } from '../contracts/buildSceneContracts';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES DO DISPATCH DO LOTE 1 (FIREFLY)');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

async function runTests() {
  let allPassed = true;

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 1: Dry-run seleciona exatamente 10 IDs canônicos e zero dossier
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1/5] Validando seleção de exatamente 10 cenas para o Lote 1 em Dry-Run...');
  try {
    const plan = await runFireflyBatchDispatch({ lote: 1, forceDispatch: false });

    const selectedIds = plan.batchItems.map((item: any) => item.sceneId);
    const expectedIds = BATCH_1_SCENE_IDS;

    const idsMatch = selectedIds.length === 10 &&
      selectedIds.every((id: string, idx: number) => id === expectedIds[idx]);

    const zeroDossierInBatch1 = plan.batchItems.every(
      (item: any) => !plan.dossierSceneIds.includes(item.sceneId)
    );

    if (idsMatch && zeroDossierInBatch1 && plan.dossierCount === 9 && plan.otherBatchCount === 11) {
      console.log(`✅ TESTE 1 PASSOU: Lote 1 contém exatamente 10 IDs na ordem canônica e zero cenas de dossiê.`);
    } else {
      console.error('❌ FALHA NO TESTE 1: Discrepância na seleção do Lote 1:', {
        selectedIds,
        expectedIds,
        dossierCount: plan.dossierCount,
        otherBatchCount: plan.otherBatchCount
      });
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 1:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 2: HIT mockado no banco NÃO entra na fila do Lote 1
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/5] Validando que HIT mockado no banco é ignorado pelo dispatcher...');
  try {
    const industrialDir = path.join(process.cwd(), 'assets', 'video_repository', 'industrial');
    const existingFiles = fs.existsSync(industrialDir) ? fs.readdirSync(industrialDir) : [];
    const sampleFile = existingFiles.length > 0 ? `industrial/${existingFiles[0]}` : 'industrial/sample.mp4';

    // Registra temporariamente clip que dá HIT em GAS_001
    VideoRepositoryMatcher.registerVideo({
      id: 'TEMP_GAS_001_MATCH',
      category: 'fuel_dispenser_nozzle',
      filename: sampleFile,
      tags: ['bico', 'tanque', 'gasolina', 'fuel', 'gas_station', 'bomba'],
      description: 'Bico da bomba abastecendo',
      durationSeconds: 6.0,
      fps: 24,
      resolution: '1280x720',
      colorTone: 'Chiaroscuro',
      provenance: 'curated_broll',
      qaStatus: 'approved',
      approvedBy: 'test_suite',
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    const planWithHit = await runFireflyBatchDispatch({ lote: 1, forceDispatch: false, runId: 'TEST_RUN_MOCK_HIT' });

    // Limpeza
    const cat = VideoRepositoryMatcher.loadCatalog(true);
    cat.videos = cat.videos.filter(v => v.id !== 'TEMP_GAS_001_MATCH');
    VideoRepositoryMatcher.saveCatalog(cat);

    const gas001Queued = planWithHit.batchItems.some((item: any) => item.sceneId === 'GAS_001');

    if (!gas001Queued && planWithHit.hitCount >= 1) {
      console.log(`✅ TESTE 2 PASSOU: Cena com HIT no banco foi ignorada pelo despachante do Firefly.`);
    } else {
      console.error('❌ FALHA NO TESTE 2: GAS_001 ainda foi incluída mesmo com HIT:', planWithHit);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 2:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 3: Prompt do plano é identicamente gerado por buildFireflyPrompt
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/5] Validando integridade dos prompts formatados do plano...');
  try {
    const plan = await runFireflyBatchDispatch({ lote: 1, forceDispatch: false });
    const gas001Item = plan.batchItems.find((item: any) => item.sceneId === 'GAS_001');

    const expectedPrompt = buildFireflyPrompt({
      sceneId: 'GAS_001',
      required_category: 'fuel_dispenser_nozzle',
      visual_must_include: ['bico', 'tanque', 'gasolina'],
      visual_must_not: ['cargo ship', 'warehouse conveyor', 'water tank rooftop', 'cell tower skyline', 'favela panorama', 'ocean port', 'conveyor belt'],
      domainTags: ['fuel', 'gas_station', 'pump', 'crime', 'fraud', 'inmetro', 'electronics'],
      visualSubject: 'Bico da bomba de gasolina travado no bocal do tanque com asfalto molhado e névoa'
    });

    if (gas001Item && gas001Item.prompt.prompt === expectedPrompt.prompt) {
      console.log(`✅ TESTE 3 PASSOU: Prompt do plano é 100% idêntico à saída do buildFireflyPrompt oficial.`);
    } else {
      console.error('❌ FALHA NO TESTE 3: Prompt divergente:', {
        actual: gas001Item?.prompt.prompt,
        expected: expectedPrompt.prompt
      });
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 3:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 4: validateVisualBatch detecta MISSING_TAKE: GAS_001 quando take.mp4 inexiste
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4/5] Validando detecção de MISSING_TAKE no validador de lote...');
  try {
    const testTempDir = path.join(process.cwd(), 'runs', 'gasolina-adulterada', 'TEST_VALIDATION_MOCK');
    const gas001Dir = path.join(testTempDir, 'visuals', 'GAS_001');
    fs.mkdirSync(gas001Dir, { recursive: true });

    // Cria start_frame.png válido (cabeçalho PNG)
    const validPngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00]);
    fs.writeFileSync(path.join(gas001Dir, 'start_frame.png'), validPngBuffer);

    // Take ausente propositalmente
    const valResult = validateVisualBatch('TEST_VALIDATION_MOCK', ['GAS_001'], testTempDir);

    // Limpeza
    fs.rmSync(testTempDir, { recursive: true, force: true });

    const hasMissingTake = valResult.failures.includes('MISSING_TAKE: GAS_001');

    if (!valResult.passed && hasMissingTake) {
      console.log(`✅ TESTE 4 PASSOU: Ausência de take.mp4 detectada com sucesso (MISSING_TAKE: GAS_001).`);
    } else {
      console.error('❌ FALHA NO TESTE 4: Falha esperada não foi detectada:', valResult);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 4:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 5: Dispatcher não chama ingest nem altera quantidade de vídeos do banco
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5/5] Validando que dispatcher não polui repositório central com novos arquivos...');
  try {
    const catBefore = VideoRepositoryMatcher.loadCatalog(true);
    const countBefore = catBefore.videos.length;

    await runFireflyBatchDispatch({ forceDispatch: false, runId: 'TEST_NO_INGEST_RUN' });

    const catAfter = VideoRepositoryMatcher.loadCatalog(true);
    const countAfter = catAfter.videos.length;

    if (countBefore === 16 && countAfter === 16) {
      console.log(`✅ TESTE 5 PASSOU: Catálogo central permaneceu estritamente com ${countAfter} vídeos originais.`);
    } else {
      console.error(`❌ FALHA NO TESTE 5: Quantidade de vídeos no catálogo foi alterada (${countBefore} -> ${countAfter})`);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 5:', err.message);
    allPassed = false;
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES DO LOTE 1 (FIREFLY) PASSARAM COM SUCESSO DETERMINÍSTICO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES DO LOTE 1!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

runTests();
