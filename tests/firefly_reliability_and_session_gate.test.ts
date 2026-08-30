import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';
import { isFireflySessionLive, resolveFireflyRoot, getFireflyPythonExec } from '../config/fireflySessionLive';
import { FireflyAdapter } from '../adapters/fireflyAdapter';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';

async function run() {
  console.log('🧪 Iniciando suite de testes: Firefly Reliability, Session Gate & Honest Auditing...\n');

  // Teste 1: Profile inexistente
  console.log('Test 1: isFireflySessionLive com profile inexistente retorna live=false...');
  const tmpDir = path.join(process.cwd(), 'temp_test_empty_firefly_root');
  fs.mkdirSync(tmpDir, { recursive: true });
  try {
    const res = await isFireflySessionLive(tmpDir);
    assert.equal(res.live, false, 'Deveria retornar live=false para raiz sem venv/profile');
    assert.ok(res.reason.includes('FIREFLY_VENV_NOT_FOUND') || res.reason.includes('PROFILE_NOT_FOUND'), 'Deveria conter motivo descritivo');
    console.log('  ✅ PASS: Retornou live=false com motivo claro:', res.reason);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  // Teste 2: Override de emergência
  console.log('\nTest 2: FIREFLY_SESSION_ACTIVE=1 serve apenas como override de emergência...');
  const prevEnv = process.env.FIREFLY_SESSION_ACTIVE;
  try {
    process.env.FIREFLY_SESSION_ACTIVE = '1';
    const res = await isFireflySessionLive();
    assert.equal(res.live, true);
    assert.equal(res.source, 'env');
    assert.ok(res.reason.includes('override'));
    console.log('  ✅ PASS: Override de emergência logou warning e retornou source=env');
  } finally {
    if (prevEnv !== undefined) {
      process.env.FIREFLY_SESSION_ACTIVE = prevEnv;
    } else {
      delete process.env.FIREFLY_SESSION_ACTIVE;
    }
  }

  // Teste 3: venv inexistente no initialize()
  console.log('\nTest 3: FireflyAdapter.initialize() lança FIREFLY_VENV_NOT_FOUND se venv inexistente...');
  const fakeRoot = path.join(process.cwd(), 'temp_fake_firefly_dir');
  fs.mkdirSync(fakeRoot, { recursive: true });
  try {
    const adapter = new FireflyAdapter(fakeRoot);
    let threw = false;
    try {
      await adapter.initialize();
    } catch (err: any) {
      threw = true;
      assert.ok(err.message.includes('FIREFLY_VENV_NOT_FOUND'), `Mensagem deveria conter prefixo, recebido: ${err.message}`);
    }
    assert.equal(threw, true, 'Deveria ter lançado FIREFLY_VENV_NOT_FOUND');
    console.log('  ✅ PASS: Lançou erro com prefixo FIREFLY_VENV_NOT_FOUND sem fallback silencioso');
  } finally {
    fs.rmSync(fakeRoot, { recursive: true, force: true });
  }

  // Teste 4: Sessão morta no feedGuideAndRunReal
  console.log('\nTest 4: FireflyAdapter.feedGuideAndRunReal lança FIREFLY_SESSION_DEAD sem gastar estado quando sessão morta...');
  const deadSessionRoot = path.join(process.cwd(), 'temp_dead_session_root');
  fs.mkdirSync(path.join(deadSessionRoot, 'data', 'chrome_profile', 'Default'), { recursive: true });

  const dummyGuide = path.join(process.cwd(), 'temp_dummy_guide.json');
  fs.writeFileSync(
    dummyGuide,
    JSON.stringify({
      schema: 'ool.firefly.production-guide.v1',
      items: [
        {
          name: 'GAS_TEST_001',
          takeType: 'CINEMATIC_TAKE',
          prompt: 'A test prompt'
        }
      ]
    }),
    'utf-8'
  );

  delete process.env.FIREFLY_SESSION_ACTIVE;
  try {
    const adapter = new FireflyAdapter(deadSessionRoot);
    let threw = false;
    try {
      await adapter.feedGuideAndRunReal('TEST_RUN_FAILFAST', dummyGuide);
    } catch (err: any) {
      threw = true;
      assert.ok(err.message.includes('FIREFLY_SESSION_DEAD'), `Mensagem deveria conter FIREFLY_SESSION_DEAD, recebido: ${err.message}`);
    }
    assert.equal(threw, true, 'Deveria ter lançado FIREFLY_SESSION_DEAD');
    console.log('  ✅ PASS: feedGuideAndRunReal bloqueou execução imediatamente com FIREFLY_SESSION_DEAD');
  } finally {
    if (fs.existsSync(dummyGuide)) fs.unlinkSync(dummyGuide);
    if (fs.existsSync(deadSessionRoot)) fs.rmSync(deadSessionRoot, { recursive: true, force: true });
    if (prevEnv !== undefined) process.env.FIREFLY_SESSION_ACTIVE = prevEnv;
  }

  // Teste 5: PipelineContractGate com cenas degradadas
  console.log('\nTest 5: PipelineContractGate reprova run quando existem cenas degradadas sem --allow-degraded...');
  const testRunId = 'TEMP-TEST-DEGRADED-RUN';
  const testRunDir = path.join(process.cwd(), 'runs', testRunId);
  const scenesDir = path.join(testRunDir, 'editorial', 'execution', 'scenes');
  fs.mkdirSync(scenesDir, { recursive: true });

  const editPackage = {
    scenes: [
      {
        sceneId: 'SC_001',
        isDegraded: true,
        degradedReason: 'FIREFLY_TIMEOUT'
      }
    ]
  };
  fs.writeFileSync(path.join(testRunDir, 'edit_package.json'), JSON.stringify(editPackage), 'utf-8');

  try {
    const reportRejected = PipelineContractGate.auditRun({
      runId: testRunId,
      allowDegraded: false
    });
    assert.equal(reportRejected.passed, false);
    assert.ok(
      reportRejected.failures.some(f => f.reason.includes('RUN_HAS_DEGRADED_SCENES')),
      'Deveria falhar por RUN_HAS_DEGRADED_SCENES'
    );
    console.log('  ✅ PASS: Reprovou run com cenas degradadas quando allowDegraded=false');

    const reportAllowed = PipelineContractGate.auditRun({
      runId: testRunId,
      allowDegraded: true
    });
    assert.ok(
      !reportAllowed.failures.some(f => f.reason.includes('RUN_HAS_DEGRADED_SCENES')),
      'Não deveria reprovar por RUN_HAS_DEGRADED_SCENES quando allowDegraded=true'
    );
    console.log('  ✅ PASS: Aprovou verificação de degradadas quando allowDegraded=true');
  } finally {
    fs.rmSync(testRunDir, { recursive: true, force: true });
  }

  console.log('\n🎉 TODOS OS 5 TESTES DE CONFIABILIDADE DO FIREFLY PASSARAM COM SUCESSO!\n');
}

run().catch((e) => {
  console.error('\n❌ TEST SUITE FAILED:', e);
  process.exit(1);
});
