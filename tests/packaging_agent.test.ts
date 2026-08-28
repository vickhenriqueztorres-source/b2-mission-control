import {DescriptionAndSeoPlanner} from '../packaging-agent/planner/description-seo-planner';
import {ThumbnailPlanner} from '../packaging-agent/planner/thumbnail-planner';
import {TitlePlanner} from '../packaging-agent/planner/title-planner';
import {PackagingRagClient} from '../packaging-agent/rag/packaging-rag-client';

async function runTests() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🧪 SUÍTE DE TESTES: SQUAD DE PACKAGING, THUMBNAILS & SEO (RAG)');
  console.log('══════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
    }
  }

  // 1. Teste do RAG Client
  console.log('🔹 Testando PackagingRagClient...');
  const rag = new PackagingRagClient();
  const principles = rag.getNeurosciencePrinciples();
  assert(principles.length >= 5, 'RAG contém princípios de neurociência e atenção');
  assert(rag.getVariantStrategy('A') !== null, 'Estratégia da Variante A disponível');
  assert(rag.getVariantStrategy('B') !== null, 'Estratégia da Variante B disponível');
  assert(rag.getVariantStrategy('C') !== null, 'Estratégia da Variante C disponível');

  // 2. Teste do ThumbnailPlanner
  console.log('\n🔹 Testando ThumbnailPlanner...');
  const thumbPlanner = new ThumbnailPlanner();
  const concepts = thumbPlanner.plan({
    episodeTitle: 'O Outro Lado do Pix',
    objectOrFlow: 'O Pacote de Dados Criptográfico',
    systemBeingAnalyzed: 'Sistema de Pagamentos Instantâneos (SPI)',
    heroVisual: 'Criptoprocessador HSM',
    mainConstraint: 'Latência de 12ms',
    primaryConsequence: 'Risco de Travamento'
  });

  assert(concepts.length === 3, 'Gera exatamente 3 conceitos de thumbnails (A, B, C)');
  assert(concepts[0].role === 'MECHANISM', 'Variante A é MECHANISM');
  assert(concepts[1].role === 'CONSEQUENCE', 'Variante B é CONSEQUENCE');
  assert(concepts[2].role === 'FINAL_HANDOFF', 'Variante C é FINAL_HANDOFF');
  for (const c of concepts) {
    const wordCount = c.headline_text.split(/\s+/).length;
    assert(wordCount >= 1 && wordCount <= 7, `Headline da variante ${c.variant_id} tem tamanho ideal (${wordCount} palavras)`);
    assert(c.color_palette.accent === '#FF5500', `Variante ${c.variant_id} usa Laranja #FF5500 oficial`);
  }

  // 3. Teste do TitlePlanner
  console.log('\n🔹 Testando TitlePlanner...');
  const titlePlanner = new TitlePlanner();
  const titles = titlePlanner.plan({
    objectOrFlow: 'O Pacote de Dados Criptográfico',
    systemBeingAnalyzed: 'Sistema de Pagamentos Instantâneos (SPI)',
    centralQuestion: 'O que acontece fisicamente nos 1,4 segundo?',
    primaryConsequence: 'Risco de Travamento',
    thumbnailConcepts: concepts
  });

  assert(titles.length === 3, 'Gera exatamente 3 títulos para teste A/B/C');
  assert(new Set(titles.map((t) => t.title)).size === 3, 'Todos os 3 títulos são distintos');
  for (const t of titles) {
    const thumb = concepts.find((c) => c.variant_id === t.variant_id);
    assert(t.title !== thumb?.headline_text, `Título ${t.variant_id} não repete o texto da thumbnail (1 + 1 = 3)`);
  }

  // 4. Teste do DescriptionAndSeoPlanner
  console.log('\n🔹 Testando DescriptionAndSeoPlanner...');
  const descPlanner = new DescriptionAndSeoPlanner();
  const metadata = descPlanner.plan({
    episodeId: 'OOL-001',
    episodeTitle: 'O Outro Lado do Pix',
    objectOrFlow: 'O Pacote de Dados Criptográfico',
    systemBeingAnalyzed: 'Sistema de Pagamentos Instantâneos (SPI)',
    centralQuestion: 'O que acontece fisicamente nos 1,4 segundo?',
    primaryConsequence: 'Risco de Travamento',
    titles,
    recommendedTitleVariant: 'C'
  });

  assert(metadata.hook_lines.length >= 2, 'Descrição contém hook de 2+ linhas');
  assert(metadata.chapters.length >= 4, 'Descrição contém 4+ capítulos com intenção de busca');
  assert(metadata.tags.all_flat_tags.length >= 15, `SEO contém 15+ tags estratégicas (${metadata.tags.all_flat_tags.length} encontradas)`);
  assert(metadata.hashtags.includes('#OOutroLado'), 'Hashtags incluem #OOutroLado');
  assert(metadata.shorts_bridge.short_hook.length > 10, 'Ponte para Shorts configurada');

  console.log(`\n==================================================================`);
  console.log(`📊 RESULTADO DOS TESTES: ${passed}/${total} PASSARAM`);
  console.log(`==================================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('❌ Erro na execução dos testes:', err);
  process.exit(1);
});
