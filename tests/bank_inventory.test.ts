import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { runBankInventory } from '../scripts/inventoryBankAgainstEpisode';
import { VideoRepositoryMatcher } from '../hsl/media/videoRepositoryMatcher';
import { buildFireflyPrompt } from '../contracts/buildFireflyPrompt';
import { parseEpisodeContract } from '../contracts/episodeContract';
import { buildSceneContracts, RawSceneInput } from '../contracts/buildSceneContracts';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES DO INVENTÁRIO DO BANCO & PROMPTS FIREFLY');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

async function runTests() {
  let allPassed = true;

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 1: Inventário gera 30 linhas estruturadas para o episódio da gasolina
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1/5] Validando execução do inventário contra as 30 cenas canônicas...');
  try {
    const report = await runBankInventory();

    if (report.totalScenes === 30 && report.scenes.length === 30) {
      console.log(`✅ TESTE 1 PASSOU: Inventário cobriu com sucesso todas as 30 cenas (HITs: ${report.hitCount}, MISSes: ${report.missCount}, PENDING_FIREFLY: ${report.pendingFireflyCount}).`);
    } else {
      console.error(`❌ FALHA NO TESTE 1: Esperado 30 cenas no relatório, recebido ${report.scenes.length}`);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 1:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 2: B-Roll de porto/esteira vs cena de bico de combustível = MISS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/5] Validando que clip de porto/esteira contra bico de gasolina retorna MISS...');
  try {
    const matchResult = VideoRepositoryMatcher.matchScene({
      sceneId: 'GAS_001_TEST',
      visualSubject: 'Bico da bomba de gasolina travado no bocal do tanque com asfalto molhado',
      requiredCategory: 'fuel_dispenser_nozzle',
      visualMustInclude: ['bico', 'tanque', 'gasolina'],
      visualMustNot: ['cargo ship', 'warehouse conveyor', 'water tank rooftop'],
      domainTags: ['fuel', 'gas_station', 'gasolina'],
      allowedSources: ['bank', 'firefly']
    }, 'smart');

    if (!matchResult.matched && matchResult.reason?.includes('BANK_DOMAIN_MISMATCH')) {
      console.log(`✅ TESTE 2 PASSOU: B-Roll genérico vetado com sucesso (${matchResult.reason.split(':')[0]}).`);
    } else {
      console.error('❌ FALHA NO TESTE 2: Matcher não vetou clip desconexo:', matchResult);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 2:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 3: Clip fuel/pump/nozzle vs cena de bico = HIT
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/5] Validando que clip compatível no banco retorna HIT (USE_MATCHED_VIDEO)...');
  try {
    const industrialDir = path.join(process.cwd(), 'assets', 'video_repository', 'industrial');
    const existingFiles = fs.existsSync(industrialDir) ? fs.readdirSync(industrialDir) : [];
    const sampleFile = existingFiles.length > 0 ? `industrial/${existingFiles[0]}` : 'industrial/sample.mp4';

    VideoRepositoryMatcher.registerVideo({
      id: 'FUEL_PUMP_NOZZLE_FLOW_01',
      category: 'fuel_dispenser_nozzle',
      filename: sampleFile,
      tags: ['bico', 'tanque', 'gasolina', 'combustivel', 'fuel', 'gas_station', 'bomba'],
      description: 'Bico da bomba de gasolina abastecendo tanque de automovel em 35mm',
      durationSeconds: 6.0,
      fps: 24,
      resolution: '1280x720',
      colorTone: 'Chiaroscuro / Sodium Amber',
      provenance: 'curated_broll',
      qaStatus: 'approved',
      approvedBy: 'test_suite',
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    const matchResult = VideoRepositoryMatcher.matchScene({
      sceneId: 'GAS_001_TEST',
      visualSubject: 'Bico da bomba de gasolina travado no bocal do tanque com asfalto molhado',
      requiredCategory: 'fuel_dispenser_nozzle',
      visualMustInclude: ['bico', 'tanque', 'gasolina'],
      visualMustNot: ['cargo ship', 'warehouse conveyor', 'water tank rooftop'],
      domainTags: ['fuel', 'gas_station', 'gasolina'],
      allowedSources: ['bank', 'firefly']
    }, 'smart');

    // Limpeza
    const cat = VideoRepositoryMatcher.loadCatalog(true);
    cat.videos = cat.videos.filter(v => v.id !== 'FUEL_PUMP_NOZZLE_FLOW_01');
    VideoRepositoryMatcher.saveCatalog(cat);

    if (matchResult.matched === true && matchResult.recommendedAction === 'USE_MATCHED_VIDEO') {
      console.log(`✅ TESTE 3 PASSOU: Clip de combustível retornou HIT com USE_MATCHED_VIDEO (Score: ${(matchResult.matchScore * 100).toFixed(1)}%).`);
    } else {
      console.error('❌ FALHA NO TESTE 3: Clip não deu HIT esperado:', matchResult);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 3:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 4: buildFireflyPrompt contém must_include e NÃO começa com Denis Villeneuve
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4/5] Validando prioridade do subject físico em buildFireflyPrompt...');
  try {
    const promptOut = buildFireflyPrompt({
      sceneId: 'GAS_001',
      visual_must_include: ['bico', 'tanque', 'gasolina'],
      visual_must_not: ['cargo ship', 'warehouse conveyor'],
      required_category: 'fuel_dispenser_nozzle',
      domainTags: ['fuel', 'gasolina'],
      visualSubject: 'Bico da bomba de gasolina travado no bocal do tanque com asfalto molhado'
    });

    const promptText = promptOut.prompt;
    const startsWithVilleneuve = /^extreme cinematic 35mm.*denis villeneuve/i.test(promptText);
    const containsMustInclude = promptOut.mustInclude.every(mi => promptText.toLowerCase().includes(mi.toLowerCase()));
    const startsWithSubject = promptText.startsWith('Detailed authentic close-up of bico and tanque and gasolina');

    if (!startsWithVilleneuve && containsMustInclude && startsWithSubject) {
      console.log(`✅ TESTE 4 PASSOU: Prompt inicia pelo subject físico substantivo e não por adjetivos de estilo.`);
    } else {
      console.error('❌ FALHA NO TESTE 4: Estrutura do prompt incorreta:', promptText);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 4:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 5: Negative prompt contém pelo menos um must_not do contrato
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5/5] Validando inclusão de must_not no negative prompt...');
  try {
    const promptOut = buildFireflyPrompt({
      sceneId: 'GAS_001',
      visual_must_include: ['bico', 'tanque', 'gasolina'],
      visual_must_not: ['cargo ship', 'warehouse conveyor', 'water tank rooftop'],
      required_category: 'fuel_dispenser_nozzle',
      domainTags: ['fuel', 'gasolina']
    });

    const negText = promptOut.negativePrompt.toLowerCase();
    const hasMustNot = promptOut.mustNot.some(mn => negText.includes(mn.toLowerCase()));
    const hasDefaultExclusions = negText.includes('text') && negText.includes('hud') && negText.includes('human face');

    if (hasMustNot && hasDefaultExclusions) {
      console.log(`✅ TESTE 5 PASSOU: Negative prompt contém termos de visual_must_not e exclusões de texto/rosto/hud.`);
    } else {
      console.error('❌ FALHA NO TESTE 5: Negative prompt incompleto:', promptOut.negativePrompt);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 5:', err.message);
    allPassed = false;
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES DO INVENTÁRIO DO BANCO PASSARAM COM SUCESSO DETERMINÍSTICO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES DO INVENTÁRIO DO BANCO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

runTests();
