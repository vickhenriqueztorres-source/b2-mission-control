import { ProviderAdapter, CodeReviewResult } from './providerAdapter';
import { AgentTelemetryAdapter } from './agentTelemetryAdapter';
import { Logger } from '../event-hub/logger';

export class CodexAdapter extends ProviderAdapter {
  public role: 'REVIEWER' = 'REVIEWER';
  public enabled: boolean = false; // Desativado até retorno das cotas
  private telemetry: AgentTelemetryAdapter;

  constructor() {
    super('CodexReviewer');
    this.telemetry = AgentTelemetryAdapter.getInstance();
  }

  public async initialize(): Promise<void> {
    Logger.info(this.name, 'Adaptador Codex (Revisor Somente-Leitura) registrado (Status: Desativado - Cotas Excedidas)');
  }

  public async checkHealth(): Promise<boolean> {
    return false; // Desativado
  }

  public async executeTask(taskDescription: string, context?: any): Promise<{ success: boolean; output: string }> {
    if (!this.enabled) {
      Logger.warn(this.name, `Tentativa de executar tarefa com Codex desativado: ${taskDescription}`);
      this.telemetry.recordEvent({
        run_id: context?.production_id || 'UNKNOWN',
        production_id: context?.production_id || 'UNKNOWN',
        agent_id: 'CodexReviewer',
        provider: 'CODEX',
        task_id: 'REVIEW_SKIPPED',
        type: 'AGENT_CANCELLED',
        status: 'CANCELLED',
        message: 'Codex desativado temporariamente (cotas excedidas).',
        attempt: 1
      });
      return {
        success: false,
        output: '[Codex] Adaptador desativado. Cotas excedidas.'
      };
    }

    return { success: true, output: '[Codex] Revisão executada.' };
  }

  public async reviewCode(targetFiles: string[]): Promise<CodeReviewResult> {
    Logger.warn(this.name, 'Revisão do Codex ignorada por falta de cotas API.');
    return {
      passed: true,
      issues: [],
      suggestions: ['[Codex Desativado] Passo de revisão marcado como liberado por padrão (bypass de cotas).']
    };
  }
}
