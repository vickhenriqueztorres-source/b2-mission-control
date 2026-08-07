import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { EventBus, AgentEvent } from './eventBus';
import { getDatabase } from '../database/db';
import { Logger } from './logger';
import { BootReconciler } from '../orchestrator/bootReconciler';
import { MetricsCollector } from '../metrics/metricsCollector';
import { ControlService } from '../orchestrator/controlService';
import { ProductionSafetyGuard } from '../config/productionSafetyGuard';

const PORT = 3333;
let isServerStarted = false;

export function startMissionControlServer(): void {
  if (isServerStarted) return;
  ProductionSafetyGuard.assertSafeForProduction();
  isServerStarted = true;

  try {
    const app = express();
    const server = http.createServer(app);

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        Logger.info('WSServer', `Port ${PORT} is already in use.`);
      } else {
        Logger.error('WSServer', `HTTP server error: ${err.message}`);
      }
    });

    const wss = new WebSocketServer({ server });
    wss.on('error', (err: any) => {
      Logger.info('WSServer', `WebSocketServer error: ${err.message}`);
    });

    app.use(express.json());

    const staticPath = path.join(__dirname, '../app-desktop/public');
    if (!fs.existsSync(staticPath)) {
      fs.mkdirSync(staticPath, { recursive: true });
    }
    app.use(express.static(staticPath));

    app.get('/api/health', (req, res) => {
      try {
        const metrics = MetricsCollector.collectMetrics();
        const control = ControlService.getStatus();
        res.json({
          status: control.emergencyStopped ? 'EMERGENCY_STOP' : control.queuePaused ? 'PAUSED' : 'HEALTHY',
          metrics,
          control
        });
      } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
      }
    });

    app.get('/api/productions', (req, res) => {
      try {
        const db = getDatabase();
        const rows = db.prepare('SELECT * FROM productions ORDER BY updated_at DESC').all();
        res.json(rows);
      } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
      }
    });

    app.get('/api/productions/:id/telemetry', (req, res) => {
      try {
        const db = getDatabase();
        const rows = db.prepare('SELECT * FROM agent_events WHERE production_id = ? ORDER BY timestamp ASC').all(req.params.id);
        const events = rows.map((r: any) => {
          try { return JSON.parse(r.payload); } catch { return r; }
        });
        res.json(events);
      } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
      }
    });

    app.get('/api/control/status', (req, res) => {
      try {
        res.json({ ok: true, ...ControlService.getStatus() });
      } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
      }
    });

    app.post('/api/control/pause-new-jobs', (req, res) => {
      try {
        res.json(ControlService.pauseNewJobs(req.body?.requested_by || 'user'));
      } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
      }
    });

    app.post('/api/control/resume-queue', (req, res) => {
      try {
        res.json(ControlService.resumeQueue(req.body?.requested_by || 'user'));
      } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
      }
    });

    app.post('/api/control/emergency-stop', (req, res) => {
      try {
        res.json(ControlService.emergencyStop(req.body?.reason || 'UNSPECIFIED', req.body?.requested_by || 'user'));
      } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
      }
    });

    app.post('/api/control/emergency-release', (req, res) => {
      try {
        res.json(ControlService.emergencyRelease(req.body?.reason || 'HUMAN_RELEASE', req.body?.requested_by || 'user'));
      } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
      }
    });

    app.post('/api/control/reconcile-state', (req, res) => {
      try {
        res.json(ControlService.reconcileState());
      } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
      }
    });

    app.post('/api/control/create-backup', async (req, res) => {
      try {
        res.json(await ControlService.createBackup());
      } catch (err: any) {
        res.status(500).json({ ok: false, error: err.message });
      }
    });

    wss.on('connection', (ws: WebSocket) => {
      Logger.info('WSServer', 'Dashboard client connected.');
      ws.send(JSON.stringify({
        event_type: 'SYSTEM_CONNECTED',
        message: 'Connected to B2 Mission Control realtime event bus'
      }));

      try {
        const db = getDatabase();
        const rows = db.prepare('SELECT payload FROM agent_events ORDER BY timestamp DESC LIMIT 50').all();
        const events = rows.map((r: any) => JSON.parse(r.payload)).reverse();
        ws.send(JSON.stringify({ event_type: 'TELEMETRY_REPLAY', events }));
      } catch (err: any) {
        Logger.warn('WSServer', `Replay failed: ${err.message}`);
      }
    });

    EventBus.getInstance().on('agent_event', (event: AgentEvent) => {
      const payload = JSON.stringify(event.payload || event);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    });

    server.listen(PORT, () => {
      Logger.info('WSServer', `B2 Mission Control dashboard running at http://localhost:${PORT}`);
    });
  } catch (err: any) {
    Logger.info('WSServer', `Server already active at http://localhost:${PORT}: ${err.message}`);
  }
}

if (require.main === module) {
  startMissionControlServer();
}
