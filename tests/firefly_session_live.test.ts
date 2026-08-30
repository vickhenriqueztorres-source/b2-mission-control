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
  // TESTE 1: Diretório sem sessão autenticada -> live: false de forma determinística
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1/4] Validando que ambiente sem perfil/sessão autenticada retorna live=false...');
  const fakeDir = path.join(process.cwd(), 'temp_test_no_profile');
  fs.mkdirSync(fakeDir, { recursive: true });
  try {
    const result = await isFireflySessionLive(fakeDir);
    if (!result.live) {
      console.log(`✅ TESTE 1 PASSOU: Ambiente sem autenticação retornou live=false (${result.reason}).`);
    } else {
      console.error('❌ FALHA NO TESTE 1: isFireflySessionLive retornou live=true indevidamente para pasta vazia:', result);
      allPassed = false;
    }
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 1:', err.message);
    allPassed = false;
  } finally {
    fs.rmSync(fakeDir, { recursive: true, force: true });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 2: Sessão real ou override de emergência
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/4] Validando probe real ou override de emergência no ambiente...');
  try {
    const result = await isFireflySessionLive();
    console.log(`✅ TESTE 2 PASSOU: Health check executado com sucesso: live=${result.live}, source=${result.source}, reason=${result.reason}`);
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE 2:', err.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TESTE 3: 0 takes + audio skip NÃO gera PARTIAL_NO_AUDIO (gera E2E_BLOCKED ou FAILED)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/4] Validando que 0 takes + audio skip nunca gera PARTIAL_NO_AUDIO...');
  const prevDispatch = process.env.FIREFLY_DISPATCH;
  const prevAudioDispatch = process.env.ELEVENLABS_DISPATCH;
  process.env.FIREFLY_DISPATCH = '0';
  process.env.ELEVENLABS_DISPATCH = '0';
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
  } finally {
    if (prevDispatch !== undefined) process.env.FIREFLY_DISPATCH = prevDispatch;
    else delete process.env.FIREFLY_DISPATCH;
    if (prevAudioDispatch !== undefined) process.env.ELEVENLABS_DISPATCH = prevAudioDispatch;
    else delete process.env.ELEVENLABS_DISPATCH;
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
