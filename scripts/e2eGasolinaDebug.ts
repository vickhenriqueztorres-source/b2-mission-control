import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { parseEpisodeContract } from '../contracts/episodeContract';
import { buildSceneContracts, RawSceneInput } from '../contracts/buildSceneContracts';
import { runFireflyBatchDispatch, validateVisualBatch, BATCH_1_SCENE_IDS, BATCH_2_SCENE_IDS } from './dispatchFireflyBatch';
import { runNarrationDispatch, validateNarrationBatch } from './dispatchNarrationBatch';
import { runAudioBedDispatch, validateAudioBed } from './dispatchAudioBed';
import { runGasolinaRender, validateRenderPreconditions } from './renderGasolinaMaster';

import { isFireflySessionLive, FireflySessionLiveResult } from '../config/fireflySessionLive';

export async function checkFireflySessionHealth(): Promise<'SESSION_OK' | 'SESSION_MISSING'> {
  const res = await isFireflySessionLive();
  return res.live ? 'SESSION_OK' : 'SESSION_MISSING';
}

export interface E2EResult {
  timestamp: string;
  runId: string;
  status: 'E2E_BLOCKED' | 'LOTE1_RUNNING_OR_DONE' | 'PARTIAL_NO_AUDIO' | 'SUCCESS' | 'FAILED';
  passed: boolean;
  audioStatus: string;
  fireflySession: 'SESSION_OK' | 'SESSION_MISSING';
  fireflyReason?: string;
  chatgptSession: 'SESSION_OK' | 'SESSION_MISSING';
  lote1Count: string;
  lote2Count: string;
  narrationCount: string;
  sfxCount: string;
  previewStatus: string;
  masterStatus: string;
  nextHuman: string;
  failures: string[];
}

/**
 * Checa a saúde do ChatGPT Image Bot
 */
export function checkChatGptSessionHealth(): 'SESSION_OK' | 'SESSION_MISSING' {
  const mainPy = path.join(process.cwd(), 'chatgpt-image-bot', 'src', 'main.py');
  return fs.existsSync(mainPy) ? 'SESSION_OK' : 'SESSION_MISSING';
}

/**
 * Checa de forma segura a conectividade e créditos da ElevenLabs
 */
export async function checkElevenLabsHealth(): Promise<{ ok: boolean; reason: string }> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key || key.trim().length === 0 || !key.startsWith('sk_')) {
    return { ok: false, reason: 'Chave ELEVENLABS_API_KEY não configurada ou formato inválido.' };
  }

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: '/v1/user',
      method: 'GET',
      headers: {
        'xi-api-key': key
      },
      timeout: 8000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ ok: true, reason: 'ElevenLabs autenticado com 200 OK.' });
        } else if (res.statusCode === 401) {
          resolve({ ok: false, reason: 'ElevenLabs retornou 401 Unauthorized (chave inválida).' });
        } else if (res.statusCode === 429) {
          resolve({ ok: false, reason: 'ElevenLabs retornou 429 Too Many Requests / Quota Exceeded.' });
        } else {
          resolve({ ok: false, reason: `ElevenLabs retornou status ${res.statusCode}.` });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ ok: false, reason: `Erro de rede ElevenLabs: ${err.message}` });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, reason: 'Timeout de conexão com ElevenLabs.' });
    });

    req.end();
  });
}

