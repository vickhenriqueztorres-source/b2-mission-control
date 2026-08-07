import { BaseAdapter } from './baseAdapter';
import path from 'path';
import fs from 'fs';
import { execSync, spawn, ChildProcess } from 'child_process';
import Database from 'better-sqlite3';
import { Logger } from '../event-hub/logger';
import { AgentTelemetryAdapter } from './agentTelemetryAdapter';
import { ProductionSafetyGuard } from '../config/productionSafetyGuard';

export class FireflyAdapter extends BaseAdapter {
  private fireflyPath: string;
  private pythonExec: string;
  private dbPath: string;
  private telemetry: AgentTelemetryAdapter;

  constructor(fireflyPath: string = 'C:\\B2-AI-STUDIO\\links\\firefly-automation') {
    super('FireflyAdapter');
    this.fireflyPath = path.resolve(fireflyPath);
    this.pythonExec = path.join(this.fireflyPath, '.venv', 'Scripts', 'python.exe');
    this.dbPath = path.join(this.fireflyPath, 'data', 'firefly_jobs.db');
    this.telemetry = AgentTelemetryAdapter.getInstance();
  }

  public async initialize(): Promise<void> {
    ProductionSafetyGuard.assertSafeForProduction();
    Logger.info(this.name, `Conectado ao Firefly Video Automation em: ${this.fireflyPath}`);
    if (!fs.existsSync(this.pythonExec)) {
      Logger.warn(this.name, `Python venv não encontrado em ${this.pythonExec}. Usando 'python' global.`);
      this.pythonExec = 'python';
    }
  }

  public async checkHealth(): Promise<boolean> {
    return fs.existsSync(this.dbPath);
  }

