import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Logger } from '../event-hub/logger';
import { validateVideoWithFfprobe } from '../media/mediaValidator';

export interface ManualKlingClipIntakeItem {
  status: "KLING_CLIP_IMPORTED";
  shot_id: string;
  take_id: string;
  video_path: string;
  mime_type: "video/mp4";
  sha256: string;
  motion_package_hash: string;
  start_frame_sha256: string;
  observed_duration_seconds: number;
  fps: number;
  width: number;
  height: number;
  manual_external_origin: "USER_MANUAL_KLING";
}

export class FireflyToIntakeBridge {
  public static convert(
    productionId: string,
    completedJobs: Array<{ name: string; output_path: string }>,
    outputPath: string,
    motionPackageHash?: string,
    startFrameHash?: string
  ): ManualKlingClipIntakeItem {
    Logger.info('FireflyToIntakeBridge', `Gerando Manifesto de Ingestão para produção ${productionId}`);

    const firstJob = completedJobs[0];
    if (!firstJob) {
      throw new Error("Nenhum job concluído fornecido para gerar o manifesto de ingestão.");
    }

    const videoPath = path.resolve(firstJob.output_path);
    if (!fs.existsSync(videoPath)) {
      throw new Error(`VÃ­deo de ingestÃ£o nÃ£o encontrado: ${videoPath}`);
    }

    const validation = validateVideoWithFfprobe(videoPath);
    if (!validation.valid) {
      throw new Error(`FAILED_MEDIA_VALIDATION: ffprobe nÃ£o validou ${videoPath}: ${validation.ffprobe_stderr}`);
    }

    const parts = firstJob.name.split('_');
    const shot_id = parts.slice(0, 2).join('_') || 'SHOT_01';
    const take_id = parts.slice(2).join('_') || 'TAKE_01';

    const manifest: ManualKlingClipIntakeItem = {
      status: "KLING_CLIP_IMPORTED",
      shot_id,
      take_id,
      video_path: validation.absolute_path,
      mime_type: "video/mp4",
      sha256: validation.sha256,
      motion_package_hash: motionPackageHash || crypto.createHash('sha256').update(productionId).digest('hex'),
      start_frame_sha256: startFrameHash || crypto.createHash('sha256').update(`${productionId}:${shot_id}:${take_id}`).digest('hex'),
      observed_duration_seconds: validation.duration_seconds,
      fps: validation.fps,
      width: validation.width,
      height: validation.height,
      manual_external_origin: "USER_MANUAL_KLING"
    };

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');
    Logger.info('FireflyToIntakeBridge', `Manifesto de Ingestão salvo em ${outputPath} para vídeo ${videoPath}`);

    return manifest;
  }
}