export async function runGasolinaE2E(): Promise<E2EResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runId = `RUN_E2E_${timestamp}`;
  const failures: string[] = [];

  console.log(`\n══════════════════════════════════════════════════════════════════════════════════════`);
  console.log(`🚀 INICIANDO E2E DEBUG PIPELINE // GASOLINA ADULTERADA`);
  console.log(`══════════════════════════════════════════════════════════════════════════════════════`);
  console.log(`- RunId: ${runId}`);
  console.log(`- Timestamp: ${new Date().toISOString()}`);

  // 1. Validação de Contratos
  const contractPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.episode.json');
  const scenesPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.scenes.json');

  const episodeContract = parseEpisodeContract(contractPath);
  const rawScenes: RawSceneInput[] = JSON.parse(fs.readFileSync(scenesPath, 'utf8'));
  const sceneContracts = buildSceneContracts(episodeContract, rawScenes);

  console.log(`- Contrato validado: 30 cenas canônicas (Duração: ${episodeContract.targetDurationSeconds}s)`);

  // 2. Health Checks de Sessão Canônico e Unificado (Firefly & ChatGPT)
  let fireflySessionLive = await isFireflySessionLive();
  const chatgptSession = checkChatGptSessionHealth();

  // Se live=false e perfil salvo existir, loga tentativa/necessidade de ativação
  if (!fireflySessionLive.live && fireflySessionLive.userProfilePath && fs.existsSync(fireflySessionLive.userProfilePath)) {
    console.log(`- Perfil Firefly salvo encontrado em: ${fireflySessionLive.userProfilePath}`);
    console.log(`- Status: Sessão viva ausente (${fireflySessionLive.reason})`);
  }

  const fireflySessionStatus: 'SESSION_OK' | 'SESSION_MISSING' = fireflySessionLive.live ? 'SESSION_OK' : 'SESSION_MISSING';

  console.log(`- Firefly Session: ${fireflySessionStatus} (${fireflySessionLive.reason})`);
  console.log(`- ChatGPT Session: ${chatgptSession}`);

  if (!fireflySessionLive.live) {
    failures.push(`E2E_BLOCKED: firefly session missing (${fireflySessionLive.reason})`);
  }

  // 3. Geração Visual: Lote 1 (10 cenas)
  let lote1VisualCount = '0/10';
  let lote2VisualCount = '0/11';
  let lote1Val = validateVisualBatch(runId, BATCH_1_SCENE_IDS);

  if (fireflySessionLive.live) {
    console.log(`\n[STEP 1/6] Disparando Firefly Lote 1 (10 Cenas)...`);
    const allowLiveDispatch = process.env.FIREFLY_DISPATCH === '1';
    try {
      await runFireflyBatchDispatch({ lote: 1, runId, forceDispatch: allowLiveDispatch });
    } catch (err: any) {
      console.warn(`⚠️ Aviso Lote 1: ${err.message}`);
      failures.push(`LOTE1_DISPATCH_NOTICE: ${err.message}`);
    }

    lote1Val = validateVisualBatch(runId, BATCH_1_SCENE_IDS);
    lote1VisualCount = `${lote1Val.successCount}/10`;
    console.log(`- Lote 1 Takes no Disco: ${lote1VisualCount}`);

    // 4. Geração Visual: Lote 2 (11 cenas)
    if (lote1Val.passed) {
      console.log(`\n[STEP 2/6] Disparando Firefly Lote 2 (11 Cenas)...`);
      try {
        await runFireflyBatchDispatch({ lote: 2, runId, forceDispatch: allowLiveDispatch });
      } catch (err: any) {
        console.warn(`⚠️ Aviso Lote 2: ${err.message}`);
        failures.push(`LOTE2_DISPATCH_NOTICE: ${err.message}`);
      }

      const lote2Val = validateVisualBatch(runId, BATCH_2_SCENE_IDS);
      lote2VisualCount = `${lote2Val.successCount}/11`;
      console.log(`- Lote 2 Takes no Disco: ${lote2VisualCount}`);
    } else {
      console.log(`- Lote 2 bloqueado (Lote 1 incompleto: ${lote1VisualCount})`);
    }
  } else {
    console.log(`- Geração visual Firefly não disparada devido à ausência de sessão autenticada ativa.`);
  }

  // 5. Narração & Áudio
  console.log(`\n[STEP 3/6] Verificando ElevenLabs e Áudio...`);
  const elevenHealth = await checkElevenLabsHealth();
  let audioStatus = '';
  let narrationCount = '0/30';
  let sfxCount = '0/30';
  let allowPartialAudio = false;

  if (!elevenHealth.ok) {
    audioStatus = 'AUDIO: SKIPPED (sem chave/crédito ElevenLabs). Vídeo sem locução/SFX/mix.';
    console.log(`⚠️ ${audioStatus}`);
    console.log(`- Motivo: ${elevenHealth.reason}`);
    allowPartialAudio = true;
  } else {
    console.log(`✅ ElevenLabs Online. Disparando síntese das 30 locuções...`);
    const allowVoDispatch = process.env.ELEVENLABS_DISPATCH === '1';
    try {
      await runNarrationDispatch({ runId, forceDispatch: allowVoDispatch });
      const voVal = validateNarrationBatch(runId);
      narrationCount = `${voVal.existingCount}/30`;
    } catch (err: any) {
      console.warn(`⚠️ Erro na síntese VO: ${err.message}`);
      allowPartialAudio = true;
      audioStatus = 'AUDIO: SKIPPED (falha na síntese ElevenLabs).';
    }

    // Tenta SFX
    try {
      await runAudioBedDispatch({ runId, forceDispatch: process.env.AUDIO_DISPATCH === '1' });
      const audioVal = validateAudioBed(runId);
      sfxCount = `${audioVal.sfxStemsPresent}/30`;
    } catch (err: any) {
      console.log(`- SFX/Music pack não disponível (${err.message}). Trilha segue sem stems.`);
    }
  }

  // 6. Preview Render
  console.log(`\n[STEP 4/6] Verificando Preview do Lote 1...`);
  let previewStatus = 'BLOCKED';
  const previewCheck = validateRenderPreconditions({ runId, preview: true, allowPartialAudio });
  if (previewCheck.passed) {
    try {
      console.log(`🎬 Renderizando preview_lote1.mp4...`);
      await runGasolinaRender({ runId, preview: true, allowPartialAudio });
      previewStatus = 'GENERATED';
    } catch (err: any) {
      previewStatus = `FAILED: ${err.message}`;
    }
  } else {
    previewStatus = `BLOCKED: ${previewCheck.reason}`;
    console.log(`- Preview bloqueado: ${previewCheck.reason}`);
  }

  // 7. Master Render
  console.log(`\n[STEP 5/6] Verificando Master Render...`);
  let masterStatus = 'BLOCKED';
  const masterCheck = validateRenderPreconditions({ runId, preview: false, allowPartialAudio });
  if (masterCheck.passed) {
    try {
      console.log(`🎬 Renderizando final_master.mp4 (Modo Partial Audio: ${allowPartialAudio})...`);
      await runGasolinaRender({ runId, preview: false, allowPartialAudio });
      masterStatus = allowPartialAudio ? 'RENDERED_PARTIAL_NO_AUDIO' : 'RENDERED_FULL';
    } catch (err: any) {
      masterStatus = `FAILED: ${err.message}`;
    }
  } else {
    masterStatus = `BLOCKED: ${masterCheck.reason}`;
    console.log(`- Master bloqueado: ${masterCheck.reason}`);
  }

  // 8. Determinação Estrita do Status Global
  let overallStatus: E2EResult['status'] = 'FAILED';
  if (!fireflySessionLive.live) {
    overallStatus = 'E2E_BLOCKED';
  } else if (masterStatus === 'RENDERED_FULL') {
    overallStatus = 'SUCCESS';
  } else if (lote1Val.passed && allowPartialAudio) {
    overallStatus = 'PARTIAL_NO_AUDIO';
  } else if (lote1Val.successCount > 0) {
    overallStatus = 'LOTE1_RUNNING_OR_DONE';
  } else {
    overallStatus = 'FAILED';
  }

  const passed = overallStatus === 'SUCCESS'; // Proibido true se faltar áudio ou visuals

  let nextHuman = '';
  if (!fireflySessionLive.live) {
    nextHuman = '1. Execute "login_firefly.bat" para autenticar o perfil Chrome do Adobe Firefly.\n2. Reexecute "npm run e2e:gasolina".';
  } else if (allowPartialAudio && !passed) {
    nextHuman = '1. Configure uma chave ELEVENLABS_API_KEY válida com créditos no arquivo .env.\n2. Reexecute "ELEVENLABS_DISPATCH=1 npm run narration:gasolina".';
  } else if (!passed) {
    nextHuman = 'Verifique o status dos takes no disco e execute os lotes pendentes.';
  } else {
    nextHuman = 'Produção finalizada com sucesso! Master 360s pronto em final_master.mp4.';
  }

  const e2eResult: E2EResult = {
    timestamp: new Date().toISOString(),
    runId,
    status: overallStatus,
    passed,
    audioStatus: audioStatus || 'AUDIO_OK',
    fireflySession: fireflySessionStatus,
    fireflyReason: fireflySessionLive.reason,
    chatgptSession,
    lote1Count: lote1VisualCount,
    lote2Count: lote2VisualCount,
    narrationCount,
    sfxCount,
    previewStatus,
    masterStatus,
    nextHuman,
    failures
  };

  // 9. Gravação do Relatório E2E
  const e2eDir = path.join(process.cwd(), 'runs', 'gasolina-adulterada', 'e2e', timestamp);
  const latestE2eDir = path.join(process.cwd(), 'runs', 'gasolina-adulterada', 'e2e', 'latest');
  fs.mkdirSync(e2eDir, { recursive: true });
  fs.mkdirSync(latestE2eDir, { recursive: true });

  const mdReport = [
    `# 📋 RELATÓRIO E2E DE PRODUÇÃO // GASOLINA ADULTERADA`,
    '',
    `> **Timestamp:** \`${e2eResult.timestamp}\` | **RunId:** \`${e2eResult.runId}\`  `,
    `> **Status Global:** \`${e2eResult.status}\` | **Passed:** \`${e2eResult.passed}\``,
    '',
    `## 1. Ground Truth do Áudio`,
    `${audioStatus ? `> ⚠️ **${audioStatus}**` : '✅ Áudio completo com locução e SFX.'}`,
    '',
    `## 2. Inventário de Execução`,
    `| Componente | Estado / Métrica | Observação Técnica |`,
    `|---|---|---|`,
    `| **Sessão Adobe Firefly** | \`${e2eResult.fireflySession}\` | Perfil Chrome / IndexedDB |`,
    `| **Sessão ChatGPT Bot** | \`${e2eResult.chatgptSession}\` | Script main.py |`,
    `| **Takes Lote 1 (Firefly)** | \`${e2eResult.lote1Count}\` | Cenas GAS_001..014 |`,
    `| **Takes Lote 2 (Firefly)** | \`${e2eResult.lote2Count}\` | Cenas GAS_017..030 |`,
    `| **Locução Narração** | \`${e2eResult.narrationCount}\` | ElevenLabs Chris |`,
    `| **SFX & Música** | \`${e2eResult.sfxCount}\` | Stems industriais |`,
    `| **Render Preview** | \`${e2eResult.previewStatus}\` | preview_lote1.mp4 |`,
    `| **Render Master** | \`${e2eResult.masterStatus}\` | final_master.mp4 |`,
    '',
    `## 3. Próxima Ação Humana Recomendada`,
    `${e2eResult.nextHuman}`,
    '',
    `---`,
    `Relatório gerado automaticamente pelo pipeline determinístico.`
  ].join('\n');

  fs.writeFileSync(path.join(e2eDir, 'E2E-REPORT.md'), mdReport, 'utf8');
  fs.writeFileSync(path.join(e2eDir, 'E2E-REPORT.json'), JSON.stringify(e2eResult, null, 2), 'utf8');
  fs.writeFileSync(path.join(latestE2eDir, 'E2E-REPORT.md'), mdReport, 'utf8');
  fs.writeFileSync(path.join(latestE2eDir, 'E2E-REPORT.json'), JSON.stringify(e2eResult, null, 2), 'utf8');

  console.log(`\n══════════════════════════════════════════════════════════════════════════════════════`);
  console.log(`📋 RELATÓRIO E2E CONCLUÍDO!`);
  console.log(`══════════════════════════════════════════════════════════════════════════════════════`);
  console.log(`- Status: ${e2eResult.status}`);
  console.log(`- Passed: ${e2eResult.passed}`);
  console.log(`- Relatório salvo em: runs/gasolina-adulterada/e2e/latest/E2E-REPORT.md`);
  console.log(`══════════════════════════════════════════════════════════════════════════════════════\n`);

  return e2eResult;
}

if (require.main === module) {
  runGasolinaE2E().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('\n❌ ERRO CRÍTICO NO E2E PIPELINE:', err.message);
    process.exit(1);
  });
}
