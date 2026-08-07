"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionPilotRunner = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const productionSafetyGuard_1 = require("../config/productionSafetyGuard");
const mediaValidator_1 = require("../media/mediaValidator");
const FIREFLY_ROOT = 'C:\\B2-AI-STUDIO\\links\\firefly-automation';
const DEFAULT_SOURCE_IMAGE = 'C:\\B2-AI-STUDIO\\mission-control\\runs\\REAL-E2E-003\\imagens\\SHOT_01_TAKE_02_TAKE_01_start.png';
const DEFAULT_PROMPT = 'Medium side-profile shot of a man looking calmly toward office window, soft rim lighting, 50mm lens';
class ProductionPilotRunner {
    static async runProductionPilot() {
        productionSafetyGuard_1.ProductionSafetyGuard.assertSafeForProduction();
        const runDir = path_1.default.resolve(process.cwd(), 'runs', 'RC2-PILOT');
        const imagesDir = path_1.default.join(runDir, 'imagens');
        const videosDir = path_1.default.join(runDir, 'videos');
        fs_1.default.rmSync(runDir, { recursive: true, force: true });
        fs_1.default.mkdirSync(imagesDir, { recursive: true });
        fs_1.default.mkdirSync(videosDir, { recursive: true });
        const sourceImage = process.env.RC2_PILOT_SOURCE_IMAGE || DEFAULT_SOURCE_IMAGE;
        const prompt = process.env.RC2_PILOT_PROMPT || DEFAULT_PROMPT;
        if (!fs_1.default.existsSync(sourceImage)) {
            throw new Error(`RC2_PILOT_SOURCE_IMAGE not found: ${sourceImage}`);
        }
        const items = [];
        for (let production = 1; production <= 5; production++) {
            for (let take = 1; take <= 4; take++) {
                const name = `RC2_PILOT_P${String(production).padStart(2, '0')}_TAKE_${String(take).padStart(2, '0')}`;
                const image = `${name}.png`;
                fs_1.default.copyFileSync(sourceImage, path_1.default.join(imagesDir, image));
                items.push({ image, prompt, name });
            }
        }
        const guidePath = path_1.default.join(runDir, 'firefly_guide.json');
        fs_1.default.writeFileSync(guidePath, JSON.stringify({
            model: 'Kling 3.0',
            resolution: '720p',
            aspect_ratio: '9:16',
            duration_seconds: 5,
            items
        }, null, 2), 'utf8');
        this.prepareFireflyQueue(items.map((item) => item.name));
        this.runFirefly(['-m', 'firefly_bot.main', '--feed-guide', guidePath], path_1.default.join(runDir, 'feed_output.txt'));
        this.runFirefly(['-m', 'firefly_bot.main', '--run'], path_1.default.join(runDir, 'worker_output.txt'));
        const rows = this.readPilotRows(items.map((item) => item.name));
        const productions = [];
        const ffprobeResults = [];
        for (let production = 1; production <= 5; production++) {
            const productionId = `RC2-PILOT-P${String(production).padStart(2, '0')}`;
            const takes = [];
            for (let take = 1; take <= 4; take++) {
                const takeName = `RC2_PILOT_P${String(production).padStart(2, '0')}_TAKE_${String(take).padStart(2, '0')}`;
                const row = rows.find((candidate) => candidate.name === takeName);
                if (!row || row.status !== 'done' || !row.output_path) {
                    throw new Error(`RC2 pilot job did not finish as real done media: ${takeName}`);
                }
                const validation = (0, mediaValidator_1.validateVideoWithFfprobe)(row.output_path);
                ffprobeResults.push({ takeName, ...validation });
                if (!validation.valid || validation.ffprobe_exit_code !== 0) {
                    throw new Error(`FAILED_MEDIA_VALIDATION: ${takeName}`);
                }
                const copiedVideo = path_1.default.join(videosDir, `${takeName}.mp4`);
                fs_1.default.copyFileSync(validation.absolute_path, copiedVideo);
                takes.push({
                    take_name: takeName,
                    job_id: row.id,
                    status: 'done',
                    sha256: validation.sha256,
                    file_path: copiedVideo,
                    width: validation.width,
                    height: validation.height,
                    duration_seconds: validation.duration_seconds,
                    codec: validation.codec
                });
            }
            const productionDir = path_1.default.join(runDir, productionId);
            fs_1.default.mkdirSync(productionDir, { recursive: true });
            fs_1.default.writeFileSync(path_1.default.join(productionDir, 'manual_kling_clip_intake.json'), JSON.stringify({ production_id: productionId, takes_processed: takes.length, items: takes }, null, 2), 'utf8');
            fs_1.default.writeFileSync(path_1.default.join(productionDir, 'REPORT.md'), `# ${productionId}\n\nResult: PASS\n\nTakes processed: ${takes.length}\n`, 'utf8');
            productions.push({ production_id: productionId, takes_count: takes.length, takes, status: 'COMPLETED' });
        }
        fs_1.default.writeFileSync(path_1.default.join(runDir, 'ffprobe_results.json'), JSON.stringify(ffprobeResults, null, 2), 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(runDir, 'pilot_results.json'), JSON.stringify({ success: true, productions }, null, 2), 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(runDir, 'REPORT.md'), `# RC2-PILOT\n\nResult: PASS\n\nProductions: 5\nTakes: 20\nAll videos passed ffprobe exit code 0.\n`, 'utf8');
        return { success: true, productions };
    }
    static pythonExecutable() {
        const venvPython = path_1.default.join(FIREFLY_ROOT, '.venv', 'Scripts', 'python.exe');
        return fs_1.default.existsSync(venvPython) ? venvPython : 'python';
    }
    static prepareFireflyQueue(pilotNames) {
        const dbPath = path_1.default.join(FIREFLY_ROOT, 'data', 'firefly_jobs.db');
        const db = new better_sqlite3_1.default(dbPath);
        try {
            db.prepare("DELETE FROM jobs WHERE status != 'done'").run();
            for (const name of pilotNames) {
                const existingOutput = path_1.default.join(FIREFLY_ROOT, 'saida', `${name}.mp4`);
                if (fs_1.default.existsSync(existingOutput)) {
                    fs_1.default.unlinkSync(existingOutput);
                }
            }
            db.prepare("UPDATE system_state SET status='running', reason=NULL, updated_at=? WHERE singleton=1").run(Date.now() / 1000);
        }
        finally {
            db.close();
        }
    }
    static runFirefly(args, outputPath) {
        const result = (0, child_process_1.spawnSync)(this.pythonExecutable(), args, {
            cwd: FIREFLY_ROOT,
            encoding: 'utf8',
            maxBuffer: 1024 * 1024 * 20
        });
        fs_1.default.writeFileSync(outputPath, `${result.stdout || ''}\n${result.stderr || ''}`, 'utf8');
        if (result.status !== 0 && result.status !== 10) {
            throw new Error(`Firefly command failed (${result.status}): ${args.join(' ')}`);
        }
    }
    static readPilotRows(names) {
        const db = new better_sqlite3_1.default(path_1.default.join(FIREFLY_ROOT, 'data', 'firefly_jobs.db'), { readonly: true });
        try {
            const placeholders = names.map(() => '?').join(', ');
            return db.prepare(`SELECT id, name, status, output_path FROM jobs WHERE name IN (${placeholders}) ORDER BY id`).all(...names);
        }
        finally {
            db.close();
        }
    }
}
exports.ProductionPilotRunner = ProductionPilotRunner;
if (require.main === module) {
    ProductionPilotRunner.runProductionPilot()
        .then((result) => {
        console.log(JSON.stringify(result, null, 2));
    })
        .catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
