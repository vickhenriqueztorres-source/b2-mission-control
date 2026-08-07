"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mediaBackupManager_1 = require("./mediaBackupManager");
function readArg(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}
function readBackupId() {
    return readArg('--backup') || process.argv.slice(3).find((arg) => !arg.startsWith('--'));
}
function readRestoreRoot() {
    const explicit = readArg('--restore-root') || readArg('--destination');
    if (explicit)
        return explicit;
    const positional = process.argv.slice(3).filter((arg) => !arg.startsWith('--'));
    return positional[1];
}
async function main() {
    const action = process.argv[2];
    if (action === 'create') {
        const result = mediaBackupManager_1.MediaBackupManager.create();
        console.log(JSON.stringify(result, null, 2));
        if ('blocked' in result)
            process.exit(2);
        return;
    }
    if (action === 'verify') {
        const result = mediaBackupManager_1.MediaBackupManager.verify(readBackupId());
        console.log(JSON.stringify(result, null, 2));
        if ('blocked' in result)
            process.exit(2);
        if (!result.valid)
            process.exit(1);
        return;
    }
    if (action === 'restore') {
        const result = mediaBackupManager_1.MediaBackupManager.restore(readBackupId(), readRestoreRoot());
        console.log(JSON.stringify(result, null, 2));
        if ('blocked' in result)
            process.exit(2);
        if (!result.restored)
            process.exit(1);
        return;
    }
    console.log('Commands: create | verify --backup <ID> | restore --backup <ID> [--restore-root <PATH>]');
    process.exit(1);
}
main();
