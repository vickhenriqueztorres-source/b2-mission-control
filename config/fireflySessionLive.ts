import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { Logger } from '../event-hub/logger';

export interface FireflySessionLiveResult {
  live: boolean;
  reason: string;
  source: 'env' | 'probe' | 'unauthenticated';
  userProfilePath?: string;
  details?: Record<string, any>;
}

/**
 * Localiza o caminho raiz da automação Firefly no workspace.
 * Prioriza caminhos locais e variáveis de ambiente explícitas.
 */
export function resolveFireflyRoot(): string {
  const envPath = process.env.FIREFLY_AUTOMATION_ROOT || process.env.FIREFLY_ROOT_PATH;
  if (envPath && fs.existsSync(envPath)) {
    return path.resolve(envPath);
  }
  const candidateAgente = path.join(process.cwd(), 'agente firefly');
  if (fs.existsSync(candidateAgente)) {
    return candidateAgente;
  }
  const candidateAutomation = path.join(process.cwd(), 'firefly-automation');
  if (fs.existsSync(candidateAutomation)) {
    return candidateAutomation;
  }
  return path.resolve(process.cwd(), 'agente firefly');
}

/**
 * Detecta o executável python do ambiente virtual (.venv) de forma portável (Windows / Unix).
 * Retorna null se o venv não existir.
 */
export function getFireflyPythonExec(fireflyRoot: string): string | null {
  const winExec = path.join(fireflyRoot, '.venv', 'Scripts', 'python.exe');
  if (fs.existsSync(winExec)) return winExec;

  const unixExec = path.join(fireflyRoot, '.venv', 'bin', 'python');
  if (fs.existsSync(unixExec)) return unixExec;

  return null;
}

/**
 * Health check REAL do Firefly em 3 camadas obrigatórias:
 * 1. Override de emergência (FIREFLY_SESSION_ACTIVE=1) com warning explícito
 * 2. Preflight de ambiente (venv, imports, db, chrome_profile)
 * 3. Probe de sessão real via Chrome headless (python -m firefly_bot.main --probe-session)
 */
export async function isFireflySessionLive(customRoot?: string): Promise<FireflySessionLiveResult> {
  // Camada C: Override de emergência (nunca caminho normal)
  if (process.env.FIREFLY_SESSION_ACTIVE === '1') {
    Logger.warn('FireflySessionLive', '⚠️ [FIREFLY_WARNING] Health check bypassed via emergency FIREFLY_SESSION_ACTIVE=1 override.');
    return {
      live: true,
      reason: 'Health check bypassed via emergency FIREFLY_SESSION_ACTIVE=1 override',
      source: 'env'
    };
  }

  const root = path.resolve(customRoot || resolveFireflyRoot());
  const profileDir = process.env.FIREFLY_CHROME_PROFILE_DIR || path.join(root, 'data', 'chrome_profile');
  const dbDir = path.join(root, 'data');
  const dbFile = path.join(dbDir, 'firefly_jobs.db');

  // Camada A: Preflight de Ambiente
  const pythonExec = getFireflyPythonExec(root);
  if (!pythonExec) {
    return {
      live: false,
      reason: `FIREFLY_VENV_NOT_FOUND: venv não encontrado em ${root}. Execute setup em firefly-automation/.`,
      source: 'unauthenticated',
      userProfilePath: profileDir
    };
  }

  const importTest = spawnSync(pythonExec, ['-c', 'import firefly_bot'], {
    cwd: root,
    encoding: 'utf-8',
    timeout: 15000
  });

  if (importTest.status !== 0) {
    const errText = importTest.stderr || importTest.stdout || 'import error';
    return {
      live: false,
      reason: `FIREFLY_IMPORT_FAILED: Falha ao importar firefly_bot no ambiente Python (${errText.trim()})`,
      source: 'unauthenticated',
      userProfilePath: profileDir
    };
  }

  if (!fs.existsSync(profileDir)) {
    return {
      live: false,
      reason: `FIREFLY_PROFILE_NOT_FOUND: data/chrome_profile não encontrado em ${profileDir}`,
      source: 'unauthenticated',
      userProfilePath: profileDir
    };
  }

  if (!fs.existsSync(dbFile)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch (e: any) {
      return {
        live: false,
        reason: `FIREFLY_DB_UNCREATABLE: Diretório data/ não pode ser criado em ${dbDir}`,
        source: 'unauthenticated',
        userProfilePath: profileDir
      };
    }
  }

  // Camada B: Probe de sessão real via Chrome headless
  const probeRun = spawnSync(pythonExec, ['-m', 'firefly_bot.main', '--probe-session'], {
    cwd: root,
    encoding: 'utf-8',
    timeout: 60000
  });

  const probeOutput = probeRun.stdout || probeRun.stderr || '';
  let probeResult: any = null;

  try {
    const jsonStart = probeOutput.indexOf('{');
    const jsonEnd = probeOutput.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      probeResult = JSON.parse(probeOutput.substring(jsonStart, jsonEnd + 1));
    } else {
      probeResult = JSON.parse(probeOutput.trim());
    }
  } catch (parseErr) {
    return {
      live: false,
      reason: `FIREFLY_PROBE_PARSE_ERROR: Saída do probe não é JSON válido (${probeOutput.trim()})`,
      source: 'probe',
      userProfilePath: profileDir
    };
  }

  if (probeResult && probeResult.authenticated === true) {
    return {
      live: true,
      reason: probeResult.reason || 'Sessão autenticada ativa no Adobe Firefly',
      source: 'probe',
      userProfilePath: profileDir,
      details: probeResult
    };
  }

  return {
    live: false,
    reason: probeResult?.reason || 'FIREFLY_SESSION_DEAD: Sessão deslogada ou não autenticada no Adobe Firefly',
    source: 'probe',
    userProfilePath: profileDir,
    details: probeResult
  };
}
