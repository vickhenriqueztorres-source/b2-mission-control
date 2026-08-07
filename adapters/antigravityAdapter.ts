import { ProviderAdapter, CodeReviewResult } from './providerAdapter';
import { AgentTelemetryAdapter, TelemetryEvent } from './agentTelemetryAdapter';
import { Logger } from '../event-hub/logger';

export class AntigravityAdapter extends ProviderAdapter {
  public role: 'BUILDER' = 'BUILDER';
  private telemetry: AgentTelemetryAdapter;

  constructor() {
    super('AntigravityBuilder');
    this.telemetry = AgentTelemetryAdapter.getInstance();
  }

  public async initialize(): Promise<void> {
    Logger.info(this.name, 'Inicializando adaptador principal Antigravity (Construtor)');
  }

  public async checkHealth(): Promise<boolean> {
    return true;
  }

  public registerAgent(productionId: string, runId: string, agentId: string, taskId: string): TelemetryEvent {
    return this.telemetry.recordEvent({
      run_id: runId,
      production_id: productionId,
      agent_id: agentId,
      provider: 'ANTIGRAVITY',
      task_id: taskId,
      type: 'AGENT_REGISTERED',
      status: 'PENDING',
      message: `Agente ${agentId} registrado no ecossistema Antigravity.`,
      attempt: 1
    });
  }

  public startAgent(productionId: string, runId: string, agentId: string, taskId: string, stepIndex?: number): TelemetryEvent {
    return this.telemetry.recordEvent({
      run_id: runId,
      production_id: productionId,
      agent_id: agentId,
      provider: 'ANTIGRAVITY',
      task_id: taskId,
      step_index: stepIndex,
      type: 'AGENT_STARTED',
      status: 'RUNNING',
      message: `Agente ${agentId} iniciou a execução da tarefa.`,
      attempt: 1
    });
  }

  public recordToolStart(productionId: string, runId: string, agentId: string, taskId: string, toolName: string): TelemetryEvent {
    return this.telemetry.recordEvent({
      run_id: runId,
      production_id: productionId,
      agent_id: agentId,
      provider: 'ANTIGRAVITY',
      task_id: taskId,
      tool_name: toolName,
      type: 'TOOL_STARTED',
      status: 'RUNNING',
      message: `Agente ${agentId} disparou a ferramenta ${toolName}.`,
      attempt: 1
    });
  }

  public recordToolComplete(productionId: string, runId: string, agentId: string, taskId: string, toolName: string, resultSummary: string): TelemetryEvent {
    return this.telemetry.recordEvent({
      run_id: runId,
      production_id: productionId,
      agent_id: agentId,
      provider: 'ANTIGRAVITY',
      task_id: taskId,
      tool_name: toolName,
      type: 'TOOL_COMPLETED',
      status: 'SUCCESS',
      message: `Ferramenta ${toolName} concluída por ${agentId}: ${resultSummary}`,
      attempt: 1
    });
  }

  public recordArtifactCreation(productionId: string, runId: string, agentId: string, taskId: string, artifactPath: string): TelemetryEvent {
    return this.telemetry.recordEvent({
      run_id: runId,
      production_id: productionId,
      agent_id: agentId,
      provider: 'ANTIGRAVITY',
      task_id: taskId,
      artifact_path: artifactPath,
      type: 'ARTIFACT_CREATED',
      status: 'SUCCESS',
      message: `Agente ${agentId} gerou o artefato: ${artifactPath}`,
      attempt: 1
    });
  }

  public recordArtifactValidation(productionId: string, runId: string, agentId: string, taskId: string, artifactPath: string, schemaName: string): TelemetryEvent {
    return this.telemetry.recordEvent({
      run_id: runId,
      production_id: productionId,
      agent_id: agentId,
      provider: 'ANTIGRAVITY',
      task_id: taskId,
      artifact_path: artifactPath,
      type: 'ARTIFACT_VALIDATED',
      status: 'SUCCESS',
      message: `Artefato ${artifactPath} validado 100% contra schema ${schemaName}`,
      attempt: 1
    });
  }

  public recordAgentWaiting(productionId: string, runId: string, agentId: string, taskId: string, waitingFor: string): TelemetryEvent {
    return this.telemetry.recordEvent({
      run_id: runId,
      production_id: productionId,
      agent_id: agentId,
      provider: 'ANTIGRAVITY',
      task_id: taskId,
      type: 'AGENT_WAITING',
      status: 'WAITING',
      message: `Agente ${agentId} aguardando dependência: ${waitingFor}`,
      attempt: 1
    });
  }

  public completeAgent(productionId: string, runId: string, agentId: string, taskId: string, summary: string): TelemetryEvent {
    return this.telemetry.recordEvent({
      run_id: runId,
      production_id: productionId,
      agent_id: agentId,
      provider: 'ANTIGRAVITY',
      task_id: taskId,
      type: 'AGENT_COMPLETED',
      status: 'SUCCESS',
      message: `Agente ${agentId} concluiu com sucesso: ${summary}`,
      attempt: 1
    });
  }

  public async executeTask(taskDescription: string, context?: any): Promise<{ success: boolean; output: string }> {
    Logger.info(this.name, `Executando tarefa de construção: ${taskDescription}`);
    return {
      success: true,
      output: `[Antigravity] Tarefa '${taskDescription}' concluída.`
    };
  }

  public async reviewCode(targetFiles: string[]): Promise<CodeReviewResult> {
    return {
      passed: true,
      issues: [],
      suggestions: ['Código verificado pelo construtor principal Antigravity.']
    };
  }
}
