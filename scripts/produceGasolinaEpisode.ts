import 'dotenv/config';
import path from 'path';
import { runEpisodeProduction } from '../pipeline/episodeProductionRunner';

export async function produceGasolinaEpisode() {
  return await runEpisodeProduction({
    contractPath: path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.episode.json'),
    scenesPath: path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.scenes.json')
  });
}

if (require.main === module) {
  produceGasolinaEpisode().catch((err) => {
    console.error('\n❌ ERRO FATAL NA PRODUÇÃO DO DOCUMENTÁRIO (GASOLINA):', err.message);
    process.exit(1);
  });
}
