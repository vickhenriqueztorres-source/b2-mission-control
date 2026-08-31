import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { resolveFireflyRoot, getFireflyPythonExec } from '../config/fireflySessionLive';

interface CheckItem {
  id: string;
  name: string;
  passed: boolean;
  details: string;
  fixInstruction?: string;
}

export async function runFireflyDoctor(): Promise<boolean> {
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log('🔬 FIREFLY DOCTOR // DIAGNÓSTICO FORENSE DE AMBIENTE & SESSÃO');
  console.log('══════════════════════════════════════════════════════════════════════\n');

  const root = resolveFireflyRoot();
  console.log(`📍 Diretório Firefly Detectado: ${root}`);

  const checks: CheckItem[] = [];

  // 1. Virtualenv Python
  const pyExec = getFireflyPythonExec(root);
  if (pyExec && fs.existsSync(pyExec)) {
    checks.push({
      id: 'VENV',
      name: 'Python Virtualenv (.venv)',
      passed: true,
      details: pyExec
    });
  } else {
    checks.push({
      id: 'VENV',
      name: 'Python Virtualenv (.venv)',
      passed: false,
      details: 'Ambiente virtual .venv não encontrado',
      fixInstruction: `Navegue até '${root}' e execute: python -m venv .venv && .venv\\Scripts\\pip install -r requirements.txt`
    });
  }

  // 2. Import do firefly_bot
  if (pyExec && fs.existsSync(pyExec)) {
    const importTest = spawnSync(pyExec, ['-c', 'import firefly_bot'], {
      cwd: root,
      encoding: 'utf-8',
      timeout: 15000
    });

    if (importTest.status === 0) {
      checks.push({
        id: 'IMPORTS',
        name: 'Módulo Python firefly_bot',
        passed: true,
        details: 'Importado com sucesso via .venv'
      });
    } else {
      const errText = importTest.stderr || importTest.stdout || 'Erro de importação';
      checks.push({
        id: 'IMPORTS',
        name: 'Módulo Python firefly_bot',
        passed: false,
        details: `Erro na importação: ${errText.trim()}`,
        fixInstruction: `Instale as dependências no venv: "${pyExec}" -m pip install -r "${path.join(root, 'requirements.txt')}"`
      });
    }
  } else {
    checks.push({
      id: 'IMPORTS',
      name: 'Módulo Python firefly_bot',
      passed: false,
      details: 'Dependente do venv',
      fixInstruction: 'Configure o .venv primeiro.'
    });
  }

  // 3. Diretório Data & Banco SQLite
  const dataDir = path.join(root, 'data');
  const dbFile = path.join(dataDir, 'firefly_jobs.db');
  if (fs.existsSync(dbFile)) {
    checks.push({
      id: 'DATABASE',
      name: 'Banco de Dados SQLite (firefly_jobs.db)',
      passed: true,
      details: dbFile
    });
  } else if (fs.existsSync(dataDir)) {
    checks.push({
      id: 'DATABASE',
      name: 'Banco de Dados SQLite (firefly_jobs.db)',
      passed: true,
      details: 'Diretório data/ pronto para inicialização automática do banco'
    });
  } else {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
      checks.push({
        id: 'DATABASE',
        name: 'Banco de Dados SQLite (firefly_jobs.db)',
        passed: true,
        details: 'Diretório data/ criado com sucesso'
      });
    } catch (e: any) {
      checks.push({
        id: 'DATABASE',
        name: 'Banco de Dados SQLite (firefly_jobs.db)',
        passed: false,
        details: `Falha ao criar diretório data/: ${e.message}`,
        fixInstruction: `Crie manualmente a pasta '${dataDir}' com permissões de escrita.`
      });
    }
  }

  // 4. Chrome Profile
  const profileDir = process.env.FIREFLY_CHROME_PROFILE_DIR || path.join(root, 'data', 'chrome_profile');
  const defaultProfile = path.join(profileDir, 'Default');
  if (fs.existsSync(profileDir) && fs.existsSync(defaultProfile)) {
    checks.push({
      id: 'PROFILE_DIR',
      name: 'Estrutura do Chrome Profile',
      passed: true,
      details: profileDir
    });
  } else if (fs.existsSync(profileDir)) {
    checks.push({
      id: 'PROFILE_DIR',
      name: 'Estrutura do Chrome Profile',
      passed: true,
      details: `${profileDir} (pasta Default será criada na primeira execução)`
    });
  } else {
    checks.push({
      id: 'PROFILE_DIR',
      name: 'Estrutura do Chrome Profile',
      passed: false,
      details: `Perfil não encontrado em ${profileDir}`,
      fixInstruction: 'Execute login_firefly.bat para gerar a estrutura de perfil autenticada.'
    });
  }

  // 5. Probe de Sessão Real
  if (pyExec && fs.existsSync(pyExec)) {
    console.log('⏳ Executando probe de sessão via Chrome headless...');
    const probeRun = spawnSync(pyExec, ['-m', 'firefly_bot.main', '--probe-session'], {
      cwd: root,
      encoding: 'utf-8',
      timeout: 60000
    });

    const probeOutput = probeRun.stdout || probeRun.stderr || '';
    let probeJson: any = null;
    try {
      const s = probeOutput.indexOf('{');
      const e = probeOutput.lastIndexOf('}');
      if (s !== -1 && e !== -1) {
        probeJson = JSON.parse(probeOutput.substring(s, e + 1));
      } else {
        probeJson = JSON.parse(probeOutput.trim());
      }
    } catch {}

    if (probeJson && probeJson.authenticated === true && probeJson.production_ui_ready === true) {
      checks.push({
        id: 'PRODUCTION_UI_READY',
        name: 'Firefly Video pronto para produção',
        passed: true,
        details: `${probeJson.reason}; modelo=${probeJson.model}; duração=${probeJson.duration_seconds}s`
      });
    } else {
      checks.push({
        id: 'PRODUCTION_UI_READY',
        name: 'Firefly Video pronto para produção',
        passed: false,
        details: probeJson?.reason || 'FIREFLY_SESSION_DEAD: Deslogado ou compositor indisponível',
        fixInstruction: 'Execute login_firefly.bat, clique em "Fazer logon" no Chrome e pressione ENTER no terminal para salvar a sessão.'
      });
    }
  } else {
    checks.push({
      id: 'SESSION_LIVE',
      name: 'Sessão Ativa no Adobe Firefly',
      passed: false,
      details: 'Não foi possível rodar o probe sem o venv',
      fixInstruction: 'Configure o venv e execute login_firefly.bat.'
    });
  }

  // Relatório formatado
  console.log('\n──────────────────────────────────────────────────────────────────────');
  console.log('📋 CHECKLIST DE CONFORMIDADE');
  console.log('──────────────────────────────────────────────────────────────────────');

  let allPassed = true;
  for (const check of checks) {
    if (check.passed) {
      console.log(`\x1b[32m[PASS] \x1b[0m ${check.name}`);
      console.log(`       └─ ${check.details}`);
    } else {
      allPassed = false;
      console.log(`\x1b[31m[FAIL] \x1b[0m ${check.name}`);
      console.log(`       ├─ Motivo: ${check.details}`);
      if (check.fixInstruction) {
        console.log(`       └─ 🔧 Solução: ${check.fixInstruction}`);
      }
    }
  }

  console.log('──────────────────────────────────────────────────────────────────────\n');

  if (allPassed) {
    console.log('\x1b[32m[FIREFLY_DOCTOR_OK] Todos os pré-requisitos do Firefly estão 100% OPERACIONAIS.\x1b[0m\n');
  } else {
    console.log('\x1b[31m[FIREFLY_DOCTOR_FAIL] Corrija os itens [FAIL] acima antes de rodar produções com Firefly.\x1b[0m\n');
  }

  return allPassed;
}

if (require.main === module) {
  runFireflyDoctor().then((passed) => {
    process.exit(passed ? 0 : 1);
  }).catch((e) => {
    console.error('[FATAL_ERROR]', e.message);
    process.exit(1);
  });
}
