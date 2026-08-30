import fs from 'fs';
import path from 'path';
import assert from 'assert';
import {
  runFireflyBatchDispatch,
  BATCH_1_SCENE_IDS,
  BATCH_2_SCENE_IDS,
  DOSSIER_SCENE_COMPONENTS
} from '../scripts/dispatchFireflyBatch';
import { VideoRepositoryMatcher } from '../hsl/media/videoRepositoryMatcher';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES DO LOTE 2 (FIREFLY) & BARREIRA DE PRODUÇÃO');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

async function runTests() {
  let allPassed = true;

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 1: Dry Lote 2 = exatamente 11 IDs, zero dossier, zero Lote 1
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1/5] Validando plano do Lote 2 em Dry-Run (11 cenas)...');
  try {
    const plan = await runFireflyBatchDispatch({ lote: 2, forceDispatch: false });

    const selectedIds = plan.batchItems.map(item => item.sceneId);
    const expectedIds = BATCH_2_SCENE_IDS;

    const idsMatch = selectedIds.length === 11 &&
      selectedIds.every((id, idx) => id === expectedIds[idx]);

    const zeroDossier = plan.batchItems.every(
      item => !plan.dossierSceneIds.includes(item.sceneId)
    );

    const zeroLote1 = plan.batchItems.every(
      item => !BATCH_1_SCENE_IDS.includes(item.sceneId)
    );

    if (idsMatch && zeroDossier && zeroLote1 && plan.dossierCount === 9) {
      console.log(`✅ TESTE 1 PASSOU: Lote 2 Dry-Run gerou exatamente 11 IDs canônicos, zero dossier e zero contaminação do Lote 1.`);
    } else {
      console.error('❌ FALHA NO TESTE 1: Discrepância no plano do Lote 2:', {
        selectedIds,
        expectedIds,
        zeroDossier,
        zeroLote1
      });
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 1:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 2: FIREFLY_LOTE=3 ou inválido lança FIREFLY_LOTE_INVALID
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/5] Validando rejeição de lote inválido (FIREFLY_LOTE=3)...');
  try {
    let threw = false;
    try {
      await runFireflyBatchDispatch({ lote: 3 });
    } catch (err: any) {
      threw = true;
      if (err.message.includes('FIREFLY_LOTE_INVALID')) {
        console.log(`✅ TESTE 2 PASSOU: Lote inválido rejeitado com sucesso: "${err.message}"`);
      } else {
        console.error('❌ FALHA NO TESTE 2: Mensagem de erro incorreta:', err.message);
        allPassed = false;
      }
    }

    if (!threw) {
      console.error('❌ FALHA NO TESTE 2: Lote 3 inválido não lançou erro!');
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 2:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 3: FIREFLY_DISPATCH=1 + LOTE=2 com Lote 1 incompleto lança LOTE1_INCOMPLETE
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/5] Validando barreira bloqueante: Lote 2 real requer Lote 1 válido no disco...');
  try {
    let threw = false;
    try {
      // Simula tentativa de disparo real do Lote 2 sem tomadas do Lote 1 no disco
      await runFireflyBatchDispatch({ lote: 2, forceDispatch: true, runId: 'TEST_BARRIER_EMPTY_LOTE1' });
    } catch (err: any) {
      threw = true;
      if (err.message.includes('LOTE1_INCOMPLETE')) {
        console.log(`✅ TESTE 3 PASSOU: Barreira bloqueou Lote 2 com sucesso: "${err.message}"`);
      } else {
        console.error('❌ FALHA NO TESTE 3: Erro inesperado na barreira:', err.message);
        allPassed = false;
      }
    }

    if (!threw) {
      console.error('❌ FALHA NO TESTE 3: Lote 2 foi disparado sem o Lote 1 existir no disco!');
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 3:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 4: Dry Lote 1 ainda tem 10 IDs
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4/5] Validando que Lote 1 preserva 10 IDs canônicos...');
  try {
    const planLote1 = await runFireflyBatchDispatch({ lote: 1, forceDispatch: false });

    if (planLote1.batchItems.length === 10 && planLote1.lote === 1) {
      console.log(`✅ TESTE 4 PASSOU: Lote 1 preservou estritamente seus 10 IDs no plano unificado.`);
    } else {
      console.error('❌ FALHA NO TESTE 4: Lote 1 com contagem incorreta:', planLote1);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 4:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 5: Nenhum ingest no video_repository (permanece com 16 clipes)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5/5] Validando que execução do Lote 2 não polui catálogo central...');
  try {
    const cat = VideoRepositoryMatcher.loadCatalog(true);
    if (cat.videos.length === 16) {
      console.log(`✅ TESTE 5 PASSOU: Catálogo central permaneceu imutável com ${cat.videos.length} vídeos originais.`);
    } else {
      console.error(`❌ FALHA NO TESTE 5: Catálogo central com contagem alterada: ${cat.videos.length}`);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 5:', err.message);
    allPassed = false;
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES DO LOTE 2 (FIREFLY) PASSARAM COM SUCESSO DETERMINÍSTICO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES DO LOTE 2!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

runTests();
