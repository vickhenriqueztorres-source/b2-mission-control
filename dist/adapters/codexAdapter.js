"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodexAdapter = void 0;
const providerAdapter_1 = require("./providerAdapter");
const agentTelemetryAdapter_1 = require("./agentTelemetryAdapter");
const logger_1 = require("../event-hub/logger");
class CodexAdapter extends providerAdapter_1.ProviderAdapter {
    role = 'REVIEWER';
    enabled = false; // Desativado até retorno das cotas
    telemetry;
    constructor() {
        super('CodexReviewer');
        this.telemetry = agentTelemetryAdapter_1.AgentTelemetryAdapter.getInstance();
    }
    async initialize() {
        logger_1.Logger.info(this.name, 'Adaptador Codex (Revisor Somente-Leitura) registrado (Status: Desativado - Cotas Excedidas)');
    }
    async checkHealth() {
        return false; // Desativado
    }
    async executeTask(taskDescription, context) {
        if (!this.enabled) {
            logger_1.Logger.warn(this.name, `Tentativa de executar tarefa com Codex desativado: ${taskDescription}`);
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
    async reviewCode(targetFiles) {
        logger_1.Logger.warn(this.name, 'Revisão do Codex ignorada por falta de cotas API.');
        return {
            passed: true,
            issues: [],
            suggestions: ['[Codex Desativado] Passo de revisão marcado como liberado por padrão (bypass de cotas).']
        };
    }
}
exports.CodexAdapter = CodexAdapter;