  public async feedGuideAndRunReal(
    productionId: string,
    guideJsonPath: string
  ): Promise<{ success: boolean; completedJobs: Array<{ name: string; output_path: string }> }> {
    Logger.info(this.name, `[EXECUÇÃO REAL] Alimentando fila do Firefly com: ${guideJsonPath}`);

    ProductionSafetyGuard.assertSafeForProduction();

    this.telemetry.recordEvent({
      run_id: productionId,
      production_id: productionId,
      agent_id: 'FireflyJobStore',
      provider: 'FIREFLY_BOT',
      task_id: 'FEED_GUIDE',
      type: 'JOB_SUBMITTED',
      status: 'PENDING',
      message: `Guia de produção enviada ao Firefly JobStore: ${path.basename(guideJsonPath)}`,
      artifact_path: guideJsonPath,
      attempt: 1
    });

    // 1. Ler itens na guia para identificar nomes de saída e limpar arquivos MP4 antigos na pasta `saida/` (evita FileExistsError)
    const rawGuide = fs.readFileSync(guideJsonPath, 'utf-8');
    const parsedGuide = JSON.parse(rawGuide);
    const items = parsedGuide.items || (Array.isArray(parsedGuide) ? parsedGuide : [parsedGuide]);
    const jobNames: string[] = items.map((i: any) => i.name);

    const saidaDir = path.join(this.fireflyPath, 'saida');
    for (const jobName of jobNames) {
      const existingMp4 = path.join(saidaDir, `${jobName}.mp4`);
      if (fs.existsSync(existingMp4)) {
        try {
          fs.unlinkSync(existingMp4);
          Logger.info(this.name, `Arquivo de saída antigo limpo: ${existingMp4}`);
        } catch (e: any) {
          Logger.warn(this.name, `Aviso ao remover saída antiga: ${e.message}`);
        }
      }
    }

    // 2. Limpar jobs pendentes/antigos na base SQLite para garantir FIFO correto
    try {
      const db = new Database(this.dbPath);
      db.prepare("DELETE FROM jobs WHERE status != 'done'").run();
      db.prepare("UPDATE system_state SET status = 'running', reason = NULL WHERE singleton = 1").run();
      db.close();
      Logger.info(this.name, 'Base de dados do Firefly limpa de jobs pendentes antigos e system_state resetado para RUNNING.');
    } catch (e: any) {
      Logger.warn(this.name, `Aviso ao preparar banco SQLite: ${e.message}`);
    }

    // 3. Liberar perfil do Chrome
    try {
      execSync('taskkill /F /IM chrome.exe /T', { stdio: 'ignore' });
    } catch (e) {}

    // 4. Executar --feed-guide no Firefly Bot
    try {
      const feedCmd = `"${this.pythonExec}" -m firefly_bot.main --feed-guide "${guideJsonPath}"`;
      Logger.info(this.name, `Executando: ${feedCmd}`);
      const feedOutput = execSync(feedCmd, { cwd: this.fireflyPath, encoding: 'utf-8' });
      Logger.info(this.name, `Feed Output: ${feedOutput.trim()}`);
    } catch (err: any) {
      this.telemetry.recordEvent({
        run_id: productionId,
        production_id: productionId,
        agent_id: 'FireflyJobStore',
        provider: 'FIREFLY_BOT',
        task_id: 'FEED_GUIDE',
        type: 'AGENT_FAILED',
        status: 'FAILED',
        message: `Falha ao alimentar guia no Firefly: ${err.message}`,
        attempt: 1
      });
      throw err;
    }

    Logger.info(this.name, `Monitorando jobs na base SQLite real: ${jobNames.join(', ')}`);

    // 5. Função para disparar worker do Firefly
    let runWorker: ChildProcess | null = null;
    const startWorkerProc = () => {
      runWorker = spawn(this.pythonExec, ['-m', 'firefly_bot.main', '--run'], {
        cwd: this.fireflyPath,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      runWorker.stdout?.on('data', (data) => {
        const line = data.toString().trim();
        if (line) Logger.info('FireflyWorkerProc', line);
      });

      runWorker.stderr?.on('data', (data) => {
        const line = data.toString().trim();
        if (line) Logger.warn('FireflyWorkerProc', line);
      });
    };

    startWorkerProc();

    // 6. Polling na tabela `jobs` do SQLite real do Firefly
    const completedJobs: Array<{ name: string; output_path: string }> = [];
    const maxRetries = 180; // até 15 minutos (5s * 180)
    let retries = 0;

    while (retries < maxRetries) {
      await new Promise(r => setTimeout(r, 5000));
      retries++;

      try {
        const db = new Database(this.dbPath, { readonly: true });
        let allDone = true;

        for (const jobName of jobNames) {
          const row: any = db.prepare('SELECT * FROM jobs WHERE name = ? ORDER BY id DESC LIMIT 1').get(jobName);
          if (row) {
            const stateReaderStatus = row.status === 'done' ? 'RESULT_READY' : (row.status === 'generating' || row.status === 'claimed' ? 'STILL_GENERATING' : row.status);
            
            const eventType = row.status === 'done' ? 'JOB_COMPLETED' : (row.status === 'generating' || row.status === 'claimed' ? 'AGENT_ACTIVITY' : 'JOB_SUBMITTED');
            const statusMap: Record<string, any> = {
              'done': 'SUCCESS',
              'generating': 'STILL_GENERATING',
              'claimed': 'STILL_GENERATING',
              'pending': 'PENDING',
              'failed-infra': 'FAILED',
              'failed-content': 'FAILED'
            };

            this.telemetry.recordEvent({
              run_id: productionId,
              production_id: productionId,
              agent_id: `FireflyWorker_${row.name}`,
              provider: 'FIREFLY_BOT',
              task_id: `JOB_${row.id}`,
              type: eventType,
              status: statusMap[row.status] || 'RUNNING',
              message: `Job #${row.id} (${row.name}) - StateReader: ${stateReaderStatus} (Elapsed: ${retries * 5}s)`,
              artifact_path: row.output_path || undefined,
              attempt: row.attempts || 1,
              payload: {
                job_id: row.id,
                shot_id: row.name,
                take_id: 'TAKE_01',
                state_reader_status: stateReaderStatus,
                elapsed_seconds: retries * 5,
                last_observation: `Status do SQLite: ${row.status}`,
                output_path: row.output_path
              }
            });

            if (row.status === 'done' && row.output_path && fs.existsSync(row.output_path)) {
              if (!completedJobs.find(j => j.name === row.name)) {
                completedJobs.push({ name: row.name, output_path: row.output_path });
              }
            } else if (row.status === 'failed-infra') {
              db.close();
              if (runWorker) (runWorker as ChildProcess).kill();
              throw new Error(`Job '${row.name}' falhou no Firefly por infraestrutura (${row.error || 'erro desconhecido'}).`);
            } else if (row.status === 'failed-content') {
              db.close();
              if (runWorker) (runWorker as ChildProcess).kill();
              this.telemetry.recordEvent({
                run_id: productionId,
                production_id: productionId,
                agent_id: `FireflyWorker_${row.name}`,
                provider: 'FIREFLY_BOT',
                task_id: `JOB_${row.id}`,
                type: 'AGENT_FAILED',
                status: 'FAILED',
                message: `Job '${row.name}' falhou por política de conteúdo.`,
                attempt: row.attempts || 1
              });
              throw new Error(`Job '${row.name}' falhou no Firefly por política de conteúdo.`);
            } else {
              allDone = false;
            }
          } else {
            allDone = false;
          }
        }

        db.close();

        if (allDone && completedJobs.length === jobNames.length) {
          Logger.info(this.name, `Todos os ${completedJobs.length} jobs foram concluídos com SUCESSO!`);
          if (runWorker) (runWorker as ChildProcess).kill();
          return { success: true, completedJobs };
        }
      } catch (err: any) {
        if (err.message.includes('falhou no Firefly')) {
          throw err;
        }
        Logger.warn(this.name, `Erro na leitura do SQLite: ${err.message}`);
      }
    }

    if (runWorker) (runWorker as ChildProcess).kill();
    throw new Error('TIMEOUT: O Firefly Worker não concluiu a geração dentro do tempo limite.');
  }

  public async feedGuideAndRun(
    productionId: string,
    guideJsonPath: string
  ): Promise<{ success: boolean; completedJobs: Array<{ name: string; output_path: string }> }> {
    return this.feedGuideAndRunReal(productionId, guideJsonPath);
  }
}
