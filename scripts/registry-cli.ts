import { ArtifactRegistry } from '../pipeline/artifactRegistry';
import { RunDerivationEngine } from '../pipeline/runDerivation';
import { RunCleaner } from '../pipeline/runCleaner';

function printHelp(): void {
  console.log(`
Uso: npm run registry -- <comando> [opções]

Comandos:
  list [projeto] [episódio]       Lista runs e seus handles compactos
  inspect <handle>                Exibe metadados técnicos, SHA-256 e linhagem
  resolve <handle>                Retorna o caminho absoluto do arquivo no disco
  list-audios <projeto>           Lista áudios aprovados e reaproveitáveis
  derive --source <handle> [...]  Deriva uma nova run herdando áudio aprovado
  clean <handle> [--execute]      Simula ou executa limpeza de intermediários
  rebuild                         Reconstrói o registry varrendo o disco
  verify-isolation                Verifica o isolamento estrito entre projetos
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  const registry = new ArtifactRegistry();

  if (!command || command === 'help' || command === '--help') {
    printHelp();
    return;
  }

  switch (command) {
    case 'list': {
      const proj = args[1];
      const ep = args[2];
      const runs = registry.listRuns({ projectId: proj, episodeId: ep });
      console.log(`\n📦 RUNS REGISTRADAS NO PIPELINE (${runs.length} encontradas):`);
      console.log(`┌───────────────────────────┬─────────┬──────────┬────────────┬──────────────┬─────────────────────┐`);
      console.log(`│ HANDLE COLÁVEL            │ VERSÃO  │ STATUS   │ DURAÇÃO    │ CONFORMIDADE │ CRIADO EM           │`);
      console.log(`├───────────────────────────┼─────────┼──────────┼────────────┼──────────────┼─────────────────────┤`);
      for (const r of runs) {
        const h = r.handle.slice(0, 25).padEnd(25);
        const v = `v${r.version}`.padEnd(7);
        const st = r.overallStatus.slice(0, 8).padEnd(8);
        const dur = r.durationSeconds ? `${r.durationSeconds.toFixed(1)}s (${(r.durationSeconds / 60).toFixed(1)}m)`.slice(0, 10).padEnd(10) : 'N/A'.padEnd(10);
        const comp = (r.complianceStatus === 'APPROVED' ? '✅ PASS' : r.complianceStatus === 'REJECTED' ? '❌ FAIL' : '⏳ PEND').padEnd(12);
        const d = r.createdAt.slice(0, 19).padEnd(19);
        console.log(`│ ${h} │ ${v} │ ${st} │ ${dur} │ ${comp} │ ${d} │`);
      }
      console.log(`└───────────────────────────┴─────────┴──────────┴────────────┴──────────────┴─────────────────────┘\n`);
      break;
    }

    case 'inspect': {
      const handle = args[1];
      if (!handle) {
        console.error('❌ Erro: Informe o handle a ser inspecionado. Ex: npm run registry -- inspect @OOL/EP02:v1');
        process.exit(1);
      }
      try {
        const art = registry.resolveArtifact(handle);
        console.log(`\n🔍 DETALHES DO ARTEFATO: ${art.handle}`);
        console.log(`══════════════════════════════════════════════════════════════════`);
        console.log(`Tipo:                 ${art.artifactType}`);
        console.log(`Run ID:               ${art.runId}`);
        console.log(`Projeto / Episódio:   ${art.projectId} / ${art.episodeId} (Versão ${art.version})`);
        console.log(`Arquivo Físico:       ${art.absolutePath}`);
        console.log(`Tamanho em Bytes:     ${art.sizeBytes} (${(art.sizeBytes / (1024 * 1024)).toFixed(2)} MB)`);
        console.log(`Hash SHA-256:         ${art.sha256}`);
        console.log(`Conformidade PRD:     ${art.complianceStatus === 'APPROVED' ? '✅ APROVADO' : '❌ REPROVADO'}`);
        if (art.technicalMetadata.durationSeconds) {
          console.log(`Duração ffprobe:      ${art.technicalMetadata.durationSeconds.toFixed(2)}s`);
        }
        if (art.technicalMetadata.width && art.technicalMetadata.height) {
          console.log(`Resolução / Codec:    ${art.technicalMetadata.width}x${art.technicalMetadata.height} (${art.technicalMetadata.codec || 'h264'})`);
        }
        if (art.lineage?.derivedFromRunId) {
          console.log(`Linhagem (Derivado):  De ${art.lineage.derivedFromRunId} (${art.lineage.derivedFromHandle})`);
        }
        console.log(`Data de Criação:      ${art.createdAt}`);
        console.log(`══════════════════════════════════════════════════════════════════\n`);
      } catch (e: any) {
        console.error(`❌ ${e.message}`);
        process.exit(1);
      }
      break;
    }

    case 'resolve': {
      const handle = args[1];
      if (!handle) {
        console.error('❌ Erro: Informe o handle a ser resolvido.');
        process.exit(1);
      }
      try {
        const filePath = registry.resolvePath(handle);
        console.log(filePath);
      } catch (e: any) {
        console.error(`❌ ${e.message}`);
        process.exit(1);
      }
      break;
    }

    case 'list-audios': {
      const proj = args[1] || 'OOL';
      const audios = registry.listApprovedAudios(proj);
      console.log(`\n🎙️ ÁUDIOS APROVADOS E REAPROVEITÁVEIS (PROJETO: ${proj.toUpperCase()}):`);
      console.log(`┌───────────────────────────────┬────────────┬─────────────┬──────────────────────────┐`);
      console.log(`│ HANDLE DE ÁUDIO               │ DURAÇÃO    │ TAMANHO     │ SHA-256 (PREFIXO)        │`);
      console.log(`├───────────────────────────────┼────────────┼─────────────┼──────────────────────────┤`);
      for (const a of audios) {
        const h = a.handle.slice(0, 29).padEnd(29);
        const dur = a.technicalMetadata.durationSeconds ? `${a.technicalMetadata.durationSeconds.toFixed(1)}s`.padEnd(10) : 'N/A'.padEnd(10);
        const sz = `${(a.sizeBytes / (1024 * 1024)).toFixed(2)} MB`.padEnd(11);
        const sha = a.sha256.slice(0, 24).padEnd(24);
        console.log(`│ ${h} │ ${dur} │ ${sz} │ ${sha} │`);
      }
      console.log(`└───────────────────────────────┴────────────┴─────────────┴──────────────────────────┘\n`);
      break;
    }

    case 'derive': {
      let sourceHandle = '';
      let targetEp = '';
      let targetProj = '';

      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--source' && args[i + 1]) {
          sourceHandle = args[i + 1];
          i++;
        } else if (args[i] === '--episode' && args[i + 1]) {
          targetEp = args[i + 1];
          i++;
        } else if (args[i] === '--project' && args[i + 1]) {
          targetProj = args[i + 1];
          i++;
        }
      }

      if (!sourceHandle) {
        console.error('❌ Erro: Especifique a run de origem com --source <handle>');
        process.exit(1);
      }

      try {
        console.log(`\n🚀 Derivando nova run a partir de '${sourceHandle}'...`);
        const result = RunDerivationEngine.deriveRun({
          sourceHandle,
          targetProjectId: targetProj,
          targetEpisodeId: targetEp,
          inherit: ['audio_narration']
        });

        console.log(`✅ RUN DERIVADA COM SUCESSO!`);
        console.log(`Novo Handle:          ${result.newHandle}`);
        console.log(`Novo Run ID:          ${result.newRunId}`);
        console.log(`Pasta Canônica:       ${result.newRunDir}`);
        console.log(`Origem (Linhagem):    ${result.sourceRunId} (${result.sourceHandle})`);
        console.log(`Áudio Herdado SHA256: ${result.inheritedArtifacts['audio_narration'].sha256}\n`);
      } catch (e: any) {
        console.error(`❌ ${e.message}`);
        process.exit(1);
      }
      break;
    }

    case 'clean': {
      const handle = args[1];
      const execute = args.includes('--execute');
      if (!handle) {
        console.error('❌ Erro: Informe o handle da run para limpeza. Ex: npm run registry -- clean @OOL/EP02:v1 [--execute]');
        process.exit(1);
      }

      try {
        const result = RunCleaner.cleanRun({
          handleOrRunId: handle,
          dryRun: !execute
        });

        console.log(`\n🧹 RELATÓRIO DE LIMPEZA DE INTERMEDIÁRIOS // RUN: ${result.handle}`);
        console.log(`══════════════════════════════════════════════════════════════════`);
        console.log(`Modo:                 ${result.dryRun ? '🔍 SIMULAÇÃO (DRY-RUN - Nenhum arquivo foi removido)' : '⚡ EXECUÇÃO REAL'}`);
        console.log(`Arquivos Descartáveis: ${result.disposableFilesFound.length} intermediários identificados`);
        console.log(`Espaço Recuperável:   ${(result.totalBytesRecoverable / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`Entregáveis Mantidos: ${result.preservedDeliverables.length} arquivos preservados 100% íntegros`);
        console.log(`══════════════════════════════════════════════════════════════════`);
        if (result.dryRun) {
          console.log(`💡 Para executar a exclusão dos intermediários, adicione a flag '--execute'.\n`);
        } else {
          console.log(`✅ Limpeza concluída com sucesso! Espaço liberado no disco.\n`);
        }
      } catch (e: any) {
        console.error(`❌ ${e.message}`);
        process.exit(1);
      }
      break;
    }

    case 'rebuild': {
      console.log('\n🔄 Reconstruindo Artifact Registry a partir de varredura do disco...');
      const data = registry.rebuildFromDisk();
      const runCount = Object.keys(data.runs).length;
      const artCount = Object.keys(data.artifacts).length;
      console.log(`✅ Registry reconstruído com sucesso!`);
      console.log(`Total de Runs indexadas:      ${runCount}`);
      console.log(`Total de Artefatos indexados: ${artCount}\n`);
      break;
    }

    case 'verify-isolation': {
      console.log('\n🔒 Verificando isolamento estrito entre projetos...');
      const check = registry.verifyProjectIsolation();
      if (check.isolated) {
        console.log('✅ 100% ISOLADO: Nenhuma contaminação ou cruzamento de assets entre projetos detectado.\n');
      } else {
        console.error(`❌ VIOLAÇÕES DE ISOLAMENTO DETECTADAS:\n${check.violations.join('\n')}\n`);
        process.exit(1);
      }
      break;
    }

    default:
      console.error(`❌ Comando desconhecido: '${command}'`);
      printHelp();
      process.exit(1);
  }
}

main().catch(e => {
  console.error('[FATAL_REGISTRY_CLI_ERROR]', e);
  process.exit(1);
});
