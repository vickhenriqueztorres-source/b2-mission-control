"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChaosEventRecorder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
class ChaosEventRecorder {
    runDir;
    jsonlPath;
    dbPath;
    db;
    seenEventIds = new Set();
    seenIdempotencyKeys = new Set();
    seenCompositeKeys = new Set();
    duplicateEventsCount = 0;
    constructor(scenarioId) {
        this.runDir = path_1.default.resolve(process.cwd(), 'runs', `CHAOS-${scenarioId.replace(/^CHAOS-/, '')}`);
        if (!fs_1.default.existsSync(this.runDir)) {
            fs_1.default.mkdirSync(this.runDir, { recursive: true });
        }
        this.jsonlPath = path_1.default.join(this.runDir, 'events.jsonl');
        this.dbPath = path_1.default.join(this.runDir, 'chaos_events.db');
        this.db = new better_sqlite3_1.default(this.dbPath);
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
    recordEvent(event) {
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
        if (event.idempotency_key)
            this.seenIdempotencyKeys.add(event.idempotency_key);
        if (event.composite_key)
            this.seenCompositeKeys.add(event.composite_key);
        // 3. Persistência em JSONL
        const jsonLine = JSON.stringify(event) + '\n';
        fs_1.default.appendFileSync(this.jsonlPath, jsonLine, 'utf-8');
        // 4. Persistência em SQLite
        const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO events 
      (event_id, run_id, production_id, agent_id, provider, task_id, timestamp, type, status, message, artifact_path, tool_name, attempt, idempotency_key, composite_key)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(event.event_id, event.run_id, event.production_id, event.agent_id, event.provider, event.task_id, event.timestamp, event.type, event.status, event.message, event.artifact_path || null, event.tool_name || null, event.attempt, event.idempotency_key || null, event.composite_key || null);
        return { recorded: true };
    }
    getEvents() {
        const rows = this.db.prepare('SELECT * FROM events ORDER BY timestamp ASC').all();
        return rows.map((r) => ({
            ...r,
            artifact_path: r.artifact_path || undefined,
            tool_name: r.tool_name || undefined,
            idempotency_key: r.idempotency_key || undefined,
            composite_key: r.composite_key || undefined
        }));
    }
    saveSnapshot() {
        const snapshotPath = path_1.default.join(this.runDir, 'db_snapshot.json');
        const events = this.getEvents();
        fs_1.default.writeFileSync(snapshotPath, JSON.stringify({ events_count: events.length, events }, null, 2), 'utf-8');
    }
    close() {
        this.db.close();
    }
}
exports.ChaosEventRecorder = ChaosEventRecorder;
