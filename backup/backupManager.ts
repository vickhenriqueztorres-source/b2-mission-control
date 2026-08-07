import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Database from 'better-sqlite3';

export interface BackupManifest {
  backup_id: string;
  created_at: string;
  files: Array<{
    relative_path: string;
    size_bytes: number;
    sha256: string;
  }>;
  sqlite_tables: Record<string, number>;
  total_files: number;
  total_size_bytes: number;
}

export class BackupManager {
  private static getBackupsRootDir(): string {
    const dir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  public static calculateFileHash(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  public static async createBackup(customBackupId?: string): Promise<BackupManifest> {
    const backupId = customBackupId || `BKP_${Date.now()}`;
    const targetDir = path.join(this.getBackupsRootDir(), backupId);

    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });

    const fileEntries: Array<{ relative_path: string; size_bytes: number; sha256: string }> = [];
    const tableCounts: Record<string, number> = {};

    // 1. Copiar Bancos SQLite Oficiais se existirem
    const dataDir = path.resolve(process.cwd(), 'data');
    if (fs.existsSync(dataDir)) {
      const dbFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.db'));
      for (const dbFile of dbFiles) {
        const srcPath = path.join(dataDir, dbFile);
        const destPath = path.join(targetDir, 'data', dbFile);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);

        const sha256 = this.calculateFileHash(destPath);
        const stats = fs.statSync(destPath);
        fileEntries.push({ relative_path: `data/${dbFile}`, size_bytes: stats.size, sha256 });

        // Conta registros do SQLite
        try {
          const db = new Database(destPath);
          const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
          for (const tbl of tables as any[]) {
            const countRow: any = db.prepare(`SELECT COUNT(*) as count FROM ${tbl.name}`).get();
            tableCounts[`${dbFile}:${tbl.name}`] = countRow.count;
          }
          db.close();
        } catch (e) {}
      }
    }

    // 2. Copiar Schemas JSON
    const schemasDir = path.resolve(process.cwd(), 'schemas');
    if (fs.existsSync(schemasDir)) {
      const schemas = fs.readdirSync(schemasDir).filter(f => f.endsWith('.json'));
      for (const schema of schemas) {
        const srcPath = path.join(schemasDir, schema);
        const destPath = path.join(targetDir, 'schemas', schema);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);

        const sha256 = this.calculateFileHash(destPath);
        const stats = fs.statSync(destPath);
        fileEntries.push({ relative_path: `schemas/${schema}`, size_bytes: stats.size, sha256 });
      }
    }

    // 3. Copiar Diretório de Execuções Runs
    const runsDir = path.resolve(process.cwd(), 'runs');
    if (fs.existsSync(runsDir)) {
      const copyDirRecursive = (src: string, dest: string, relBase: string) => {
        const items = fs.readdirSync(src);
        for (const item of items) {
          const srcItem = path.join(src, item);
          const relPath = path.join(relBase, item);
          const destItem = path.join(dest, item);
          const stats = fs.statSync(srcItem);

          if (stats.isDirectory()) {
            fs.mkdirSync(destItem, { recursive: true });
            copyDirRecursive(srcItem, destItem, relPath);
          } else {
            fs.copyFileSync(srcItem, destItem);
            const sha256 = this.calculateFileHash(destItem);
            fileEntries.push({ relative_path: relPath.replace(/\\/g, '/'), size_bytes: stats.size, sha256 });
          }
        }
      };
      copyDirRecursive(runsDir, path.join(targetDir, 'runs'), 'runs');
    }

    const totalSizeBytes = fileEntries.reduce((acc, f) => acc + f.size_bytes, 0);

    const manifest: BackupManifest = {
      backup_id: backupId,
      created_at: new Date().toISOString(),
      files: fileEntries,
      sqlite_tables: tableCounts,
      total_files: fileEntries.length,
      total_size_bytes: totalSizeBytes
    };

    fs.writeFileSync(path.join(targetDir, 'backup_manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
    return manifest;
  }

  public static async verifyBackup(backupId: string): Promise<{ valid: boolean; errors: string[] }> {
    const backupDir = path.join(this.getBackupsRootDir(), backupId);
    const manifestPath = path.join(backupDir, 'backup_manifest.json');
    const errors: string[] = [];

    if (!fs.existsSync(manifestPath)) {
      return { valid: false, errors: [`Manifesto de backup não encontrado em: ${manifestPath}`] };
    }

    const manifest: BackupManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    for (const entry of manifest.files) {
      const filePath = path.join(backupDir, entry.relative_path);
      if (!fs.existsSync(filePath)) {
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

  public static async restoreBackup(backupId: string, targetRestoreRootDir?: string): Promise<{ restored: boolean; errors: string[] }> {
    const verifyRes = await this.verifyBackup(backupId);
    if (!verifyRes.valid) {
      return { restored: false, errors: [`Impossível restaurar backup inválido: ${verifyRes.errors.join('; ')}`] };
    }

    const backupDir = path.join(this.getBackupsRootDir(), backupId);
    const manifestPath = path.join(backupDir, 'backup_manifest.json');
    const manifest: BackupManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const targetRoot = targetRestoreRootDir || process.cwd();

    const errors: string[] = [];

    for (const entry of manifest.files) {
      const srcFile = path.join(backupDir, entry.relative_path);
      const destFile = path.join(targetRoot, entry.relative_path);

      try {
        fs.mkdirSync(path.dirname(destFile), { recursive: true });
        fs.copyFileSync(srcFile, destFile);

        const restoredHash = this.calculateFileHash(destFile);
        if (restoredHash !== entry.sha256) {
          errors.push(`Falha de integridade ao restaurar ${entry.relative_path}`);
        }
      } catch (err: any) {
        errors.push(`Erro ao restaurar ${entry.relative_path}: ${err.message}`);
      }
    }

    return { restored: errors.length === 0, errors };
  }
}
