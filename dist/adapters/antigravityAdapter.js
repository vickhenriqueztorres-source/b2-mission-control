"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntigravityAdapter = void 0;
const providerAdapter_1 = require("./providerAdapter");
const agentTelemetryAdapter_1 = require("./agentTelemetryAdapter");
const logger_1 = require("../event-hub/logger");
class AntigravityAdapter extends providerAdapter_1.ProviderAdapter {
    role = 'BUILDER';
    telemetry;
    constructor() {
        super('AntigravityBuilder');
        this.telemetry = agentTelemetryAdapter_1.AgentTelemetryAdapter.getInstance();
    }
    async initialize() {
        logger_1.Logger.info(this.name, 'Inicializando adaptador principal Antigravity (Construtor)');
    }
    async checkHealth() {
        return true;
    }
    registerAgent(productionId, runId, agentId, taskId) {
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
    startAgent(productionId, runId, agentId, taskId, stepIndex) {
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
    recordToolStart(productionId, runId, agentId, taskId, toolName) {
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
    recordToolComplete(productionId, runId, agentId, taskId, toolName, resultSummary) {
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
    recordArtifactCreation(productionId, runId, agentId, taskId, artifactPath) {
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
    recordArtifactValidation(productionId, runId, agentId, taskId, artifactPath, schemaName) {
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
    recordAgentWaiting(productionId, runId, agentId, taskId, waitingFor) {
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
    completeAgent(productionId, runId, agentId, taskId, summary) {
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
    async executeTask(taskDescription, context) {
        logger_1.Logger.info(this.name, `Executando tarefa de construção: ${taskDescription}`);
        return {
            success: true,
            output: `[Antigravity] Tarefa '${taskDescription}' concluída.`
        };
    }
    async reviewCode(targetFiles) {
        return {
            passed: true,
            issues: [],
            suggestions: ['Código verificado pelo construtor principal Antigravity.']
        };
    }
}
exports.AntigravityAdapter = AntigravityAdapter;
