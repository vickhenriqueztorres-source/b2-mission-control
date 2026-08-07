"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
class CleanupManager {
    static cleanupStaging(runDir, strategy) {
        const cleanupLog = { timestamp: new Date().toISOString(), strategy, actions: [] };
        try {
            // 1. Matar processos robóticos orfãos se necessário
            if (strategy === 'KILL_ORPHAN_PROCESSES' || strategy === 'FULL_STAGING_RESET') {
                try {
                    (0, child_process_1.execSync)('taskkill /F /IM chrome.exe /T', { stdio: 'ignore' });
                    cleanupLog.actions.push('Processos Chrome encerrados.');
                }
                catch (e) { }
            }
            // 2. Limpar arquivos temporários na pasta do run do caos (preservando evidências oficiais)
            const tmpFiles = fs_1.default.readdirSync(runDir).filter(f => f.endsWith('.tmp') || f.endsWith('.lock'));
            tmpFiles.forEach(f => {
                fs_1.default.unlinkSync(path_1.default.join(runDir, f));
                cleanupLog.actions.push(`Arquivo temporário removido: ${f}`);
            });
            cleanupLog.actions.push('Ambiente de staging limpo com sucesso.');
        }
        catch (err) {
            cleanupLog.actions.push(`Aviso durante cleanup: ${err.message}`);
        }
        const cleanupJsonPath = path_1.default.join(runDir, 'cleanup.json');
        fs_1.default.writeFileSync(cleanupJsonPath, JSON.stringify(cleanupLog, null, 2), 'utf-8');
    }
}
exports.CleanupManager = CleanupManager;
