import { ImageRepositoryManager } from '../hsl/media/imageRepositoryManager';

function parseArgs(): { runId: string; episodeId?: string; topic?: string } {
  const args = process.argv.slice(2);
  let runId = 'OOL-EP02-CABOS';
  let episodeId: string | undefined;
  let topic: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--runId' || args[i] === '-r') && args[i + 1]) {
      runId = args[i + 1];
      i++;
    } else if ((args[i] === '--episode' || args[i] === '-e') && args[i + 1]) {
      episodeId = args[i + 1];
      i++;
    } else if ((args[i] === '--topic' || args[i] === '-t') && args[i + 1]) {
      topic = args[i + 1];
      i++;
    }
  }

  return { runId, episodeId, topic };
}

async function main(): Promise<void> {
  const { runId, episodeId, topic } = parseArgs();

  console.log(`\n[IMAGE_BANK_SYNC] Sincronizando imagens do episódio '${runId}' com o Banco Central de Imagens...`);
  
  const result = ImageRepositoryManager.archiveEpisodeRun(runId, episodeId, topic);

  console.log(`\n[SUCESSO] ${result.archivedCount} imagens catalogadas e arquivadas no Banco Central!`);
  console.log(`- Episódio: ${episodeId || runId}`);
  console.log(`- Diretório de Arquivo: assets/image_repository/episodes_archive/${episodeId || runId}/`);
  console.log(`- Total de Imagens no Catálogo Central: ${ImageRepositoryManager.loadCatalog().totalImages}\n`);
}

main().catch((err) => {
  console.error('[FATAL_ERROR]', err.message);
  process.exit(1);
});
