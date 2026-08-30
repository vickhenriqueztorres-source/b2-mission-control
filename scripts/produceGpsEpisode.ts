import 'dotenv/config';
import path from 'path';
import { runEpisodeProduction } from '../pipeline/episodeProductionRunner';

export async function produceGpsEpisode() {
  return await runEpisodeProduction({
    contractPath: path.join(process.cwd(), 'contracts', 'episodes', 'gps-tempo.episode.json'),
    scenesPath: path.join(process.cwd(), 'contracts', 'episodes', 'gps-tempo.scenes.json')
  });
}

if (require.main === module) {
  produceGpsEpisode().catch((err) => {
    console.error('\n❌ ERRO FATAL NA PRODUÇÃO DO DOCUMENTÁRIO (GPS-TEMPO):', err.message);
    process.exit(1);
  });
}
