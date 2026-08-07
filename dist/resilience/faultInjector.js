"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaultInjector = void 0;
const fs_1 = __importDefault(require("fs"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const diskSpaceProvider_1 = require("./diskSpaceProvider");
class FaultInjector {
    stagingDir;
    constructor(stagingDir) {
        this.stagingDir = stagingDir;
    }
    // CHAOS-001: Esquema Inválido
    injectInvalidSchema(filePath) {
        const invalidJson = {
            version: 'invalid_v999',
            items: [
                { name: 'SHOT_INVALID', missing_required_fields: true }
            ]
        };
        fs_1.default.writeFileSync(filePath, JSON.stringify(invalidJson, null, 2), 'utf-8');
    }
    // CHAOS-002: Start Frame Inexistente
    injectMissingStartFrame(guidePath) {
        const guide = {
            items: [
                {
                    name: 'SHOT_01_TAKE_01',
                    prompt: 'Cinematic slow push-in',
                    start_frame_path: 'C:\\B2-AI-STUDIO\\non_existent_folder\\missing_frame_9999.png'
                }
            ]
        };
        fs_1.default.writeFileSync(guidePath, JSON.stringify(guide, null, 2), 'utf-8');
    }
    // CHAOS-003: Take Duplicado
    injectDuplicateTake(guidePath) {
        const guide = {
            items: [
                { name: 'SHOT_01_TAKE_01', prompt: 'Cinematic slow push-in' },
                { name: 'SHOT_01_TAKE_01', prompt: 'Cinematic slow push-in DUPLICATE' }
            ]
        };
        fs_1.default.writeFileSync(guidePath, JSON.stringify(guide, null, 2), 'utf-8');
    }
    // CHAOS-005: MP4 Incompleto (0 bytes ou truncado)
    injectIncompleteMp4(mp4Path) {
        fs_1.default.writeFileSync(mp4Path, Buffer.from('INCOMPLETE_HEADER_TRUNCATED_BYTES'), 'utf-8');
    }
    // CHAOS-008: SQLite Bloqueado
    injectSqliteLock(dbPath) {
        const db = new better_sqlite3_1.default(dbPath, { timeout: 10 });
        db.exec('BEGIN EXCLUSIVE TRANSACTION;');
        return db; // Mantém a transação aberta para simular lock
    }
    // CHAOS-010: Espaço em Disco Esgotado (Simulado via DiskSpaceProvider)
    injectDiskSpaceExhaustion() {
        diskSpaceProvider_1.DiskSpaceProvider.setSimulatedFreeSpace(1024); // Apenas 1 KB disponível
    }
    resetDiskSpaceExhaustion() {
        diskSpaceProvider_1.DiskSpaceProvider.setSimulatedFreeSpace(null);
    }
    // CHAOS-011: Sessão Deslogada
    mockStateReaderSessionLoggedOut() {
        return 'session_logged_out';
    }
    // CHAOS-012: Quota Esgotada
    mockStateReaderQuotaExhausted() {
        return 'quota_exhausted';
    }
    // CHAOS-013: Prompt Rejeitado (Filtro de Segurança)
    mockStateReaderPromptRejected() {
        return 'failed-content';
    }
    // CHAOS-014: Timeout no Worker
    mockStateReaderTimeout() {
        return 'still_generating_timeout';
    }
    // CHAOS-015: Chrome Travado
    mockStateReaderChromeFrozen() {
        return 'chrome_frozen';
    }
}
exports.FaultInjector = FaultInjector;
