import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { DiskSpaceProvider } from './diskSpaceProvider';

export class FaultInjector {
  private stagingDir: string;

  constructor(stagingDir: string) {
    this.stagingDir = stagingDir;
  }

  // CHAOS-001: Esquema Inválido
  public injectInvalidSchema(filePath: string): void {
    const invalidJson = {
      version: 'invalid_v999',
      items: [
        { name: 'SHOT_INVALID', missing_required_fields: true }
      ]
    };
    fs.writeFileSync(filePath, JSON.stringify(invalidJson, null, 2), 'utf-8');
  }

  // CHAOS-002: Start Frame Inexistente
  public injectMissingStartFrame(guidePath: string): void {
    const guide = {
      items: [
        {
          name: 'SHOT_01_TAKE_01',
          prompt: 'Cinematic slow push-in',
          start_frame_path: 'C:\\B2-AI-STUDIO\\non_existent_folder\\missing_frame_9999.png'
        }
      ]
    };
    fs.writeFileSync(guidePath, JSON.stringify(guide, null, 2), 'utf-8');
  }

  // CHAOS-003: Take Duplicado
  public injectDuplicateTake(guidePath: string): void {
    const guide = {
      items: [
        { name: 'SHOT_01_TAKE_01', prompt: 'Cinematic slow push-in' },
        { name: 'SHOT_01_TAKE_01', prompt: 'Cinematic slow push-in DUPLICATE' }
      ]
    };
    fs.writeFileSync(guidePath, JSON.stringify(guide, null, 2), 'utf-8');
  }

  // CHAOS-005: MP4 Incompleto (0 bytes ou truncado)
  public injectIncompleteMp4(mp4Path: string): void {
    fs.writeFileSync(mp4Path, Buffer.from('INCOMPLETE_HEADER_TRUNCATED_BYTES'), 'utf-8');
  }

  // CHAOS-008: SQLite Bloqueado
  public injectSqliteLock(dbPath: string): Database.Database {
    const db = new Database(dbPath, { timeout: 10 });
    db.exec('BEGIN EXCLUSIVE TRANSACTION;');
    return db; // Mantém a transação aberta para simular lock
  }

  // CHAOS-010: Espaço em Disco Esgotado (Simulado via DiskSpaceProvider)
  public injectDiskSpaceExhaustion(): void {
    DiskSpaceProvider.setSimulatedFreeSpace(1024); // Apenas 1 KB disponível
  }

  public resetDiskSpaceExhaustion(): void {
    DiskSpaceProvider.setSimulatedFreeSpace(null);
  }

  // CHAOS-011: Sessão Deslogada
  public mockStateReaderSessionLoggedOut(): string {
    return 'session_logged_out';
  }

  // CHAOS-012: Quota Esgotada
  public mockStateReaderQuotaExhausted(): string {
    return 'quota_exhausted';
  }

  // CHAOS-013: Prompt Rejeitado (Filtro de Segurança)
  public mockStateReaderPromptRejected(): string {
    return 'failed-content';
  }

  // CHAOS-014: Timeout no Worker
  public mockStateReaderTimeout(): string {
    return 'still_generating_timeout';
  }

  // CHAOS-015: Chrome Travado
  public mockStateReaderChromeFrozen(): string {
    return 'chrome_frozen';
  }
}
