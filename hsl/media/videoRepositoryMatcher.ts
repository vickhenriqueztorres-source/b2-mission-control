import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  VideoCatalog,
  VideoCatalogEntry,
  VideoMatchRequest,
  VideoMatchResult,
  VideoExecutionMode
} from './types';

export class VideoRepositoryMatcher {
  private static catalogCache: VideoCatalog | null = null;
  private static readonly REPO_PATH = path.join(process.cwd(), 'assets', 'video_repository');
  private static readonly CATALOG_FILE = path.join(process.cwd(), 'assets', 'video_repository', 'catalog.json');

  /**
   * Carrega o catálogo de vídeos do disco
   */
  public static loadCatalog(forceReload: boolean = false): VideoCatalog {
    if (this.catalogCache && !forceReload) {
      return this.catalogCache;
    }

    if (!fs.existsSync(this.CATALOG_FILE)) {
      const defaultCatalog: VideoCatalog = {
        version: '1.0.0',
        name: 'O Outro Lado - Master Video Repository',
        description: 'Biblioteca central de videos e B-Rolls cinematograficos em 35mm chiaroscuro.',
        categories: ['infrastructure', 'cyber_telemetry', 'industrial', 'atmospheric', 'macro_physics'],
        videos: []
      };
      this.saveCatalog(defaultCatalog);
      this.catalogCache = defaultCatalog;
      return defaultCatalog;
    }

    try {
      const data = fs.readFileSync(this.CATALOG_FILE, 'utf8');
      this.catalogCache = JSON.parse(data);
      return this.catalogCache!;
    } catch (err: any) {
      console.warn(`[VIDEO_REPO] Erro ao ler catalog.json: ${err.message}. Retornando catalogo vazio.`);
      return {
        version: '1.0.0',
        name: 'O Outro Lado - Master Video Repository',
        description: 'Fallback catalog',
        categories: [],
        videos: []
      };
    }
  }

