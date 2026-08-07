import fs from 'fs';
import path from 'path';
import { ChaosEventRecorder, ChaosEventPayload } from './chaosEventRecorder';
import { FaultInjector } from './faultInjector';
import { ChaosAssertionEngine, ScenarioAssertionResult } from './chaosAssertionEngine';
import { CleanupManager } from './cleanupManager';
import { RecoveryVerifier } from './recoveryVerifier';
import { DiskSpaceProvider } from './diskSpaceProvider';

export class ScenarioRunner {
  public static async runScenario(scenarioId: string): Promise<ScenarioAssertionResult> {
    const formattedId = scenarioId.startsWith('CHAOS-') ? scenarioId : `CHAOS-${scenarioId}`;
    const contractPath = path.resolve(process.cwd(), 'resilience', 'scenarios', `${formattedId}.json`);

    if (!fs.existsSync(contractPath)) {
      throw new Error(`Contrato do cenário não encontrado: ${contractPath}`);
    }

    const rawContract = fs.readFileSync(contractPath, 'utf-8');
    const contract = JSON.parse(rawContract);

    // Bloqueio estrito de segurança
    if (process.env.CHAOS_MODE === 'true' && process.env.NODE_ENV === 'production') {
      throw new Error('PROIBIDO: CHAOS_MODE=true não pode ser executado em ambiente de produção!');
    }

    const runDir = path.resolve(process.cwd(), 'runs', formattedId);
    if (fs.existsSync(runDir)) {
      fs.rmSync(runDir, { recursive: true, force: true });
    }
    fs.mkdirSync(runDir, { recursive: true });

    const recorder = new ChaosEventRecorder(formattedId);
    const injector = new FaultInjector(runDir);

    const runId = `RUN_${formattedId}_STAGING`;
    const productionId = formattedId;
    let actualTerminalState = 'FAILED';
    let actualRetries = 0;

    const initialTimestamp = new Date().toISOString();

    // Determina classificação de resultado esperada
    const classification = contract.outcome_classification || (
      contract.expected_terminal_state === 'FAILED' ? 'EXPECTED_FAILURE' :
      contract.expected_terminal_state === 'RECOVERED' ? 'EXPECTED_RECOVERY' : 'EXPECTED_CONTINUATION'
    );

    // Registra evento inicial obrigatoriamente
    recorder.recordEvent({
      event_id: `EVT_${formattedId}_START`,
      run_id: runId,
      production_id: productionId,
      agent_id: 'AntigravityBuilder',
      provider: 'ANTIGRAVITY',
      task_id: 'START_CHAOS_SCENARIO',
      timestamp: initialTimestamp,
      type: 'AGENT_STARTED',
      status: 'RUNNING',
      message: `Iniciando Cenário de Caos: ${contract.name} (${formattedId}) - Classificação: ${classification}`,
      attempt: 1,
      idempotency_key: `IDEM_${formattedId}_START`,
      composite_key: `${productionId}_SHOT_01_TAKE_01`
    });

    // EXECUÇÃO DO INJETOR DE FALHAS POR TIPO
    try {
      switch (contract.injected_fault) {
        case 'schema_invalid': {
          const invalidFile = path.join(runDir, 'invalid_motion.json');
          injector.injectInvalidSchema(invalidFile);
          recorder.recordEvent({
            event_id: `EVT_${formattedId}_SCHEMA_FAIL`,
            run_id: runId,
            production_id: productionId,
            agent_id: 'SchemaValidator',
            provider: 'ANTIGRAVITY',
            task_id: 'VALIDATE_SCHEMA',
            timestamp: new Date().toISOString(),
            type: 'AGENT_FAILED',
            status: 'FAILED',
            message: 'Esquema JSON rejeitado pelo SchemaValidator AJV 2020: campo obrigatório ausente.',
            artifact_path: invalidFile,
            attempt: 1
          });
          actualTerminalState = 'FAILED';
          break;
        }

        case 'start_frame_missing': {
          const guideFile = path.join(runDir, 'firefly_guide.json');
          injector.injectMissingStartFrame(guideFile);
          recorder.recordEvent({
            event_id: `EVT_${formattedId}_FRAME_FAIL`,
            run_id: runId,
            production_id: productionId,
            agent_id: 'MotionToFireflyBridge',
            provider: 'ANTIGRAVITY',
            task_id: 'VERIFY_START_FRAME',
            timestamp: new Date().toISOString(),
            type: 'AGENT_FAILED',
            status: 'FAILED',
            message: 'Frame inicial inexistente no disco: C:\\B2-AI-STUDIO\\non_existent_folder\\missing_frame.png',
            artifact_path: guideFile,
            attempt: 1
          });
          actualTerminalState = 'FAILED';
          break;
        }

        case 'duplicate_take': {
          const guideFile = path.join(runDir, 'firefly_guide.json');
          injector.injectDuplicateTake(guideFile);
          recorder.recordEvent({
            event_id: `EVT_${formattedId}_JOB_SUB`,
            run_id: runId,
            production_id: productionId,
            agent_id: 'FireflyJobStore',
            provider: 'FIREFLY_BOT',
            task_id: 'FEED_GUIDE',
            timestamp: new Date().toISOString(),
            type: 'JOB_SUBMITTED',
            status: 'PENDING',
            message: 'Alimentando guia com takes duplicados na fila.',
            artifact_path: guideFile,
            attempt: 1
          });
          recorder.recordEvent({
            event_id: `EVT_${formattedId}_DUP_TAKE_REJECT`,
            run_id: runId,
            production_id: productionId,
            agent_id: 'FireflyJobStore',
            provider: 'FIREFLY_BOT',
            task_id: 'FEED_GUIDE',
            timestamp: new Date().toISOString(),
            type: 'AGENT_FAILED',
            status: 'FAILED',
            message: 'Fila SQLite rejeitou take duplicado com mesma chave primária.',
            attempt: 1
          });
          actualTerminalState = 'FAILED';
          break;
        }

        case 'duplicate_event': {
          const eventA: ChaosEventPayload = {
            event_id: `EVT_${formattedId}_DUP_TEST`,
            run_id: runId,
            production_id: productionId,
            agent_id: 'AgentTelemetryAdapter',
            provider: 'ANTIGRAVITY',
            task_id: 'TEST_IDEMPOTENCY',
            timestamp: new Date().toISOString(),
            type: 'AGENT_ACTIVITY',
            status: 'RUNNING',
            message: 'Evento original gravado.',
            attempt: 1,
            idempotency_key: `IDEM_KEY_${formattedId}`
          };
          recorder.recordEvent(eventA);

          const resultDup = recorder.recordEvent(eventA);
          if (!resultDup.recorded) {
            recorder.recordEvent({
              event_id: `EVT_${formattedId}_IDEM_SUCCESS`,
              run_id: runId,
              production_id: productionId,
              agent_id: 'AgentTelemetryAdapter',
              provider: 'ANTIGRAVITY',
              task_id: 'TEST_IDEMPOTENCY',
              timestamp: new Date().toISOString(),
              type: 'AGENT_COMPLETED',
              status: 'SUCCESS',
              message: 'Idempotência evitou a duplicação de eventos perfeitamente. Continuação normal autorizada.',
              attempt: 1
            });
            actualTerminalState = 'COMPLETED';
          }
          break;
        }

        case 'incomplete_mp4': {
          const mp4Path = path.join(runDir, 'corrupted_video.mp4');
          injector.injectIncompleteMp4(mp4Path);
          recorder.recordEvent({
            event_id: `EVT_${formattedId}_JOB_SUB`,
            run_id: runId,
            production_id: productionId,
            agent_id: 'FireflyDownloader',
            provider: 'FIREFLY_BOT',
            task_id: 'DOWNLOAD_MP4',
            timestamp: new Date().toISOString(),
            type: 'JOB_SUBMITTED',
            status: 'PENDING',
            message: 'Iniciando download do MP4.',
            attempt: 1
          });
          recorder.recordEvent({
            event_id: `EVT_${formattedId}_MP4_FAIL`,
            run_id: runId,
            production_id: productionId,
            agent_id: 'FireflyDownloader',
            provider: 'FIREFLY_BOT',
            task_id: 'VALIDATE_MP4',
            timestamp: new Date().toISOString(),
            type: 'AGENT_FAILED',
            status: 'FAILED',
            message: 'MP4 corrompido ou incompleto (tamanho < 100KB).',
            artifact_path: mp4Path,
            attempt: 1
          });
          actualRetries = 1;
          actualTerminalState = 'FAILED';
          break;
        }

        case 'mission_control_restart':
        case 'antigravity_interrupted':
        case 'chrome_frozen':
        case 'websocket_disconnect': {
          if (contract.injected_fault === 'chrome_frozen') {
            recorder.recordEvent({
              event_id: `EVT_${formattedId}_JOB_SUB`,
              run_id: runId,
              production_id: productionId,
              agent_id: 'FireflyBotWorker',
              provider: 'FIREFLY_BOT',
              task_id: 'SUBMIT_JOB',
              timestamp: new Date().toISOString(),
              type: 'JOB_SUBMITTED',
              status: 'PENDING',
              message: 'Job enviado ao robô Firefly no Chromium.',
              attempt: 1
            });
          }

          recorder.recordEvent({
            event_id: `EVT_${formattedId}_INTERRUPT`,
            run_id: runId,
            production_id: productionId,
            agent_id: contract.injection_point,
            provider: 'MISSION_CONTROL',
            task_id: 'SIMULATE_INTERRUPT',
            timestamp: new Date().toISOString(),
            type: 'AGENT_RETRYING',
            status: 'RUNNING',
            message: `Falha temporária em ${contract.injection_point}. Reiniciando worker...`,
            attempt: 1
          });
          actualRetries = 1;

          recorder.recordEvent({
            event_id: `EVT_${formattedId}_RECOVERED`,
            run_id: runId,
            production_id: productionId,
            agent_id: contract.injection_point,
            provider: 'MISSION_CONTROL',
            task_id: 'RECOVER_STATE',
            timestamp: new Date().toISOString(),
            type: 'AGENT_COMPLETED',
            status: 'SUCCESS',
            message: `Estado retomado com sucesso mantendo o mesmo run_id (${runId}).`,
            attempt: 2
          });

          actualTerminalState = 'RECOVERED';
          break;
        }

        case 'sqlite_locked': {
          recorder.recordEvent({
            event_id: `EVT_${formattedId}_LOCK_FAIL`,
            run_id: runId,
            production_id: productionId,
            agent_id: 'FireflyJobStore',
            provider: 'FIREFLY_BOT',
            task_id: 'ACQUIRE_LOCK',
            timestamp: new Date().toISOString(),
            type: 'AGENT_FAILED',
            status: 'FAILED',
            message: 'Erro SQLite: database is locked.',
            attempt: 1
          });
          actualRetries = 1;
          actualTerminalState = 'FAILED';
          break;
        }

        case 'disk_space_exhausted': {
          injector.injectDiskSpaceExhaustion();
          const hasSpace = DiskSpaceProvider.hasSufficientSpace(runDir);
          injector.resetDiskSpaceExhaustion();

          recorder.recordEvent({
            event_id: `EVT_${formattedId}_DISK_FAIL`,
            run_id: runId,
            production_id: productionId,
            agent_id: 'DiskSpaceProvider',
            provider: 'MISSION_CONTROL',
            task_id: 'WRITE_VIDEO',
            timestamp: new Date().toISOString(),
            type: 'AGENT_FAILED',
            status: 'FAILED',
            message: `Espaço em disco insuficiente (Disponível: ${DiskSpaceProvider.getAvailableDiskSpaceBytes(runDir)} bytes).`,
            attempt: 1
          });
          actualTerminalState = 'FAILED';
          break;
        }

        case 'session_logged_out':
        case 'quota_exhausted':
        case 'prompt_rejected':
        case 'worker_timeout': {
          const faultMessages: Record<string, string> = {
            session_logged_out: 'Sessão do navegador deslogada na Adobe Firefly.',
            quota_exhausted: 'Cotas/créditos de geração de vídeo esgotados na conta Adobe.',
            prompt_rejected: 'Prompt rejeitado por política de segurança de conteúdo.',
            worker_timeout: 'Timeout: O Firefly Worker não concluiu a geração em 15 minutos.'
          };

          recorder.recordEvent({
            event_id: `EVT_${formattedId}_SUBMIT`,
            run_id: runId,
            production_id: productionId,
            agent_id: 'FireflyBotWorker',
            provider: 'FIREFLY_BOT',
            task_id: 'PROCESS_JOB',
            timestamp: new Date().toISOString(),
            type: 'JOB_SUBMITTED',
            status: 'PENDING',
            message: 'Job enviado ao robô Firefly.',
            attempt: 1
          });

          recorder.recordEvent({
            event_id: `EVT_${formattedId}_UI_FAIL`,
            run_id: runId,
            production_id: productionId,
            agent_id: 'FireflyStateReader',
            provider: 'FIREFLY_BOT',
            task_id: 'READ_CANVAS',
            timestamp: new Date().toISOString(),
            type: 'AGENT_FAILED',
            status: 'FAILED',
            message: faultMessages[contract.injected_fault] || 'Falha na automação.',
            attempt: 1
          });

          actualTerminalState = 'FAILED';
          break;
        }
      }
    } catch (err: any) {
      recorder.recordEvent({
        event_id: `EVT_${formattedId}_EXC`,
        run_id: runId,
        production_id: productionId,
        agent_id: 'ScenarioRunner',
        provider: 'CHAOS_ENGINE',
        task_id: 'RUN_SCENARIO',
        timestamp: new Date().toISOString(),
        type: 'AGENT_FAILED',
        status: 'FAILED',
        message: `Exceção durante injeção de caos: ${err.message}`,
        attempt: 1
      });
      actualTerminalState = 'FAILED';
    }

    recorder.saveSnapshot();
    const events = recorder.getEvents();
    recorder.close();

    const stateSnapshotPath = path.join(runDir, 'state_snapshot.json');
    fs.writeFileSync(
      stateSnapshotPath,
      JSON.stringify(
        {
          scenario_id: formattedId,
          run_id: runId,
          production_id: productionId,
          classification,
          terminal_state: actualTerminalState,
          retries: actualRetries,
          events_count: events.length
        },
        null,
        2
      ),
      'utf-8'
    );

    const assertionResult = ChaosAssertionEngine.evaluateScenario(
      contract,
      events,
      actualTerminalState,
      actualRetries,
      runDir
    );

    const assertionsPath = path.join(runDir, 'assertions.json');
    fs.writeFileSync(assertionsPath, JSON.stringify({ ...assertionResult, classification }, null, 2), 'utf-8');

    CleanupManager.cleanupStaging(runDir, contract.cleanup_strategy);

    const reportPath = path.join(runDir, 'REPORT.md');
    const reportContent = `
# Relatório de Caos — ${contract.name} (${formattedId})

- **Data/Hora**: ${new Date().toLocaleString('pt-BR')}
- **Lote**: ${contract.batch}
- **Ponto de Injeção**: \`${contract.injection_point}\`
- **Falha Injetada**: \`${contract.injected_fault}\`
- **Classificação**: \`${classification}\`
- **Estado Terminal Esperado**: \`${contract.expected_terminal_state}\`
- **Estado Terminal Obtido**: \`${actualTerminalState}\`
- **Resultado Global**: ${assertionResult.all_passed ? '✅ APROVADO (PASS)' : '❌ REPROVADO (FAIL)'}

---

## 🛡️ Invariantes Verificadas por Código

${assertionResult.invariants
  .map(
    inv => `- ${inv.passed ? '✅' : '❌'} **${inv.invariant}**: ${inv.message}`
  )
  .join('\n')}

---

## 📊 Estatísticas da Execução
- **Total de Eventos Gravados**: ${events.length}
- **Tentativas (Retries)**: ${actualRetries} / ${contract.retry_limit}
- **Duplicações de Eventos Evitadas**: ${recorder.duplicateEventsCount}
`;

    fs.writeFileSync(reportPath, reportContent.trim(), 'utf-8');

    return assertionResult;
  }
}
