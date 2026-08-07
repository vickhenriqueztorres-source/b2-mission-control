"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiskSpaceProvider = void 0;
const fs_1 = __importDefault(require("fs"));
class DiskSpaceProvider {
    static simulatedFreeSpaceBytes = null;
    static setSimulatedFreeSpace(bytes) {
        this.simulatedFreeSpaceBytes = bytes;
    }
    static getAvailableDiskSpaceBytes(dirPath) {
        if (this.simulatedFreeSpaceBytes !== null) {
            return this.simulatedFreeSpaceBytes;
        }
        // Retorno de contingência real (aproximado via fs stat)
        try {
            const stats = fs_1.default.statSync(dirPath);
            return stats.size || 10737418240; // 10 GB padrão
        }
        catch {
            return 10737418240;
        }
    }
    static hasSufficientSpace(dirPath, requiredBytes = 104857600) {
        const available = this.getAvailableDiskSpaceBytes(dirPath);
        return available >= requiredBytes;
    }
}
exports.DiskSpaceProvider = DiskSpaceProvider;
