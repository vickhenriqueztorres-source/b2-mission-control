"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTelemetryAdapter = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const eventBus_1 = require("../event-hub/eventBus");
const db_1 = require("../database/db");
const logger_1 = require("../event-hub/logger");
class AgentTelemetryAdapter {
    static instance;
    constructor() { }
    static getInstance() {
        if (!AgentTelemetryAdapter.instance) {
            AgentTelemetryAdapter.instance = new AgentTelemetryAdapter();
        }
        return AgentTelemetryAdapter.instance;
    }
    recordEvent(eventInput) {
        const fullEvent = {
            event_id: eventInput.event_id || `evt_${Date.now()}_${crypto_1.default.randomBytes(4).toString('hex')}`,
            run_id: eventInput.run_id,
            production_id: eventInput.production_id,
            agent_id: eventInput.agent_id,
            provider: eventInput.provider,
            task_id: eventInput.task_id || `task_${Date.now()}`,
            timestamp: eventInput.timestamp || new Date().toISOString(),
            type: eventInput.type,
            status: eventInput.status,
            message: eventInput.message,
            artifact_path: eventInput.artifact_path,
            tool_name: eventInput.tool_name,
            attempt: eventInput.attempt ?? 1,
            step_index: eventInput.step_index,
            payload: eventInput.payload || {}
        };
        // 1. Persistir no SQLite WAL (garantindo FK em productions)
        try {
            const db = (0, db_1.getDatabase)();
            const prodCheck = db.prepare('SELECT production_id FROM productions WHERE production_id = ?').get(fullEvent.production_id);
            if (!prodCheck) {
                db.prepare(`
          INSERT INTO productions (production_id, project_name, status, current_step)
          VALUES (?, 'Rafa Lobo Live Ops', 'RUNNING', 1)
        `).run(fullEvent.production_id);
            }
            const stmt = db.prepare(`
        INSERT OR REPLACE INTO agent_events (event_id, production_id, source, agent_name, step_index, event_type, timestamp, payload)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
            stmt.run(fullEvent.event_id, fullEvent.production_id, fullEvent.provider, fullEvent.agent_id, fullEvent.step_index || 0, fullEvent.type, fullEvent.timestamp, JSON.stringify(fullEvent));
        }
        catch (err) {
            logger_1.Logger.error('AgentTelemetryAdapter', `Erro ao gravar no SQLite: ${err.message}`);
        }
        // 2. Gravar em arquivo JSONL na pasta da execução
        try {
            const runDir = path_1.default.resolve(`C:/B2-AI-STUDIO/mission-control/runs/${fullEvent.run_id}`);
            if (!fs_1.default.existsSync(runDir)) {
                fs_1.default.mkdirSync(runDir, { recursive: true });
            }
            const jsonlPath = path_1.default.join(runDir, 'events.jsonl');
            fs_1.default.appendFileSync(jsonlPath, JSON.stringify(fullEvent) + '\n', 'utf-8');
        }
        catch (err) {
            logger_1.Logger.error('AgentTelemetryAdapter', `Erro ao gravar JSONL: ${err.message}`);
        }
        // 3. Emitir no Barramento EventBus (para transmissão por WebSocket aos dashboards)
        const agentEvent = {
            event_id: fullEvent.event_id,
            production_id: fullEvent.production_id,
            source: fullEvent.provider,
            agent_name: fullEvent.agent_id,
            step_index: fullEvent.step_index,
            event_type: fullEvent.type,
            timestamp: fullEvent.timestamp,
            payload: fullEvent
        };
        eventBus_1.EventBus.getInstance().emitEvent(agentEvent);
        logger_1.Logger.info('AgentTelemetryAdapter', `[${fullEvent.provider}] ${fullEvent.agent_id}: ${fullEvent.type} -> ${fullEvent.message}`);
        return fullEvent;
    }
}
exports.AgentTelemetryAdapter = AgentTelemetryAdapter;
