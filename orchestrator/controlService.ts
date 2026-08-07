import Database from 'better-sqlite3';
import { getDatabase } from '../database/db';
import { AgentTelemetryAdapter } from '../adapters/agentTelemetryAdapter';
import { BackupManager } from '../backup/backupManager';
import { BootReconciler } from './bootReconciler';

export interface OperationalControlState {
  queuePaused: boolean;
  emergencyStopped: boolean;
  emergencyReason?: string;
  requestedBy?: string;
  activatedAt?: string;
  releasedAt?: string;
}

export class ControlService {
  private static fireflyDbPath = 'C:\\B2-AI-STUDIO\\links\\firefly-automation\\data\\firefly_jobs.db';

  private static rowToState(row: any): OperationalControlState {
    return {
      queuePaused: Boolean(row.queue_paused),
      emergencyStopped: Boolean(row.emergency_stopped),
      emergencyReason: row.emergency_reason || undefined,
      requestedBy: row.requested_by || undefined,
      activatedAt: row.activated_at || undefined,
      releasedAt: row.released_at || undefined
    };
  }

  private static syncFireflySystemState(status: string, reason?: string): void {
    try {
      const db = new Database(this.fireflyDbPath);
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
    } catch {
      // Mission Control state remains authoritative; Firefly sync failure is surfaced by endpoint state/events.
    }
  }

  private static record(type: string, message: string, payload: any = {}): void {
    AgentTelemetryAdapter.getInstance().recordEvent({
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

  public static getStatus(): OperationalControlState {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM operational_control_state WHERE singleton = 1').get();
    return this.rowToState(row);
  }

  public static pauseNewJobs(requestedBy = 'user'): OperationalControlState & { ok: true } {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE operational_control_state
      SET queue_paused = 1, requested_by = ?, updated_at = ?
      WHERE singleton = 1
    `).run(requestedBy, now);
    BootReconciler.pauseNewJobs();
    this.syncFireflySystemState('paused-control', 'queuePaused=true');
    const state = this.getStatus();
    this.record('QUEUE_PAUSED', 'New job claiming paused; active monitoring may continue.', state);
    return { ok: true, ...state };
  }

  public static resumeQueue(requestedBy = 'user'): OperationalControlState & { ok: true } {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE operational_control_state
      SET queue_paused = 0, requested_by = ?, updated_at = ?
      WHERE singleton = 1
    `).run(requestedBy, now);
    BootReconciler.resumeQueue();
    const state = this.getStatus();
    this.syncFireflySystemState(state.emergencyStopped ? 'emergency-stop' : 'running', state.emergencyReason);
    this.record('QUEUE_RESUMED', 'New job claiming resumed.', state);
    return { ok: true, ...state };
  }

  public static emergencyStop(reason: string, requestedBy = 'user'): OperationalControlState & { ok: true; humanReleaseRequired: true } {
    const db = getDatabase();
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
    BootReconciler.emergencyStop();
    this.syncFireflySystemState('emergency-stop', reason);
    const state = this.getStatus();
    this.record('EMERGENCY_STOP_ACTIVATED', 'Emergency stop activated. HUMAN_RELEASE_REQUIRED.', state);
    return { ok: true, humanReleaseRequired: true, ...state };
  }

  public static emergencyRelease(reason: string, requestedBy = 'user'): OperationalControlState & { ok: true } {
    const db = getDatabase();
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
    BootReconciler.isEmergencyStopped = false;
    BootReconciler.resumeQueue();
    this.syncFireflySystemState('running', reason);
    const state = this.getStatus();
    this.record('EMERGENCY_STOP_RELEASED', 'Emergency stop released by explicit human action.', { ...state, releaseReason: reason });
    return { ok: true, ...state };
  }

  public static reconcileState(): { ok: true; state: OperationalControlState; reconciliation: any } {
    const reconciliation = BootReconciler.reconcileBoot();
    const state = this.getStatus();
    this.record('CONTROL_RECONCILED', 'Operational control state reconciled.', { state, reconciliation });
    return { ok: true, state, reconciliation };
  }

  public static async createBackup(): Promise<{ ok: true; manifest: any }> {
    const manifest = await BackupManager.createBackup();
    this.record('CONTROL_BACKUP_CREATED', 'Operational backup created from control endpoint.', { backup_id: manifest.backup_id });
    return { ok: true, manifest };
  }
}
