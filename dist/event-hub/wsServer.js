"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMissionControlServer = startMissionControlServer;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const eventBus_1 = require("./eventBus");
const db_1 = require("../database/db");
const logger_1 = require("./logger");
const metricsCollector_1 = require("../metrics/metricsCollector");
const controlService_1 = require("../orchestrator/controlService");
const productionSafetyGuard_1 = require("../config/productionSafetyGuard");
const PORT = 3333;
let isServerStarted = false;
function startMissionControlServer() {
    if (isServerStarted)
        return;
    productionSafetyGuard_1.ProductionSafetyGuard.assertSafeForProduction();
    isServerStarted = true;
    try {
        const app = (0, express_1.default)();
        const server = http_1.default.createServer(app);
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger_1.Logger.info('WSServer', `Port ${PORT} is already in use.`);
            }
            else {
                logger_1.Logger.error('WSServer', `HTTP server error: ${err.message}`);
            }
        });
        const wss = new ws_1.WebSocketServer({ server });
        wss.on('error', (err) => {
            logger_1.Logger.info('WSServer', `WebSocketServer error: ${err.message}`);
        });
        app.use(express_1.default.json());
        const staticPath = path_1.default.join(__dirname, '../app-desktop/public');
        if (!fs_1.default.existsSync(staticPath)) {
            fs_1.default.mkdirSync(staticPath, { recursive: true });
        }
        app.use(express_1.default.static(staticPath));
        app.get('/api/health', (req, res) => {
            try {
                const metrics = metricsCollector_1.MetricsCollector.collectMetrics();
                const control = controlService_1.ControlService.getStatus();
                res.json({
                    status: control.emergencyStopped ? 'EMERGENCY_STOP' : control.queuePaused ? 'PAUSED' : 'HEALTHY',
                    metrics,
                    control
                });
            }
            catch (err) {
                res.status(500).json({ ok: false, error: err.message });
            }
        });
        app.get('/api/productions', (req, res) => {
            try {
                const db = (0, db_1.getDatabase)();
                const rows = db.prepare('SELECT * FROM productions ORDER BY updated_at DESC').all();
                res.json(rows);
            }
            catch (err) {
                res.status(500).json({ ok: false, error: err.message });
            }
        });
        app.get('/api/productions/:id/telemetry', (req, res) => {
            try {
                const db = (0, db_1.getDatabase)();
                const rows = db.prepare('SELECT * FROM agent_events WHERE production_id = ? ORDER BY timestamp ASC').all(req.params.id);
                const events = rows.map((r) => {
                    try {
                        return JSON.parse(r.payload);
                    }
                    catch {
                        return r;
                    }
                });
                res.json(events);
            }
            catch (err) {
                res.status(500).json({ ok: false, error: err.message });
            }
        });
        app.get('/api/control/status', (req, res) => {
            try {
                res.json({ ok: true, ...controlService_1.ControlService.getStatus() });
            }
            catch (err) {
                res.status(500).json({ ok: false, error: err.message });
            }
        });
        app.post('/api/control/pause-new-jobs', (req, res) => {
            try {
                res.json(controlService_1.ControlService.pauseNewJobs(req.body?.requested_by || 'user'));
            }
            catch (err) {
                res.status(500).json({ ok: false, error: err.message });
            }
        });
        app.post('/api/control/resume-queue', (req, res) => {
            try {
                res.json(controlService_1.ControlService.resumeQueue(req.body?.requested_by || 'user'));
            }
            catch (err) {
                res.status(500).json({ ok: false, error: err.message });
            }
        });
        app.post('/api/control/emergency-stop', (req, res) => {
            try {
                res.json(controlService_1.ControlService.emergencyStop(req.body?.reason || 'UNSPECIFIED', req.body?.requested_by || 'user'));
            }
            catch (err) {
                res.status(500).json({ ok: false, error: err.message });
            }
        });
        app.post('/api/control/emergency-release', (req, res) => {
            try {
                res.json(controlService_1.ControlService.emergencyRelease(req.body?.reason || 'HUMAN_RELEASE', req.body?.requested_by || 'user'));
            }
            catch (err) {
                res.status(500).json({ ok: false, error: err.message });
            }
        });
        app.post('/api/control/reconcile-state', (req, res) => {
            try {
                res.json(controlService_1.ControlService.reconcileState());
            }
            catch (err) {
                res.status(500).json({ ok: false, error: err.message });
            }
        });
        app.post('/api/control/create-backup', async (req, res) => {
            try {
                res.json(await controlService_1.ControlService.createBackup());
            }
            catch (err) {
                res.status(500).json({ ok: false, error: err.message });
            }
        });
        wss.on('connection', (ws) => {
            logger_1.Logger.info('WSServer', 'Dashboard client connected.');
            ws.send(JSON.stringify({
                event_type: 'SYSTEM_CONNECTED',
                message: 'Connected to B2 Mission Control realtime event bus'
            }));
            try {
                const db = (0, db_1.getDatabase)();
                const rows = db.prepare('SELECT payload FROM agent_events ORDER BY timestamp DESC LIMIT 50').all();
                const events = rows.map((r) => JSON.parse(r.payload)).reverse();
                ws.send(JSON.stringify({ event_type: 'TELEMETRY_REPLAY', events }));
            }
            catch (err) {
                logger_1.Logger.warn('WSServer', `Replay failed: ${err.message}`);
            }
        });
        eventBus_1.EventBus.getInstance().on('agent_event', (event) => {
            const payload = JSON.stringify(event.payload || event);
            wss.clients.forEach((client) => {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    client.send(payload);
                }
            });
        });
        server.listen(PORT, () => {
            logger_1.Logger.info('WSServer', `B2 Mission Control dashboard running at http://localhost:${PORT}`);
        });
    }
    catch (err) {
        logger_1.Logger.info('WSServer', `Server already active at http://localhost:${PORT}: ${err.message}`);
    }
}
if (require.main === module) {
    startMissionControlServer();
}
