"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const events_1 = require("events");
const db_1 = require("../database/db");
const logger_1 = require("./logger");
class EventBus extends events_1.EventEmitter {
    static instance;
    constructor() {
        super();
    }
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    emitEvent(event) {
        const timestamp = event.timestamp || new Date().toISOString();
        const eventId = event.event_id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        try {
            const db = (0, db_1.getDatabase)();
            const stmt = db.prepare(`
        INSERT OR IGNORE INTO agent_events (event_id, production_id, source, agent_name, step_index, event_type, timestamp, payload)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
            stmt.run(eventId, event.production_id, event.source, event.agent_name, event.step_index || 0, event.event_type, timestamp, JSON.stringify(event.payload || {}));
        }
        catch (err) {
            logger_1.Logger.error('EventBus', `Erro ao persistir evento no SQLite: ${err.message}`);
        }
        const enrichedEvent = {
            ...event,
            event_id: eventId,
            timestamp
        };
        this.emit('agent_event', enrichedEvent);
        logger_1.Logger.info('EventBus', `[${event.source}] ${event.agent_name}: ${event.event_type} (${event.production_id})`);
    }
}
exports.EventBus = EventBus;
