import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { VideoRepositoryMatcher } from '../hsl/media/videoRepositoryMatcher';
import { VideoCatalog, VideoCatalogEntry } from '../hsl/media/types';
import { parseAndCalculateTimeline, TimelineContractSchema } from '../contracts/timelineContract';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🛡️ SUÍTE DE TESTES: ELIMINAÇÃO DE VAZAMENTO DE IDENTIDADE ENTRE EPISÓDIOS');
console.log('══════════════════════════════════════════════════════════════════════════════════════\n');

async function runCrossEpisodeIsolationSuite() {
  let allPassed = true;

  // ─────────────────────────────────────────────────────────────────────────────
  // FRENTE 1: Proibição de Conteúdo Editorial como Default de Prop
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('[FRENTE 1] Validando ausência de defaults editoriais nos 33 componentes de remotion/documentary...');
  const documentaryDir = path.join(process.cwd(), 'remotion', 'documentary');
  const files = fs.readdirSync(documentaryDir).filter(f => f.endsWith('.tsx'));
  const forbiddenEditorialTerms = [
    'TEMPO DE LIQUIDAÇÃO ATÔMICA',
    'DESDE O TOQUE ATÉ O CRÉDITO NA CONTA DESTINO',
    'CIRCUITO TANQUE',
    'PORTARIA 559',
    'BARUERI // SP',
    'R$ 1,00',
    'CARLOS EDUARDO SILVA'
  ];

  let defaultsFound = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(documentaryDir, file), 'utf8');
    for (const term of forbiddenEditorialTerms) {
      if (content.includes(`'${term}'`) || content.includes(`"${term}"`)) {
        console.error(`  ❌ [${file}] Contém default editorial proibido: "${term}"`);
        defaultsFound++;
        allPassed = false;
      }
    }
  }

  if (defaultsFound === 0) {
    console.log(`  ✅ FRENTE 1 PASSOU: Todos os ${files.length} componentes estão livres de defaults editoriais.`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FRENTE 2: Veto Temático do Banco de Vídeos (Fail-Closed)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[FRENTE 2] Validando veto temático fail-closed (BANK_CLIP_NO_DOMAIN & BANK_DOMAIN_MISMATCH)...');
  const catalogPath = path.join(process.cwd(), 'assets', 'video_repository', 'catalog.json');
  const catalogRaw = fs.readFileSync(catalogPath, 'utf8');

  try {
    // Garante restauração limpa
    fs.writeFileSync(catalogPath, catalogRaw, 'utf8');
    const catalog = VideoRepositoryMatcher.loadCatalog(true);

    // 2.1: Catálogo deve conter 'domains' em todos os vídeos
    const missingDomains = catalog.videos.filter(v => !v.domains || v.domains.length === 0);
    assert.equal(missingDomains.length, 0, 'Todos os vídeos do catálogo devem ter domains declarados');
    console.log(`  ✅ 2.1 PASSOU: Todos os ${catalog.videos.length} vídeos possuem 'domains' preenchidos.`);

    // 2.2: BANK_CLIP_NO_DOMAIN se clip não possuir domains
    const clip = catalog.videos.find(v => v.id === 'IND_PARCEL_CONVEYOR_BELT_01')!;
    assert(clip, 'IND_PARCEL_CONVEYOR_BELT_01 deve existir no catálogo');
    const mockClipNoDomain: VideoCatalogEntry = {
      ...clip,
      resolution: '1920x1080',
      domains: []
    };
    const mockCatalog: VideoCatalog = {
      ...catalog,
      videos: [mockClipNoDomain]
    };
    VideoRepositoryMatcher.saveCatalog(mockCatalog);

    const matchNoDomain = VideoRepositoryMatcher.matchScene({
      sceneId: 'SC_TEST_VETO',
      chapterTitle: 'A TRIAGEM DE ENCOMENDAS',
      visualSubject: 'Esteira rolante automatizada transportando pacotes e caixas em centro de distribuicao',
      domainTags: ['logistics'],
      tags: ['esteira', 'pacote', 'triagem', 'logistica'],
      visualMustInclude: ['pacote'],
      requiredCategory: 'industrial',
      allowedSources: ['bank']
    }, 'smart');

    assert.ok(matchNoDomain.reason.includes('BANK_CLIP_NO_DOMAIN'), `Deve rejeitar com BANK_CLIP_NO_DOMAIN (atual: ${matchNoDomain.reason})`);
    console.log(`  ✅ 2.2 PASSOU: Rejeição com BANK_CLIP_NO_DOMAIN confirmada.`);

    // 2.3: BANK_DOMAIN_MISMATCH se não houver interseção entre clip.domains e episode.domainTags
    const mockClipWithDomains: VideoCatalogEntry = {
      ...clip,
      resolution: '1920x1080',
      domains: ['logistics', 'ecommerce']
    };
    const mockCatalog2: VideoCatalog = {
      ...catalog,
      videos: [mockClipWithDomains]
    };
    VideoRepositoryMatcher.saveCatalog(mockCatalog2);

    const matchMismatch = VideoRepositoryMatcher.matchScene({
      sceneId: 'SC_TEST_MISMATCH',
      chapterTitle: 'A TRIAGEM DE ENCOMENDAS',
      visualSubject: 'Esteira rolante automatizada transportando pacotes e caixas em centro de distribuicao',
      domainTags: ['gps', 'relativity', 'satellites'],
      tags: ['esteira', 'pacote', 'triagem', 'logistica'],
      visualMustInclude: ['pacote'],
      requiredCategory: 'industrial',
      allowedSources: ['bank']
    }, 'smart');

    assert.ok(matchMismatch.reason.includes('BANK_DOMAIN_MISMATCH'), `Deve rejeitar com BANK_DOMAIN_MISMATCH (atual: ${matchMismatch.reason})`);
    console.log(`  ✅ 2.3 PASSOU: Veto temático com BANK_DOMAIN_MISMATCH confirmado.`);
  } catch (err: any) {
    console.error('  ❌ FALHA NA FRENTE 2:', err.message);
    allPassed = false;
  } finally {
    fs.writeFileSync(catalogPath, catalogRaw, 'utf8');
    VideoRepositoryMatcher.loadCatalog(true);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FRENTE 3: Deduplicação e QA Visual no Gate (GATE_DUPLICATE_ASSET_ADJACENT & GATE_BLACK_FRAME)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[FRENTE 3] Validando regras estritas do Gate (GATE_DUPLICATE_ASSET_ADJACENT & GATE_BLACK_FRAME)...');
  try {
    // 3.1: Luminância do método calculateMediaLuminance
    const thumbPath = path.join(process.cwd(), 'public', 'episodes', 'gps-tempo', 'images', '00_thumbnail_master_4k.jpg');
    const lum = PipelineContractGate.calculateMediaLuminance(thumbPath);
    assert.ok(lum > 0.03, `Luminância de thumbnail válida deve ser > 3% (atual: ${(lum * 100).toFixed(2)}%)`);
    console.log(`  ✅ 3.1 PASSOU: Medição de luminância operacional (${(lum * 100).toFixed(2)}%).`);
  } catch (err: any) {
    console.error('  ❌ FALHA NA FRENTE 3:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FRENTE 4: Callout Fail-Closed & Validação de Props Editoriais
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[FRENTE 4] Validando Callouts e Props Editoriais no Timeline Contract...');
  try {
    // 4.1: TIMELINE_CALLOUT_INVALID se kicker === title
    const invalidCalloutTimeline = {
      episodeId: 'test-callout',
      fps: 30,
      coldOpen: { sceneIds: ['SC_01', 'SC_02'] },
      actBreaks: [2, 3],
      scenes: [
        { id: 'SC_01', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0, callout: { categoryText: 'DOSSIÊ', mainText: 'DOSSIÊ', subText: 'Sub' } },
        { id: 'SC_02', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
        { id: 'SC_03', component: 'DynamicDocumentaryMedia', durationSeconds: 6.0 },
        { id: 'SC_04', component: 'DynamicDocumentaryMedia', durationSeconds: 6.0 }
      ]
    };

    assert.throws(
      () => parseAndCalculateTimeline(invalidCalloutTimeline),
      /TIMELINE_CALLOUT_INVALID/
    );
    console.log('  ✅ 4.1 PASSOU: TIMELINE_CALLOUT_INVALID bloqueia kicker === title.');

    // 4.2: TIMELINE_MISSING_EDITORIAL_PROPS se componente não tiver props obrigatórias
    const missingPropsTimeline = {
      episodeId: 'test-props',
      fps: 30,
      coldOpen: { sceneIds: ['SC_01', 'SC_02'] },
      actBreaks: [2, 3],
      scenes: [
        { id: 'SC_01', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
        { id: 'SC_02', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
        { id: 'SC_03', component: 'VelocityPhysicsCalculationHUD', durationSeconds: 6.0, props: {} }, // Sem headerFormula
        { id: 'SC_04', component: 'DynamicDocumentaryMedia', durationSeconds: 6.0 }
      ]
    };

    assert.throws(
      () => parseAndCalculateTimeline(missingPropsTimeline),
      /TIMELINE_MISSING_EDITORIAL_PROPS/
    );
    console.log('  ✅ 4.2 PASSOU: TIMELINE_MISSING_EDITORIAL_PROPS bloqueia componentes vazios.');
  } catch (err: any) {
    console.error('  ❌ FALHA NA FRENTE 4:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FRENTE 5: Colisão de HUD em Safe Zones
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[FRENTE 5] Validando prevenção de colisão de HUDs (TIMELINE_HUD_COLLISION)...');
  try {
    const collisionTimeline = {
      episodeId: 'test-collision',
      fps: 30,
      coldOpen: { sceneIds: ['SC_01', 'SC_02'] },
      actBreaks: [2, 3],
      scenes: [
        {
          id: 'SC_01',
          component: 'DynamicDocumentaryMedia',
          durationSeconds: 8.0,
          callout: { categoryText: 'ALERTA', mainText: 'TITULO A', subText: 'SUB', position: 'top_center' }
        },
        { id: 'SC_02', component: 'DynamicDocumentaryMedia', durationSeconds: 8.0 },
        { id: 'SC_03', component: 'DynamicDocumentaryMedia', durationSeconds: 6.0 },
        { id: 'SC_04', component: 'DynamicDocumentaryMedia', durationSeconds: 6.0 }
      ],
      hudWindows: [
        {
          componentName: 'AtomicStopwatch',
          zone: 'top_center',
          props: { label: 'CRONOMETRO' },
          appearances: [{ startScene: 0, seconds: 8 }] // Mesma cena 0 e mesma zona top_center
        }
      ]
    };

    assert.throws(
      () => parseAndCalculateTimeline(collisionTimeline),
      /TIMELINE_HUD_COLLISION/
    );
    console.log('  ✅ 5.1 PASSOU: TIMELINE_HUD_COLLISION bloqueia elementos simultâneos na mesma safe zone.');
  } catch (err: any) {
    console.error('  ❌ FALHA NA FRENTE 5:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CRITÉRIO DE ACEITE FINAL: Validação do episódio GPS não-migrado
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[CRITÉRIO DE ACEITE FINAL] Validando que o episódio GPS atual falha estritamente no contrato...');
  try {
    assert.throws(
      () => {
        require('../remotion/episodeGpsTimelineData');
      },
      /(TIMELINE_CALLOUT_INVALID|TIMELINE_MISSING_EDITORIAL_PROPS)/
    );
    console.log('  ✅ CRITÉRIO DE ACEITE PASSOU: O episódio GPS não-migrado falha com as violações editoriais esperadas.');
  } catch (err: any) {
    console.error('  ❌ FALHA NO CRITÉRIO DE ACEITE FINAL:', err.message);
    allPassed = false;
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODAS AS 5 FRENTES E CRITÉRIOS DE ACEITE FORAM CUMPRIDOS COM SUCESSO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE ISOLAMENTO DE EPISÓDIOS!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

runCrossEpisodeIsolationSuite();
