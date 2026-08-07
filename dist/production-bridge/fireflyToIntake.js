"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FireflyToIntakeBridge = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../event-hub/logger");
const mediaValidator_1 = require("../media/mediaValidator");
class FireflyToIntakeBridge {
    static convert(productionId, completedJobs, outputPath, motionPackageHash, startFrameHash) {
        logger_1.Logger.info('FireflyToIntakeBridge', `Gerando Manifesto de Ingestão para produção ${productionId}`);
        const firstJob = completedJobs[0];
        if (!firstJob) {
            throw new Error("Nenhum job concluído fornecido para gerar o manifesto de ingestão.");
        }
        const videoPath = path_1.default.resolve(firstJob.output_path);
        if (!fs_1.default.existsSync(videoPath)) {
            throw new Error(`VÃ­deo de ingestÃ£o nÃ£o encontrado: ${videoPath}`);
        }
        const validation = (0, mediaValidator_1.validateVideoWithFfprobe)(videoPath);
        if (!validation.valid) {
            throw new Error(`FAILED_MEDIA_VALIDATION: ffprobe nÃ£o validou ${videoPath}: ${validation.ffprobe_stderr}`);
        }
        const parts = firstJob.name.split('_');
        const shot_id = parts.slice(0, 2).join('_') || 'SHOT_01';
        const take_id = parts.slice(2).join('_') || 'TAKE_01';
        const manifest = {
            status: "KLING_CLIP_IMPORTED",
            shot_id,
            take_id,
            video_path: validation.absolute_path,
            mime_type: "video/mp4",
            sha256: validation.sha256,
            motion_package_hash: motionPackageHash || crypto_1.default.createHash('sha256').update(productionId).digest('hex'),
            start_frame_sha256: startFrameHash || crypto_1.default.createHash('sha256').update(`${productionId}:${shot_id}:${take_id}`).digest('hex'),
            observed_duration_seconds: validation.duration_seconds,
            fps: validation.fps,
            width: validation.width,
            height: validation.height,
            manual_external_origin: "USER_MANUAL_KLING"
        };
        const outputDir = path_1.default.dirname(outputPath);
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        }
        fs_1.default.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');
        logger_1.Logger.info('FireflyToIntakeBridge', `Manifesto de Ingestão salvo em ${outputPath} para vídeo ${videoPath}`);
        return manifest;
    }
}
exports.FireflyToIntakeBridge = FireflyToIntakeBridge;
