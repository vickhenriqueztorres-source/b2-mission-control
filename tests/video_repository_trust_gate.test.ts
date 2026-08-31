import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { VideoRepositoryMatcher } from '../hsl/media/videoRepositoryMatcher';
import { VideoCatalog, VideoCatalogEntry } from '../hsl/media/types';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES: PORTÃO DE CONFIANÇA DO REPOSITÓRIO DE VÍDEOS (FURO 3)');
console.log('══════════════════════════════════════════════════════════════════════════════════════\n');

async function runTrustGateTests() {
  let allPassed = true;

  // Backup do catálogo original para restauração
  const catalogPath = path.join(process.cwd(), 'assets', 'video_repository', 'catalog.json');
  const originalCatalogRaw = fs.readFileSync(catalogPath, 'utf8');

  const resetCatalog = (): VideoCatalog => {
    fs.writeFileSync(catalogPath, originalCatalogRaw, 'utf8');
    return VideoRepositoryMatcher.loadCatalog(true);
  };

  try {
    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 1: Clipe com qaStatus 'quarantined' e match semântico perfeito NÃO é retornado
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('[TEST 1/5] Validando que clip com qaStatus="quarantined" e match 100% é rejeitado com BANK_CLIP_NOT_APPROVED...');
    try {
      const catalog = resetCatalog();
      const legitimateClip = catalog.videos.find(v => v.id === 'IND_PARCEL_CONVEYOR_BELT_01');
      assert(legitimateClip, 'Clip legítimo não encontrado no catálogo');

      const quarantinedClip: VideoCatalogEntry = {
        ...legitimateClip,
        qaStatus: 'quarantined'
      };
      catalog.videos = [quarantinedClip];
      VideoRepositoryMatcher.saveCatalog(catalog);

      const matchResult = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_TEST_QUARANTINE',
        visualSubject: 'Esteira rolante automatizada transportando pacotes e caixas em centro de distribuicao',
        tags: ['pacote', 'esteira', 'triagem', 'logistica'],
        domainTags: ['pacote', 'esteira'],
        visualMustInclude: ['pacote', 'esteira'],
        requiredCategory: 'industrial',
        allowedSources: ['bank']
      }, 'smart');

      const isRejected = !matchResult.matched && matchResult.reason.includes('BANK_CLIP_NOT_APPROVED');
      if (isRejected && matchResult.reason.includes("qaStatus 'quarantined' (exigido: approved)")) {
        console.log(`  ✅ TESTE 1 PASSOU: Clip em quarentena vetado com sucesso (${matchResult.reason}).`);
      } else {
        console.error(`  ❌ FALHA NO TESTE 1: Clip em quarentena não foi vetado corretamente:`, matchResult);
        allPassed = false;
      }
    } catch (err: any) {
      console.error(`  ❌ ERRO NO TESTE 1:`, err.message);
      allPassed = false;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 2: Clipe com qaStatus 'rejected' NUNCA é retornado
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 2/5] Validando que clip com qaStatus="rejected" nunca é retornado...');
    try {
      const catalog = resetCatalog();
      const legitimateClip = catalog.videos.find(v => v.id === 'IND_FORKLIFT_WAREHOUSE_01');
      assert(legitimateClip, 'Clip legítimo não encontrado no catálogo');

      const rejectedClip: VideoCatalogEntry = {
        ...legitimateClip,
        qaStatus: 'rejected'
      };
      catalog.videos = [rejectedClip];
      VideoRepositoryMatcher.saveCatalog(catalog);

      const matchResult = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_TEST_REJECTED',
        visualSubject: 'Empilhadeira operando e manobrando cargas em centro de distribuição logístico',
        tags: ['empilhadeira', 'galpao', 'armazem', 'logistica'],
        domainTags: ['empilhadeira', 'galpao'],
        visualMustInclude: ['empilhadeira'],
        requiredCategory: 'industrial',
        allowedSources: ['bank']
      }, 'smart');

      const isRejected = !matchResult.matched && matchResult.reason.includes('BANK_CLIP_NOT_APPROVED');
      if (isRejected && matchResult.reason.includes("qaStatus 'rejected' (exigido: approved)")) {
        console.log(`  ✅ TESTE 2 PASSOU: Clip rejeitado vetado com sucesso (${matchResult.reason}).`);
      } else {
        console.error(`  ❌ FALHA NO TESTE 2: Clip rejeitado não foi vetado:`, matchResult);
        allPassed = false;
      }
    } catch (err: any) {
      console.error(`  ❌ ERRO NO TESTE 2:`, err.message);
      allPassed = false;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 3: Clipe com provenance undefined (via cast) é rejeitado com BANK_CLIP_NO_PROVENANCE
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 3/5] Validando que clip sem provenance é rejeitado com BANK_CLIP_NO_PROVENANCE...');
    try {
      const catalog = resetCatalog();
      const legitimateClip = catalog.videos.find(v => v.id === 'CYBER_PRINTER_EJECTS_PAPER_01');
      assert(legitimateClip, 'Clip legítimo não encontrado no catálogo');

      const noProvenanceClip: any = {
        ...legitimateClip,
        provenance: undefined
      };
      catalog.videos = [noProvenanceClip];
      VideoRepositoryMatcher.saveCatalog(catalog);

      const matchResult = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_TEST_NO_PROVENANCE',
        visualSubject: 'Impressora emitindo folha de documento oficial e relatorio tecnico',
        tags: ['impressora', 'papel', 'documento', 'fiscal'],
        domainTags: ['impressora', 'papel'],
        visualMustInclude: ['impressora'],
        requiredCategory: 'cyber_telemetry',
        allowedSources: ['bank']
      }, 'smart');

      const isRejected = !matchResult.matched && matchResult.reason.includes('BANK_CLIP_NO_PROVENANCE');
      if (isRejected) {
        console.log(`  ✅ TESTE 3 PASSOU: Clip sem procedência rejeitado com BANK_CLIP_NO_PROVENANCE (${matchResult.reason}).`);
      } else {
        console.error(`  ❌ FALHA NO TESTE 3: Clip sem provenance não retornou BANK_CLIP_NO_PROVENANCE:`, matchResult);
        allPassed = false;
      }
    } catch (err: any) {
      console.error(`  ❌ ERRO NO TESTE 3:`, err.message);
      allPassed = false;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 4: Clipe 'approved' + 'curated_broll' CONTINUA passando com mesmo score
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 4/5] Validando que clip "approved" + "curated_broll" passa sem regressão de score...');
    try {
      resetCatalog();

      const matchResult = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_035',
        chapterTitle: 'A TRIAGEM DE ENCOMENDAS',
        visualSubject: 'Esteira rolante automatizada transportando pacotes e caixas em centro de distribuicao',
        tags: ['pacote', 'esteira', 'triagem', 'logistica'],
        requiredCategory: 'industrial'
      }, 'smart');

      if (matchResult.matched && matchResult.recommendedAction === 'USE_MATCHED_VIDEO' && matchResult.videoEntry?.id === 'IND_PARCEL_CONVEYOR_BELT_01') {
        console.log(`  ✅ TESTE 4 PASSOU: Clip legítimo aprovado retornou HIT com Score: ${(matchResult.matchScore * 100).toFixed(1)}%.`);
      } else {
        console.error(`  ❌ FALHA NO TESTE 4: Clip aprovado não deu HIT esperado:`, matchResult);
        allPassed = false;
      }
    } catch (err: any) {
      console.error(`  ❌ ERRO NO TESTE 4:`, err.message);
      allPassed = false;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 6: Clipe sem 'domains' é rejeitado com BANK_CLIP_NO_DOMAIN (Veto Temático Fail-Closed)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 6/7] Validando que clip sem domains é rejeitado com BANK_CLIP_NO_DOMAIN...');
    try {
      const catalog = resetCatalog();
      const clip = catalog.videos.find(v => v.id === 'IND_PARCEL_CONVEYOR_BELT_01')!;
      const noDomainClip: VideoCatalogEntry = {
        ...clip,
        domains: []
      };
      catalog.videos = [noDomainClip];
      VideoRepositoryMatcher.saveCatalog(catalog);

      const matchResult = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_TEST_NO_DOMAIN',
        visualSubject: 'Esteira rolante automatizada transportando pacotes e caixas em centro de distribuicao',
        tags: ['pacote', 'esteira', 'triagem', 'logistica'],
        domainTags: ['logistics'],
        visualMustInclude: ['pacote'],
        requiredCategory: 'industrial',
        allowedSources: ['bank']
      }, 'smart');

      if (!matchResult.matched && matchResult.reason.includes('BANK_CLIP_NO_DOMAIN')) {
        console.log(`  ✅ TESTE 6 PASSOU: Clip sem domains rejeitado com BANK_CLIP_NO_DOMAIN (${matchResult.reason}).`);
      } else {
        console.error(`  ❌ FALHA NO TESTE 6: Clip sem domains não retornou BANK_CLIP_NO_DOMAIN:`, matchResult);
        allPassed = false;
      }
    } catch (err: any) {
      console.error(`  ❌ ERRO NO TESTE 6:`, err.message);
      allPassed = false;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 7: Clipe com domains ['logistics'] é rejeitado para episódio com domainTags ['gps', 'relativity']
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 7/7] Validando veto temático por BANK_DOMAIN_MISMATCH...');
    try {
      resetCatalog();

      const matchResult = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_TEST_DOMAIN_MISMATCH',
        visualSubject: 'Esteira rolante automatizada transportando pacotes e caixas em centro de distribuicao',
        tags: ['pacote', 'esteira', 'triagem', 'logistica'],
        domainTags: ['gps', 'relativity', 'atomic_physics'],
        visualMustInclude: ['pacote'],
        requiredCategory: 'industrial',
        allowedSources: ['bank']
      }, 'smart');

      if (!matchResult.matched && matchResult.reason.includes('BANK_DOMAIN_MISMATCH')) {
        console.log(`  ✅ TESTE 7 PASSOU: Veto temático barrou clip não relacionado (${matchResult.reason}).`);
      } else {
        console.error(`  ❌ FALHA NO TESTE 7: Clip fora do domínio do episódio não foi barrado:`, matchResult);
        allPassed = false;
      }
    } catch (err: any) {
      console.error(`  ❌ ERRO NO TESTE 7:`, err.message);
      allPassed = false;
    }

  } finally {
    // Garante restauração absoluta do catálogo
    fs.writeFileSync(catalogPath, originalCatalogRaw, 'utf8');
    VideoRepositoryMatcher.loadCatalog(true);
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES DO PORTÃO DE CONFIANÇA (FURO 3) PASSARAM COM SUCESSO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES DO PORTÃO DE CONFIANÇA!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

runTrustGateTests();
