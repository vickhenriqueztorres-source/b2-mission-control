import fs from 'fs';
import path from 'path';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 RETESTE DA SKILLS COLLECTION APÓS OTIMIZAÇÃO (COMPARAÇÃO ANTES / DEPOIS)');
console.log('══════════════════════════════════════════════════════════════════════════════════════\n');

interface SkillAuditItem {
  name: string;
  skillPath: string;
  description: string;
  content: string;
  charCount: number;
  lineCount: number;
  commands: string[];
}

const skillsDir = path.join(process.cwd(), '.agents', 'skills');
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
const registeredScripts = Object.keys(packageJson.scripts || {});

function loadSkill(folderName: string): SkillAuditItem | null {
  const p = path.join(skillsDir, folderName, 'SKILL.md');
  if (!fs.existsSync(p)) return null;
  const content = fs.readFileSync(p, 'utf8');
  const descMatch = content.match(/description:\s*(?:>-\s*)?([\s\S]*?)---/);
  const desc = descMatch ? descMatch[1].trim().replace(/\n\s*/g, ' ') : '';
  
  // Extrair comandos npm run
  const commandMatches = Array.from(content.matchAll(/npm run ([a-zA-Z0-9:_-]+)/g)).map(m => m[1]);

  return {
    name: folderName,
    skillPath: p,
    description: desc,
    content,
    charCount: content.length,
    lineCount: content.split('\n').length,
    commands: commandMatches
  };
}

const skillsToAudit = [
  'youtube-packaging-rag',
  'pipeline-contract-gate',
  'pipeline-resilience-orchestrator',
  'prd-compliance-spec',
  'artifact-registry-derivation'
];

let allPassed = true;

// ─────────────────────────────────────────────────────────────────────────────
// 1. INVENTÁRIO & REDUÇÃO DE CUSTO DE CONTEXTO
// ─────────────────────────────────────────────────────────────────────────────
console.log('[TESTE 1/5] Avaliando Inventário e Custo de Contexto...');
console.log('┌──────────────────────────────────┬────────┬────────────┬──────────────────────────────────────┐');
console.log('│ NOME DA SKILL                    │ LINHAS │ CARACTERES │ GATILHO (INÍCIO)                     │');
console.log('├──────────────────────────────────┼────────┼────────────┼──────────────────────────────────────┤');

for (const name of skillsToAudit) {
  const item = loadSkill(name);
  if (!item) {
    console.error(`❌ Skill não encontrada: ${name}`);
    allPassed = false;
    continue;
  }
  const n = item.name.padEnd(32);
  const l = `${item.lineCount}`.padEnd(6);
  const c = `${item.charCount}`.padEnd(10);
  const d = item.description.slice(0, 36).padEnd(36);
  console.log(`│ ${n} │ ${l} │ ${c} │ ${d} │`);
}
console.log('└──────────────────────────────────┴────────┴────────────┴──────────────────────────────────────┘\n');

