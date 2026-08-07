import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';

type MediaBackupConfig = {
  policy: 'media-full-backup';
  source_roots: string[];
  destination_root: string | null;
  verify_sha256: boolean;
};

type MediaBackupEntry = {
  source: string;
  destination: string;
  size_bytes: number;
  sha256: string;
  copied_at: string;
  policy: string;
  copied_file: string;
  verification_result: 'PASS' | 'FAIL' | 'NOT_RUN';
};

type MediaBackupManifest = {
  backup_id: string;
  policy: string;
  created_at: string;
  destination_root: string;
  verify_sha256: boolean;
  media_files_included: boolean;
  mp4_source_valid_count: number;
  mp4_copied_count: number;
  skipped_invalid_mp4_count: number;
  files: MediaBackupEntry[];
  total_files: number;
  total_size_bytes: number;
};

type SkippedInvalidMp4 = {
  source: string;
  size_bytes: number;
  ffprobe_exit_code: number | null;
  ffprobe_stderr: string;
};

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

export class MediaBackupManager {
  private static repoRoot(): string {
    return process.cwd();
  }

  private static auditDir(): string {
    const dir = path.join(this.repoRoot(), 'runs', 'MEDIA-BACKUP-001');
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  private static configPath(): string {
    return path.join(this.repoRoot(), 'config', 'media-full-backup.json');
  }

  private static loadConfig(): MediaBackupConfig {
    const raw = fs.readFileSync(this.configPath(), 'utf8');
    const config = JSON.parse(raw) as MediaBackupConfig;
    const envDestination = process.env.MEDIA_BACKUP_DESTINATION || process.env.MEDIA_FULL_BACKUP_DESTINATION;
    if (envDestination) {
      config.destination_root = envDestination;
    }
    return config;
  }

  private static hash(filePath: string): string {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
  }

  private static validateMp4(filePath: string): { valid: true } | { valid: false; ffprobe_exit_code: number | null; ffprobe_stderr: string } {
    const probe = spawnSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', filePath], { encoding: 'utf8' });
    if (probe.status !== 0) {
      return { valid: false, ffprobe_exit_code: probe.status, ffprobe_stderr: probe.stderr || '' };
    }

    try {
      const parsed = JSON.parse(probe.stdout || '{}');
      const streams = Array.isArray(parsed.streams) ? parsed.streams : [];
      const video = streams.find((stream: any) => stream.codec_type === 'video');
      const width = Number(video?.width || 0);
      const height = Number(video?.height || 0);
      const duration = Number(parsed.format?.duration || video?.duration || 0);
      if (video && width > 0 && height > 0 && duration > 0) {
        return { valid: true };
      }
      return { valid: false, ffprobe_exit_code: probe.status, ffprobe_stderr: 'ffprobe succeeded but no valid video stream/dimensions/duration were found.' };
    } catch (err: any) {
      return { valid: false, ffprobe_exit_code: probe.status, ffprobe_stderr: `ffprobe JSON parse failed: ${err.message}` };
    }
  }

  private static isInside(child: string, parent: string): boolean {
    const relative = path.relative(path.resolve(parent), path.resolve(child));
    return relative === '' || (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative));
  }

  private static validateDestination(config: MediaBackupConfig): { ok: true; destination: string } | { ok: false; reason: string } {
    if (!config.destination_root) {
      return { ok: false, reason: 'MEDIA_BACKUP_DESTINATION_REQUIRED: No external destination_root configured. Set config/media-full-backup.json, MEDIA_BACKUP_DESTINATION, or MEDIA_FULL_BACKUP_DESTINATION.' };
    }

    const destination = path.resolve(config.destination_root);
    for (const source of config.source_roots) {
      const resolvedSource = path.resolve(source);
      if (this.isInside(destination, resolvedSource)) {
        return { ok: false, reason: `Destination ${destination} is inside source root ${resolvedSource}.` };
      }
    }

    const sourceDrives = new Set(config.source_roots.map((source) => path.parse(path.resolve(source)).root.toLowerCase()));
    const destinationDrive = path.parse(destination).root.toLowerCase();
    if (sourceDrives.has(destinationDrive) && process.env.MEDIA_FULL_BACKUP_ALLOW_SAME_DRIVE !== 'true') {
      return { ok: false, reason: `Destination ${destination} is on the same drive root as a source. Configure an external/NAS/cloud-synced destination or set an explicit override only for controlled testing.` };
    }

    return { ok: true, destination };
  }

