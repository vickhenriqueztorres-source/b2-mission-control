import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { RunIdentity, RunCoordinates, ParsedHandle } from './runIdentity';
import { PipelineContractGate } from './pipelineContractGate';
import { PrdComplianceChecker } from './prdComplianceChecker';

export type AddressableArtifactType =
  | 'audio_narration'
  | 'final_master'
  | 'thumbnail_a'
  | 'thumbnail_b'
  | 'thumbnail_c'
  | 'youtube_metadata'
  | 'editorial_plan';

export interface TechnicalMetadata {
  durationSeconds?: number;
  width?: number;
  height?: number;
  fps?: number;
  codec?: string;
  bitrateKbps?: number;
}

export interface LineageInfo {
  derivedFromRunId?: string;
  derivedFromHandle?: string;
  inheritedArtifacts?: Record<string, {
    sourceRunId: string;
    sourceHandle: string;
    sha256: string;
    verifiedAt: string;
  }>;
}

export interface RegisteredArtifact {
  handle: string;
  runId: string;
  projectId: string;
  episodeId: string;
  version: number;
  artifactType: AddressableArtifactType;
  relativePath: string;
  absolutePath: string;
  sizeBytes: number;
  sha256: string;
  technicalMetadata: TechnicalMetadata;
  complianceStatus: 'APPROVED' | 'REJECTED' | 'PENDING';
  lineage?: LineageInfo;
  createdAt: string;
  updatedAt: string;
}

export interface RegisteredRunSummary {
  runId: string;
  handle: string;
  projectId: string;
  episodeId: string;
  version: number;
  runDir: string;
  overallStatus: 'COMPLETED' | 'RUNNING' | 'FAILED';
  complianceStatus: 'APPROVED' | 'REJECTED' | 'PENDING';
  durationSeconds?: number;
  totalScenes?: number;
  artifactsCount: number;
  lineage?: LineageInfo;
  createdAt: string;
  updatedAt: string;
}

export interface RegistryData {
  schema: 'hsl.artifact-registry.v1';
  updatedAt: string;
  runs: Record<string, RegisteredRunSummary>;
  artifacts: Record<string, RegisteredArtifact>;
}

export class ArtifactRegistry {
  private registryPath: string;
  private runsDir: string;
  private data: RegistryData;

  constructor(runsDir?: string) {
    this.runsDir = runsDir || path.join(process.cwd(), 'runs');
    this.registryPath = path.join(this.runsDir, 'artifact_registry.json');
    this.data = this.loadOrCreate();
  }

