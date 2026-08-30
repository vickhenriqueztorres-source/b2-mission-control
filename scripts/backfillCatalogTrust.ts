import fs from 'fs';
import path from 'path';
import { VideoRepositoryMatcher } from '../hsl/media/videoRepositoryMatcher';
import { VideoCatalogEntry } from '../hsl/media/types';

export interface BackfillReport {
  total: number;
  approved: number;
  quarantined: number;
  rejected: number;
  nonApprovedList: Array<{ id: string; filename: string; qaStatus: string; reason: string }>;
}

export function backfillCatalogTrust(): BackfillReport {
  const repoRoot = path.join(process.cwd(), 'assets', 'video_repository');
  const bancoDir = path.join(process.cwd(), 'banco de videos');
  const catalog = VideoRepositoryMatcher.loadCatalog(true);

  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('🧹 BACKFILL DE CONFIANÇA DO CATÁLOGO DE VÍDEOS (FURO 3)');
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log(`Total de vídeos no catálogo: ${catalog.videos.length}\n`);

  let approvedCount = 0;
  let quarantinedCount = 0;
  let rejectedCount = 0;
  const nonApprovedList: Array<{ id: string; filename: string; qaStatus: string; reason: string }> = [];

  const originalFiles = fs.existsSync(bancoDir)
    ? new Set(fs.readdirSync(bancoDir).map(f => f.toLowerCase()))
    : new Set<string>();

  for (const entry of catalog.videos) {
    const rawFilename = path.basename(entry.filename || '');
    const id = entry.id || '';
    const currentProvenance = entry.provenance;

    // 1. Suspeito de ser take gerado / Ken Burns / procedural
    if (id.startsWith('GEN_') || currentProvenance === 'remotion_procedural') {
      entry.qaStatus = 'rejected';
      if (!entry.provenance) {
        entry.provenance = currentProvenance || 'remotion_procedural';
      }
      rejectedCount++;
      nonApprovedList.push({
        id,
        filename: entry.filename,
        qaStatus: 'rejected',
        reason: id.startsWith('GEN_') ? "ID inicia com 'GEN_'" : "Provenance é 'remotion_procedural'"
      });
      console.log(`  ❌ [REJEITADO] Clipe '${id}' marcado como rejected.`);
      continue;
    }

    // 2. Rastreável ao acervo original ('banco de videos')
    const existsInBancoDeVideos = originalFiles.has(rawFilename.toLowerCase());
    const candidatePaths = [
      path.join(repoRoot, entry.filename),
      path.join(bancoDir, rawFilename),
      path.join(process.cwd(), entry.filename)
    ];
    const fileExistsOnDisk = candidatePaths.some(p => fs.existsSync(p));

    if (existsInBancoDeVideos && fileExistsOnDisk) {
      entry.qaStatus = 'approved';
      entry.provenance = 'curated_broll';
      entry.approvedBy = entry.approvedBy || 'backfill_script';
      entry.approvedAt = entry.approvedAt || new Date().toISOString();
      approvedCount++;
      console.log(`  ✅ [APROVADO] Clipe '${id}' (${rawFilename}) autenticado como curated_broll.`);
      continue;
    }

    // 3. Qualquer outro caso ambíguo -> Quarentena (PROIBIDO aprovar por dúvida)
    entry.qaStatus = 'quarantined';
    if (!entry.provenance) {
      entry.provenance = 'curated_broll';
    }
    quarantinedCount++;
    const reason = !existsInBancoDeVideos
      ? `Arquivo '${rawFilename}' não encontrado no acervo original ('banco de videos')`
      : `Arquivo físico não encontrado no disco`;

    nonApprovedList.push({
      id,
      filename: entry.filename,
      qaStatus: 'quarantined',
      reason
    });
    console.log(`  ⚠️  [QUARENTENA] Clipe '${id}' em quarentena: ${reason}`);
  }

  VideoRepositoryMatcher.saveCatalog(catalog);

  console.log('\n════════════════════════════════════════════════════════════════════════');
  console.log(`📋 RELATÓRIO FINAL DO BACKFILL DE CONFIANÇA:`);
  console.log(`- Total de vídeos processados : ${catalog.videos.length}`);
  console.log(`- Aprovados (curated_broll)   : ${approvedCount}`);
  console.log(`- Em Quarentena (quarantined) : ${quarantinedCount}`);
  console.log(`- Rejeitados (rejected)       : ${rejectedCount}`);
  console.log('────────────────────────────────────────────────────────────────────────');

  if (nonApprovedList.length > 0) {
    console.log('\n🔍 CLIPES NÃO-APROVADOS (REVISÃO MANUAL):');
    nonApprovedList.forEach(item => {
      console.log(`  - [${item.qaStatus.toUpperCase()}] ID: ${item.id} | Arquivo: ${item.filename}`);
      console.log(`    Motivo: ${item.reason}`);
    });
  } else {
    console.log('Todos os clipes do acervo foram verificados e aprovados com sucesso!');
  }
  console.log('════════════════════════════════════════════════════════════════════════\n');

  return {
    total: catalog.videos.length,
    approved: approvedCount,
    quarantined: quarantinedCount,
    rejected: rejectedCount,
    nonApprovedList
  };
}

if (require.main === module) {
  try {
    backfillCatalogTrust();
  } catch (err: any) {
    console.error('❌ Erro no backfill:', err.message);
    process.exit(1);
  }
}
