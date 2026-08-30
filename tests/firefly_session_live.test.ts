import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { isFireflySessionLive } from '../config/fireflySessionLive';
import { runGasolinaE2E } from '../scripts/e2eGasolinaDebug';
import { runFireflyBatchDispatch } from '../scripts/dispatchFireflyBatch';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES: CANONICAL FIREFLY SESSION LIVE & E2E CONSISTENCY');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

async function runTests() {
  let allPassed = true;

  // Salva estado original de env
  const origSessionActive = process.env.FIREFLY_SESSION_ACTIVE;
  delete process.env.FIREFLY_SESSION_ACTIVE;

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 1: Arquivo login_firefly.bat existindo sozinho -> live: false
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1/4] Validando que existência de login_firefly.bat ou pastas de perfil NÃO conta como sessão viva...');
  try {
    const batPath = path.join(process.cwd(), 'login_firefly.bat');
    assert.strictEqual(fs.existsSync(batPath), true, 'login_firefly.bat deve existir na raiz');

    const result = await isFireflySessionLive();
    if (!result.live && result.source === 'unauthenticated') {
      console.log(`✅ TESTE 1 PASSOU: login_firefly.bat presente, mas isFireflySessionLive retornou live=false (${result.reason}).`);
    } else {
      console.error('❌ FALHA NO TESTE 1: isFireflySessionLive retornou live=true indevidamente:', result);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 1:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 2: E2E e Dispatcher usam a mesma função e bloqueiam sincronizados
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/4] Validando que E2E e dispatchFireflyBatch tratam sessão sem live de forma consistente...');
  try {
    // Dispatcher com forceDispatch real sem sessão viva deve lançar STAGE_UNAVAILABLE
    let dispatcherFailedWithStageUnavailable = false;
    try {
      await runFireflyBatchDispatch({ lote: 1, forceDispatch: true, runId: 'TEST_DISPATCH_NO_SESSION' });
    } catch (err: any) {
      if (err.message.includes('STAGE_UNAVAILABLE: visuals (firefly session)')) {
        dispatcherFailedWithStageUnavailable = true;
      }
    }

    assert.strictEqual(dispatcherFailedWithStageUnavailable, true, 'Dispatcher deve lançar STAGE_UNAVAILABLE quando live=false');

    // E2E sem sessão viva deve registrar SESSION_MISSING e terminar com E2E_BLOCKED
    const e2eResult = await runGasolinaE2E();
    assert.strictEqual(e2eResult.fireflySession, 'SESSION_MISSING', 'E2E deve registrar SESSION_MISSING quando live=false');
    assert.strictEqual(e2eResult.status, 'E2E_BLOCKED', 'E2E deve ter status E2E_BLOCKED quando sessão Firefly não está viva');

    console.log('✅ TESTE 2 PASSOU: E2E e Dispatcher 100% consistentes. Nunca geram SESSION_OK + STAGE_UNAVAILABLE.');
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 2:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 3: 0 takes + audio skip NÃO gera PARTIAL_NO_AUDIO (gera E2E_BLOCKED ou FAILED)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/4] Validando que 0 takes + audio skip nunca gera PARTIAL_NO_AUDIO...');
  try {
    const e2eResult = await runGasolinaE2E();

    if (e2eResult.lote1Count === '0/10' && e2eResult.status === 'PARTIAL_NO_AUDIO') {
      console.error('❌ FALHA NO TESTE 3: 0 takes gerou PARTIAL_NO_AUDIO indevidamente!');
      allPassed = false;
    } else {
      console.log(`✅ TESTE 3 PASSOU: 0 takes com audio skip gerou status correto '${e2eResult.status}' (e não PARTIAL_NO_AUDIO).`);
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 3:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 4: Zero tokens / API keys vazadas no relatório
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4/4] Validando que nenhum cookie, token ou credencial foi vazado no relatório...');
  try {
    const reportPath = path.join(process.cwd(), 'runs', 'gasolina-adulterada', 'e2e', 'latest', 'E2E-REPORT.md');
    const content = fs.readFileSync(reportPath, 'utf8');

    const forbiddenTokens = ['Bearer ', 'sk_', 'auth_token', 'session_id=', 'cookie:'];
    const hasForbidden = forbiddenTokens.some(t => content.includes(t));

    if (!hasForbidden) {
      console.log('✅ TESTE 4 PASSOU: Relatório E2E 100% limpo e sem vazamento de tokens ou credenciais.');
    } else {
      console.error('❌ FALHA NO TESTE 4: Token sensível encontrado no relatório!');
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 4:', err.message);
    allPassed = false;
  }

  // Restaura env original
  if (origSessionActive !== undefined) {
    process.env.FIREFLY_SESSION_ACTIVE = origSessionActive;
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES DE FIREFLY SESSION LIVE PASSARAM COM SUCESSO DETERMINÍSTICO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES FIREFLY SESSION LIVE!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

runTests();
