"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backupManager_1 = require("./backupManager");
async function main() {
    const args = process.argv.slice(2);
    const action = args[0];
    let backupId = null;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--backup' && args[i + 1]) {
            backupId = args[i + 1];
            i++;
        }
        else if (i > 0 && !args[i].startsWith('--')) {
            backupId = args[i];
        }
    }
    console.log('====================================================================');
    console.log('📦 B2 MISSION CONTROL — GERENCIADOR DE BACKUP & RESTAURAÇÃO');
    console.log('====================================================================\n');
    if (action === 'create' || args.includes('create')) {
        console.log('▶ Criando novo backup do sistema...');
        const manifest = await backupManager_1.BackupManager.createBackup(backupId || undefined);
        console.log(`✅ Backup criado com SUCESSO!`);
        console.log(`   - ID do Backup: ${manifest.backup_id}`);
        console.log(`   - Arquivos inclusos: ${manifest.total_files}`);
        console.log(`   - Tamanho Total: ${(manifest.total_size_bytes / 1024 / 1024).toFixed(2)} MB`);
    }
    else if (action === 'verify' || args.includes('verify')) {
        if (!backupId) {
            console.log('Erro: Especifique o ID do backup com --backup <ID> ou como argumento posicional.');
            process.exit(1);
        }
        console.log(`▶ Verificando integridade do backup: ${backupId}...`);
        const res = await backupManager_1.BackupManager.verifyBackup(backupId);
        if (res.valid) {
            console.log(`✅ Backup ${backupId} é 100% VÁLIDO e ÍNTEGRO!`);
        }
        else {
            console.log(`❌ Backup ${backupId} é INVÁLIDO:`);
            res.errors.forEach(e => console.log(`   - ${e}`));
            process.exit(1);
        }
    }
    else if (action === 'restore' || args.includes('restore')) {
        if (!backupId) {
            console.log('Erro: Especifique o ID do backup com --backup <ID> ou como argumento posicional.');
            process.exit(1);
        }
        console.log(`▶ Restaurando backup: ${backupId}...`);
        const res = await backupManager_1.BackupManager.restoreBackup(backupId);
        if (res.restored) {
            console.log(`✅ Backup ${backupId} restaurado com SUCESSO!`);
        }
        else {
            console.log(`❌ Falha ao restaurar backup ${backupId}:`);
            res.errors.forEach(e => console.log(`   - ${e}`));
            process.exit(1);
        }
    }
    else {
        console.log('Comandos aceitos:');
        console.log('  npx ts-node backup/cli.ts create');
        console.log('  npx ts-node backup/cli.ts verify --backup <ID>');
        console.log('  npx ts-node backup/cli.ts restore --backup <ID>');
    }
}
main();
