"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FireflyAdapter = void 0;
const baseAdapter_1 = require("./baseAdapter");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const logger_1 = require("../event-hub/logger");
const agentTelemetryAdapter_1 = require("./agentTelemetryAdapter");
const productionSafetyGuard_1 = require("../config/productionSafetyGuard");
class FireflyAdapter extends baseAdapter_1.BaseAdapter {
    fireflyPath;
    pythonExec;
    dbPath;
    telemetry;
    constructor(fireflyPath = 'C:\\B2-AI-STUDIO\\links\\firefly-automation') {
        super('FireflyAdapter');
        this.fireflyPath = path_1.default.resolve(fireflyPath);
        this.pythonExec = path_1.default.join(this.fireflyPath, '.venv', 'Scripts', 'python.exe');
        this.dbPath = path_1.default.join(this.fireflyPath, 'data', 'firefly_jobs.db');
        this.telemetry = agentTelemetryAdapter_1.AgentTelemetryAdapter.getInstance();
    }
    async initialize() {
        productionSafetyGuard_1.ProductionSafetyGuard.assertSafeForProduction();
        logger_1.Logger.info(this.name, `Conectado ao Firefly Video Automation em: ${this.fireflyPath}`);
        if (!fs_1.default.existsSync(this.pythonExec)) {
            logger_1.Logger.warn(this.name, `Python venv não encontrado em ${this.pythonExec}. Usando 'python' global.`);
            this.pythonExec = 'python';
        }
    }
    async checkHealth() {
        return fs_1.default.existsSync(this.dbPath);
    }
    async feedGuideAndRunReal(productionId, guideJsonPath) {
        logger_1.Logger.info(this.name, `[EXECUÇÃO REAL] Alimentando fila do Firefly com: ${guideJsonPath}`);
        productionSafetyGuard_1.ProductionSafetyGuard.assertSafeForProduction();
        this.telemetry.recordEvent({
            run_id: productionId,
            production_id: productionId,
            agent_id: 'FireflyJobStore',
            provider: 'FIREFLY_BOT',
            task_id: 'FEED_GUIDE',
            type: 'JOB_SUBMITTED',
            status: 'PENDING',
            message: `Guia de produção enviada ao Firefly JobStore: ${path_1.default.basename(guideJsonPath)}`,
            artifact_path: guideJsonPath,
            attempt: 1
        });
        // 1. Ler itens na guia para identificar nomes de saída e limpar arquivos MP4 antigos na pasta `saida/` (evita FileExistsError)
        const rawGuide = fs_1.default.readFileSync(guideJsonPath, 'utf-8');
        const parsedGuide = JSON.parse(rawGuide);
        const items = parsedGuide.items || (Array.isArray(parsedGuide) ? parsedGuide : [parsedGuide]);
        const jobNames = items.map((i) => i.name);
        const saidaDir = path_1.default.join(this.fireflyPath, 'saida');
        for (const jobName of jobNames) {
            const existingMp4 = path_1.default.join(saidaDir, `${jobName}.mp4`);
            if (fs_1.default.existsSync(existingMp4)) {
                try {
                    fs_1.default.unlinkSync(existingMp4);
                    logger_1.Logger.info(this.name, `Arquivo de saída antigo limpo: ${existingMp4}`);
                }
                catch (e) {
                    logger_1.Logger.warn(this.name, `Aviso ao remover saída antiga: ${e.message}`);
                }
            }
        }
        // 2. Limpar jobs pendentes/antigos na base SQLite para garantir FIFO correto
        try {
            const db = new better_sqlite3_1.default(this.dbPath);
            db.prepare("DELETE FROM jobs WHERE status != 'done'").run();
            db.prepare("UPDATE system_state SET status = 'running', reason = NULL WHERE singleton = 1").run();
            db.close();
            logger_1.Logger.info(this.name, 'Base de dados do Firefly limpa de jobs pendentes antigos e system_state resetado para RUNNING.');
        }
        catch (e) {
            logger_1.Logger.warn(this.name, `Aviso ao preparar banco SQLite: ${e.message}`);
        }
        // 3. Liberar perfil do Chrome
        try {
            (0, child_process_1.execSync)('taskkill /F /IM chrome.exe /T', { stdio: 'ignore' });
        }
        catch (e) { }
        // 4. Executar --feed-guide no Firefly Bot
        try {
            const feedCmd = `"${this.pythonExec}" -m firefly_bot.main --feed-guide "${guideJsonPath}"`;
            logger_1.Logger.info(this.name, `Executando: ${feedCmd}`);
            const feedOutput = (0, child_process_1.execSync)(feedCmd, { cwd: this.fireflyPath, encoding: 'utf-8' });
            logger_1.Logger.info(this.name, `Feed Output: ${feedOutput.trim()}`);
        }
        catch (err) {
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
        logger_1.Logger.info(this.name, `Monitorando jobs na base SQLite real: ${jobNames.join(', ')}`);
        // 5. Função para disparar worker do Firefly
        let runWorker = null;
        const startWorkerProc = () => {
            runWorker = (0, child_process_1.spawn)(this.pythonExec, ['-m', 'firefly_bot.main', '--run'], {
                cwd: this.fireflyPath,
                stdio: ['ignore', 'pipe', 'pipe']
            });
            runWorker.stdout?.on('data', (data) => {
                const line = data.toString().trim();
                if (line)
                    logger_1.Logger.info('FireflyWorkerProc', line);
            });
            runWorker.stderr?.on('data', (data) => {
                const line = data.toString().trim();
                if (line)
                    logger_1.Logger.warn('FireflyWorkerProc', line);
            });
        };
        startWorkerProc();
        // 6. Polling na tabela `jobs` do SQLite real do Firefly
        const completedJobs = [];
        const maxRetries = 180; // até 15 minutos (5s * 180)
        let retries = 0;
        while (retries < maxRetries) {
            await new Promise(r => setTimeout(r, 5000));
            retries++;
            try {
                const db = new better_sqlite3_1.default(this.dbPath, { readonly: true });
                let allDone = true;
                for (const jobName of jobNames) {
                    const row = db.prepare('SELECT * FROM jobs WHERE name = ? ORDER BY id DESC LIMIT 1').get(jobName);
                    if (row) {
                        const stateReaderStatus = row.status === 'done' ? 'RESULT_READY' : (row.status === 'generating' || row.status === 'claimed' ? 'STILL_GENERATING' : row.status);
                        const eventType = row.status === 'done' ? 'JOB_COMPLETED' : (row.status === 'generating' || row.status === 'claimed' ? 'AGENT_ACTIVITY' : 'JOB_SUBMITTED');
                        const statusMap = {
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
                        if (row.status === 'done' && row.output_path && fs_1.default.existsSync(row.output_path)) {
                            if (!completedJobs.find(j => j.name === row.name)) {
                                completedJobs.push({ name: row.name, output_path: row.output_path });
                            }
                        }
                        else if (row.status === 'failed-infra') {
                            db.close();
                            if (runWorker)
                                runWorker.kill();
                            throw new Error(`Job '${row.name}' falhou no Firefly por infraestrutura (${row.error || 'erro desconhecido'}).`);
                        }
                        else if (row.status === 'failed-content') {
                            db.close();
                            if (runWorker)
                                runWorker.kill();
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
                        }
                        else {
                            allDone = false;
                        }
                    }
                    else {
                        allDone = false;
                    }
                }
                db.close();
                if (allDone && completedJobs.length === jobNames.length) {
                    logger_1.Logger.info(this.name, `Todos os ${completedJobs.length} jobs foram concluídos com SUCESSO!`);
                    if (runWorker)
                        runWorker.kill();
                    return { success: true, completedJobs };
                }
            }
            catch (err) {
                if (err.message.includes('falhou no Firefly')) {
                    throw err;
                }
                logger_1.Logger.warn(this.name, `Erro na leitura do SQLite: ${err.message}`);
            }
        }
        if (runWorker)
            runWorker.kill();
        throw new Error('TIMEOUT: O Firefly Worker não concluiu a geração dentro do tempo limite.');
    }
    async feedGuideAndRun(productionId, guideJsonPath) {
        return this.feedGuideAndRunReal(productionId, guideJsonPath);
    }
}
exports.FireflyAdapter = FireflyAdapter;
