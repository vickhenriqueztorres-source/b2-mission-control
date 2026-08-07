import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export class CleanupManager {
  public static cleanupStaging(runDir: string, strategy: string): void {
    const cleanupLog: any = { timestamp: new Date().toISOString(), strategy, actions: [] };

    try {
      // 1. Matar processos robóticos orfãos se necessário
      if (strategy === 'KILL_ORPHAN_PROCESSES' || strategy === 'FULL_STAGING_RESET') {
        try {
          execSync('taskkill /F /IM chrome.exe /T', { stdio: 'ignore' });
          cleanupLog.actions.push('Processos Chrome encerrados.');
        } catch (e) {}
      }

      // 2. Limpar arquivos temporários na pasta do run do caos (preservando evidências oficiais)
      const tmpFiles = fs.readdirSync(runDir).filter(f => f.endsWith('.tmp') || f.endsWith('.lock'));
      tmpFiles.forEach(f => {
        fs.unlinkSync(path.join(runDir, f));
        cleanupLog.actions.push(`Arquivo temporário removido: ${f}`);
      });

      cleanupLog.actions.push('Ambiente de staging limpo com sucesso.');
    } catch (err: any) {
      cleanupLog.actions.push(`Aviso durante cleanup: ${err.message}`);
    }

    const cleanupJsonPath = path.join(runDir, 'cleanup.json');
    fs.writeFileSync(cleanupJsonPath, JSON.stringify(cleanupLog, null, 2), 'utf-8');
  }
}