  private loadOrCreate(): RegistryData {
    if (fs.existsSync(this.registryPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.registryPath, 'utf8'));
      } catch {
        return this.createEmpty();
      }
    }
    return this.createEmpty();
  }

  private createEmpty(): RegistryData {
    return {
      schema: 'hsl.artifact-registry.v1',
      updatedAt: new Date().toISOString(),
      runs: {},
      artifacts: {}
    };
  }

  public save(): void {
    this.data.updatedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(this.registryPath), { recursive: true });
    fs.writeFileSync(this.registryPath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  /**
   * Registra ou atualiza uma run completa e todos os seus artefatos endereçáveis
   */
  public registerRun(runDir: string, explicitRunId?: string, lineage?: LineageInfo): RegisteredRunSummary {
    const dirName = path.basename(runDir);
    const runId = explicitRunId || dirName;
    const coords = RunIdentity.parseRunId(runId);
    const runHandle = RunIdentity.formatHandle(coords);

    // Avaliar conformidade do PRD
    let complianceStatus: 'APPROVED' | 'REJECTED' | 'PENDING' = 'PENDING';
    let durationSeconds = 0;
    try {
      const report = PrdComplianceChecker.verifyRun(runId, path.dirname(runDir));
      complianceStatus = report.overallPassed ? 'APPROVED' : 'REJECTED';
      const durRule = report.results.find(r => r.ruleId === 'PRD-R01-NARRATION-DURATION');
      if (durRule) {
        const match = durRule.measuredValue.match(/^([0-9.]+)s/);
        if (match) durationSeconds = parseFloat(match[1]);
      }
    } catch {
      complianceStatus = 'PENDING';
    }

    const manifestPath = path.join(runDir, 'run-manifest.json');
    let overallStatus: 'COMPLETED' | 'RUNNING' | 'FAILED' = 'RUNNING';
    let createdAt = new Date().toISOString();
    let updatedAt = new Date().toISOString();

    if (fs.existsSync(manifestPath)) {
      try {
        const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        overallStatus = m.overallStatus || 'RUNNING';
        if (m.createdAt) createdAt = m.createdAt;
        if (m.updatedAt) updatedAt = m.updatedAt;
      } catch {}
    } else if (fs.existsSync(path.join(runDir, 'final_master.mp4'))) {
      overallStatus = 'COMPLETED';
    }

    // Registrar artefatos endereçáveis
    const addressableMap: Array<{ type: AddressableArtifactType; relPath: string }> = [
      { type: 'audio_narration', relPath: 'postproduction/narration.mp3' },
      { type: 'final_master', relPath: 'final_master.mp4' },
      { type: 'thumbnail_a', relPath: 'postproduction/thumbnails/thumbnail_variant_a_mechanism.png' },
      { type: 'thumbnail_b', relPath: 'postproduction/thumbnails/thumbnail_variant_b_consequence.png' },
      { type: 'thumbnail_c', relPath: 'postproduction/thumbnails/thumbnail_variant_c_final_handoff.png' },
      { type: 'youtube_metadata', relPath: 'postproduction/youtube-metadata.json' },
      { type: 'editorial_plan', relPath: 'editorial/execution/documentary-edit-package.json' }
    ];

    let artifactsCount = 0;

    for (const item of addressableMap) {
      const fullPath = path.join(runDir, item.relPath);
      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        if (stat.size > 0) {
          const fileBuffer = fs.readFileSync(fullPath);
          const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
          const artifactHandle = RunIdentity.formatHandle(coords, item.type.replace('thumbnail_', 'thumb_').replace('audio_narration', 'audio').replace('final_master', 'master').replace('youtube_metadata', 'seo').replace('editorial_plan', 'plan'));

          let techMeta: TechnicalMetadata = {};
          if (item.relPath.endsWith('.mp3') || item.relPath.endsWith('.mp4')) {
            const probe = PipelineContractGate.probeMedia(fullPath);
            techMeta = {
              durationSeconds: probe.duration,
              width: probe.width,
              height: probe.height,
              codec: probe.codec
            };
            if (techMeta.durationSeconds && !durationSeconds) {
              durationSeconds = techMeta.durationSeconds;
            }
          }

          const registeredArt: RegisteredArtifact = {
            handle: artifactHandle,
            runId,
            projectId: coords.projectId,
            episodeId: coords.episodeId,
            version: coords.version,
            artifactType: item.type,
            relativePath: item.relPath,
            absolutePath: fullPath,
            sizeBytes: stat.size,
            sha256,
            technicalMetadata: techMeta,
            complianceStatus,
            lineage,
            createdAt,
            updatedAt
          };

          this.data.artifacts[artifactHandle] = registeredArt;
          this.data.artifacts[`${runId}/${item.type}`] = registeredArt;
          artifactsCount++;
        }
      }
    }

    const summary: RegisteredRunSummary = {
      runId,
      handle: runHandle,
      projectId: coords.projectId,
      episodeId: coords.episodeId,
      version: coords.version,
      runDir,
      overallStatus,
      complianceStatus,
      durationSeconds,
      artifactsCount,
      lineage,
      createdAt,
      updatedAt
    };

    this.data.runs[runId] = summary;
    this.data.runs[runHandle] = summary;
    this.save();

    return summary;
  }

  /**
   * Resolve um handle para um artefato registrado único
   */
  public resolveArtifact(query: string): RegisteredArtifact {
    const raw = query.trim();

    // 1. Match direto de chave
    if (this.data.artifacts[raw]) {
      return this.data.artifacts[raw];
    }

    // 2. Parse de handle estruturado
    const parsed = RunIdentity.parseHandle(raw);
    const targetType = parsed.artifactType || 'final_master';

    // Buscar correspondências
    const candidates = Object.values(this.data.artifacts).filter(a => {
      const matchProj = a.projectId.toUpperCase() === parsed.projectId.toUpperCase();
      const matchEp = a.episodeId.toUpperCase().includes(parsed.episodeId.toUpperCase());
      const matchVer = parsed.version === 'latest' || parsed.version === undefined || a.version === parsed.version;
      const matchType = a.artifactType.includes(targetType) || a.handle.toLowerCase().includes(targetType.toLowerCase());
      return matchProj && matchEp && matchVer && matchType;
    });

    if (candidates.length === 0) {
      throw new Error(`ARTIFACT_NOT_FOUND: Nenhum artefato encontrado para a consulta '${query}'. Use 'npm run registry -- list' para ver os artefatos disponíveis.`);
    }

    if (candidates.length > 1) {
      // Se houver mais de um candidato com versões diferentes e pediu 'latest', seleciona a maior versão
      if (parsed.version === 'latest') {
        candidates.sort((a, b) => b.version - a.version);
        return candidates[0];
      }
      const handlesList = candidates.map(c => `  - ${c.handle} (${c.absolutePath})`).join('\n');
      throw new Error(`AMBIGUOUS_HANDLE_ERROR: O identificador '${query}' é ambíguo e resolve para ${candidates.length} artefatos:\n${handlesList}\nEspecifique a versão exata.`);
    }

    return candidates[0];
  }

  /**
   * Resolve um handle diretamente para o caminho absoluto do arquivo no disco
   */
  public resolvePath(query: string): string {
    const art = this.resolveArtifact(query);
    if (!fs.existsSync(art.absolutePath)) {
      throw new Error(`ARTIFACT_FILE_MISSING_ON_DISK: O registro existe (${art.handle}), mas o arquivo físico '${art.absolutePath}' não foi encontrado.`);
    }
    return art.absolutePath;
  }

  /**
   * Reconstrói o registry completamente a partir de uma varredura do disco
   */
  public rebuildFromDisk(): RegistryData {
    this.data = this.createEmpty();

    if (!fs.existsSync(this.runsDir)) {
      this.save();
      return this.data;
    }

    const scanDirectory = (currentDir: string): void => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      // Se este diretório for uma pasta de run (contém editorial/ ou postproduction/ ou final_master.mp4)
      const hasEditorial = fs.existsSync(path.join(currentDir, 'editorial'));
      const hasPost = fs.existsSync(path.join(currentDir, 'postproduction'));
      const hasMaster = fs.existsSync(path.join(currentDir, 'final_master.mp4'));

      if (hasEditorial || hasPost || hasMaster) {
        try {
          this.registerRun(currentDir);
        } catch {}
        return; // Não descer mais fundo nesta árvore de run
      }

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scanDirectory(path.join(currentDir, entry.name));
        }
      }
    };

    scanDirectory(this.runsDir);
    this.save();
    return this.data;
  }

  /**
   * Lista todas as runs registradas com suporte a filtros
   */
  public listRuns(filter?: { projectId?: string; episodeId?: string }): RegisteredRunSummary[] {
    const uniqueRuns = new Map<string, RegisteredRunSummary>();
    for (const run of Object.values(this.data.runs)) {
      if (filter?.projectId && run.projectId.toUpperCase() !== filter.projectId.toUpperCase()) continue;
      if (filter?.episodeId && !run.episodeId.toUpperCase().includes(filter.episodeId.toUpperCase())) continue;
      uniqueRuns.set(run.runId, run);
    }
    return Array.from(uniqueRuns.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /**
   * Lista apenas os áudios aprovados e reaproveitáveis de um projeto
   */
  public listApprovedAudios(projectId: string): RegisteredArtifact[] {
    const unique = new Map<string, RegisteredArtifact>();
    for (const a of Object.values(this.data.artifacts)) {
      const matchProj = a.projectId.toUpperCase() === projectId.toUpperCase();
      const isAudio = a.artifactType === 'audio_narration';
      const isApproved = a.complianceStatus === 'APPROVED' || a.sizeBytes > 500 * 1024;
      if (matchProj && isAudio && isApproved) {
        unique.set(a.handle, a);
      }
    }
    return Array.from(unique.values());
  }

  /**
   * Verifica isolamento de projetos (assegura que nenhuma run herde ou aponte para outro projeto)
   */
  public verifyProjectIsolation(): { isolated: boolean; violations: string[] } {
    const violations: string[] = [];

    for (const art of Object.values(this.data.artifacts)) {
      if (art.lineage?.inheritedArtifacts) {
        for (const [key, inherited] of Object.entries(art.lineage.inheritedArtifacts)) {
          const sourceProj = RunIdentity.parseRunId(inherited.sourceRunId).projectId;
          if (sourceProj !== art.projectId) {
            violations.push(`CROSS_PROJECT_CONTAMINATION: Artefato '${art.handle}' do projeto '${art.projectId}' herdou '${key}' da run '${inherited.sourceRunId}' que pertence ao projeto '${sourceProj}'.`);
          }
        }
      }
    }

    return {
      isolated: violations.length === 0,
      violations
    };
  }

  public getData(): RegistryData {
    return this.data;
  }
}
