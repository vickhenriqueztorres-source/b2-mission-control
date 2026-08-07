import { MediaBackupManager } from './mediaBackupManager';

function readArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function readBackupId(): string | undefined {
  return readArg('--backup') || process.argv.slice(3).find((arg) => !arg.startsWith('--'));
}

function readRestoreRoot(): string | undefined {
  const explicit = readArg('--restore-root') || readArg('--destination');
  if (explicit) return explicit;

  const positional = process.argv.slice(3).filter((arg) => !arg.startsWith('--'));
  return positional[1];
}

async function main() {
  const action = process.argv[2];
  if (action === 'create') {
    const result = MediaBackupManager.create();
    console.log(JSON.stringify(result, null, 2));
    if ('blocked' in result) process.exit(2);
    return;
  }
  if (action === 'verify') {
    const result = MediaBackupManager.verify(readBackupId());
    console.log(JSON.stringify(result, null, 2));
    if ('blocked' in result) process.exit(2);
    if (!result.valid) process.exit(1);
    return;
  }
  if (action === 'restore') {
    const result = MediaBackupManager.restore(readBackupId(), readRestoreRoot());
    console.log(JSON.stringify(result, null, 2));
    if ('blocked' in result) process.exit(2);
    if (!result.restored) process.exit(1);
    return;
  }

  console.log('Commands: create | verify --backup <ID> | restore --backup <ID> [--restore-root <PATH>]');
  process.exit(1);
}

main();
