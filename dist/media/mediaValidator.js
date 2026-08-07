"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVideoWithFfprobe = validateVideoWithFfprobe;
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const child_process_1 = require("child_process");
function sha256(filePath) {
    return crypto_1.default.createHash('sha256').update(fs_1.default.readFileSync(filePath)).digest('hex');
}
function fpsFromRate(rate) {
    if (!rate || !rate.includes('/'))
        return 0;
    const [num, den] = rate.split('/').map(Number);
    return den ? num / den : 0;
}
function validateVideoWithFfprobe(filePath) {
    const absolutePath = fs_1.default.realpathSync(filePath);
    const stats = fs_1.default.statSync(absolutePath);
    const proc = (0, child_process_1.spawnSync)('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', absolutePath], {
        encoding: 'utf8'
    });
    let parsed = {};
    try {
        parsed = proc.stdout ? JSON.parse(proc.stdout) : {};
    }
    catch {
        parsed = {};
    }
    const videoStream = Array.isArray(parsed.streams)
        ? parsed.streams.find((stream) => stream.codec_type === 'video')
        : null;
    const width = Number(videoStream?.width || 0);
    const height = Number(videoStream?.height || 0);
    const duration = Number(parsed.format?.duration || videoStream?.duration || 0);
    const codec = String(videoStream?.codec_name || '');
    const fps = fpsFromRate(videoStream?.avg_frame_rate || videoStream?.r_frame_rate);
    return {
        valid: proc.status === 0 && Boolean(videoStream) && width > 0 && height > 0 && duration > 0 && Boolean(codec),
        absolute_path: absolutePath,
        size_bytes: stats.size,
        sha256: sha256(absolutePath),
        width,
        height,
        duration_seconds: duration,
        fps,
        codec,
        pixel_format: videoStream?.pix_fmt,
        ffprobe_exit_code: proc.status,
        ffprobe_stdout: proc.stdout || '',
        ffprobe_stderr: proc.stderr || ''
    };
}
