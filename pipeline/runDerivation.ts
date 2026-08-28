import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { RunIdentity, RunCoordinates } from './runIdentity';
import { ArtifactRegistry, RegisteredArtifact, LineageInfo } from './artifactRegistry';
import { PipelineContractGate } from './pipelineContractGate';
import { RunManifest } from './runManifest';
import { HSL_MAX_AUDIO_VIDEO_DESYNC_SECONDS, HSL_MIN_EPISODE_DURATION_SECONDS, HSL_MAX_EPISODE_DURATION_SECONDS } from '../spec/hsl-spec';

export interface DeriveRunOptions {
  sourceHandle: string;
  targetProjectId?: string;
  targetEpisodeId?: string;
  targetVersion?: number;
  inherit: ('audio_narration' | 'editorial_plan')[];
  newScenePlanPath?: string;
  runsDir?: string;
  notes?: string;
}

export interface DeriveRunResult {
  newRunId: string;
  newHandle: string;
  newRunDir: string;
  sourceRunId: string;
  sourceHandle: string;
  inheritedArtifacts: Record<string, { path: string; sha256: string; durationSeconds?: number }>;
  lineage: LineageInfo;
}

export class RunDerivationEngine {
  /**
   * Executa a derivação determinística de uma run herdando artefatos aprovados
   */
  public static deriveRun(options: DeriveRunOptions): DeriveRunResult {
    const baseRunsDir = options.runsDir || path.join(process.cwd(), 'runs');
    const registry = new ArtifactRegistry(baseRunsDir);

    // ─────────────────────────────────────────────────────────────────────────
    // 1. RESOLUÇÃO E VALIDAÇÃO ESTRITA DA ORIGEM
    // ─────────────────────────────────────────────────────────────────────────
    const parsedSource = RunIdentity.parseHandle(options.sourceHandle);
    const sourceRunSummary = registry.listRuns({
      projectId: parsedSource.projectId,
      episodeId: parsedSource.episodeId
    }).find(r => parsedSource.version === 'latest' || parsedSource.version === undefined || r.version === parsedSource.version);

    if (!sourceRunSummary) {
      throw new Error(`SOURCE_RUN_NOT_FOUND: A run de origem '${options.sourceHandle}' não foi encontrada no registry.`);
    }

    const sourceProjectId = sourceRunSummary.projectId;
    const sourceEpisodeId = sourceRunSummary.episodeId;
    const targetProjectId = options.targetProjectId ? options.targetProjectId.toUpperCase() : sourceProjectId;
    const targetEpisodeId = options.targetEpisodeId ? options.targetEpisodeId.toUpperCase() : sourceEpisodeId;

    // Bloqueio de violação de namespace entre projetos diferentes
    if (targetProjectId !== sourceProjectId) {
      throw new Error(`CROSS_PROJECT_DERIVATION_BLOCKED: Não é permitido derivar artefatos do projeto '${sourceProjectId}' para o projeto '${targetProjectId}'. O isolamento entre projetos é estrito.`);
    }

    // Calcular próxima versão imutável
    const existingVersions = registry.listRuns({ projectId: targetProjectId, episodeId: targetEpisodeId }).map(r => r.version);
    const nextVersion = options.targetVersion || (existingVersions.length > 0 ? Math.max(...existingVersions) + 1 : 1);

    const newCoords: RunCoordinates = RunIdentity.createCoordinates(targetProjectId, targetEpisodeId, nextVersion);
    const newRunId = RunIdentity.formatRunId(newCoords);
    const newHandle = RunIdentity.formatHandle(newCoords);
    const newRunDir = RunIdentity.getCanonicalRunDir(baseRunsDir, newCoords);

    // Garantir imutabilidade: se a pasta de destino já existir com status COMPLETED, abortar
    if (fs.existsSync(newRunDir)) {
      const manifestPath = path.join(newRunDir, 'run-manifest.json');
      if (fs.existsSync(manifestPath)) {
        const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (m.overallStatus === 'COMPLETED') {
          throw new Error(`IMMUTABLE_RUN_COLLISION_ERROR: A run '${newRunId}' já existe e está concluída. Sobrescrita de runs concluídas é terminantemente proibida.`);
        }
      }
    }

    // Criar estrutura de diretórios limpa para a nova run (zero contaminação de assets visuais anteriores)
    const newPostDir = path.join(newRunDir, 'postproduction');
    const newEditorialDir = path.join(newRunDir, 'editorial', 'execution');
    const newScenesDir = path.join(newEditorialDir, 'scenes');

    fs.mkdirSync(newPostDir, { recursive: true });
    fs.mkdirSync(newScenesDir, { recursive: true });

    const inheritedArtifactsRecord: Record<string, { path: string; sha256: string; durationSeconds?: number }> = {};
    const lineageRecord: Record<string, { sourceRunId: string; sourceHandle: string; sha256: string; verifiedAt: string }> = {};

    // ─────────────────────────────────────────────────────────────────────────
    // 2. HERANÇA DE ÁUDIO DE NARRAÇÃO
    // ─────────────────────────────────────────────────────────────────────────
    if (options.inherit.includes('audio_narration')) {
      const audioHandle = `${sourceRunSummary.handle}/audio`;
      const sourceAudioArtifact = registry.resolveArtifact(audioHandle);

      if (!fs.existsSync(sourceAudioArtifact.absolutePath)) {
        throw new Error(`SOURCE_AUDIO_MISSING: O arquivo de áudio '${sourceAudioArtifact.absolutePath}' não existe no disco.`);
      }

      // Validar integridade física e ffprobe
      const probe = PipelineContractGate.probeMedia(sourceAudioArtifact.absolutePath);
      if (probe.duration < HSL_MIN_EPISODE_DURATION_SECONDS || probe.duration > HSL_MAX_EPISODE_DURATION_SECONDS) {
        throw new Error(`REJECTED_AUDIO_HERITAGE_BLOCKED: O áudio de origem '${audioHandle}' possui duração de ${probe.duration.toFixed(2)}s, que está fora dos limites do PRD (${HSL_MIN_EPISODE_DURATION_SECONDS}s - ${HSL_MAX_EPISODE_DURATION_SECONDS}s). Derivação de áudio reprovado é proibida.`);
      }

      // Validar hash do arquivo
      const sourceBuffer = fs.readFileSync(sourceAudioArtifact.absolutePath);
      const computedSha256 = crypto.createHash('sha256').update(sourceBuffer).digest('hex');

      if (sourceAudioArtifact.sha256 && computedSha256 !== sourceAudioArtifact.sha256) {
        throw new Error(`SOURCE_AUDIO_HASH_MISMATCH: O hash do áudio no disco (${computedSha256}) não confere com o registrado no registry (${sourceAudioArtifact.sha256}). O áudio está corrompido.`);
      }

      // Validar compatibilidade com novo plano de cena (se fornecido)
      if (options.newScenePlanPath && fs.existsSync(options.newScenePlanPath)) {
        try {
          const plan = JSON.parse(fs.readFileSync(options.newScenePlanPath, 'utf8'));
          if (plan.targetDurationSeconds) {
            const delta = Math.abs(probe.duration - plan.targetDurationSeconds);
            if (delta > HSL_MAX_AUDIO_VIDEO_DESYNC_SECONDS) {
              throw new Error(`INCOMPATIBLE_SCENE_PLAN_DURATION: O novo plano de cena tem ${plan.targetDurationSeconds}s, mas o áudio herdado tem ${probe.duration.toFixed(2)}s (Delta de ${delta.toFixed(2)}s > tolerância de ${HSL_MAX_AUDIO_VIDEO_DESYNC_SECONDS}s). Derivação abortada sem modificar o áudio.`);
            }
          }
        } catch (e: any) {
          if (e.message.startsWith('INCOMPATIBLE_SCENE_PLAN_DURATION')) throw e;
        }
      }

      // Copiar áudio para a nova run de forma segura
      const targetNarrationPath = path.join(newPostDir, 'narration.mp3');
      fs.copyFileSync(sourceAudioArtifact.absolutePath, targetNarrationPath);

      // Confirmar que o hash da cópia é idêntico byte a byte
      const targetBuffer = fs.readFileSync(targetNarrationPath);
      const targetSha256 = crypto.createHash('sha256').update(targetBuffer).digest('hex');

      if (targetSha256 !== computedSha256) {
        throw new Error(`AUDIO_COPY_INTEGRITY_FAILURE: Falha na integridade da cópia do áudio.`);
      }

      inheritedArtifactsRecord['audio_narration'] = {
        path: targetNarrationPath,
        sha256: targetSha256,
        durationSeconds: probe.duration
      };

      lineageRecord['audio_narration'] = {
        sourceRunId: sourceRunSummary.runId,
        sourceHandle: sourceAudioArtifact.handle,
        sha256: targetSha256,
        verifiedAt: new Date().toISOString()
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. GRAVAÇÃO DO MANIFESTO E ATUALIZAÇÃO DO REGISTRY
    // ─────────────────────────────────────────────────────────────────────────
    const lineage: LineageInfo = {
      derivedFromRunId: sourceRunSummary.runId,
      derivedFromHandle: sourceRunSummary.handle,
      inheritedArtifacts: lineageRecord
    };

    const newManifest = new RunManifest(newRunDir, newRunId);
    newManifest.startStage('PREPRODUCTION', 50);
    newManifest.completeStage('VOICEOVER', 1, {
      inherited: true,
      sourceRunId: sourceRunSummary.runId,
      sourceHandle: sourceRunSummary.handle
    });

    if (inheritedArtifactsRecord['audio_narration']) {
      newManifest.recordAsset(
        'postproduction/narration.mp3',
        inheritedArtifactsRecord['audio_narration'].path,
        inheritedArtifactsRecord['audio_narration'].durationSeconds
      );
    }

    // Registrar no catálogo central
    registry.registerRun(newRunDir, newRunId, lineage);

    return {
      newRunId,
      newHandle,
      newRunDir,
      sourceRunId: sourceRunSummary.runId,
      sourceHandle: sourceRunSummary.handle,
      inheritedArtifacts: inheritedArtifactsRecord,
      lineage
    };
  }
}
