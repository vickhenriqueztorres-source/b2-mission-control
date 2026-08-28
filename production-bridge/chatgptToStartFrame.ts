import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Logger } from '../event-hub/logger';
import { ChatGptImageBotAdapter, ChatGptImageResult } from '../adapters/chatgptImageBotAdapter';

export interface ChatGptStartFrameItem {
  scene_id: string;
  shot_id: string;
  prompt: string;
  image_path: string;
  sha256: string;
  status: 'IMPORTED' | 'FAILED';
}

export class ChatGptToStartFrameBridge {
  private adapter: ChatGptImageBotAdapter;

  constructor() {
    this.adapter = new ChatGptImageBotAdapter();
  }

  public async generateFramesForScenes(
    productionId: string,
    scenes: Array<{ scene_id: string; shot_id: string; prompt: string }>,
    targetDir: string
  ): Promise<ChatGptStartFrameItem[]> {
    fs.mkdirSync(targetDir, { recursive: true });
    Logger.info('ChatGptToStartFrameBridge', `Iniciando geração de ${scenes.length} quadros via ChatGPT Bot...`);

    const prompts = scenes.map((s) => s.prompt);
    const result = await this.adapter.submitPromptsAndExecute(productionId, prompts);

    const items: ChatGptStartFrameItem[] = [];

    for (const scene of scenes) {
      const match = result.completedImages.find((img) => img.prompt === scene.prompt);

      if (match && fs.existsSync(match.filepath)) {
        const ext = path.extname(match.filepath) || '.png';
        const destName = `${scene.shot_id}_start_frame${ext}`;
        const destPath = path.join(targetDir, destName);

        fs.copyFileSync(match.filepath, destPath);

        const fileBuffer = fs.readFileSync(destPath);
        const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        items.push({
          scene_id: scene.scene_id,
          shot_id: scene.shot_id,
          prompt: scene.prompt,
          image_path: destPath,
          sha256,
          status: 'IMPORTED'
        });

        Logger.info('ChatGptToStartFrameBridge', `Quadro importado com sucesso: ${destName} (SHA256: ${sha256.slice(0, 8)}...)`);
      } else {
        items.push({
          scene_id: scene.scene_id,
          shot_id: scene.shot_id,
          prompt: scene.prompt,
          image_path: '',
          sha256: '',
          status: 'FAILED'
        });
        Logger.warn('ChatGptToStartFrameBridge', `Falha ao obter imagem para cena ${scene.scene_id}`);
      }
    }

    return items;
  }
}
