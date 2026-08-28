import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { BaseAdapter } from './baseAdapter';
import { Logger } from '../event-hub/logger';
import { AgentTelemetryAdapter } from './agentTelemetryAdapter';
import { spawnSync } from 'child_process';

export interface ElevenLabsSynthesizeOptions {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

export class ElevenLabsAdapter extends BaseAdapter {
  private apiKey: string;
  private voiceId: string;
  private modelId: string;
  private telemetry: AgentTelemetryAdapter;

  constructor() {
    super('ElevenLabsAdapter');
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    this.voiceId = process.env.ELEVENLABS_VOICE_ID || 'iP95p4xoKVk53GoZ742B'; // Chris
    this.modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
    this.telemetry = AgentTelemetryAdapter.getInstance();
  }

  public async initialize(): Promise<void> {
    Logger.info(this.name, `Inicializado. Voz Oficial: Chris (${this.voiceId}) | Modelo: ${this.modelId}`);
  }

  public async checkHealth(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.startsWith('sk_'));
  }

  /**
   * Sintetiza um texto usando a API oficial da ElevenLabs
   */
  public async synthesizeText(
    text: string,
    outputPath: string,
    options?: ElevenLabsSynthesizeOptions
  ): Promise<{ outputPath: string; durationSeconds: number }> {
    const voiceId = options?.voiceId || this.voiceId;
    const modelId = options?.modelId || this.modelId;
    const stability = options?.stability ?? 0.50;
    const similarityBoost = options?.similarityBoost ?? 0.80;

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost
        }
      });

      const reqOptions = {
        hostname: 'api.elevenlabs.io',
        port: 443,
        path: `/v1/text-to-speech/${voiceId}`,
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(reqOptions, (res) => {
        if (res.statusCode !== 200) {
          let errorBody = '';
          res.on('data', (chunk) => (errorBody += chunk));
          res.on('end', () => {
            reject(new Error(`ElevenLabs API returned ${res.statusCode}: ${errorBody}`));
          });
          return;
        }

        const fileStream = fs.createWriteStream(outputPath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();

          // Obter duração real via ffprobe
          try {
            const probe = spawnSync('ffprobe', [
              '-v', 'error',
              '-show_entries', 'format=duration',
              '-of', 'default=noprint_wrappers=1:nokey=1',
              outputPath
            ], { encoding: 'utf8' });

            const durationSeconds = parseFloat(probe.stdout.trim()) || 0;
            resolve({ outputPath, durationSeconds });
          } catch {
            resolve({ outputPath, durationSeconds: 0 });
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.write(payload);
      req.end();
    });
  }
}
