import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

export interface ChaosEventPayload {
  event_id: string;
  run_id: string;
  production_id: string;
  agent_id: string;
  provider: 'ANTIGRAVITY' | 'FIREFLY_BOT' | 'RAFA_LOBO' | 'MISSION_CONTROL' | 'CHAOS_ENGINE';
  task_id: string;
  timestamp: string;
  type: string;
  status: string;
  message: string;
  artifact_path?: string;
  tool_name?: string;
  attempt: number;
  idempotency_key?: string;
  composite_key?: string; // production_id + shot_id + take_id
}

export class ChaosEventRecorder {
  private runDir: string;
  private jsonlPath: string;
  private dbPath: string;
  private db: Database.Database;
  private seenEventIds: Set<string> = new Set();
  private seenIdempotencyKeys: Set<string> = new Set();
  private seenCompositeKeys: Set<string> = new Set();
  public duplicateEventsCount: number = 0;

  constructor(scenarioId: string) {
    this.runDir = path.resolve(process.cwd(), 'runs', `CHAOS-${scenarioId.replace(/^CHAOS-/, '')}`);
    if (!fs.existsSync(this.runDir)) {
      fs.mkdirSync(this.runDir, { recursive: true });
    }

    this.jsonlPath = path.join(this.runDir, 'events.jsonl');
    this.dbPath = path.join(this.runDir, 'chaos_events.db');

    this.db = new Database(this.dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        event_id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        production_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        task_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT NOT NULL,
        artifact_path TEXT,
        tool_name TEXT,
        attempt INTEGER NOT NULL,
        idempotency_key TEXT,
        composite_key TEXT
      )
    `);
  }

  public recordEvent(event: ChaosEventPayload): { recorded: boolean; reason?: string } {
    // 1. Verificação de Idempotência por event_id
    if (this.seenEventIds.has(event.event_id)) {
      this.duplicateEventsCount++;
      return { recorded: false, reason: `DUPLICATE_EVENT_ID: ${event.event_id}` };
    }

    // 2. Verificação de Idempotência por idempotency_key (quando fornecida)
    if (event.idempotency_key && this.seenIdempotencyKeys.has(event.idempotency_key)) {
      this.duplicateEventsCount++;
      return { recorded: false, reason: `DUPLICATE_IDEMPOTENCY_KEY: ${event.idempotency_key}` };
    }

    // Registra chaves vistas
    this.seenEventIds.add(event.event_id);
    if (event.idempotency_key) this.seenIdempotencyKeys.add(event.idempotency_key);
    if (event.composite_key) this.seenCompositeKeys.add(event.composite_key);

    // 3. Persistência em JSONL
    const jsonLine = JSON.stringify(event) + '\n';
    fs.appendFileSync(this.jsonlPath, jsonLine, 'utf-8');

    // 4. Persistência em SQLite
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO events 
      (event_id, run_id, production_id, agent_id, provider, task_id, timestamp, type, status, message, artifact_path, tool_name, attempt, idempotency_key, composite_key)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      event.event_id,
      event.run_id,
      event.production_id,
      event.agent_id,
      event.provider,
      event.task_id,
      event.timestamp,
      event.type,
      event.status,
      event.message,
      event.artifact_path || null,
      event.tool_name || null,
      event.attempt,
      event.idempotency_key || null,
      event.composite_key || null
    );

    return { recorded: true };
  }

  public getEvents(): ChaosEventPayload[] {
    const rows = this.db.prepare('SELECT * FROM events ORDER BY timestamp ASC').all();
    return rows.map((r: any) => ({
      ...r,
      artifact_path: r.artifact_path || undefined,
      tool_name: r.tool_name || undefined,
      idempotency_key: r.idempotency_key || undefined,
      composite_key: r.composite_key || undefined
    }));
  }

  public saveSnapshot(): void {
    const snapshotPath = path.join(this.runDir, 'db_snapshot.json');
    const events = this.getEvents();
    fs.writeFileSync(snapshotPath, JSON.stringify({ events_count: events.length, events }, null, 2), 'utf-8');
  }

  public close(): void {
    this.db.close();
  }
}
