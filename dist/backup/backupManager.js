"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
class BackupManager {
    static getBackupsRootDir() {
        const dir = path_1.default.resolve(process.cwd(), 'backups');
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        return dir;
    }
    static calculateFileHash(filePath) {
        const fileBuffer = fs_1.default.readFileSync(filePath);
        const hashSum = crypto_1.default.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }
    static async createBackup(customBackupId) {
        const backupId = customBackupId || `BKP_${Date.now()}`;
        const targetDir = path_1.default.join(this.getBackupsRootDir(), backupId);
        if (fs_1.default.existsSync(targetDir)) {
            fs_1.default.rmSync(targetDir, { recursive: true, force: true });
        }
        fs_1.default.mkdirSync(targetDir, { recursive: true });
        const fileEntries = [];
        const tableCounts = {};
        // 1. Copiar Bancos SQLite Oficiais se existirem
        const dataDir = path_1.default.resolve(process.cwd(), 'data');
        if (fs_1.default.existsSync(dataDir)) {
            const dbFiles = fs_1.default.readdirSync(dataDir).filter(f => f.endsWith('.db'));
            for (const dbFile of dbFiles) {
                const srcPath = path_1.default.join(dataDir, dbFile);
                const destPath = path_1.default.join(targetDir, 'data', dbFile);
                fs_1.default.mkdirSync(path_1.default.dirname(destPath), { recursive: true });
                fs_1.default.copyFileSync(srcPath, destPath);
                const sha256 = this.calculateFileHash(destPath);
                const stats = fs_1.default.statSync(destPath);
                fileEntries.push({ relative_path: `data/${dbFile}`, size_bytes: stats.size, sha256 });
                // Conta registros do SQLite
                try {
                    const db = new better_sqlite3_1.default(destPath);
                    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
                    for (const tbl of tables) {
                        const countRow = db.prepare(`SELECT COUNT(*) as count FROM ${tbl.name}`).get();
                        tableCounts[`${dbFile}:${tbl.name}`] = countRow.count;
                    }
                    db.close();
                }
                catch (e) { }
            }
        }
        // 2. Copiar Schemas JSON
        const schemasDir = path_1.default.resolve(process.cwd(), 'schemas');
        if (fs_1.default.existsSync(schemasDir)) {
            const schemas = fs_1.default.readdirSync(schemasDir).filter(f => f.endsWith('.json'));
            for (const schema of schemas) {
                const srcPath = path_1.default.join(schemasDir, schema);
                const destPath = path_1.default.join(targetDir, 'schemas', schema);
                fs_1.default.mkdirSync(path_1.default.dirname(destPath), { recursive: true });
                fs_1.default.copyFileSync(srcPath, destPath);
                const sha256 = this.calculateFileHash(destPath);
                const stats = fs_1.default.statSync(destPath);
                fileEntries.push({ relative_path: `schemas/${schema}`, size_bytes: stats.size, sha256 });
            }
        }
        // 3. Copiar Diretório de Execuções Runs
        const runsDir = path_1.default.resolve(process.cwd(), 'runs');
        if (fs_1.default.existsSync(runsDir)) {
            const copyDirRecursive = (src, dest, relBase) => {
                const items = fs_1.default.readdirSync(src);
                for (const item of items) {
                    const srcItem = path_1.default.join(src, item);
                    const relPath = path_1.default.join(relBase, item);
                    const destItem = path_1.default.join(dest, item);
                    const stats = fs_1.default.statSync(srcItem);
                    if (stats.isDirectory()) {
                        fs_1.default.mkdirSync(destItem, { recursive: true });
                        copyDirRecursive(srcItem, destItem, relPath);
                    }
                    else {
                        fs_1.default.copyFileSync(srcItem, destItem);
                        const sha256 = this.calculateFileHash(destItem);
                        fileEntries.push({ relative_path: relPath.replace(/\\/g, '/'), size_bytes: stats.size, sha256 });
                    }
                }
            };
            copyDirRecursive(runsDir, path_1.default.join(targetDir, 'runs'), 'runs');
        }
        const totalSizeBytes = fileEntries.reduce((acc, f) => acc + f.size_bytes, 0);
        const manifest = {
            backup_id: backupId,
            created_at: new Date().toISOString(),
            files: fileEntries,
            sqlite_tables: tableCounts,
            total_files: fileEntries.length,
            total_size_bytes: totalSizeBytes
        };
        fs_1.default.writeFileSync(path_1.default.join(targetDir, 'backup_manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
        return manifest;
    }
    static async verifyBackup(backupId) {
        const backupDir = path_1.default.join(this.getBackupsRootDir(), backupId);
        const manifestPath = path_1.default.join(backupDir, 'backup_manifest.json');
        const errors = [];
        if (!fs_1.default.existsSync(manifestPath)) {
            return { valid: false, errors: [`Manifesto de backup não encontrado em: ${manifestPath}`] };
        }
        const manifest = JSON.parse(fs_1.default.readFileSync(manifestPath, 'utf-8'));
        for (const entry of manifest.files) {
            const filePath = path_1.default.join(backupDir, entry.relative_path);
            if (!fs_1.default.existsSync(filePath)) {
                errors.push(`Arquivo faltante no backup: ${entry.relative_path}`);
                continue;
            }
            const currentHash = this.calculateFileHash(filePath);
            if (currentHash !== entry.sha256) {
                errors.push(`Hash SHA-256 incorreto para ${entry.relative_path}: esperado ${entry.sha256}, obtido ${currentHash}`);
            }
        }
        return { valid: errors.length === 0, errors };
    }
    static async restoreBackup(backupId, targetRestoreRootDir) {
        const verifyRes = await this.verifyBackup(backupId);
        if (!verifyRes.valid) {
            return { restored: false, errors: [`Impossível restaurar backup inválido: ${verifyRes.errors.join('; ')}`] };
        }
        const backupDir = path_1.default.join(this.getBackupsRootDir(), backupId);
        const manifestPath = path_1.default.join(backupDir, 'backup_manifest.json');
        const manifest = JSON.parse(fs_1.default.readFileSync(manifestPath, 'utf-8'));
        const targetRoot = targetRestoreRootDir || process.cwd();
        const errors = [];
        for (const entry of manifest.files) {
            const srcFile = path_1.default.join(backupDir, entry.relative_path);
            const destFile = path_1.default.join(targetRoot, entry.relative_path);
            try {
                fs_1.default.mkdirSync(path_1.default.dirname(destFile), { recursive: true });
                fs_1.default.copyFileSync(srcFile, destFile);
                const restoredHash = this.calculateFileHash(destFile);
                if (restoredHash !== entry.sha256) {
                    errors.push(`Falha de integridade ao restaurar ${entry.relative_path}`);
                }
            }
            catch (err) {
                errors.push(`Erro ao restaurar ${entry.relative_path}: ${err.message}`);
            }
        }
        return { restored: errors.length === 0, errors };
    }
}
exports.BackupManager = BackupManager;
