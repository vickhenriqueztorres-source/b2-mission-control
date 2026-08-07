"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlService = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const db_1 = require("../database/db");
const agentTelemetryAdapter_1 = require("../adapters/agentTelemetryAdapter");
const backupManager_1 = require("../backup/backupManager");
const bootReconciler_1 = require("./bootReconciler");
class ControlService {
    static fireflyDbPath = 'C:\\B2-AI-STUDIO\\links\\firefly-automation\\data\\firefly_jobs.db';
    static rowToState(row) {
        return {
            queuePaused: Boolean(row.queue_paused),
            emergencyStopped: Boolean(row.emergency_stopped),
            emergencyReason: row.emergency_reason || undefined,
            requestedBy: row.requested_by || undefined,
            activatedAt: row.activated_at || undefined,
            releasedAt: row.released_at || undefined
        };
    }
    static syncFireflySystemState(status, reason) {
        try {
            const db = new better_sqlite3_1.default(this.fireflyDbPath);
            db.exec(`
        CREATE TABLE IF NOT EXISTS system_state (
          singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
          status TEXT NOT NULL,
          reason TEXT,
          updated_at REAL NOT NULL
        )
      `);
            db.prepare(`
        INSERT INTO system_state(singleton, status, reason, updated_at)
        VALUES (1, ?, ?, strftime('%s','now'))
        ON CONFLICT(singleton) DO UPDATE SET
          status = excluded.status,
          reason = excluded.reason,
          updated_at = excluded.updated_at
      `).run(status, reason || null);
            db.close();
        }
        catch {
            // Mission Control state remains authoritative; Firefly sync failure is surfaced by endpoint state/events.
        }
    }
    static record(type, message, payload = {}) {
        agentTelemetryAdapter_1.AgentTelemetryAdapter.getInstance().recordEvent({
            run_id: 'OPERATIONAL-CONTROL',
            production_id: 'SYSTEM',
            agent_id: 'ControlService',
            provider: 'MISSION_CONTROL',
            task_id: type,
            type: 'AGENT_ACTIVITY',
            status: 'SUCCESS',
            message,
            attempt: 1,
            payload
        });
    }
    static getStatus() {
        const db = (0, db_1.getDatabase)();
        const row = db.prepare('SELECT * FROM operational_control_state WHERE singleton = 1').get();
        return this.rowToState(row);
    }
    static pauseNewJobs(requestedBy = 'user') {
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        db.prepare(`
      UPDATE operational_control_state
      SET queue_paused = 1, requested_by = ?, updated_at = ?
      WHERE singleton = 1
    `).run(requestedBy, now);
        bootReconciler_1.BootReconciler.pauseNewJobs();
        this.syncFireflySystemState('paused-control', 'queuePaused=true');
        const state = this.getStatus();
        this.record('QUEUE_PAUSED', 'New job claiming paused; active monitoring may continue.', state);
        return { ok: true, ...state };
    }
    static resumeQueue(requestedBy = 'user') {
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        db.prepare(`
      UPDATE operational_control_state
      SET queue_paused = 0, requested_by = ?, updated_at = ?
      WHERE singleton = 1
    `).run(requestedBy, now);
        bootReconciler_1.BootReconciler.resumeQueue();
        const state = this.getStatus();
        this.syncFireflySystemState(state.emergencyStopped ? 'emergency-stop' : 'running', state.emergencyReason);
        this.record('QUEUE_RESUMED', 'New job claiming resumed.', state);
        return { ok: true, ...state };
    }
    static emergencyStop(reason, requestedBy = 'user') {
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        db.prepare(`
      UPDATE operational_control_state
      SET emergency_stopped = 1,
          queue_paused = 1,
          emergency_reason = ?,
          requested_by = ?,
          activated_at = ?,
          released_at = NULL,
          updated_at = ?
      WHERE singleton = 1
    `).run(reason, requestedBy, now, now);
        bootReconciler_1.BootReconciler.emergencyStop();
        this.syncFireflySystemState('emergency-stop', reason);
        const state = this.getStatus();
        this.record('EMERGENCY_STOP_ACTIVATED', 'Emergency stop activated. HUMAN_RELEASE_REQUIRED.', state);
        return { ok: true, humanReleaseRequired: true, ...state };
    }
    static emergencyRelease(reason, requestedBy = 'user') {
        const db = (0, db_1.getDatabase)();
        const now = new Date().toISOString();
        db.prepare(`
      UPDATE operational_control_state
      SET emergency_stopped = 0,
          queue_paused = 0,
          requested_by = ?,
          released_at = ?,
          updated_at = ?
      WHERE singleton = 1
    `).run(requestedBy, now, now);
        bootReconciler_1.BootReconciler.isEmergencyStopped = false;
        bootReconciler_1.BootReconciler.resumeQueue();
        this.syncFireflySystemState('running', reason);
        const state = this.getStatus();
        this.record('EMERGENCY_STOP_RELEASED', 'Emergency stop released by explicit human action.', { ...state, releaseReason: reason });
        return { ok: true, ...state };
    }
    static reconcileState() {
        const reconciliation = bootReconciler_1.BootReconciler.reconcileBoot();
        const state = this.getStatus();
        this.record('CONTROL_RECONCILED', 'Operational control state reconciled.', { state, reconciliation });
        return { ok: true, state, reconciliation };
    }
    static async createBackup() {
        const manifest = await backupManager_1.BackupManager.createBackup();
        this.record('CONTROL_BACKUP_CREATED', 'Operational backup created from control endpoint.', { backup_id: manifest.backup_id });
        return { ok: true, manifest };
    }
}
exports.ControlService = ControlService;
