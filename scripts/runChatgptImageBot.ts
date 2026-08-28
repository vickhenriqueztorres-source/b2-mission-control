import { ChatGptImageBotAdapter } from '../adapters/chatgptImageBotAdapter';
import { Logger } from '../event-hub/logger';

async function main() {
  const productionId = `PROD_CHATGPT_${Date.now()}`;
  Logger.info('RunChatgptImageBot', `Iniciando agente de geração de imagens via ChatGPT (ID: ${productionId})...`);

  const adapter = new ChatGptImageBotAdapter();
  await adapter.initialize();

  const isHealthy = await adapter.checkHealth();
  if (!isHealthy) {
    Logger.error('RunChatgptImageBot', 'ChatGPT Image Bot não está devidamente configurado.');
    process.exit(1);
  }

  const samplePrompts = [
    'Gere uma imagem de um gato astronauta flutuando no espaço em estilo aquarela vibrante',
    'Gere uma ilustração de um robô mecânico vintage reparando um relógio antigo em estilo cyberpunk suave',
    'Gere uma imagem cinematográfica de um farol solitário durante uma tempestade oceânica com raios no horizonte'
  ];

  Logger.info('RunChatgptImageBot', `Disparando ${samplePrompts.length} prompts para execução automatizada...`);

  const result = await adapter.submitPromptsAndExecute(productionId, samplePrompts);

  Logger.info(
    'RunChatgptImageBot',
    `Resultado da execução: ${result.success ? 'SUCESSO' : 'FALHA'}. Imagens geradas: ${result.completedImages.length}`
  );

  for (const img of result.completedImages) {
    Logger.info('RunChatgptImageBot', `[IMAGEM] ${img.filename} -> ${img.filepath} (${img.size_bytes} bytes)`);
  }
}

main().catch((err) => {
  Logger.error('RunChatgptImageBot', `Erro fatal na execução: ${err.message}`);
  process.exit(1);
});
