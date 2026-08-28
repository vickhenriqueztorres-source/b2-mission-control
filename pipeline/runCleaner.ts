import fs from 'fs';
import path from 'path';
import { ArtifactRegistry } from './artifactRegistry';
import { RunIdentity } from './runIdentity';
import { PrdComplianceChecker } from './prdComplianceChecker';

export interface CleanRunOptions {
  handleOrRunId: string;
  dryRun?: boolean;
  runsDir?: string;
}

export interface CleanRunResult {
  runId: string;
  handle: string;
  dryRun: boolean;
  disposableFilesFound: string[];
  totalBytesRecoverable: number;
  preservedDeliverables: string[];
  cleaned: boolean;
}

export class RunCleaner {
  /**
   * Executa a limpeza segura de intermediários descartáveis em runs concluídas
   */
  public static cleanRun(options: CleanRunOptions): CleanRunResult {
    const dryRun = options.dryRun !== false; // Padrão seguro é dryRun: true
    const baseRunsDir = options.runsDir || path.join(process.cwd(), 'runs');
    const registry = new ArtifactRegistry(baseRunsDir);

    const parsed = RunIdentity.parseHandle(options.handleOrRunId);
    const runSummary = registry.listRuns({
      projectId: parsed.projectId,
      episodeId: parsed.episodeId
    }).find(r => parsed.version === 'latest' || parsed.version === undefined || r.version === parsed.version);

    if (!runSummary) {
      throw new Error(`RUN_NOT_FOUND_FOR_CLEANUP: A run '${options.handleOrRunId}' não foi encontrada no registry.`);
    }

    const runDir = runSummary.runDir;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. GUARDA DE SEGURANÇA: BLOQUEAR LIMPEZA EM RUNS INCOMPLETAS OU REPROVADAS
    // ─────────────────────────────────────────────────────────────────────────
    const manifestPath = path.join(runDir, 'run-manifest.json');
    let overallStatus = runSummary.overallStatus;
    if (fs.existsSync(manifestPath)) {
      try {
        const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        overallStatus = m.overallStatus;
      } catch {}
    }

    if (overallStatus !== 'COMPLETED') {
      throw new Error(`CLEANUP_BLOCKED_ON_INCOMPLETE_RUN: A run '${runSummary.runId}' está com status '${overallStatus}'. A limpeza de intermediários é permitida APENAS em runs com status 'COMPLETED'.`);
    }

    // Verificar se o vídeo mestre final existe
    const finalMasterPath = path.join(runDir, 'final_master.mp4');
    if (!fs.existsSync(finalMasterPath) || fs.statSync(finalMasterPath).size < 1024 * 1024) {
      throw new Error(`CLEANUP_BLOCKED_NO_MASTER_VIDEO: O vídeo final master '${finalMasterPath}' não existe ou é inválido. A limpeza não pode prosseguir.`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. IDENTIFICAÇÃO DE INTERMEDIÁRIOS DESCARTÁVEIS VS ENTREGÁVEIS PRESERVADOS
    // ─────────────────────────────────────────────────────────────────────────
    const disposableFiles: string[] = [];
    const preservedFiles: string[] = [];
    let totalBytes = 0;

    const scanDirectory = (dir: string): void => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else {
          const fileName = entry.name;
          const isChunk = fileName.startsWith('chunk_') && fileName.endsWith('.mp4');
          const isChunksList = fileName === 'chunks_list.txt';
          const isSceneTake = fileName === 'firefly_take.mp4';
          const isSceneFrame = fileName === 'firefly_start_frame.png';
          const isSceneAudio = dir.includes('scenes_audio') && fileName.endsWith('.mp3');

          if (isChunk || isChunksList || isSceneTake || isSceneFrame || isSceneAudio) {
            disposableFiles.push(fullPath);
            totalBytes += fs.statSync(fullPath).size;
          } else {
            preservedFiles.push(fullPath);
          }
        }
      }
    };

    scanDirectory(runDir);

    // ─────────────────────────────────────────────────────────────────────────
    // 3. EXECUÇÃO OU SIMULAÇÃO
    // ─────────────────────────────────────────────────────────────────────────
    if (!dryRun) {
      for (const filePath of disposableFiles) {
        try {
          fs.unlinkSync(filePath);
        } catch {}
      }
      // Atualizar registry
      registry.registerRun(runDir, runSummary.runId, runSummary.lineage);
    }

    return {
      runId: runSummary.runId,
      handle: runSummary.handle,
      dryRun,
      disposableFilesFound: disposableFiles,
      totalBytesRecoverable: totalBytes,
      preservedDeliverables: preservedFiles,
      cleaned: !dryRun
    };
  }
}
