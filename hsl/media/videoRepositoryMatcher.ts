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
import { MIN_RESOLUTION, STOCK_TAG_BLACKLIST, ALLOWED_COLOR_TONES } from '../../config/visualIdentity';

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
   * PORTA ÚNICA PÚBLICA DE ESCRITA NO CATÁLOGO DE VÍDEOS
   * Governa inserções, atualizações e retagging com controle estrito de procedência e QA.
   */
  public static upsertEntries(
    entries: VideoCatalogEntry[],
    origin: 'sync_broll' | 'manual_ingest' | 'on_demand_dispatch',
    opts?: { retagOnly?: boolean }
  ): { inserted: number; updated: number; rejected: Array<{ id: string; reason: string }> } {
    const catalog = this.loadCatalog(true);
    let inserted = 0;
    let updated = 0;
    const rejected: Array<{ id: string; reason: string }> = [];

    const ORIGIN_MAP: Record<
      'sync_broll' | 'manual_ingest' | 'on_demand_dispatch',
      { provenance: 'curated_broll' | 'manual_import' | 'firefly_ai'; qaStatus: 'quarantined' }
    > = {
      sync_broll: { provenance: 'curated_broll', qaStatus: 'quarantined' },
      manual_ingest: { provenance: 'manual_import', qaStatus: 'quarantined' },
      on_demand_dispatch: { provenance: 'firefly_ai', qaStatus: 'quarantined' }
    };

    const derivedDefaults = ORIGIN_MAP[origin];

    for (const entry of entries) {
      if (!entry.id || !entry.id.trim() || !entry.filename || !entry.filename.trim()) {
        const idStr = entry.id || 'UNKNOWN';
        const reason = `MISSING_REQUIRED_FIELDS: Entry '${idStr}' deve conter id e filename preenchidos.`;
        rejected.push({ id: idStr, reason });
        console.warn(`[CATALOG_AUDIT] REJECTED | id='${idStr}' | origin='${origin}' | motivo='${reason}'`);
        continue;
      }

      const existingIndex = catalog.videos.findIndex(
        v => v.id === entry.id || v.filename === entry.filename
      );

      if (opts?.retagOnly) {
        if (existingIndex < 0) {
          const reason = `RETAG_ONLY_NOT_FOUND: Entry '${entry.id}' não existe no catálogo para retag.`;
          rejected.push({ id: entry.id, reason });
          console.warn(`[CATALOG_AUDIT] REJECTED | id='${entry.id}' | origin='${origin}' | motivo='${reason}'`);
          continue;
        }

        const existing = catalog.videos[existingIndex];
        if (entry.tags) existing.tags = entry.tags;
        if (entry.description) existing.description = entry.description;
        if (entry.category) existing.category = entry.category;
        updated++;
        console.log(`[CATALOG_AUDIT] RETAGGED | id='${existing.id}' | origin='${origin}' | tags=[${(existing.tags || []).join(', ')}]`);
        continue;
      }

      if (existingIndex >= 0) {
        const existing = catalog.videos[existingIndex];
        // Preserva o qaStatus atual e campos de auditoria
        catalog.videos[existingIndex] = {
          ...entry,
          qaStatus: existing.qaStatus,
          provenance: existing.provenance ?? derivedDefaults.provenance,
          approvedBy: existing.approvedBy,
          approvedAt: existing.approvedAt,
          sourceRunId: existing.sourceRunId ?? entry.sourceRunId
        };
        updated++;
        console.log(`[CATALOG_AUDIT] UPDATED | id='${entry.id}' | origin='${origin}' | qaStatus='${existing.qaStatus}' (preservado)`);
      } else {
        const newEntry: VideoCatalogEntry = {
          ...entry,
          provenance: derivedDefaults.provenance,
          qaStatus: derivedDefaults.qaStatus
        };
        catalog.videos.push(newEntry);
        if (newEntry.category && !catalog.categories.includes(newEntry.category)) {
          catalog.categories.push(newEntry.category);
        }
        inserted++;
        console.log(`[CATALOG_AUDIT] INSERTED | id='${newEntry.id}' | origin='${origin}' | provenance='${newEntry.provenance}' | qaStatus='${newEntry.qaStatus}'`);
      }
    }

    if (inserted > 0 || updated > 0) {
      this.saveCatalog(catalog);
    }

    return { inserted, updated, rejected };
  }

  /**
   * @deprecated Utilize VideoRepositoryMatcher.upsertEntries(entries, origin) para controle estrito de escrita.
   */
  public static registerVideo(entry: VideoCatalogEntry): void {
    this.upsertEntries([entry], 'manual_ingest');
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
   * com verificação estrita de fail-fast na ordem canônica da identidade Dossiê do Sistema v3.0.
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

    const substantiveQueryTokens = new Set([
      ...this.tokenize(request.visualSubject || ''),
      ...(request.domainTags || []).flatMap(t => this.tokenize(t)),
      ...(request.tags || []).flatMap(t => this.tokenize(t)),
      ...(request.visualMustInclude || []).flatMap(t => this.tokenize(t))
    ]);

    const mustIncludeTokens = (request.visualMustInclude || []).flatMap(t => this.tokenize(t));
    const mustNotTokens = (request.visualMustNot || []).flatMap(t => this.tokenize(t));
    const domainTokens = (request.domainTags || []).flatMap(t => this.tokenize(t));

    const usedAssetIdsSet = request.usedAssetIds
      ? (request.usedAssetIds instanceof Set ? request.usedAssetIds : new Set(request.usedAssetIds))
      : new Set<string>();

    let bestMatch: VideoCatalogEntry | null = null;
    let highestScore = 0;
    let highestRawScore = 0;
    let bestMatchPath = '';
    let lastRejectionReason = 'BANK_CLIP_UNINDEXED: Nenhum clip compatível encontrado no banco.';

    for (const video of catalog.videos) {
      if (!video || !video.filename) continue;

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

      // 2. BANK_CLIP_LOW_RES: Resolução < MIN_RESOLUTION (1920x1080)
      const [w, h] = (video.resolution || '').split('x').map(Number);
      if (!w || !h || w < MIN_RESOLUTION.width || h < MIN_RESOLUTION.height) {
        lastRejectionReason = `BANK_CLIP_LOW_RES: Clip '${video.id}' possui resolução '${video.resolution || 'indefinida'}' inferior ao mínimo exigido (${MIN_RESOLUTION.width}x${MIN_RESOLUTION.height}).`;
        continue;
      }

      // 3. BANK_CLIP_STOCK_AESTHETIC: qualquer tag na STOCK_TAG_BLACKLIST
      const allVideoTokens = new Set([
        ...(video.tags || []).flatMap(t => this.tokenize(t)),
        ...this.tokenize(video.description || '')
      ]);
      const blacklistedTag = STOCK_TAG_BLACKLIST.find(bt =>
        allVideoTokens.has(bt.toLowerCase()) || (video.tags || []).some(t => t.toLowerCase() === bt.toLowerCase())
      );
      if (blacklistedTag) {
        lastRejectionReason = `BANK_CLIP_STOCK_AESTHETIC: Clip '${video.id}' contém tag/estética de banco stock proibida ('${blacklistedTag}').`;
        continue;
      }

      // 4. BANK_CLIP_BAD_TONE: colorTone fora de ALLOWED_COLOR_TONES
      if (!video.colorTone) {
        lastRejectionReason = `BANK_CLIP_BAD_TONE: Clip '${video.id}' não possui colorTone definido.`;
        continue;
      }
      const normTone = video.colorTone.toLowerCase().replace(/[^a-z0-9\-]/g, ' ');
      const toneTokens = this.tokenize(normTone);
      const toneMatched = ALLOWED_COLOR_TONES.some(at =>
        normTone.includes(at) || toneTokens.some(tt => at.includes(tt))
      );
      if (!toneMatched) {
        lastRejectionReason = `BANK_CLIP_BAD_TONE: Clip '${video.id}' possui colorTone '${video.colorTone}' fora dos tons permitidos [${ALLOWED_COLOR_TONES.join(', ')}].`;
        continue;
      }

      // 5. Portão de Confiança & Procedência (Fail-Closed)
      if (video.qaStatus !== 'approved') {
        lastRejectionReason = `BANK_CLIP_NOT_APPROVED: Clip '${video.id}' tem qaStatus '${video.qaStatus ?? 'ausente'}' (exigido: approved).`;
        continue;
      }
      if (!video.provenance || video.provenance.trim().length === 0) {
        lastRejectionReason = `BANK_CLIP_NO_PROVENANCE: Clip '${video.id}' sem procedência declarada ou não auditada.`;
        continue;
      }

      // 6. BANK_CLIP_NO_DOMAIN: Veto Temático Fail-Closed
      if (!video.domains || video.domains.length === 0) {
        lastRejectionReason = `BANK_CLIP_NO_DOMAIN: Clip '${video.id}' não possui domains declarados no catálogo.`;
        continue;
      }

      // 7. BANK_CLIP_ALREADY_USED: Deduplicação
      if (usedAssetIdsSet.has(video.id)) {
        lastRejectionReason = `BANK_CLIP_ALREADY_USED: Clip '${video.id}' já foi utilizado em cena anterior neste episódio.`;
        continue;
      }

      const clipTagTokens = new Set([
        ...(video.tags || []).flatMap(t => this.tokenize(t)),
        ...(video.domains || []).flatMap(d => this.tokenize(d)),
        ...this.tokenize(video.description || ''),
        ...this.tokenize(video.category || '')
      ]);

      const clipDomainTokens = new Set((video.domains || []).flatMap(d => this.tokenize(d)));

      // 8. BANK_DOMAIN_MISMATCH (clip.domains ∩ episode.domainTags vazio)
      if (domainTokens.length > 0) {
        const hasDomainOverlap = domainTokens.some(dt => clipDomainTokens.has(dt));
        if (!hasDomainOverlap) {
          lastRejectionReason = `BANK_DOMAIN_MISMATCH: Clip '${video.id}' com domínios [${(video.domains || []).join(', ')}] não possui interseção com domainTags do episódio [${domainTokens.join(', ')}].`;
          continue;
        }
      }

      // 9. BANK_SUBJECT_MISS (visual_must_include: TODOS os tokens presentes - AND estrito)
      if (mustIncludeTokens.length > 0) {
        const allMustIncludePresent = mustIncludeTokens.every(mit => clipTagTokens.has(mit));
        if (!allMustIncludePresent) {
          const missingTokens = mustIncludeTokens.filter(mit => !clipTagTokens.has(mit));
          lastRejectionReason = `BANK_SUBJECT_MISS: Clip '${video.id}' não contém todos os termos obrigatórios (faltam: [${missingTokens.join(', ')}]).`;
          continue;
        }
      }

      // 10. BANK_FORBIDDEN_TAG (clip.tags ∩ visual_must_not não vazio)
      if (mustNotTokens.length > 0) {
        const forbiddenFound = mustNotTokens.find(fnt => clipTagTokens.has(fnt));
        if (forbiddenFound) {
          lastRejectionReason = `BANK_FORBIDDEN_TAG: Clip '${video.id}' contém tag proibida '${forbiddenFound}'.`;
          continue;
        }
      }

      // 11. BANK_CATEGORY_MISS
      if (request.requiredCategory) {
        const reqCat = request.requiredCategory.toLowerCase().trim();
        const vidCat = (video.category || '').toLowerCase().trim();
        if (reqCat !== vidCat) {
          lastRejectionReason = `BANK_CATEGORY_MISS: Categoria do clip '${vidCat}' não confere com required_category '${reqCat}'.`;
          continue;
        }
      }

      // 12. Scoring substantivo sobre sobreviventes
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

    // 13. BANK_SOURCE_NOT_ALLOWED
    if (request.allowedSources && !request.allowedSources.includes('bank')) {
      return {
        sceneId: request.sceneId,
        matched: false,
        matchScore: highestScore,
        recommendedAction: 'DISPATCH_FIREFLY_ON_DEMAND',
        reason: 'BANK_SOURCE_NOT_ALLOWED: allowed_sources não autoriza uso de banco para esta cena.'
      };
    }

    // 14. HIT
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
      sourceRunId?: string;
    },
    origin: 'firefly_real'
  ): VideoCatalogEntry {
    if (origin !== 'firefly_real') {
      throw new Error(`INGEST_REJECTED_NON_APPROVED_ORIGIN: Origem '${origin}' não autorizada para ingestão no repositório.`);
    }

    if (!fs.existsSync(sourceVideoPath)) {
      throw new Error(`SOURCE_VIDEO_NOT_FOUND: ${sourceVideoPath}`);
    }

    const autoIngestEnabled = process.env.HSL_AUTO_INGEST === 'true';
    const filename = path.basename(sourceVideoPath);
    const category = metadata.category || 'industrial';

    // Mede metadados e hash diretamente do arquivo fonte antes de qualquer cópia
    const buf = fs.readFileSync(sourceVideoPath);
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
        sourceVideoPath
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

    const quarantineRelativePath = `_quarantine/${category}/${filename}`.replace(/\\/g, '/');

    const entry: VideoCatalogEntry = {
      id: metadata.id || `GEN_${path.basename(filename, path.extname(filename)).toUpperCase()}`,
      category,
      filename: quarantineRelativePath,
      tags: metadata.tags || ['firefly', 'gerado', category],
      description: metadata.description || `Take cinematográfico gerado via Firefly (${category}).`,
      durationSeconds: Math.round(durationSeconds * 1000) / 1000,
      fps,
      resolution,
      colorTone: metadata.colorTone || 'Chiaroscuro / Industrial 35mm',
      recommendedMotion: (metadata.recommendedMotion as any) || 'slow_push_in',
      sha256: sha,
      provenance: 'firefly_ai',
      qaStatus: 'quarantined',
      sourceRunId: metadata.sourceRunId,
      createdAt: new Date().toISOString()
    };

    // PROIBIDO copiar se autoIngestEnabled estiver desligado
    if (!autoIngestEnabled) {
      return entry;
    }

    // Se autoIngestEnabled estiver ativo, copia exclusivamente para a QUARENTENA
    const quarantineCategoryDir = path.join(this.REPO_PATH, '_quarantine', category);
    fs.mkdirSync(quarantineCategoryDir, { recursive: true });

    const targetPath = path.join(quarantineCategoryDir, filename);
    if (!fs.existsSync(targetPath) || fs.statSync(targetPath).size !== fs.statSync(sourceVideoPath).size) {
      fs.copyFileSync(sourceVideoPath, targetPath);
    }

    this.registerVideo(entry);
    return entry;
  }

  /**
   * Avalia todas as cenas de um plano de edição com deduplicação de clipes
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
    const usedAssetIds = new Set<string>();
    const matchedResults: VideoMatchResult[] = [];

    for (const req of requests) {
      const result = this.matchScene({
        ...req,
        usedAssetIds
      }, mode);

      if (result.matched && result.videoEntry?.id) {
        usedAssetIds.add(result.videoEntry.id);
      }
      matchedResults.push(result);
    }

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
