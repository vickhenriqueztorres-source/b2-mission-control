import fs from 'fs';
import path from 'path';
import { ChaosEventPayload } from './chaosEventRecorder';

export interface InvariantResult {
  invariant: string;
  passed: boolean;
  message: string;
  details?: any;
}

export interface ScenarioAssertionResult {
  scenario_id: string;
  all_passed: boolean;
  terminal_state_matches: boolean;
  invariants: InvariantResult[];
}

export class ChaosAssertionEngine {
  public static evaluateScenario(
    scenarioContract: any,
    events: ChaosEventPayload[],
    actualTerminalState: string,
    actualRetries: number,
    runDir: string
  ): ScenarioAssertionResult {
    const invariants: InvariantResult[] = [];

    // 1. Invariante: Erro Real Exibido
    const hasErrorEvent = events.some(
      e => e.status === 'FAILED' || e.type === 'AGENT_FAILED' || e.type === 'JOB_SUBMITTED' && e.message.includes('failed')
    );
    const expectedFailure = scenarioContract.expected_terminal_state === 'FAILED';
    invariants.push({
      invariant: 'real_error_displayed',
      passed: expectedFailure ? hasErrorEvent : true,
      message: expectedFailure
        ? (hasErrorEvent ? 'Erro real registrado corretamente nos eventos.' : 'FALHA: Erro esperado mas nenhum evento de falha foi emitido.')
        : 'Cenário não esperava falha terminal.'
    });

    // 2. Invariante: Sucesso Não Marcado em Falha
    const hasCompletedEvent = events.some(e => e.type === 'AGENT_COMPLETED' && e.status === 'SUCCESS' && e.agent_id === 'AntigravityBuilder');
    invariants.push({
      invariant: 'success_not_marked',
      passed: expectedFailure ? !hasCompletedEvent : true,
      message: expectedFailure
        ? (!hasCompletedEvent ? 'Sucesso FALSO evitado 100%.' : 'FALHA: Evento AGENT_COMPLETED foi emitido em cenário de falha!')
        : 'Cenário concluído com sucesso esperado.'
    });

    // 3. Invariante: Estado Persistido
    const eventsFileExists = fs.existsSync(path.join(runDir, 'events.jsonl'));
    const dbFileExists = fs.existsSync(path.join(runDir, 'chaos_events.db'));
    invariants.push({
      invariant: 'state_persisted',
      passed: eventsFileExists && dbFileExists && events.length > 0,
      message: eventsFileExists && dbFileExists
        ? `Estado persistido com sucesso (${events.length} eventos registrados em SQLite e JSONL).`
        : 'FALHA: Arquivos de estado ou banco SQLite de caos não foram salvos no disco.'
    });

    // 4. Invariante: Nenhum Artefato Duplicado
    const artifactEvents = events.filter(e => e.artifact_path);
    const artifactPaths = artifactEvents.map(e => e.artifact_path as string);
    const uniqueArtifacts = new Set(artifactPaths);
    const hasDuplicateArtifacts = artifactPaths.length !== uniqueArtifacts.size;
    invariants.push({
      invariant: 'no_duplicate_artifacts',
      passed: !hasDuplicateArtifacts,
      message: !hasDuplicateArtifacts
        ? 'Nenhum artefato duplicado detectado.'
        : `FALHA: Artefatos duplicados encontrados em disco: ${artifactPaths.filter((item, index) => artifactPaths.indexOf(item) !== index).join(', ')}`
    });

    // 5. Invariante: Nenhum Evento Perdido (Eventos Obrigatórios Presentes & Proibidos Ausentes)
    const eventTypes = events.map(e => e.type);
    const missingMandatory = (scenarioContract.mandatory_events || []).filter(
      (m: string) => !eventTypes.includes(m)
    );
    const foundForbidden = (scenarioContract.forbidden_events || []).filter(
      (f: string) => eventTypes.includes(f)
    );
    const noLostEventsPassed = missingMandatory.length === 0 && foundForbidden.length === 0;
    invariants.push({
      invariant: 'no_lost_events',
      passed: noLostEventsPassed,
      message: noLostEventsPassed
        ? 'Todos os eventos obrigatórios estão presentes e os proibidos estão ausentes.'
        : `FALHA: Eventos faltantes: [${missingMandatory.join(', ')}], Eventos proibidos encontrados: [${foundForbidden.join(', ')}]`
    });

    // 6. Invariante: Limite de Retries Respeitado
    const maxRetries = scenarioContract.retry_limit;
    const retryLimitPassed = actualRetries <= maxRetries;
    invariants.push({
      invariant: 'retry_limit_respected',
      passed: retryLimitPassed,
      message: retryLimitPassed
        ? `Limite de retries respeitado (${actualRetries} / ${maxRetries}).`
        : `FALHA: Tentativas de retry (${actualRetries}) excederam o limite (${maxRetries}).`
    });

    // 7. Invariante: Retomada Possível (quando aplicável)
    const isRecoverable = scenarioContract.recovery_expectation?.recoverable;
    invariants.push({
      invariant: 'recovery_possible',
      passed: isRecoverable ? actualTerminalState === 'RECOVERED' || actualTerminalState === 'COMPLETED' : true,
      message: isRecoverable
        ? (actualTerminalState === 'RECOVERED' || actualTerminalState === 'COMPLETED' ? 'Retomada de estado verificada com sucesso.' : 'FALHA: Cenário recuperável não retomou o estado esperado.')
        : 'Cenário não requeria recuperação de estado.'
    });

    const terminalMatches = actualTerminalState === scenarioContract.expected_terminal_state || (isRecoverable && actualTerminalState === 'RECOVERED');
    const allPassed = invariants.every(inv => inv.passed) && terminalMatches;

    return {
      scenario_id: scenarioContract.id,
      all_passed: allPassed,
      terminal_state_matches: terminalMatches,
      invariants
    };
  }
}