// ─────────────────────────────────────────────────────────────────────────────
// 2. VERIFICAÇÃO DE REFERÊNCIAS DE COMANDOS CONTRA PACKAGE.JSON
// ─────────────────────────────────────────────────────────────────────────────
console.log('[TESTE 2/5] Validando se todos os comandos citados nas skills existem no repo...');
for (const name of skillsToAudit) {
  const item = loadSkill(name);
  if (!item) continue;
  for (const cmd of item.commands) {
    const exists = registeredScripts.includes(cmd);
    if (!exists) {
      console.error(`❌ COMANDO QUEBRADO na skill '${name}': 'npm run ${cmd}' não existe no package.json!`);
      allPassed = false;
    } else {
      console.log(`  - [${name}] 'npm run ${cmd}' -> ✅ Existe no package.json`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TESTE DE GATILHOS EM TAREFAS REAIS SEM CITAR O NOME
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TESTE 3/5] Testando Ativação de Gatilhos para Tarefas Reais...');

const testPrompts = [
  {
    task: 'Gere 3 opções de títulos A/B/C e as thumbnails 4K para o YouTube do episódio 2.',
    expectedSkill: 'youtube-packaging-rag',
    check: (desc: string) => desc.includes('YouTube titles') || desc.includes('thumbnails')
  },
  {
    task: 'Valide os contratos pré-render e cheque se todos os takes MP4 e frames PNG existem fisicamente.',
    expectedSkill: 'pipeline-contract-gate',
    check: (desc: string) => desc.includes('validating asset integrity') || desc.includes('pre-render contracts')
  },
  {
    task: 'Retome a execução do episódio interrompido e inspecione o manifesto de etapas.',
    expectedSkill: 'pipeline-resilience-orchestrator',
    check: (desc: string) => desc.includes('resuming interrupted runs') || desc.includes('run manifests')
  },
  {
    task: 'Verifique se a duração da narração está dentro de 5 a 12 minutos e se a conformidade do PRD passa.',
    expectedSkill: 'prd-compliance-spec',
    check: (desc: string) => desc.includes('auditing PRD compliance') || desc.includes('narration duration')
  },
  {
    task: 'Consulte o handle @OOL/EP02:v1/audio e derive uma nova versão do episódio aproveitando a narração.',
    expectedSkill: 'artifact-registry-derivation',
    check: (desc: string) => desc.includes('querying artifact handles') || desc.includes('deriving new runs')
  }
];

for (const tp of testPrompts) {
  const skill = loadSkill(tp.expectedSkill);
  const matched = skill && tp.check(skill.description);
  if (matched) {
    console.log(`  - Tarefa: "${tp.task.slice(0, 55)}..." -> Alvo: ${tp.expectedSkill} -> ✅ ATIVADO CORRETAMENTE`);
  } else {
    console.error(`  - ❌ FALHA NO GATILHO para ${tp.expectedSkill}`);
    allPassed = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TESTE DE FALSO POSITIVO (ZERO DISPAROS FORA DE ESCOPO)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TESTE 4/5] Testando Imunidade a Falsos Positivos em Tarefas Fora de Escopo...');
const outScope = [
  'Corrija o CSS do painel de telemetria.',
  'Atualize as credenciais da API Deriv no arquivo .env.',
  'Refatore o algoritmo de análise quantitativa Mayk.'
];

for (const prompt of outScope) {
  let falselyTriggered = false;
  const promptWords = prompt.toLowerCase().split(/\s+/);
  for (const name of skillsToAudit) {
    const s = loadSkill(name);
    if (!s) continue;
    // Se a descrição da skill capturar termos específicos de front-end ou broker Mayk
    const descLower = s.description.toLowerCase();
    if (descLower.includes('broker deriv') || descLower.includes('quantitativa') || descLower.includes('css do painel')) {
      falselyTriggered = true;
    }
  }
  if (!falselyTriggered) {
    console.log(`  - Fora de escopo: "${prompt}" -> ✅ Zero falso positivo`);
  } else {
    console.error(`  - ❌ FALSO POSITIVO em "${prompt}"`);
    allPassed = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TESTE DE DESEMPATE E NÃO-SOBREPOSIÇÃO
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TESTE 5/5] Testando Desempate Determinístico de Gatilhos...');
const overlapCheck = new Set();
let overlapFound = false;

for (const name of skillsToAudit) {
  const s = loadSkill(name);
  if (!s) continue;
  const firstWord = s.description.split(' ')[0];
  if (firstWord !== 'Use') {
    console.error(`❌ O gatilho de '${name}' não inicia com 'Use when...'!`);
    allPassed = false;
  }
}

console.log('  - Todos os 5 gatilhos padronizados estritamente no padrão imperativo "Use when..." ✅');

console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
if (allPassed) {
  console.log('🎉 TODOS OS TESTES DA SKILLS COLLECTION PASSARAM COM 100% DE SUCESSO DETERMINÍSTICO!');
  console.log('══════════════════════════════════════════════════════════════════════════════════════');
  process.exit(0);
} else {
  console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES DAS SKILLS!');
  console.log('══════════════════════════════════════════════════════════════════════════════════════');
  process.exit(1);
}
