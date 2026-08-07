"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaBackupManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const child_process_1 = require("child_process");
const MEDIA_EXTENSIONS = new Set([
    '.mp4',
    '.mov',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.wav',
    '.mp3',
    '.aac',
    '.json',
    '.md'
]);
class MediaBackupManager {
    static repoRoot() {
        return process.cwd();
    }
    static auditDir() {
        const dir = path_1.default.join(this.repoRoot(), 'runs', 'MEDIA-BACKUP-001');
        fs_1.default.mkdirSync(dir, { recursive: true });
        return dir;
    }
    static configPath() {
        return path_1.default.join(this.repoRoot(), 'config', 'media-full-backup.json');
    }
    static loadConfig() {
        const raw = fs_1.default.readFileSync(this.configPath(), 'utf8');
        const config = JSON.parse(raw);
        const envDestination = process.env.MEDIA_BACKUP_DESTINATION || process.env.MEDIA_FULL_BACKUP_DESTINATION;
        if (envDestination) {
            config.destination_root = envDestination;
        }
        return config;
    }
    static hash(filePath) {
        return crypto_1.default.createHash('sha256').update(fs_1.default.readFileSync(filePath)).digest('hex');
    }
    static validateMp4(filePath) {
        const probe = (0, child_process_1.spawnSync)('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', filePath], { encoding: 'utf8' });
        if (probe.status !== 0) {
            return { valid: false, ffprobe_exit_code: probe.status, ffprobe_stderr: probe.stderr || '' };
        }
        try {
            const parsed = JSON.parse(probe.stdout || '{}');
            const streams = Array.isArray(parsed.streams) ? parsed.streams : [];
            const video = streams.find((stream) => stream.codec_type === 'video');
            const width = Number(video?.width || 0);
            const height = Number(video?.height || 0);
            const duration = Number(parsed.format?.duration || video?.duration || 0);
            if (video && width > 0 && height > 0 && duration > 0) {
                return { valid: true };
            }
            return { valid: false, ffprobe_exit_code: probe.status, ffprobe_stderr: 'ffprobe succeeded but no valid video stream/dimensions/duration were found.' };
        }
        catch (err) {
            return { valid: false, ffprobe_exit_code: probe.status, ffprobe_stderr: `ffprobe JSON parse failed: ${err.message}` };
        }
    }
    static isInside(child, parent) {
        const relative = path_1.default.relative(path_1.default.resolve(parent), path_1.default.resolve(child));
        return relative === '' || (!!relative && !relative.startsWith('..') && !path_1.default.isAbsolute(relative));
    }
    static validateDestination(config) {
        if (!config.destination_root) {
            return { ok: false, reason: 'MEDIA_BACKUP_DESTINATION_REQUIRED: No external destination_root configured. Set config/media-full-backup.json, MEDIA_BACKUP_DESTINATION, or MEDIA_FULL_BACKUP_DESTINATION.' };
        }
        const destination = path_1.default.resolve(config.destination_root);
        for (const source of config.source_roots) {
            const resolvedSource = path_1.default.resolve(source);
            if (this.isInside(destination, resolvedSource)) {
                return { ok: false, reason: `Destination ${destination} is inside source root ${resolvedSource}.` };
            }
        }
        const sourceDrives = new Set(config.source_roots.map((source) => path_1.default.parse(path_1.default.resolve(source)).root.toLowerCase()));
        const destinationDrive = path_1.default.parse(destination).root.toLowerCase();
        if (sourceDrives.has(destinationDrive) && process.env.MEDIA_FULL_BACKUP_ALLOW_SAME_DRIVE !== 'true') {
            return { ok: false, reason: `Destination ${destination} is on the same drive root as a source. Configure an external/NAS/cloud-synced destination or set an explicit override only for controlled testing.` };
        }
        return { ok: true, destination };
    }
    static listFiles(root) {
        if (!fs_1.default.existsSync(root))
            return [];
        const out = [];
        const walk = (dir) => {
            for (const item of fs_1.default.readdirSync(dir, { withFileTypes: true })) {
                const full = path_1.default.join(dir, item.name);
                if (item.isDirectory()) {
                    walk(full);
                }
                else if (item.isFile() && MEDIA_EXTENSIONS.has(path_1.default.extname(item.name).toLowerCase())) {
                    out.push(full);
                }
            }
        };
        walk(root);
        return out;
    }
    static writeBlocked(reason) {
        const dir = this.auditDir();
        const payload = {
            generated_at: new Date().toISOString(),
            policy: 'media-full-backup',
            result: 'BLOCKED',
            reason
        };
        fs_1.default.writeFileSync(path_1.default.join(dir, 'media_backup_manifest.json'), JSON.stringify(payload, null, 2), 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(dir, 'source_hashes.json'), JSON.stringify({ generated_at: payload.generated_at, files: [] }, null, 2), 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(dir, 'destination_hashes.json'), JSON.stringify({ generated_at: payload.generated_at, files: [] }, null, 2), 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(dir, 'restore_hashes.json'), JSON.stringify({ generated_at: payload.generated_at, files: [] }, null, 2), 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(dir, 'ffprobe_restore_results.json'), JSON.stringify({ generated_at: payload.generated_at, files: [] }, null, 2), 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(dir, 'REPORT.md'), `# MEDIA-BACKUP-001\n\nResult: BLOCKED\n\nReason: ${reason}\n`, 'utf8');
    }
    static create() {
        const config = this.loadConfig();
        const destinationCheck = this.validateDestination(config);
        if (!destinationCheck.ok) {
            this.writeBlocked(destinationCheck.reason);
            return { blocked: true, reason: destinationCheck.reason };
        }
        const backupId = `MEDIA_FULL_BACKUP_${Date.now()}`;
        const backupRoot = path_1.default.join(destinationCheck.destination, backupId);
        fs_1.default.mkdirSync(backupRoot, { recursive: true });
        const entries = [];
        const sourceHashes = [];
        const skippedInvalidMp4s = [];
        for (const sourceRoot of config.source_roots) {
            const resolvedRoot = path_1.default.resolve(sourceRoot);
            for (const source of this.listFiles(resolvedRoot)) {
                const stats = fs_1.default.statSync(source);
                if (path_1.default.extname(source).toLowerCase() === '.mp4') {
                    const mp4Validation = this.validateMp4(source);
                    if (!mp4Validation.valid) {
                        skippedInvalidMp4s.push({
                            source,
                            size_bytes: stats.size,
                            ffprobe_exit_code: mp4Validation.ffprobe_exit_code,
                            ffprobe_stderr: mp4Validation.ffprobe_stderr
                        });
                        continue;
                    }
                }
                const rootName = path_1.default.basename(resolvedRoot);
                const relative = path_1.default.join(rootName, path_1.default.relative(resolvedRoot, source));
                const destination = path_1.default.join(backupRoot, relative);
                fs_1.default.mkdirSync(path_1.default.dirname(destination), { recursive: true });
                fs_1.default.copyFileSync(source, destination);
                const sha256 = this.hash(source);
                const copiedSha = this.hash(destination);
                const verification = config.verify_sha256 ? (sha256 === copiedSha ? 'PASS' : 'FAIL') : 'NOT_RUN';
                sourceHashes.push({ source, size_bytes: stats.size, sha256 });
                entries.push({
                    source,
                    destination,
                    size_bytes: stats.size,
                    sha256,
                    copied_at: new Date().toISOString(),
                    policy: config.policy,
                    copied_file: relative.replace(/\\/g, '/'),
                    verification_result: verification
                });
            }
        }
        const manifest = {
            backup_id: backupId,
            policy: config.policy,
            created_at: new Date().toISOString(),
            destination_root: destinationCheck.destination,
            verify_sha256: config.verify_sha256,
            media_files_included: entries.some((entry) => path_1.default.extname(entry.source).toLowerCase() === '.mp4'),
            mp4_source_valid_count: entries.filter((entry) => path_1.default.extname(entry.source).toLowerCase() === '.mp4').length,
            mp4_copied_count: entries.filter((entry) => path_1.default.extname(entry.destination).toLowerCase() === '.mp4').length,
            skipped_invalid_mp4_count: skippedInvalidMp4s.length,
            files: entries,
            total_files: entries.length,
            total_size_bytes: entries.reduce((sum, entry) => sum + entry.size_bytes, 0)
        };
        fs_1.default.writeFileSync(path_1.default.join(backupRoot, 'media_backup_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
        const dir = this.auditDir();
        fs_1.default.writeFileSync(path_1.default.join(dir, 'media_backup_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(dir, 'source_hashes.json'), JSON.stringify({ generated_at: manifest.created_at, files: sourceHashes }, null, 2), 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(dir, 'destination_hashes.json'), JSON.stringify({
            generated_at: manifest.created_at,
            files: entries.map((entry) => ({ destination: entry.destination, size_bytes: entry.size_bytes, sha256: this.hash(entry.destination), verification_result: entry.verification_result }))
        }, null, 2), 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(dir, 'skipped_invalid_mp4s.json'), JSON.stringify({ generated_at: manifest.created_at, files: skippedInvalidMp4s }, null, 2), 'utf8');
        return manifest;
    }
    static verify(backupId) {
        const config = this.loadConfig();
        const destinationCheck = this.validateDestination(config);
        if (!destinationCheck.ok) {
            this.writeBlocked(destinationCheck.reason);
            return { blocked: true, reason: destinationCheck.reason };
        }
        if (!backupId) {
            return { valid: false, errors: ['Missing --backup <ID>.'] };
        }
        const manifestPath = path_1.default.join(destinationCheck.destination, backupId, 'media_backup_manifest.json');
        if (!fs_1.default.existsSync(manifestPath)) {
            return { valid: false, errors: [`Manifest not found: ${manifestPath}`] };
        }
        const manifest = JSON.parse(fs_1.default.readFileSync(manifestPath, 'utf8'));
        const errors = [];
        for (const entry of manifest.files) {
            if (!fs_1.default.existsSync(entry.destination)) {
                errors.push(`Missing copied file: ${entry.destination}`);
                continue;
            }
            const actual = this.hash(entry.destination);
            if (actual !== entry.sha256) {
                errors.push(`Hash mismatch: ${entry.destination}`);
            }
        }
        return { valid: errors.length === 0, errors };
    }
    static restore(backupId, restoreRoot) {
        const config = this.loadConfig();
        const destinationCheck = this.validateDestination(config);
        if (!destinationCheck.ok) {
            this.writeBlocked(destinationCheck.reason);
            return { blocked: true, reason: destinationCheck.reason };
        }
        if (!backupId) {
            return { restored: false, errors: ['Missing --backup <ID>.'] };
        }
        const manifestPath = path_1.default.join(destinationCheck.destination, backupId, 'media_backup_manifest.json');
        if (!fs_1.default.existsSync(manifestPath)) {
            return { restored: false, errors: [`Manifest not found: ${manifestPath}`] };
        }
        const manifest = JSON.parse(fs_1.default.readFileSync(manifestPath, 'utf8'));
        const target = path_1.default.resolve(restoreRoot || path_1.default.join(this.auditDir(), `restore_${backupId}`));
        if (fs_1.default.existsSync(target) && fs_1.default.readdirSync(target).length > 0) {
            return { restored: false, errors: [`Restore target is not empty: ${target}`] };
        }
        fs_1.default.mkdirSync(target, { recursive: true });
        const errors = [];
        const restoreHashes = [];
        const ffprobeResults = [];
        for (const entry of manifest.files) {
            const destination = path_1.default.join(target, entry.copied_file);
            fs_1.default.mkdirSync(path_1.default.dirname(destination), { recursive: true });
            fs_1.default.copyFileSync(entry.destination, destination);
            const restoredHash = this.hash(destination);
            const stats = fs_1.default.statSync(destination);
            const ok = restoredHash === entry.sha256;
            if (!ok)
                errors.push(`Restored hash mismatch: ${destination}`);
            restoreHashes.push({ restored: destination, size_bytes: stats.size, sha256: restoredHash, expected_sha256: entry.sha256, verification_result: ok ? 'PASS' : 'FAIL' });
            if (path_1.default.extname(destination).toLowerCase() === '.mp4') {
                const probe = (0, child_process_1.spawnSync)('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', destination], { encoding: 'utf8' });
                ffprobeResults.push({ restored: destination, exit_code: probe.status, stdout: probe.stdout, stderr: probe.stderr });
                if (probe.status !== 0) {
                    errors.push(`ffprobe failed for restored MP4: ${destination}`);
                }
            }
        }
        const dir = this.auditDir();
        fs_1.default.writeFileSync(path_1.default.join(dir, 'restore_hashes.json'), JSON.stringify({ generated_at: new Date().toISOString(), files: restoreHashes }, null, 2), 'utf8');
        fs_1.default.writeFileSync(path_1.default.join(dir, 'ffprobe_restore_results.json'), JSON.stringify({ generated_at: new Date().toISOString(), files: ffprobeResults }, null, 2), 'utf8');
        return { restored: errors.length === 0, errors };
    }
}
exports.MediaBackupManager = MediaBackupManager;
