import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';
import http from 'http';
import { Logger } from '../../event-hub/logger';
import { ProductionSafetyGuard } from '../../config/productionSafetyGuard';

export interface StartFrameGenerationItem {
  sceneId: string;
  prompt: string;
  subject: string;
  chapterTitle?: string;
}

export interface GeneratedStartFrameResult {
  sceneId: string;
  filePath: string;
  sha256: string;
  width: number;
  height: number;
}

export class StartFrameGenerator {
  private readonly name = 'StartFrameGenerator';
  private readonly chatgptOutputDir = path.join(process.cwd(), 'chatgpt-image-bot', 'output');

  constructor() {}

  /**
   * Tenta sincronizar a imagem real gerada pelo ChatGPT Image Bot
   */
  private syncFromChatGptBot(sceneId: string, targetPath: string): boolean {
    if (!fs.existsSync(this.chatgptOutputDir)) return false;

    // Procura por ID direto (ex: OOL_001.png) ou em arquivos do manifest
    const directFile = path.join(this.chatgptOutputDir, `${sceneId}.png`);
    if (fs.existsSync(directFile) && fs.statSync(directFile).size > 1024 * 50) {
      fs.copyFileSync(directFile, targetPath);
      Logger.info(this.name, `[BOT_SYNC] Frame ${sceneId} sincronizado do ChatGPT Image Bot (${directFile})`);
      return true;
    }

    // Procura em arquivos com o padrão do sceneId
    const allFiles = fs.readdirSync(this.chatgptOutputDir);
    const match = allFiles.find(f => f.toLowerCase().includes(sceneId.toLowerCase()) && (f.endsWith('.png') || f.endsWith('.jpg')));
    if (match) {
      const matchPath = path.join(this.chatgptOutputDir, match);
      if (fs.statSync(matchPath).size > 1024 * 50) {
        fs.copyFileSync(matchPath, targetPath);
        Logger.info(this.name, `[BOT_SYNC] Frame ${sceneId} sincronizado do ChatGPT Image Bot (${matchPath})`);
        return true;
      }
    }

    return false;
  }

  /**
   * Baixa uma imagem gerada via Pollinations AI (FLUX.1) com timeout estendido e validação real
   */
  private async fetchRemoteImage(prompt: string, targetPath: string): Promise<boolean> {
    const encodedPrompt = encodeURIComponent(
      `${prompt}, 8k resolution, raw realistic documentary, 35mm anamorphic photography, no watermark, no text, no human faces`
    );
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1920&height=1080&model=flux&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { timeout: 30000 }, (res) => {
        if (res.statusCode !== 200) {
          Logger.warn(this.name, `Pollinations HTTP ${res.statusCode} para: ${prompt.slice(0, 40)}`);
          resolve(false);
          return;
        }
        const fileStream = fs.createWriteStream(targetPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          const stats = fs.statSync(targetPath);
          if (stats.size > 1024 * 30) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });

      req.on('error', (err) => {
        Logger.warn(this.name, `Erro na conexão remota de imagem: ${err.message}`);
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Gera ou sincroniza Start Frames autênticos gerados por IA para cada cena
   */
  public async generateAll(
    episodeId: string,
    outputBaseDir: string,
    items: StartFrameGenerationItem[]
  ): Promise<GeneratedStartFrameResult[]> {
    Logger.info(this.name, `Iniciando síntese/sincronização de ${items.length} Start Frames para o episódio: ${episodeId}`);
    const results: GeneratedStartFrameResult[] = [];
    const missingScenes: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const sceneDir = path.join(outputBaseDir, 'scenes', item.sceneId);
      fs.mkdirSync(sceneDir, { recursive: true });

      const targetPath = path.join(sceneDir, 'firefly_start_frame.png');
      Logger.info(this.name, `[${i + 1}/${items.length}] Processando frame da cena ${item.sceneId}: "${item.subject.slice(0, 45)}..."`);

      // 1. Tentar sincronizar do ChatGPT Image Bot
      let success = this.syncFromChatGptBot(item.sceneId, targetPath);

      // 2. Se não estiver no bot, tentar API remota (Pollinations FLUX)
      if (!success && (!fs.existsSync(targetPath) || fs.statSync(targetPath).size < 1024 * 30)) {
        try {
          success = await this.fetchRemoteImage(item.prompt, targetPath);
        } catch (err: any) {
          Logger.warn(this.name, `Falha na API remota: ${err.message}`);
        }
      }

      // 3. ZERO FALLBACK FAKE: Se não conseguiu gerar imagem real, registra cena faltante
      if (!fs.existsSync(targetPath) || fs.statSync(targetPath).size < 1024 * 30) {
        missingScenes.push(item.sceneId);
        Logger.error(this.name, `❌ Frame de IA ausente para ${item.sceneId}. Não será gerado mock fraudulento.`);
        continue;
      }

      const fileBuffer = fs.readFileSync(targetPath);
      const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Gravar comprovante de proveniência oficial da IA
      const receiptPath = path.join(sceneDir, 'start_frame_receipt.json');
      const receipt = {
        sceneId: item.sceneId,
        sha256,
        provider: success ? 'chatgpt_image_bot' : 'remote_flux_ai',
        status: 'AUTHENTIC_AI_GENERATED',
        prompt: item.prompt,
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');

      ProductionSafetyGuard.assertNoReusedStartFrames([targetPath], episodeId);

      results.push({
        sceneId: item.sceneId,
        filePath: targetPath,
        sha256,
        width: 1920,
        height: 1080
      });
    }

    if (missingScenes.length > 0) {
      throw new Error(
        `[START_FRAME_GENERATION_FAILED] ${missingScenes.length} cenas não possuem Start Frame gerado por IA: ${missingScenes.join(', ')}. ` +
        `Execute o ChatGPT Image Bot com 'chatgpt-image-bot/prompts/queue.txt' para gerar os frames autênticos!`
      );
    }

    Logger.info(this.name, `✅ ${results.length} Start Frames autênticos validados para ${episodeId}!`);
    return results;
  }
}
