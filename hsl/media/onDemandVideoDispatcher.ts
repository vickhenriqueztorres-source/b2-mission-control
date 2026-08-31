import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { OnDemandVideoJob, VideoCatalogEntry } from './types';
import { VideoRepositoryMatcher } from './videoRepositoryMatcher';

export class OnDemandVideoDispatcher {
  private static readonly REPO_PATH = path.join(process.cwd(), 'assets', 'video_repository');
  private static readonly FIREFLY_ROOT = path.join(process.cwd(), 'firefly-automation');

  /**
   * Cria um guia de produção cirúrgico focado apenas nas cenas sob demanda
   */
  public static createOnDemandGuide(
    runId: string,
    jobs: OnDemandVideoJob[]
  ): string {
    const guidePath = path.join(process.cwd(), 'runs', runId, 'on-demand-firefly-guide.json');
    const guideDir = path.dirname(guidePath);
    if (!fs.existsSync(guideDir)) {
      fs.mkdirSync(guideDir, { recursive: true });
    }

    const items = jobs.map((job) => ({
      name: `${job.sceneId}_${job.shotId}`,
      prompt: job.prompt,
      motion: 'slow_push_in',
      camera_movement: 'Cinematic push in 35mm chiaroscuro',
      duration_seconds: job.durationSeconds || 8.0,
      aspect_ratio: job.aspectRatio || '16:9',
      category: job.targetCategory || 'infrastructure',
      tags: job.tags || []
    }));

    fs.writeFileSync(guidePath, JSON.stringify({ items, createdAt: new Date().toISOString() }, null, 2), 'utf8');
    return guidePath;
  }

  /**
   * Dispara o Firefly Bot cirurgicamente para as cenas especificadas
   */
  public static dispatchBot(guidePath: string): { success: boolean; output: string } {
    console.log(`[ON_DEMAND_FIREFLY] Alimentando guia cirúrgico: ${guidePath}`);

    // 1. Feed guide
    const feedResult = spawnSync('python', [
      '-m', 'firefly_bot.main',
      '--root', 'firefly-automation',
      '--feed-guide', guidePath
    ], {
      cwd: process.cwd(),
      encoding: 'utf8'
    });

    if (feedResult.status !== 0) {
      console.warn(`[ON_DEMAND_FIREFLY] Aviso ao alimentar fila: ${feedResult.stderr || feedResult.stdout}`);
      return { success: false, output: feedResult.stderr || feedResult.stdout };
    }

    console.log(`[ON_DEMAND_FIREFLY] Fila alimentada com sucesso. Iniciando execução do bot...`);

    // 2. Run bot
    const runResult = spawnSync('python', [
      '-m', 'firefly_bot.main',
      '--root', 'firefly-automation',
      '--run'
    ], {
      cwd: process.cwd(),
      encoding: 'utf8'
    });

    const isSuccess = runResult.status === 0;
    return {
      success: isSuccess,
      output: runResult.stdout || runResult.stderr || ''
    };
  }

  /**
   * Auto-ingere um take gerado sob demanda no Repositório Central de Vídeos
   */
  public static autoIngestCompletedTake(options: {
    videoFilePath: string;
    sceneId: string;
    category: string;
    description: string;
    tags: string[];
    durationSeconds?: number;
    recommendedMotion?: any;
  }): VideoCatalogEntry | null {
    if (!fs.existsSync(options.videoFilePath)) {
      console.warn(`[ON_DEMAND_FIREFLY] Arquivo de vídeo gerado não encontrado: ${options.videoFilePath}`);
      return null;
    }

    const catFolder = path.join(this.REPO_PATH, options.category);
    if (!fs.existsSync(catFolder)) {
      fs.mkdirSync(catFolder, { recursive: true });
    }

    const filename = `${options.category}/${path.basename(options.videoFilePath)}`;
    const destPath = path.join(this.REPO_PATH, filename);

    // Copia para o repositório
    fs.copyFileSync(options.videoFilePath, destPath);

    // Extrai hash SHA-256
    const fileBuf = fs.readFileSync(destPath);
    const sha256 = crypto.createHash('sha256').update(fileBuf).digest('hex');

    const entry: VideoCatalogEntry = {
      id: `${options.category.toUpperCase()}_${options.sceneId}_${Date.now()}`,
      category: options.category,
      filename: filename.replace(/\\/g, '/'),
      tags: options.tags,
      description: options.description,
      durationSeconds: options.durationSeconds || 8.0,
      fps: 30,
      resolution: '1920x1080',
      colorTone: 'Chiaroscuro / Sodium Amber',
      recommendedMotion: options.recommendedMotion || 'slow_push_in',
      sha256,
      provenance: 'firefly_ai',
      qaStatus: 'quarantined',
      createdAt: new Date().toISOString()
    };

    VideoRepositoryMatcher.registerVideo(entry);
    console.log(`[ON_DEMAND_FIREFLY] Vídeo auto-ingerido com sucesso no Repositório Central: ${entry.id}`);
    return entry;
  }
}
