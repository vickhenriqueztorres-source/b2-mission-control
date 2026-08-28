import { abrahamRag } from '../hsl/editorial/abraham';
import { AbrahamDomain, AbrahamModuleId } from '../hsl/editorial/abraham/abrahamRagRuntime';

function parseArgs(): {
  query: string;
  domain?: AbrahamDomain;
  moduleId?: AbrahamModuleId;
  topK: number;
} {
  const args = process.argv.slice(2);
  let query = '';
  let domain: AbrahamDomain | undefined;
  let moduleId: AbrahamModuleId | undefined;
  let topK = 3;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--domain' || arg === '-d') {
      domain = args[++i] as AbrahamDomain;
    } else if (arg === '--module' || arg === '-m') {
      moduleId = parseInt(args[++i], 10) as AbrahamModuleId;
    } else if (arg === '--top' || arg === '-t') {
      topK = parseInt(args[++i], 10);
    } else if (!arg.startsWith('-')) {
      query += (query ? ' ' : '') + arg;
    }
  }

  return { query: query.trim() || 'diretrizes gerais criador zen', domain, moduleId, topK };
}

async function main(): Promise<void> {
  const { query, domain, moduleId, topK } = parseArgs();

  process.stdout.write(`\n🔍 PESQUISANDO RAG ABRAHAM (O CRIADOR ZEN)\n`);
  process.stdout.write(`──────────────────────────────────────────\n`);
  process.stdout.write(`Termo: "${query}" | Domínio: ${domain || 'TODOS'} | Módulo: ${moduleId || 'TODOS'} | Top: ${topK}\n\n`);

  try {
    const result = abrahamRag.query({
      query,
      domain,
      module_id: moduleId,
      top_k: topK
    });

    if (result.scored_chunks.length === 0) {
      process.stdout.write(`⚠️ Nenhum resultado encontrado para o termo pesquisado.\n\n`);
      return;
    }

    process.stdout.write(`✅ ${result.total_matches} correspondência(s) encontrada(s). Exibindo as top ${result.scored_chunks.length}:\n\n`);

    result.scored_chunks.forEach((sc, idx) => {
      process.stdout.write(`[${idx + 1}] ⭐ Score: ${sc.score} | Domínio: ${sc.chunk.domain} | Módulo: ${sc.chunk.module_id}\n`);
      process.stdout.write(`📌 Seção: ${sc.chunk.section_title}\n`);
      process.stdout.write(`📄 Origem: ${sc.chunk.source_file}\n`);
      process.stdout.write(`📝 Conteúdo:\n${sc.chunk.content}\n`);
      if (sc.chunk.actionable_rules.length > 0) {
        process.stdout.write(`⚡ Regras Aplicáveis:\n`);
        sc.chunk.actionable_rules.forEach((r) => process.stdout.write(`   - ${r}\n`));
      }
      process.stdout.write(`\n──────────────────────────────────────────\n\n`);
    });

    process.stdout.write(`🎯 Princípios Identificados:\n`);
    result.principles.forEach((p) => process.stdout.write(`   • ${p}\n`));
    process.stdout.write(`\n`);
  } catch (error) {
    process.stderr.write(`❌ Erro ao consultar RAG Abraham: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}

main();
