import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EventBus, AgentEvent } from '../event-hub/eventBus';
import { getDatabase } from '../database/db';
import { Logger } from '../event-hub/logger';

export type TelemetryEventType =
  | 'AGENT_REGISTERED'
  | 'AGENT_STARTED'
  | 'AGENT_ACTIVITY'
  | 'TOOL_STARTED'
  | 'TOOL_COMPLETED'
  | 'ARTIFACT_READ'
  | 'ARTIFACT_CREATED'
  | 'ARTIFACT_VALIDATED'
  | 'AGENT_WAITING'
  | 'AGENT_COMPLETED'
  | 'AGENT_FAILED'
  | 'AGENT_RETRYING'
  | 'AGENT_CANCELLED'
  | 'STEP_STARTED'
  | 'STEP_COMPLETED'
  | 'QA_APPROVED'
  | 'QA_REJECTED'
  | 'HANDOFF_REACHED'
  | 'JOB_SUBMITTED'
  | 'JOB_COMPLETED'
  | 'ERROR';

export type TelemetryStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'WAITING'
  | 'FAILED'
  | 'CANCELLED'
  | 'STILL_GENERATING'
  | 'RESULT_READY'
  | 'IDLE';

export type TelemetryProvider = 'ANTIGRAVITY' | 'RAFA_LOBO' | 'FIREFLY_BOT' | 'CODEX' | 'MISSION_CONTROL';

export interface TelemetryEvent {
  event_id: string;
  run_id: string;
  production_id: string;
  agent_id: string;
  provider: TelemetryProvider;
  task_id: string;
  timestamp: string;
  type: TelemetryEventType;
  status: TelemetryStatus;
  message: string;
  artifact_path?: string;
  tool_name?: string;
  attempt: number;
  step_index?: number;
  payload?: any;
}

export class AgentTelemetryAdapter {
  private static instance: AgentTelemetryAdapter;

  private constructor() {}

  public static getInstance(): AgentTelemetryAdapter {
    if (!AgentTelemetryAdapter.instance) {
      AgentTelemetryAdapter.instance = new AgentTelemetryAdapter();
    }
    return AgentTelemetryAdapter.instance;
  }

  public recordEvent(eventInput: Partial<TelemetryEvent> & {
    run_id: string;
    production_id: string;
    agent_id: string;
    provider: TelemetryProvider;
    type: TelemetryEventType;
    status: TelemetryStatus;
    message: string;
  }): TelemetryEvent {
    const fullEvent: TelemetryEvent = {
      event_id: eventInput.event_id || `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
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
      const db = getDatabase();
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
      stmt.run(
        fullEvent.event_id,
        fullEvent.production_id,
        fullEvent.provider,
        fullEvent.agent_id,
        fullEvent.step_index || 0,
        fullEvent.type,
        fullEvent.timestamp,
        JSON.stringify(fullEvent)
      );
    } catch (err: any) {
      Logger.error('AgentTelemetryAdapter', `Erro ao gravar no SQLite: ${err.message}`);
    }

    // 2. Gravar em arquivo JSONL na pasta da execução
    try {
      const runDir = path.resolve(`C:/B2-AI-STUDIO/mission-control/runs/${fullEvent.run_id}`);
      if (!fs.existsSync(runDir)) {
        fs.mkdirSync(runDir, { recursive: true });
      }
      const jsonlPath = path.join(runDir, 'events.jsonl');
      fs.appendFileSync(jsonlPath, JSON.stringify(fullEvent) + '\n', 'utf-8');
    } catch (err: any) {
      Logger.error('AgentTelemetryAdapter', `Erro ao gravar JSONL: ${err.message}`);
    }

    // 3. Emitir no Barramento EventBus (para transmissão por WebSocket aos dashboards)
    const agentEvent: AgentEvent = {
      event_id: fullEvent.event_id,
      production_id: fullEvent.production_id,
      source: fullEvent.provider as any,
      agent_name: fullEvent.agent_id,
      step_index: fullEvent.step_index,
      event_type: fullEvent.type as any,
      timestamp: fullEvent.timestamp,
      payload: fullEvent
    };
    EventBus.getInstance().emitEvent(agentEvent);

    Logger.info('AgentTelemetryAdapter', `[${fullEvent.provider}] ${fullEvent.agent_id}: ${fullEvent.type} -> ${fullEvent.message}`);

    return fullEvent;
  }
}
