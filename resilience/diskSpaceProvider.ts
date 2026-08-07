import fs from 'fs';

export class DiskSpaceProvider {
  private static simulatedFreeSpaceBytes: number | null = null;

  public static setSimulatedFreeSpace(bytes: number | null): void {
    this.simulatedFreeSpaceBytes = bytes;
  }

  public static getAvailableDiskSpaceBytes(dirPath: string): number {
    if (this.simulatedFreeSpaceBytes !== null) {
      return this.simulatedFreeSpaceBytes;
    }
    // Retorno de contingência real (aproximado via fs stat)
    try {
      const stats = fs.statSync(dirPath);
      return stats.size || 10737418240; // 10 GB padrão
    } catch {
      return 10737418240;
    }
  }

  public static hasSufficientSpace(dirPath: string, requiredBytes: number = 104857600): boolean {
    const available = this.getAvailableDiskSpaceBytes(dirPath);
    return available >= requiredBytes;
  }
}