  private static listFiles(root: string): string[] {
    if (!fs.existsSync(root)) return [];
    const out: string[] = [];
    const walk = (dir: string) => {
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
          walk(full);
        } else if (item.isFile() && MEDIA_EXTENSIONS.has(path.extname(item.name).toLowerCase())) {
          out.push(full);
        }
      }
    };
    walk(root);
    return out;
  }

  private static writeBlocked(reason: string): void {
    const dir = this.auditDir();
    const payload = {
      generated_at: new Date().toISOString(),
      policy: 'media-full-backup',
      result: 'BLOCKED',
      reason
    };
    fs.writeFileSync(path.join(dir, 'media_backup_manifest.json'), JSON.stringify(payload, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'source_hashes.json'), JSON.stringify({ generated_at: payload.generated_at, files: [] }, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'destination_hashes.json'), JSON.stringify({ generated_at: payload.generated_at, files: [] }, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'restore_hashes.json'), JSON.stringify({ generated_at: payload.generated_at, files: [] }, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'ffprobe_restore_results.json'), JSON.stringify({ generated_at: payload.generated_at, files: [] }, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'REPORT.md'), `# MEDIA-BACKUP-001\n\nResult: BLOCKED\n\nReason: ${reason}\n`, 'utf8');
  }

  public static create(): MediaBackupManifest | { blocked: true; reason: string } {
    const config = this.loadConfig();
    const destinationCheck = this.validateDestination(config);
    if (!destinationCheck.ok) {
      this.writeBlocked(destinationCheck.reason);
      return { blocked: true, reason: destinationCheck.reason };
    }

    const backupId = `MEDIA_FULL_BACKUP_${Date.now()}`;
    const backupRoot = path.join(destinationCheck.destination, backupId);
    fs.mkdirSync(backupRoot, { recursive: true });

    const entries: MediaBackupEntry[] = [];
    const sourceHashes: Array<{ source: string; size_bytes: number; sha256: string }> = [];
    const skippedInvalidMp4s: SkippedInvalidMp4[] = [];
    for (const sourceRoot of config.source_roots) {
      const resolvedRoot = path.resolve(sourceRoot);
      for (const source of this.listFiles(resolvedRoot)) {
        const stats = fs.statSync(source);
        if (path.extname(source).toLowerCase() === '.mp4') {
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

        const rootName = path.basename(resolvedRoot);
        const relative = path.join(rootName, path.relative(resolvedRoot, source));
        const destination = path.join(backupRoot, relative);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(source, destination);

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

    const manifest: MediaBackupManifest = {
      backup_id: backupId,
      policy: config.policy,
      created_at: new Date().toISOString(),
      destination_root: destinationCheck.destination,
      verify_sha256: config.verify_sha256,
      media_files_included: entries.some((entry) => path.extname(entry.source).toLowerCase() === '.mp4'),
      mp4_source_valid_count: entries.filter((entry) => path.extname(entry.source).toLowerCase() === '.mp4').length,
      mp4_copied_count: entries.filter((entry) => path.extname(entry.destination).toLowerCase() === '.mp4').length,
      skipped_invalid_mp4_count: skippedInvalidMp4s.length,
      files: entries,
      total_files: entries.length,
      total_size_bytes: entries.reduce((sum, entry) => sum + entry.size_bytes, 0)
    };

    fs.writeFileSync(path.join(backupRoot, 'media_backup_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

    const dir = this.auditDir();
    fs.writeFileSync(path.join(dir, 'media_backup_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'source_hashes.json'), JSON.stringify({ generated_at: manifest.created_at, files: sourceHashes }, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'destination_hashes.json'), JSON.stringify({
      generated_at: manifest.created_at,
      files: entries.map((entry) => ({ destination: entry.destination, size_bytes: entry.size_bytes, sha256: this.hash(entry.destination), verification_result: entry.verification_result }))
    }, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'skipped_invalid_mp4s.json'), JSON.stringify({ generated_at: manifest.created_at, files: skippedInvalidMp4s }, null, 2), 'utf8');

    return manifest;
  }

  public static verify(backupId?: string): { valid: boolean; errors: string[] } | { blocked: true; reason: string } {
    const config = this.loadConfig();
    const destinationCheck = this.validateDestination(config);
    if (!destinationCheck.ok) {
      this.writeBlocked(destinationCheck.reason);
      return { blocked: true, reason: destinationCheck.reason };
    }

    if (!backupId) {
      return { valid: false, errors: ['Missing --backup <ID>.'] };
    }

    const manifestPath = path.join(destinationCheck.destination, backupId, 'media_backup_manifest.json');
    if (!fs.existsSync(manifestPath)) {
      return { valid: false, errors: [`Manifest not found: ${manifestPath}`] };
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as MediaBackupManifest;
    const errors: string[] = [];
    for (const entry of manifest.files) {
      if (!fs.existsSync(entry.destination)) {
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

  public static restore(backupId?: string, restoreRoot?: string): { restored: boolean; errors: string[] } | { blocked: true; reason: string } {
    const config = this.loadConfig();
    const destinationCheck = this.validateDestination(config);
    if (!destinationCheck.ok) {
      this.writeBlocked(destinationCheck.reason);
      return { blocked: true, reason: destinationCheck.reason };
    }
    if (!backupId) {
      return { restored: false, errors: ['Missing --backup <ID>.'] };
    }

    const manifestPath = path.join(destinationCheck.destination, backupId, 'media_backup_manifest.json');
    if (!fs.existsSync(manifestPath)) {
      return { restored: false, errors: [`Manifest not found: ${manifestPath}`] };
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as MediaBackupManifest;
    const target = path.resolve(restoreRoot || path.join(this.auditDir(), `restore_${backupId}`));
    if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
      return { restored: false, errors: [`Restore target is not empty: ${target}`] };
    }
    fs.mkdirSync(target, { recursive: true });

    const errors: string[] = [];
    const restoreHashes: Array<{ restored: string; size_bytes: number; sha256: string; expected_sha256: string; verification_result: string }> = [];
    const ffprobeResults: unknown[] = [];
    for (const entry of manifest.files) {
      const destination = path.join(target, entry.copied_file);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(entry.destination, destination);
      const restoredHash = this.hash(destination);
      const stats = fs.statSync(destination);
      const ok = restoredHash === entry.sha256;
      if (!ok) errors.push(`Restored hash mismatch: ${destination}`);
      restoreHashes.push({ restored: destination, size_bytes: stats.size, sha256: restoredHash, expected_sha256: entry.sha256, verification_result: ok ? 'PASS' : 'FAIL' });

      if (path.extname(destination).toLowerCase() === '.mp4') {
        const probe = spawnSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', destination], { encoding: 'utf8' });
        ffprobeResults.push({ restored: destination, exit_code: probe.status, stdout: probe.stdout, stderr: probe.stderr });
        if (probe.status !== 0) {
          errors.push(`ffprobe failed for restored MP4: ${destination}`);
        }
      }
    }

    const dir = this.auditDir();
    fs.writeFileSync(path.join(dir, 'restore_hashes.json'), JSON.stringify({ generated_at: new Date().toISOString(), files: restoreHashes }, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'ffprobe_restore_results.json'), JSON.stringify({ generated_at: new Date().toISOString(), files: ffprobeResults }, null, 2), 'utf8');
    return { restored: errors.length === 0, errors };
  }
}
