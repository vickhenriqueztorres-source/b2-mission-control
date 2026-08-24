import fs from 'fs';
import crypto from 'crypto';
import { spawnSync } from 'child_process';

export interface MediaValidationResult {
  valid: boolean;
  absolute_path: string;
  size_bytes: number;
  sha256: string;
  width: number;
  height: number;
  duration_seconds: number;
  fps: number;
  codec: string;
  pixel_format?: string;
  has_audio: boolean;
  audio_codec?: string;
  audio_sample_rate?: number;
  audio_channels?: number;
  ffprobe_exit_code: number | null;
  ffprobe_stdout: string;
  ffprobe_stderr: string;
}

function sha256(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function fpsFromRate(rate: string | undefined): number {
  if (!rate || !rate.includes('/')) return 0;
  const [num, den] = rate.split('/').map(Number);
  return den ? num / den : 0;
}

export function validateVideoWithFfprobe(filePath: string): MediaValidationResult {
  const absolutePath = fs.realpathSync(filePath);
  const stats = fs.statSync(absolutePath);
  const proc = spawnSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', absolutePath], {
    encoding: 'utf8'
  });

  let parsed: any = {};
  try {
    parsed = proc.stdout ? JSON.parse(proc.stdout) : {};
  } catch {
    parsed = {};
  }

  const videoStream = Array.isArray(parsed.streams)
    ? parsed.streams.find((stream: any) => stream.codec_type === 'video')
    : null;
  const width = Number(videoStream?.width || 0);
  const height = Number(videoStream?.height || 0);
  const duration = Number(parsed.format?.duration || videoStream?.duration || 0);
  const codec = String(videoStream?.codec_name || '');
  const fps = fpsFromRate(videoStream?.avg_frame_rate || videoStream?.r_frame_rate);
  const audioStream = Array.isArray(parsed.streams)
    ? parsed.streams.find((stream: any) => stream.codec_type === 'audio')
    : null;

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
    has_audio: Boolean(audioStream),
    audio_codec: audioStream?.codec_name,
    audio_sample_rate: audioStream?.sample_rate ? Number(audioStream.sample_rate) : undefined,
    audio_channels: audioStream?.channels ? Number(audioStream.channels) : undefined,
    ffprobe_exit_code: proc.status,
    ffprobe_stdout: proc.stdout || '',
    ffprobe_stderr: proc.stderr || ''
  };
}
