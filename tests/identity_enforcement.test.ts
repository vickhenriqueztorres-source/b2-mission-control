import fs from 'fs';
import path from 'path';
import assert from 'assert';
import {
  IDENTITY_SUFFIX,
  GLOBAL_NEGATIVE,
  DOCUMENTARY_FIELD_IDENTITY,
  FUTURISTIC_STYLE_BLACKLIST,
  VISUAL_IDENTITY_VERSION,
  STOCK_TAG_BLACKLIST,
  ALLOWED_COLOR_TONES,
  MIN_RESOLUTION,
  CANONICAL_PROPORTIONS
} from '../config/visualIdentity';
import { buildFireflyPrompt } from '../contracts/buildFireflyPrompt';
import { VideoRepositoryMatcher } from '../hsl/media/videoRepositoryMatcher';
import { VideoCatalog, VideoCatalogEntry } from '../hsl/media/types';
import { validateCanonBalance } from '../pipeline/canonBalanceCheck';

console.log('══════════════════════════════════════════════════════════════════════');
console.log('SUITE DE TESTES: DOCUMENTARIO DE CAMPO INVESTIGATIVO V4.0');
console.log('══════════════════════════════════════════════════════════════════════\n');

async function runIdentityEnforcementTests() {
  let allPassed = true;

  const catalogPath = path.join(process.cwd(), 'assets', 'video_repository', 'catalog.json');
  const dummyVideoDir = path.join(process.cwd(), 'assets', 'video_repository', 'industrial');
  const dummyVideoPath = path.join(dummyVideoDir, 'sample_valid.mp4');

  fs.mkdirSync(dummyVideoDir, { recursive: true });
  fs.writeFileSync(dummyVideoPath, Buffer.alloc(1024 * 60)); // 60KB dummy MP4

  let originalCatalogRaw = '';
  if (fs.existsSync(catalogPath)) {
    originalCatalogRaw = fs.readFileSync(catalogPath, 'utf8');
  }

  const resetTestCatalog = (videos: VideoCatalogEntry[] = []): VideoCatalog => {
    const testCat: VideoCatalog = {
      version: '2.0.0',
      name: 'Test Video Repository',
      description: 'Test catalog for identity enforcement',
      categories: ['infrastructure', 'industrial', 'cyber_telemetry'],
      videos
    };
    VideoRepositoryMatcher.saveCatalog(testCat);
    return testCat;
  };

  try {
    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 1: Prompt gerado começa pelo subject substantivo e termina com IDENTITY_SUFFIX
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('[TEST 1/7] Validando ordem de prompt (SUBJECT primeiro -> IDENTITY_SUFFIX ao final) e negativos...');
    try {
      const output = buildFireflyPrompt({
        sceneId: 'SC_TEST_01',
        visual_must_include: ['turbina_hidreletrica', 'eixo_rotor'],
        visual_must_not: ['rosto_humano_proibido', 'escritorio_comum'],
        required_category: 'power_generation',
        domainTags: ['energy', 'grid'],
        visualSubject: 'Turbina hidrelétrica monumental girando no escuro'
      });

      const prompt = output.prompt;
      const negPrompt = output.negativePrompt;

      assert.equal(VISUAL_IDENTITY_VERSION, 'HSL_DOCUMENTARY_FIELD_V4');
      assert(fs.existsSync(path.join(process.cwd(), 'IDENTIDADE_VISUAL.md')), 'IDENTIDADE_VISUAL.md ausente na raiz');
      assert(fs.existsSync(path.join(process.cwd(), 'AGENTS.md')), 'AGENTS.md ausente na raiz');
      assert.equal(
        Object.values(DOCUMENTARY_FIELD_IDENTITY.distribution).reduce((sum, value) => sum + value, 0),
        1,
        'Distribuicao visual v4 nao totaliza 100%'
      );
      assert.equal(DOCUMENTARY_FIELD_IDENTITY.overlayMaximumFrameRatio, 0.12);
      assert.match(IDENTITY_SUFFIX, /natural Rec\.709 color/i);
      assert.match(IDENTITY_SUFFIX, /practical available lighting/i);
      assert.doesNotMatch(IDENTITY_SUFFIX, /cyan laser|dense volumetric fog|wet reflective ground/i);
      for (const forbidden of FUTURISTIC_STYLE_BLACKLIST) {
        assert(
          GLOBAL_NEGATIVE.some((term) => term.toLowerCase().includes(forbidden.toLowerCase()) || forbidden.toLowerCase().includes(term.toLowerCase())),
          `Termo futurista '${forbidden}' nao esta coberto por GLOBAL_NEGATIVE`
        );
      }

      assert(
        prompt.startsWith('turbina_hidreletrica and eixo_rotor, physically present and clearly observable'),
        `Prompt não inicia com subject substantivo: "${prompt.slice(0, 70)}..."`
      );
      assert(
        prompt.endsWith(IDENTITY_SUFFIX),
        `Prompt não termina com IDENTITY_SUFFIX canônico: "${prompt.slice(-80)}"`
      );
      assert(
        !prompt.toLowerCase().startsWith('extreme cinematic 35mm') && !prompt.toLowerCase().startsWith('denis villeneuve'),
        'Prompt começou incorretamente com adjetivos de estilo em vez do sujeito físico.'
      );

      for (const globalNeg of GLOBAL_NEGATIVE) {
        assert(
          negPrompt.includes(globalNeg),
          `Negative prompt não incluiu termo global '${globalNeg}'`
        );
      }
      assert(
        negPrompt.includes('rosto_humano_proibido') && negPrompt.includes('escritorio_comum'),
        'Negative prompt não incluiu os termos de visual_must_not da cena.'
      );
      assert.throws(
        () => buildFireflyPrompt({sceneId: 'SC_BAD_FUTURE', visualSubject: 'cyberpunk holographic drone'}),
        /VISUAL_IDENTITY_FUTURISM_FORBIDDEN:SC_BAD_FUTURE/
      );

      console.log('  ✅ TESTE 1 PASSOU: Prompt governado perfeitamente estruturado e negativos unificados.');
    } catch (err: any) {
      console.error('  ❌ FALHA NO TESTE 1:', err.message);
      allPassed = false;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 2: Fail-Closed Gate com códigos de erro nomeados para clipes inválidos
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 2/7] Validando portão fail-closed (LOW_RES, STOCK_AESTHETIC, BAD_TONE, NO_PROVENANCE, NO_DOMAIN)...');
    try {
      // Mock base válido de 1080p
      const baseValidClip: VideoCatalogEntry = {
        id: 'CLIP_VALID_BASE',
        category: 'industrial',
        filename: 'industrial/sample_valid.mp4',
        tags: ['turbina', 'rotor', 'energia'],
        domains: ['energy', 'industrial'],
        description: 'Turbina real girando em baixa velocidade, fotografia documental de locacao',
        durationSeconds: 6.0,
        fps: 30,
        resolution: '1920x1080',
        colorTone: 'Natural Rec709 / Practical Light',
        provenance: 'curated_broll',
        qaStatus: 'approved'
      };

      // 2.A: Low Resolution (720p)
      resetTestCatalog([{
        ...baseValidClip,
        id: 'CLIP_720P',
        resolution: '1280x720'
      }]);
      const resLowRes = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_01',
        visualSubject: 'turbina',
        visualMustInclude: ['turbina'],
        domainTags: ['energy'],
        requiredCategory: 'industrial'
      });
      assert(
        resLowRes.reason.includes('BANK_CLIP_LOW_RES'),
        `Esperado erro BANK_CLIP_LOW_RES, recebido: ${resLowRes.reason}`
      );

      // 2.B: Stock Aesthetic Tag
      resetTestCatalog([{
        ...baseValidClip,
        id: 'CLIP_STOCK',
        tags: ['turbina', 'generic_stock', 'corporate_smile']
      }]);
      const resStock = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_01',
        visualSubject: 'turbina',
        visualMustInclude: ['turbina'],
        domainTags: ['energy'],
        requiredCategory: 'industrial'
      });
      assert(
        resStock.reason.includes('BANK_CLIP_STOCK_AESTHETIC'),
        `Esperado erro BANK_CLIP_STOCK_AESTHETIC, recebido: ${resStock.reason}`
      );

      // 2.C: Bad Color Tone
      resetTestCatalog([{
        ...baseValidClip,
        id: 'CLIP_BAD_TONE',
        colorTone: 'Daylight Commercial / Pastel Warmth'
      }]);
      const resTone = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_01',
        visualSubject: 'turbina',
        visualMustInclude: ['turbina'],
        domainTags: ['energy'],
        requiredCategory: 'industrial'
      });
      assert(
        resTone.reason.includes('BANK_CLIP_BAD_TONE'),
        `Esperado erro BANK_CLIP_BAD_TONE, recebido: ${resTone.reason}`
      );

      // 2.D: No Provenance
      resetTestCatalog([{
        ...baseValidClip,
        id: 'CLIP_NO_PROV',
        provenance: '' as any
      }]);
      const resProv = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_01',
        visualSubject: 'turbina',
        visualMustInclude: ['turbina'],
        domainTags: ['energy'],
        requiredCategory: 'industrial'
      });
      assert(
        resProv.reason.includes('BANK_CLIP_NO_PROVENANCE'),
        `Esperado erro BANK_CLIP_NO_PROVENANCE, recebido: ${resProv.reason}`
      );

      // 2.E: No Domain
      resetTestCatalog([{
        ...baseValidClip,
        id: 'CLIP_NO_DOM',
        domains: []
      }]);
      const resDom = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_01',
        visualSubject: 'turbina',
        visualMustInclude: ['turbina'],
        domainTags: ['energy'],
        requiredCategory: 'industrial'
      });
      assert(
        resDom.reason.includes('BANK_CLIP_NO_DOMAIN'),
        `Esperado erro BANK_CLIP_NO_DOMAIN, recebido: ${resDom.reason}`
      );

      console.log('  ✅ TESTE 2 PASSOU: Todos os 5 portões de integridade física e estética rejeitaram com erros nomeados.');
    } catch (err: any) {
      console.error('  ❌ FALHA NO TESTE 2:', err.message);
      allPassed = false;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 3: must_include em AND estrito (2 de 3 tokens -> reprovado por BANK_SUBJECT_MISS)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 3/7] Validando correspondência estrita AND em visual_must_include...');
    try {
      // Mock de arquivo com apenas 2 das 3 tags obrigatórias
      resetTestCatalog([{
        id: 'CLIP_PARTIAL_MATCH',
        category: 'industrial',
        filename: 'industrial/sample_valid.mp4',
        tags: ['bico', 'tanque', 'combustivel'],
        domains: ['fuel', 'transportation'],
        description: 'Bico de combustível em tanque',
        durationSeconds: 6.0,
        fps: 30,
        resolution: '1920x1080',
        colorTone: 'Chiaroscuro / Sodium Amber',
        provenance: 'curated_broll',
        qaStatus: 'approved'
      }]);

      const partialReq = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_FUEL_01',
        visualSubject: 'bico no tanque com gasolina',
        visualMustInclude: ['bico', 'tanque', 'gasolina'], // 'gasolina' NÃO está no clip
        domainTags: ['fuel'],
        requiredCategory: 'industrial'
      });

      assert(
        !partialReq.matched,
        'Clip com apenas 2 de 3 tokens não deveria ter dado MATCH.'
      );
      assert(
        partialReq.reason.includes('BANK_SUBJECT_MISS'),
        `Esperado motivo BANK_SUBJECT_MISS, recebido: ${partialReq.reason}`
      );

      // Adicionando 'gasolina' ao clip -> Deve dar HIT
      resetTestCatalog([{
        id: 'CLIP_FULL_MATCH',
        category: 'industrial',
        filename: 'industrial/sample_valid.mp4',
        tags: ['bico', 'tanque', 'gasolina', 'combustivel'],
        domains: ['fuel', 'transportation'],
        description: 'Bico de combustível abastecendo gasolina em tanque',
        durationSeconds: 6.0,
        fps: 30,
        resolution: '1920x1080',
        colorTone: 'Chiaroscuro / Sodium Amber',
        provenance: 'curated_broll',
        qaStatus: 'approved'
      }]);

      const fullReq = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_FUEL_01',
        visualSubject: 'bico no tanque com gasolina',
        visualMustInclude: ['bico', 'tanque', 'gasolina'],
        domainTags: ['fuel'],
        requiredCategory: 'industrial'
      });

      assert(
        fullReq.matched && fullReq.recommendedAction === 'USE_MATCHED_VIDEO',
        `Clip completo com os 3 tokens em AND deveria ter sido aprovado: ${fullReq.reason}`
      );

      console.log('  ✅ TESTE 3 PASSOU: visual_must_include validado com correspondência AND estrita.');
    } catch (err: any) {
      console.error('  ❌ FALHA NO TESTE 3:', err.message);
      allPassed = false;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 4: Deduplicação de clipes no mesmo episódio (BANK_CLIP_ALREADY_USED)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 4/7] Validando deduplicação de clipes no episódio (BANK_CLIP_ALREADY_USED)...');
    try {
      resetTestCatalog([{
        id: 'CLIP_UNIQUE_ASSET_01',
        category: 'industrial',
        filename: 'industrial/sample_valid.mp4',
        tags: ['tubulacao', 'valvula', 'pressao'],
        domains: ['infrastructure', 'hydraulics'],
        description: 'Válvula industrial em tubulação de alta pressão',
        durationSeconds: 6.0,
        fps: 30,
        resolution: '1920x1080',
        colorTone: 'Natural Rec709 / Practical Light',
        provenance: 'curated_broll',
        qaStatus: 'approved'
      }]);

      const requests = [
        {
          sceneId: 'SC_001',
          visualSubject: 'tubulacao com valvula',
          visualMustInclude: ['tubulacao', 'valvula'],
          domainTags: ['infrastructure'],
          requiredCategory: 'industrial'
        },
        {
          sceneId: 'SC_002',
          visualSubject: 'tubulacao com valvula secundária',
          visualMustInclude: ['tubulacao', 'valvula'],
          domainTags: ['infrastructure'],
          requiredCategory: 'industrial'
        }
      ];

      const batchResult = VideoRepositoryMatcher.matchAllScenes(requests);

      assert.equal(batchResult.matchedResults.length, 2);
      assert.equal(batchResult.matchedResults[0].recommendedAction, 'USE_MATCHED_VIDEO', 'Primeira cena deveria ter aprovado o clipe.');
      assert.equal(batchResult.matchedResults[1].recommendedAction, 'DISPATCH_FIREFLY_ON_DEMAND', 'Segunda cena não pode reutilizar o mesmo clipe.');
      assert(
        batchResult.matchedResults[1].reason.includes('BANK_CLIP_ALREADY_USED'),
        `Esperado motivo BANK_CLIP_ALREADY_USED na segunda cena, recebido: ${batchResult.matchedResults[1].reason}`
      );

      console.log('  ✅ TESTE 4 PASSOU: Reutilização de clipe no mesmo episódio foi bloqueada por BANK_CLIP_ALREADY_USED.');
    } catch (err: any) {
      console.error('  ❌ FALHA NO TESTE 4:', err.message);
      allPassed = false;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 5: Validador de Proporções Canônicas (100% HUD -> CANON_PROPORTIONS_VIOLATED)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 5/7] Validando proporções canônicas de cenas (CANON_PROPORTIONS_VIOLATED)...');
    try {
      // 10 cenas todas como KEYFRAME_DOSSIER (100% evidence -> viola 20-30%)
      const biasedScenes = Array.from({ length: 10 }, (_, i) => ({
        sceneId: `SC_${i + 1}`,
        takeType: 'KEYFRAME_DOSSIER',
        required_category: 'evidence_audit',
        visual_subject: 'Relatório pericial com dados'
      }));

      assert.throws(
        () => validateCanonBalance(biasedScenes, { throwOnViolation: true }),
        (err: any) => err.message.includes('CANON_PROPORTIONS_VIOLATED'),
        'Validador deveria ter lançado CANON_PROPORTIONS_VIOLATED para distribuição 100% evidence.'
      );

      // Distribuição equilibrada: 55% matter (11), 25% evidence (5), 10% maps (2), 10% reveal (2) = 20 cenas
      const balancedScenes = [
        ...Array.from({ length: 11 }, (_, i) => ({ sceneId: `M_${i}`, takeType: 'CINEMATIC_TAKE', required_category: 'machinery' })),
        ...Array.from({ length: 5 }, (_, i) => ({ sceneId: `E_${i}`, takeType: 'KEYFRAME_DOSSIER', required_category: 'document_audit' })),
        ...Array.from({ length: 2 }, (_, i) => ({ sceneId: `MAP_${i}`, takeType: 'CINEMATIC_TAKE', required_category: 'route_map' })),
        ...Array.from({ length: 2 }, (_, i) => ({ sceneId: `REV_${i}`, takeType: 'CINEMATIC_TAKE', required_category: 'technical_reveal' }))
      ];

      const balancedResult = validateCanonBalance(balancedScenes, { throwOnViolation: true });
      assert(balancedResult.valid, 'Distribuição perfeitamente equilibrada deveria ter sido aprovada.');

      console.log('  ✅ TESTE 5 PASSOU: CANON_PROPORTIONS_VIOLATED validado com sucesso.');
    } catch (err: any) {
      console.error('  ❌ FALHA NO TESTE 5:', err.message);
      allPassed = false;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 6: Pool vazio gera recomendação e registro limpo sem throw genérico
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 6/7] Validando fallback determinístico quando pool está vazio...');
    try {
      resetTestCatalog([]);

      const matchResult = VideoRepositoryMatcher.matchScene({
        sceneId: 'SC_EMPTY_TEST',
        visualSubject: 'Conexão subterrânea de cabos de fibra',
        visualMustInclude: ['cabos', 'fibra'],
        domainTags: ['telecom'],
        requiredCategory: 'infrastructure'
      });

      assert.equal(matchResult.matched, false);
      assert.equal(matchResult.recommendedAction, 'DISPATCH_FIREFLY_ON_DEMAND');
      assert(matchResult.reason.includes('BANK_CLIP_UNINDEXED'));

      console.log('  ✅ TESTE 6 PASSOU: Pool vazio acionou ação on-demand/fallback determinística sem exceção genérica.');
    } catch (err: any) {
      console.error('  ❌ FALHA NO TESTE 6:', err.message);
      allPassed = false;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TESTE 7: Varredura de Arquitetura contra Hardcoded de Identidade fora de config/spec
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 7/7] Executando varredura contra identidade futurista legada e hardcoding cromatico...');
    try {
      const foldersToScan = ['pipeline', 'contracts'];
      const allowedFiles = new Set([
        path.normalize('config/visualIdentity.ts'),
        path.normalize('spec/hsl-spec.ts')
      ]);

      const violations: string[] = [];

      function scanDir(dirPath: string) {
        if (!fs.existsSync(dirPath)) return;
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          const relPath = path.relative(process.cwd(), fullPath);

          if (entry.isDirectory()) {
            if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git' && entry.name !== 'episodes') {
              scanDir(fullPath);
            }
          } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            if (allowedFiles.has(path.normalize(relPath))) continue;

            const content = fs.readFileSync(fullPath, 'utf8');
            // Verifica template string hardcoded com Denis Villeneuve ou #FF5500
            const hasHardcodedVilleneuve = /["'`][^"'`]*Denis Villeneuve[^"'`]*["'`]/i.test(content);
            const hasHardcodedOrange = /["'`][^"'`]*#FF5500[^"'`]*["'`]/i.test(content);

            if (hasHardcodedVilleneuve) {
              violations.push(`Formula estetica futurista legada encontrada em ${relPath}`);
            }
            if (hasHardcodedOrange) {
              violations.push(`Hardcoded '#FF5500' encontrado em ${relPath}`);
            }
          }
        }
      }

      for (const folder of foldersToScan) {
        scanDir(path.join(process.cwd(), folder));
      }

      if (violations.length > 0) {
        throw new Error(
          `ARCHITECTURE_VIOLATION: Constantes estéticas hardcoded encontradas fora de config/visualIdentity.ts:\n` +
          violations.map(v => `  • ${v}`).join('\n')
        );
      }

      console.log('  ✅ TESTE 7 PASSOU: Zero hardcoding de fórmulas estéticas no pipeline e contratos.');
    } catch (err: any) {
      console.error('  ❌ FALHA NO TESTE 7:', err.message);
      allPassed = false;
    }

  } finally {
    // Limpa o arquivo dummy de vídeo
    if (fs.existsSync(dummyVideoPath)) {
      try { fs.unlinkSync(dummyVideoPath); } catch {}
    }

    // Restaura o catálogo original se existia
    if (originalCatalogRaw) {
      fs.writeFileSync(catalogPath, originalCatalogRaw, 'utf8');
      VideoRepositoryMatcher.loadCatalog(true);
    }
  }

  console.log('\n══════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS 7 TESTES DE EXECUÇÃO DA IDENTIDADE PASSARAM COM SUCESSO!');
    console.log('══════════════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE IDENTIDADE DOSSIÊ DO SISTEMA V3.0!');
    console.log('══════════════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

runIdentityEnforcementTests();
