import path from 'path';
import crypto from 'crypto';

export interface RunCoordinates {
  projectId: string;   // Ex: 'OOL', 'HSL'
  episodeId: string;   // Ex: 'EP02_CABOS', 'EP01_PIX'
  version: number;     // Ex: 1, 2, 3
  suffix: string;      // Ex: 'a8f9' (4-char hash or random hex)
}

export interface ParsedHandle {
  projectId: string;
  episodeId: string;
  version?: number | 'latest';
  artifactType?: string; // Ex: 'audio', 'master', 'thumb_a', 'thumb_b', 'thumb_c', 'seo'
}

export class RunIdentity {
  /**
   * Formata as coordenadas em um Run ID longo canônico:
   * Ex: OOL.EP02_CABOS.v1.a8f9
   */
  public static formatRunId(coords: RunCoordinates): string {
    return `${coords.projectId}.${coords.episodeId}.v${coords.version}.${coords.suffix}`;
  }

  /**
   * Formata as coordenadas em um Handle Curto Colável:
   * Ex: @OOL/EP02_CABOS:v1 ou @OOL/EP02_CABOS:v1/audio
   */
  public static formatHandle(coords: RunCoordinates, artifactType?: string): string {
    const base = `@${coords.projectId}/${coords.episodeId}:v${coords.version}`;
    return artifactType ? `${base}/${artifactType}` : base;
  }

  /**
   * Cria novas coordenadas de run com sufixo único
   */
  public static createCoordinates(projectId: string, episodeId: string, version: number = 1): RunCoordinates {
    const cleanProject = projectId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const cleanEpisode = episodeId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
    const suffix = crypto.randomBytes(2).toString('hex');
    return {
      projectId: cleanProject,
      episodeId: cleanEpisode,
      version: Math.max(1, version),
      suffix
    };
  }

  /**
   * Faz o parse de um Run ID longo ou legado
   */
  public static parseRunId(runId: string): RunCoordinates {
    const parts = runId.split('.');
    if (parts.length >= 4 && parts[2].startsWith('v')) {
      const version = parseInt(parts[2].slice(1), 10);
      return {
        projectId: parts[0].toUpperCase(),
        episodeId: parts[1].toUpperCase(),
        version: isNaN(version) ? 1 : version,
        suffix: parts[3]
      };
    }

    // Suporte a IDs legados como 'OOL-EP02-CABOS' ou 'OOL-EP01-PIX'
    if (runId.startsWith('OOL-') || runId.startsWith('HSL-')) {
      const splitDash = runId.split('-');
      const proj = splitDash[0].toUpperCase();
      const ep = splitDash.slice(1).join('_').toUpperCase();
      return {
        projectId: proj,
        episodeId: ep,
        version: 1,
        suffix: 'leg'
      };
    }

    // Fallback genérico determinístico
    return {
      projectId: 'DEFAULT',
      episodeId: runId.toUpperCase().replace(/[^A-Z0-9_-]/g, '_'),
      version: 1,
      suffix: 'leg'
    };
  }

  /**
   * Faz o parse de um handle colado no chat ou CLI:
   * Suporta:
   * - @OOL/EP02:v1
   * - @OOL/EP02:latest
   * - @OOL/EP02:v1/audio
   * - @OOL/EP02:v1/master
   * - OOL.EP02_CABOS.v1.a8f9
   * - OOL-EP02-CABOS
   */
  public static parseHandle(input: string): ParsedHandle {
    const raw = input.trim();

    // Formato @PROJECT/EPISODE:vVERSION/TYPE
    if (raw.startsWith('@')) {
      const match = raw.match(/^@([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)(?::v?([0-9]+|latest))?(?:\/([A-Za-z0-9_-]+))?$/);
      if (!match) {
        throw new Error(`INVALID_HANDLE_SYNTAX: O formato do handle '${input}' é inválido. Use '@PROJETO/EPISODIO:v1' ou '@PROJETO/EPISODIO:v1/tipo'.`);
      }

      const projectId = match[1].toUpperCase();
      const episodeId = match[2].toUpperCase();
      let version: number | 'latest' = 'latest';
      if (match[3]) {
        version = match[3].toLowerCase() === 'latest' ? 'latest' : parseInt(match[3], 10);
      }
      const artifactType = match[4]?.toLowerCase();

      return {
        projectId,
        episodeId,
        version,
        artifactType
      };
    }

    // Se for um Run ID longo
    if (raw.includes('.')) {
      const coords = this.parseRunId(raw);
      return {
        projectId: coords.projectId,
        episodeId: coords.episodeId,
        version: coords.version
      };
    }

    // Se for ID legado (ex: OOL-EP02-CABOS)
    const coords = this.parseRunId(raw);
    return {
      projectId: coords.projectId,
      episodeId: coords.episodeId,
      version: coords.version
    };
  }

  /**
   * Retorna o caminho canônico no namespace por projeto:
   * runs/<projectId>/<episodeId>/v<version>_<suffix>/
   */
  public static getCanonicalRunDir(baseRunsDir: string, coords: RunCoordinates): string {
    return path.join(baseRunsDir, coords.projectId, coords.episodeId, `v${coords.version}_${coords.suffix}`);
  }

  /**
   * Retorna o caminho de uma run existente, suportando tanto o esquema canônico quanto o legado
   */
  public static resolveRunDir(baseRunsDir: string, rawRunId: string): string {
    // 1. Tentar pasta canônica se o rawRunId for longo
    if (rawRunId.includes('.')) {
      const coords = this.parseRunId(rawRunId);
      const canonical = this.getCanonicalRunDir(baseRunsDir, coords);
      if (require('fs').existsSync(canonical)) return canonical;
    }

    // 2. Tentar pasta plana legada (runs/OOL-EP02-CABOS)
    const flatPath = path.join(baseRunsDir, rawRunId);
    if (require('fs').existsSync(flatPath)) return flatPath;

    // 3. Retornar caminho canônico esperado
    const coords = this.parseRunId(rawRunId);
    return this.getCanonicalRunDir(baseRunsDir, coords);
  }
}