  /**
   * Salva o catálogo atualizado no disco
   */
  public static saveCatalog(catalog: VideoCatalog): void {
    if (!fs.existsSync(this.REPO_PATH)) {
      fs.mkdirSync(this.REPO_PATH, { recursive: true });
    }
    fs.writeFileSync(this.CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf8');
    this.catalogCache = catalog;
  }

  /**
   * Registra um novo vídeo no catálogo central
   */
  public static registerVideo(entry: VideoCatalogEntry): void {
    const catalog = this.loadCatalog(true);
    const existingIndex = catalog.videos.findIndex(v => v.id === entry.id || v.filename === entry.filename);

    if (existingIndex >= 0) {
      catalog.videos[existingIndex] = { ...catalog.videos[existingIndex], ...entry };
    } else {
      catalog.videos.push(entry);
    }

    if (entry.category && !catalog.categories.includes(entry.category)) {
      catalog.categories.push(entry.category);
    }

    this.saveCatalog(catalog);
  }

  /**
   * Normaliza texto para busca por tokens
   */
  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  /**
   * Realiza matching inteligente de uma cena contra o repositório central
   */
  public static matchScene(
    request: VideoMatchRequest,
    mode: VideoExecutionMode = 'smart'
  ): VideoMatchResult {
    const catalog = this.loadCatalog();
    const queryTokens = new Set([
      ...this.tokenize(request.visualSubject || ''),
      ...this.tokenize(request.chapterTitle || ''),
      ...this.tokenize(request.narrativeFunction || ''),
      ...(request.tags || []).flatMap(t => this.tokenize(t))
    ]);

    let bestMatch: VideoCatalogEntry | null = null;
    let highestScore = 0;
    let highestRawScore = 0;

    for (const video of catalog.videos) {
      let score = 0;
      const videoTokens = new Set([
        ...this.tokenize(video.description || ''),
        ...this.tokenize(video.category || ''),
        ...(video.tags || []).flatMap(t => this.tokenize(t))
      ]);

      // 1. Tag direct match (ponderação alta)
      for (const tag of video.tags) {
        const normTag = tag.toLowerCase().trim();
        for (const qToken of queryTokens) {
          if (normTag === qToken) score += 5.0;
          else if (normTag.includes(qToken) || qToken.includes(normTag)) score += 2.0;
        }
      }

      // 2. Token overlap score
      for (const token of queryTokens) {
        if (videoTokens.has(token)) {
          score += 1.0;
        }
      }

      // 3. Category match
      if (request.requiredCategory) {
        if (video.category.toLowerCase() === request.requiredCategory.toLowerCase()) {
          score += 4.0;
        }
      }

      if (score > highestRawScore) {
        highestRawScore = score;
        highestScore = Math.min(1.0, score / 12.0);
        bestMatch = video;
      }
    }

    if (mode === 'generate-all' || (mode as string) === 'force-firefly') {
      return {
        sceneId: request.sceneId,
        matched: false,
        matchScore: 0,
        recommendedAction: 'DISPATCH_FIREFLY_ON_DEMAND',
        reason: 'FORCE_FIREFLY_MODE: Geração cirúrgica forçada no Firefly para todos os takes cinematográficos.'
      };
    }

    const configuredThreshold = parseFloat(process.env.HSL_VIDEO_MATCH_THRESHOLD || '0.50');
    const MATCH_THRESHOLD = Number.isFinite(configuredThreshold) ? configuredThreshold : 0.50;
    const isCacheHit = bestMatch !== null && highestScore >= MATCH_THRESHOLD;

    if (isCacheHit && bestMatch) {
      const candidatePaths = [
        path.join(this.REPO_PATH, bestMatch.filename),
        path.join(process.cwd(), 'banco de videos', path.basename(bestMatch.filename)),
        path.join(process.cwd(), bestMatch.filename)
      ];

      const resolvedPath = candidatePaths.find(p => fs.existsSync(p));

      if (resolvedPath) {
        return {
          sceneId: request.sceneId,
          matched: true,
          matchScore: highestScore,
          videoEntry: bestMatch,
          absoluteVideoPath: resolvedPath,
          relativePublicSrc: `video_repository/${bestMatch.filename.replace(/\\/g, '/')}`,
          recommendedAction: 'USE_MATCHED_VIDEO',
          reason: `MATCH_FOUND: Clip '${bestMatch.id}' (${bestMatch.category}) com relevância ${(highestScore * 100).toFixed(1)}% (Threshold: ${(MATCH_THRESHOLD * 100).toFixed(0)}%).`
        };
      }
    }

    // Sem correspondência satisfatória acima do threshold
    if (mode === 'repository') {
      return {
        sceneId: request.sceneId,
        matched: false,
        matchScore: highestScore,
        recommendedAction: 'FALLBACK_REMOTION_PARALLAX',
        reason: `REPOSITORY_ONLY_MODE: Nenhum clip exato encontrado (Score ${(highestScore * 100).toFixed(1)}% < ${(MATCH_THRESHOLD * 100).toFixed(0)}%). Usando animação Remotion Parallax/Dossier 2.5D.`
      };
    }

    if (mode === 'smart') {
      return {
        sceneId: request.sceneId,
        matched: false,
        matchScore: highestScore,
        recommendedAction: 'DISPATCH_FIREFLY_ON_DEMAND',
        reason: `ON_DEMAND_REQUIRED: Score ${(highestScore * 100).toFixed(1)}% abaixo do threshold ${(MATCH_THRESHOLD * 100).toFixed(0)}%. Disparar geração cirúrgica de take no Firefly.`
      };
    }

    return {
      sceneId: request.sceneId,
      matched: false,
      matchScore: highestScore,
      recommendedAction: 'FALLBACK_REMOTION_PARALLAX',
      reason: 'DEFAULT_FALLBACK: Usando Remotion Parallax/Dossier.'
    };
  }

  /**
   * Ingesta um vídeo gerado pelo Firefly diretamente no repositório central e no catálogo
   */
  public static ingestGeneratedVideo(
    sourceVideoPath: string,
    metadata: {
      id?: string;
      category?: string;
      description?: string;
      tags?: string[];
      colorTone?: string;
      recommendedMotion?: string;
    }
  ): VideoCatalogEntry {
    if (!fs.existsSync(sourceVideoPath)) {
      throw new Error(`SOURCE_VIDEO_NOT_FOUND: ${sourceVideoPath}`);
    }

    const filename = path.basename(sourceVideoPath);
    const category = metadata.category || 'industrial';
    const categoryDir = path.join(this.REPO_PATH, category);
    fs.mkdirSync(categoryDir, { recursive: true });

    const targetPath = path.join(categoryDir, filename);
    if (!fs.existsSync(targetPath) || fs.statSync(targetPath).size !== fs.statSync(sourceVideoPath).size) {
      fs.copyFileSync(sourceVideoPath, targetPath);
    }

    // Copia também para banco de videos/ se existir
    const bancoDeVideosDir = path.join(process.cwd(), 'banco de videos');
    if (fs.existsSync(bancoDeVideosDir)) {
      const bancoTargetPath = path.join(bancoDeVideosDir, filename);
      if (!fs.existsSync(bancoTargetPath)) {
        try {
          fs.copyFileSync(sourceVideoPath, bancoTargetPath);
        } catch {}
      }
    }

    const buf = fs.readFileSync(targetPath);
    const sha = crypto.createHash('sha256').update(buf).digest('hex');

    let durationSeconds = 6.0;
    let fps = 24;
    let resolution = '1280x720';

    try {
      const { spawnSync } = require('child_process');
      const probe = spawnSync('ffprobe', [
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,r_frame_rate:format=duration',
        '-of', 'json',
        targetPath
      ], { encoding: 'utf8' });
      const parsed = JSON.parse(probe.stdout);
      if (parsed.format?.duration) durationSeconds = parseFloat(parsed.format.duration);
      if (parsed.streams?.[0]) {
        const s = parsed.streams[0];
        if (s.width && s.height) resolution = `${s.width}x${s.height}`;
        if (s.r_frame_rate) {
          const [n, d] = s.r_frame_rate.split('/').map(Number);
          if (n && d) fps = Math.round(n / d);
        }
      }
    } catch {}

    const entry: VideoCatalogEntry = {
      id: metadata.id || `GEN_${path.basename(filename, path.extname(filename)).toUpperCase()}`,
      category,
      filename: `${category}/${filename}`.replace(/\\/g, '/'),
      tags: metadata.tags || ['firefly', 'gerado', category],
      description: metadata.description || `Take cinematográfico gerado via Firefly (${category}).`,
      durationSeconds: Math.round(durationSeconds * 1000) / 1000,
      fps,
      resolution,
      colorTone: metadata.colorTone || 'Chiaroscuro / Industrial 35mm',
      recommendedMotion: (metadata.recommendedMotion as any) || 'slow_push_in',
      sha256: sha,
      createdAt: new Date().toISOString()
    };

    this.registerVideo(entry);
    return entry;
  }

  /**
   * Avalia todas as cenas de um plano de edição
   */
  public static matchAllScenes(
    requests: VideoMatchRequest[],
    mode: VideoExecutionMode = 'smart'
  ): {
    matchedResults: VideoMatchResult[];
    totalMatched: number;
    totalOnDemandNeeded: number;
    totalFallback: number;
  } {
    const matchedResults = requests.map(req => this.matchScene(req, mode));
    const totalMatched = matchedResults.filter(r => r.recommendedAction === 'USE_MATCHED_VIDEO').length;
    const totalOnDemandNeeded = matchedResults.filter(r => r.recommendedAction === 'DISPATCH_FIREFLY_ON_DEMAND').length;
    const totalFallback = matchedResults.filter(r => r.recommendedAction === 'FALLBACK_REMOTION_PARALLAX').length;

    return {
      matchedResults,
      totalMatched,
      totalOnDemandNeeded,
      totalFallback
    };
  }
}
