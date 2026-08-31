import fs from 'fs';
import path from 'path';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 TESTE DE ARQUITETURA: ZERO VAZAMENTO DE DEFAULTS EDITORIAIS (REMOTION/DOCUMENTARY)');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

let allPassed = true;
const documentaryDir = path.join(process.cwd(), 'remotion', 'documentary');
const files = fs.readdirSync(documentaryDir).filter(f => f.endsWith('.tsx') && !f.endsWith('.fixture.ts'));

// Padrões proibidos em valores padrão de props ou desestruturação de componentes
const FORBIDDEN_EDITORIAL_PATTERNS = [
  /TEMPO DE LIQUIDAÇÃO ATÔMICA/i,
  /DESDE O TOQUE ATÉ O CRÉDITO/i,
  /BLOCO MEDIDOR HIDRÁULICO/i,
  /CÂMARA DE MEDIÇÃO VOLUMÉTRICA/i,
  /PORTARIA 559/i,
  /AUTO DE INFRAÇÃO METROLÓGICA/i,
  /DUTO DE DADOS FIBRA/i,
  /BARUERI \/\/ SP/i,
  /O PONTO DE ESTRANGULAMENTO/i,
  /MILHÕES DE TRANSAÇÕES/i,
  /INMETRO-559-PR/i,
  /4\.000 PULSOS GERADOS/i,
  /CARLOS EDUARDO SILVA/i,
  /pix@exemplo\.com\.br/i,
  /PROPAGAÇÃO DE ONDAS VLF/i,
  /ANATOMIA DO CABO SUBMARINO/i,
  /MAPA BATIMÉTRICO ATLÂNTICO/i,
  /AMPLIFICADOR ÓPTICO DE ÉRBIO/i,
  /DETECÇÃO DE RUPTURA SUBMARINA/i,
  /ANÁLISE DE HARDWARE \/\/ O OUTRO LADO/i
];

console.log(`[TEST 1/2] Auditando ${files.length} componentes em remotion/documentary/...`);

for (const file of files) {
  const filePath = path.join(documentaryDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Buscar qualquer ocorrência dos termos proibidos em defaults
  for (const pattern of FORBIDDEN_EDITORIAL_PATTERNS) {
    if (pattern.test(content)) {
      console.error(`❌ VIOLAÇÃO DETECTADA em ${file}: Conteúdo editorial legado encontrado matching ${pattern}`);
      allPassed = false;
    }
  }
}

if (allPassed) {
  console.log(`✅ TESTE 1 PASSOU: Todos os ${files.length} componentes estão livres de defaults editoriais legados.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTE 2: Verificar que AtomicStopwatch, VelocityPhysics, TechnicalCutaway e FlowMeter
// possuem props vazias ou genéricas por padrão
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 2/2] Validando componentes críticos...');
const atomicContent = fs.readFileSync(path.join(documentaryDir, 'AtomicStopwatch.tsx'), 'utf8');
const velocityContent = fs.readFileSync(path.join(documentaryDir, 'VelocityPhysicsCalculationHUD.tsx'), 'utf8');
const cutawayContent = fs.readFileSync(path.join(documentaryDir, 'TechnicalCutawaySchematic.tsx'), 'utf8');
const flowContent = fs.readFileSync(path.join(documentaryDir, 'FlowMeterPulserSchematicHUD.tsx'), 'utf8');

const isAtomicClean = !atomicContent.includes('TEMPO DE LIQUIDAÇÃO ATÔMICA') && atomicContent.includes("label = ''");
const isVelocityClean = !velocityContent.includes('CIRCUITO TANQUE') && velocityContent.includes("circuitTitle = ''");
const isCutawayClean = !cutawayContent.includes('BLOCO MEDIDOR HIDRÁULICO') && cutawayContent.includes("systemTitle = ''");
const isFlowClean = !flowContent.includes('METROLOGIA // PORTARIA INMETRO 559') && flowContent.includes("meterTitle = ''");

if (isAtomicClean && isVelocityClean && isCutawayClean && isFlowClean) {
  console.log('✅ TESTE 2 PASSOU: Componentes críticos parametrizados fail-closed com sucesso.');
} else {
  console.error('❌ FALHA NO TESTE 2: Um ou mais componentes críticos ainda contêm strings não parametrizadas.', {
    isAtomicClean,
    isVelocityClean,
    isCutawayClean,
    isFlowClean
  });
  allPassed = false;
}

if (!allPassed) {
  console.error('\n❌ SUÍTE DE TESTES REPROVOU. VAZAMENTO DE IDENTIDADE DETECTADO.');
  process.exit(1);
} else {
  console.log('\n🎉 TODOS OS TESTES DE ARQUITETURA PASSARAM COM SUCESSO!');
}
