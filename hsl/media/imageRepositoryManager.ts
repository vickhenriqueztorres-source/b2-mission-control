import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ImageCatalog, ImageCatalogEntry } from './types';

export class ImageRepositoryManager {
  private static catalogCache: ImageCatalog | null = null;
  private static readonly REPO_PATH = path.join(process.cwd(), 'assets', 'image_repository');
  private static readonly CATALOG_FILE = path.join(process.cwd(), 'assets', 'image_repository', 'catalog.json');

  /**
   * Carrega o catálogo de imagens do disco
   */
  public static loadCatalog(forceReload: boolean = false): ImageCatalog {
    if (this.catalogCache && !forceReload) {
      return this.catalogCache;
    }

    if (!fs.existsSync(this.CATALOG_FILE)) {
      const defaultCatalog: ImageCatalog = {
        version: '1.0.0',
        name: 'O Outro Lado - Master Image Repository & Knowledge Hub',
        description: 'Banco central de imagens cinematograficas 35mm e blueprints documentais do canal para reutilizacao permanente.',
        topics: [
          'radares_transito',
          'sistema_bancario_pix',
          'cabos_submarinos_internet',
          'distribuicao_eletrica_itaipu',
          'logistica_correios_portos',
          'refino_petroleo_combustiveis',
          'tratamento_agua_cantareira'
        ],
        totalImages: 0,
        images: []
      };
      this.saveImageCatalog(defaultCatalog);
      this.catalogCache = defaultCatalog;
      return defaultCatalog;
    }

    try {
      const data = fs.readFileSync(this.CATALOG_FILE, 'utf8');
      this.catalogCache = JSON.parse(data);
      return this.catalogCache!;
    } catch (err: any) {
      console.warn(`[IMAGE_REPO] Erro ao ler catalog.json: ${err.message}. Retornando catalogo vazio.`);
      return {
        version: '1.0.0',
        name: 'O Outro Lado - Master Image Repository',
        description: 'Fallback image catalog',
        topics: [],
        totalImages: 0,
        images: []
      };
    }
  }

  /**
   * Salva o catálogo de imagens no disco
   */
  private static saveImageCatalog(catalog: ImageCatalog): void {
    if (!fs.existsSync(this.REPO_PATH)) {
      fs.mkdirSync(this.REPO_PATH, { recursive: true });
    }
    catalog.totalImages = catalog.images.length;
    fs.writeFileSync(this.CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf8');
    this.catalogCache = catalog;
  }

  /**
   * Calcula o hash SHA-256 de um arquivo
   */
  public static computeSha256(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Arquiva uma imagem de cena gerada no Banco Central de Imagens
   */
  public static archiveSceneImage(options: {
    runId: string;
    episodeId: string;
    sceneId: string;
    imageFilePath: string;
    prompt: string;
    topic?: string;
    tags?: string[];
    resolution?: string;
  }): ImageCatalogEntry | null {
    if (!fs.existsSync(options.imageFilePath)) {
      console.warn(`[IMAGE_REPO] Arquivo de imagem não encontrado: ${options.imageFilePath}`);
      return null;
    }

    const sha256 = this.computeSha256(options.imageFilePath);
    const episodeFolder = path.join(this.REPO_PATH, 'episodes_archive', options.episodeId);
    if (!fs.existsSync(episodeFolder)) {
      fs.mkdirSync(episodeFolder, { recursive: true });
    }

    const ext = path.extname(options.imageFilePath) || '.png';
    const destFilename = `episodes_archive/${options.episodeId}/${options.sceneId}${ext}`;
    const destAbsolutePath = path.join(this.REPO_PATH, destFilename);

    // Copia para o repositório
    fs.copyFileSync(options.imageFilePath, destAbsolutePath);

    const catalog = this.loadCatalog(true);
    const imageId = `${options.episodeId}_${options.sceneId}`;
    const topic = options.topic || 'infraestrutura_geral';

    const entry: ImageCatalogEntry = {
      id: imageId,
      filename: destFilename.replace(/\\/g, '/'),
      topic,
      episodeSource: options.episodeId,
      sceneId: options.sceneId,
      prompt: options.prompt || 'Cinematic 35mm Chiaroscuro Industrial Shot',
      tags: options.tags || ['35mm', 'chiaroscuro', 'industrial_xray'],
      resolution: options.resolution || '1920x1080',
      sha256,
      createdAt: new Date().toISOString()
    };

    const existingIdx = catalog.images.findIndex(img => img.id === imageId || img.sha256 === sha256);
    if (existingIdx >= 0) {
      catalog.images[existingIdx] = { ...catalog.images[existingIdx], ...entry };
    } else {
      catalog.images.push(entry);
    }

    if (!catalog.topics.includes(topic)) {
      catalog.topics.push(topic);
    }

    this.saveImageCatalog(catalog);
    return entry;
  }

  /**
   * Sincroniza em lote todas as imagens geradas de um episódio para o Banco Central
   */
  public static archiveEpisodeRun(runId: string, episodeId?: string, topic?: string): { archivedCount: number; entries: ImageCatalogEntry[] } {
    const epId = episodeId || runId;
    const runDir = path.join(process.cwd(), 'runs', runId);
    const scenesDir = path.join(runDir, 'editorial', 'execution', 'scenes');
    const publicScenesDir = path.join(process.cwd(), 'public', 'editorial', 'execution', runId, 'scenes');
    const directPublicDir = path.join(process.cwd(), 'public', 'editorial', 'execution');

    const searchDirs = [scenesDir, publicScenesDir, directPublicDir].filter(d => fs.existsSync(d));

    const archivedEntries: ImageCatalogEntry[] = [];
    const processedScenes = new Set<string>();

    for (const baseDir of searchDirs) {
      const items = fs.readdirSync(baseDir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory() && item.name.startsWith('SC_')) {
          const scId = item.name;
          if (processedScenes.has(scId)) continue;

          const sceneDir = path.join(baseDir, scId);
          const framePath1 = path.join(sceneDir, 'firefly_start_frame.png');
          const framePath2 = path.join(sceneDir, 'start_frame.png');
          const targetFrame = [framePath1, framePath2].find(p => fs.existsSync(p));

          if (targetFrame) {
            let prompt = 'Present-day on-location investigative documentary, natural Rec.709, practical available light';
            let tags: string[] = ['documentary-field-v4', '35mm', scId.toLowerCase()];

            const receiptPath = path.join(sceneDir, 'start_frame_receipt.json');
            if (fs.existsSync(receiptPath)) {
              try {
                const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
                if (receipt.prompt) prompt = receipt.prompt;
                if (receipt.tags) tags = receipt.tags;
              } catch {}
            }

            const entry = this.archiveSceneImage({
              runId,
              episodeId: epId,
              sceneId: scId,
              imageFilePath: targetFrame,
              prompt,
              topic: topic || epId.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
              tags
            });

            if (entry) {
              archivedEntries.push(entry);
              processedScenes.add(scId);
            }
          }
        }
      }
    }

    return {
      archivedCount: archivedEntries.length,
      entries: archivedEntries
    };
  }
}
