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
  /**
   * Realiza matching inteligente e governado de uma cena contra o repositório central
   * com verificação estrita de fail-fast na ordem canônica.
   */
  public static matchScene(
    request: VideoMatchRequest,
    mode: VideoExecutionMode = 'smart'
  ): VideoMatchResult {
    if (mode === 'generate-all' || (mode as string) === 'force-firefly') {
      return {
        sceneId: request.sceneId,
        matched: false,
        matchScore: 0,
        recommendedAction: 'DISPATCH_FIREFLY_ON_DEMAND',
        reason: 'FORCE_FIREFLY_MODE: Geração cirúrgica forçada no Firefly para todos os takes cinematográficos.'
      };
    }

    // 1. BANK_CLIP_UNINDEXED (Catálogo vazio)
    const catalog = this.loadCatalog();
    if (!catalog.videos || catalog.videos.length === 0) {
      return {
        sceneId: request.sceneId,
        matched: false,
        matchScore: 0,
        recommendedAction: mode === 'repository' ? 'STOP_UNMATCHED' : 'DISPATCH_FIREFLY_ON_DEMAND',
        reason: 'BANK_CLIP_UNINDEXED: Catálogo de vídeos está vazio ou sem clips indexados.'
      };
    }

    // matchText = subject + domainTags + must_include (NUNCA estilo Villeneuve)
    const substantiveQueryTokens = new Set([
      ...this.tokenize(request.visualSubject || ''),
      ...(request.domainTags || []).flatMap(t => this.tokenize(t)),
      ...(request.tags || []).flatMap(t => this.tokenize(t)),
      ...(request.visualMustInclude || []).flatMap(t => this.tokenize(t))
    ]);

    const mustIncludeTokens = (request.visualMustInclude || []).flatMap(t => this.tokenize(t));
    const mustNotTokens = (request.visualMustNot || []).flatMap(t => this.tokenize(t));
    const domainTokens = (request.domainTags || []).flatMap(t => this.tokenize(t));

    let bestMatch: VideoCatalogEntry | null = null;
    let highestScore = 0;
    let highestRawScore = 0;
    let bestMatchPath = '';
    let lastRejectionReason = 'BANK_CLIP_UNINDEXED: Nenhum clip compatível encontrado no banco.';

    for (const video of catalog.videos) {
      // 1. BANK_CLIP_UNINDEXED (Arquivo físico não existe)
      const candidatePaths = [
        path.join(this.REPO_PATH, video.filename),
        path.join(process.cwd(), 'banco de videos', path.basename(video.filename)),
        path.join(process.cwd(), video.filename)
      ];
      const resolvedPath = candidatePaths.find(p => fs.existsSync(p));
      if (!resolvedPath) {
        lastRejectionReason = `BANK_CLIP_UNINDEXED: Arquivo '${video.filename}' não encontrado no disco.`;
        continue;
      }

      const clipTagTokens = new Set([
        ...(video.tags || []).flatMap(t => this.tokenize(t)),
        ...this.tokenize(video.description || ''),
        ...this.tokenize(video.category || '')
      ]);

      // 2. BANK_DOMAIN_MISMATCH (clip.tags ∩ episode.domainTags vazio)
      if (domainTokens.length > 0) {
        const hasDomainOverlap = domainTokens.some(dt => clipTagTokens.has(dt));
        if (!hasDomainOverlap) {
          lastRejectionReason = `BANK_DOMAIN_MISMATCH: Clip '${video.id}' não possui interseção com domainTags do episódio [${domainTokens.join(', ')}].`;
          continue;
        }
      }

      // 3. BANK_SUBJECT_MISS (clip.tags ∩ visual_must_include vazio)
      if (mustIncludeTokens.length > 0) {
        const hasSubjectOverlap = mustIncludeTokens.some(mit => clipTagTokens.has(mit));
        if (!hasSubjectOverlap) {
          lastRejectionReason = `BANK_SUBJECT_MISS: Clip '${video.id}' não contém nenhum dos termos obrigatórios [${mustIncludeTokens.join(', ')}].`;
          continue;
        }
      }

      // 4. BANK_FORBIDDEN_TAG (clip.tags ∩ visual_must_not não vazio)
      if (mustNotTokens.length > 0) {
        const forbiddenFound = mustNotTokens.find(fnt => clipTagTokens.has(fnt));
        if (forbiddenFound) {
          lastRejectionReason = `BANK_FORBIDDEN_TAG: Clip '${video.id}' contém tag proibida '${forbiddenFound}'.`;
          continue;
        }
      }

      // 5. BANK_CATEGORY_MISS
      if (request.requiredCategory) {
        const reqCat = request.requiredCategory.toLowerCase().trim();
        const vidCat = (video.category || '').toLowerCase().trim();
        if (reqCat !== vidCat) {
          lastRejectionReason = `BANK_CATEGORY_MISS: Categoria do clip '${vidCat}' não confere com required_category '${reqCat}'.`;
          continue;
        }
      }

      // 6. BANK_SCORE_LOW (cálculo substantivo)
      let score = 0;
      for (const tag of video.tags || []) {
        const normTag = tag.toLowerCase().trim();
        for (const qToken of substantiveQueryTokens) {
          if (normTag === qToken) score += 4.0;
          else if (normTag.includes(qToken) || qToken.includes(normTag)) score += 2.0;
        }
      }

      for (const reqToken of mustIncludeTokens) {
        if (clipTagTokens.has(reqToken)) score += 6.0;
      }

      for (const token of substantiveQueryTokens) {
        if (clipTagTokens.has(token)) {
          score += 1.0;
        }
      }

      if (score > highestRawScore) {
        highestRawScore = score;
        highestScore = Math.min(1.0, score / 15.0);
        bestMatch = video;
        bestMatchPath = resolvedPath;
      }
    }

    const configuredThreshold = parseFloat(process.env.HSL_VIDEO_MATCH_THRESHOLD || '0.85');
    const MATCH_THRESHOLD = Number.isFinite(configuredThreshold) ? configuredThreshold : 0.85;

    // Se nenhum vídeo atingiu score mínimo -> BANK_SCORE_LOW
    if (!bestMatch || highestScore < MATCH_THRESHOLD) {
      if (bestMatch && highestScore < MATCH_THRESHOLD) {
        lastRejectionReason = `BANK_SCORE_LOW: Melhor score obtido foi ${(highestScore * 100).toFixed(1)}% (Threshold mínimo é ${(MATCH_THRESHOLD * 100).toFixed(0)}%).`;
      }
      return {
        sceneId: request.sceneId,
        matched: false,
        matchScore: highestScore,
        recommendedAction: mode === 'repository' ? 'STOP_UNMATCHED' : 'DISPATCH_FIREFLY_ON_DEMAND',
        reason: lastRejectionReason
      };
    }

    // 7. BANK_SOURCE_NOT_ALLOWED
    if (request.allowedSources && !request.allowedSources.includes('bank')) {
      return {
        sceneId: request.sceneId,
        matched: false,
        matchScore: highestScore,
        recommendedAction: 'DISPATCH_FIREFLY_ON_DEMAND',
        reason: 'BANK_SOURCE_NOT_ALLOWED: allowed_sources não autoriza uso de banco para esta cena.'
      };
    }

    // 8. HIT
    return {
      sceneId: request.sceneId,
      matched: true,
      matchScore: highestScore,
      videoEntry: bestMatch,
      absoluteVideoPath: bestMatchPath,
      relativePublicSrc: `video_repository/${bestMatch.filename.replace(/\\/g, '/')}`,
      recommendedAction: 'USE_MATCHED_VIDEO',
      reason: `HIT: Clip '${bestMatch.id}' aprovado no banco (Score ${(highestScore * 100).toFixed(1)}% >= ${(MATCH_THRESHOLD * 100).toFixed(0)}%). Cobre domínio, assunto e categoria exata sem tags proibidas.`
    };
  }

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

    const autoIngestEnabled = process.env.HSL_AUTO_INGEST === 'true';
    const filename = path.basename(sourceVideoPath);
    const category = metadata.category || 'industrial';
    const categoryDir = path.join(this.REPO_PATH, category);
    fs.mkdirSync(categoryDir, { recursive: true });

    const targetPath = path.join(categoryDir, filename);
    if (!fs.existsSync(targetPath) || fs.statSync(targetPath).size !== fs.statSync(sourceVideoPath).size) {
      fs.copyFileSync(sourceVideoPath, targetPath);
    }

    const buf = fs.readFileSync(targetPath);
    const sha = crypto.createHash('sha256').update(buf).digest('hex');

    let durationSeconds = 5.0;
    let fps = 30;
    let resolution = '1920x1080';

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
      provenance: 'firefly_ai',
      createdAt: new Date().toISOString()
    };

    if (autoIngestEnabled) {
      this.registerVideo(entry);
    }
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
