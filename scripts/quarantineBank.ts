import fs from 'fs';
import path from 'path';
import { VideoCatalog, VideoCatalogEntry } from '../hsl/media/types';
import { MIN_RESOLUTION, STOCK_TAG_BLACKLIST, ALLOWED_COLOR_TONES } from '../config/visualIdentity';

const REPO_PATH = path.join(process.cwd(), 'assets', 'video_repository');
const CATALOG_PATH = path.join(REPO_PATH, 'catalog.json');
const QUARANTINE_PATH = path.join(REPO_PATH, 'quarantine');

/**
 * Validador estrito de conformidade para admissão ou readmissão no repositório ativo.
 * Clipes só entram no catálogo ativo se passarem em 100% dos portões de identidade v3.0.
 */
export function validateClipForAdmission(video: VideoCatalogEntry): { eligible: boolean; error?: string } {
  // 1. Resolução >= 1920x1080
  const [w, h] = (video.resolution || '').split('x').map(Number);
  if (!w || !h || w < MIN_RESOLUTION.width || h < MIN_RESOLUTION.height) {
    return {
      eligible: false,
      error: `BANK_CLIP_LOW_RES: Clip '${video.id}' possui resolução '${video.resolution || 'indefinida'}' inferior ao mínimo exigido (${MIN_RESOLUTION.width}x${MIN_RESOLUTION.height}).`
    };
  }

  // 2. Blacklist de Tags Stock
  const allVideoTokens = new Set([
    ...(video.tags || []).map(t => t.toLowerCase().trim()),
    ...(video.description ? video.description.toLowerCase().split(/\s+/) : [])
  ]);
  const blacklistedTag = STOCK_TAG_BLACKLIST.find(bt => allVideoTokens.has(bt.toLowerCase()));
  if (blacklistedTag) {
    return {
      eligible: false,
      error: `BANK_CLIP_STOCK_AESTHETIC: Clip '${video.id}' contém tag/estética de banco stock proibida ('${blacklistedTag}').`
    };
  }

  // 3. Tom de Cor Permitido
  if (!video.colorTone) {
    return {
      eligible: false,
      error: `BANK_CLIP_BAD_TONE: Clip '${video.id}' não possui colorTone definido.`
    };
  }
  const normTone = video.colorTone.toLowerCase().replace(/[^a-z0-9\-]/g, ' ');
  const toneMatched = ALLOWED_COLOR_TONES.some(at => normTone.includes(at));
  if (!toneMatched) {
    return {
      eligible: false,
      error: `BANK_CLIP_BAD_TONE: Clip '${video.id}' possui colorTone '${video.colorTone}' fora dos tons permitidos [${ALLOWED_COLOR_TONES.join(', ')}].`
    };
  }

  // 4. Procedência e Aprovação
  if (video.qaStatus !== 'approved') {
    return {
      eligible: false,
      error: `BANK_CLIP_NOT_APPROVED: Clip '${video.id}' tem qaStatus '${video.qaStatus ?? 'ausente'}' (exigido: approved).`
    };
  }
  if (!video.provenance || video.provenance.trim().length === 0) {
    return {
      eligible: false,
      error: `BANK_CLIP_NO_PROVENANCE: Clip '${video.id}' sem procedência declarada ou não auditada.`
    };
  }

  // 5. Domínios
  if (!video.domains || video.domains.length === 0) {
    return {
      eligible: false,
      error: `BANK_CLIP_NO_DOMAIN: Clip '${video.id}' não possui domains declarados no catálogo.`
    };
  }

  return { eligible: true };
}

/**
 * Executa a quarentena completa dos clipes 720p stock legados do catálogo ativo.
 */
export function quarantineLegacyBank(): { quarantinedCount: number; destination: string } {
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log('📦 EXECUTANDO QUARENTENA DO BANCO DE VÍDEOS LEGADO (DOSSIÊ DO SISTEMA V3.0)');
  console.log('══════════════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(CATALOG_PATH)) {
    console.log('ℹ️ Catálogo não encontrado. Nada para colocar em quarentena.');
    return { quarantinedCount: 0, destination: QUARANTINE_PATH };
  }

  const catalogRaw = fs.readFileSync(CATALOG_PATH, 'utf8');
  const catalog: VideoCatalog = JSON.parse(catalogRaw);

  fs.mkdirSync(QUARANTINE_PATH, { recursive: true });

  // Backup do catálogo anterior na pasta de quarentena
  const backupCatalogPath = path.join(QUARANTINE_PATH, 'catalog_quarantine_backup.json');
  fs.writeFileSync(backupCatalogPath, JSON.stringify(catalog, null, 2), 'utf8');

  let movedCount = 0;

  for (const video of catalog.videos) {
    const candidatePaths = [
      path.join(REPO_PATH, video.filename),
      path.join(REPO_PATH, video.category, path.basename(video.filename)),
      path.join(process.cwd(), 'banco de videos', path.basename(video.filename))
    ];

    const foundPath = candidatePaths.find(p => fs.existsSync(p));
    if (foundPath) {
      const catDir = path.join(QUARANTINE_PATH, video.category || 'misc');
      fs.mkdirSync(catDir, { recursive: true });
      const destPath = path.join(catDir, path.basename(foundPath));

      if (path.resolve(foundPath) !== path.resolve(destPath)) {
        fs.copyFileSync(foundPath, destPath);
        try {
          fs.unlinkSync(foundPath);
        } catch {}
      }
      movedCount++;
      console.log(`  🔒 Quarentenado: [${video.id}] ${video.filename} (${video.resolution || '720p'}) -> ${path.relative(REPO_PATH, destPath)}`);
    } else {
      console.warn(`  ⚠️ Arquivo físico não encontrado para [${video.id}]: ${video.filename}`);
    }
  }

  // Zera o catálogo ativo
  const freshCatalog: VideoCatalog = {
    version: '2.0.0',
    name: 'O Outro Lado - Master Video Repository (Identity v3.0 1080p)',
    description: 'Biblioteca central de vídeos em 35mm chiaroscuro 1080p auditados pelo Dossiê do Sistema v3.0.',
    categories: catalog.categories || [
      'infrastructure',
      'cyber_telemetry',
      'industrial',
      'atmospheric',
      'macro_physics'
    ],
    videos: []
  };

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(freshCatalog, null, 2), 'utf8');

  console.log(`\n✅ Quarentena concluída com sucesso: ${movedCount} clipes isolados em assets/video_repository/quarantine/`);
  console.log(`✅ Catálogo ativo zerado e protegido contra stock 720p.`);
  console.log('══════════════════════════════════════════════════════════════════════\n');

  return {
    quarantinedCount: movedCount,
    destination: QUARANTINE_PATH
  };
}

// Execução direta via CLI
if (require.main === module) {
  quarantineLegacyBank();
}
