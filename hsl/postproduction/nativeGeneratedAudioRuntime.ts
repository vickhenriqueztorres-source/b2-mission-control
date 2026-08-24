import {spawnSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {HslGeneratedAssetIntakeItem} from '../../production-bridge/fireflyToIntake';

export interface HslNativeAudioPlacement {
  readonly shot_id: string;
  readonly start_seconds: number;
  readonly duration_seconds: number;
  readonly status: HslGeneratedAssetIntakeItem['native_audio_status'];
  readonly source_video_path: string;
  readonly extracted_stem_path?: string;
}

export interface HslNativeGeneratedAudioResult {
  readonly status: 'NATIVE_AUDIO_QA_PASS';
  readonly bedPath: string;
  readonly planPath: string;
  readonly placements: readonly HslNativeAudioPlacement[];
  readonly acceptedCount: number;
  readonly fallbackCount: number;
}

function run(args: readonly string[], code: string): void {
  const result = spawnSync('ffmpeg', [...args], {encoding: 'utf8', maxBuffer: 1024 * 1024 * 20});
  if (result.status !== 0) throw new Error(`${code}:${result.stderr || result.stdout || ''}`);
}

function writeJson(filePath: string, value: unknown): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export class NativeGeneratedAudioAgent {
  create(input: Readonly<{
    timeline: readonly {shotId: string; startSeconds: number; durationSeconds: number}[];
    assets: ReadonlyMap<string, HslGeneratedAssetIntakeItem>;
    totalDurationSeconds: number;
    outputDirectory: string;
  }>): HslNativeGeneratedAudioResult {
    const outputRoot = path.resolve(input.outputDirectory);
    fs.mkdirSync(outputRoot, {recursive: true});
    const placements: HslNativeAudioPlacement[] = [];
    const accepted: Array<HslNativeAudioPlacement & {extracted_stem_path: string}> = [];
    for (const timelineItem of input.timeline) {
      const asset = input.assets.get(timelineItem.shotId);
      if (!asset || asset.model !== 'Veo 3.1 Fast') continue;
      const placement: HslNativeAudioPlacement = {
        shot_id: timelineItem.shotId, start_seconds: timelineItem.startSeconds,
        duration_seconds: timelineItem.durationSeconds, status: asset.native_audio_status,
        source_video_path: asset.video_path
      };
      if (asset.native_audio_status === 'PRESENT_VALIDATED') {
        const stem = path.join(outputRoot, 'stems', `${timelineItem.shotId}.wav`);
        fs.mkdirSync(path.dirname(stem), {recursive: true});
        run([
          '-y', '-hide_banner', '-loglevel', 'error', '-i', asset.video_path, '-vn',
          '-t', String(timelineItem.durationSeconds),
          '-af', 'highpass=f=35,lowpass=f=16000,loudnorm=I=-27:TP=-6:LRA=9,aformat=sample_fmts=s16:channel_layouts=stereo',
          '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', stem
        ], `HSL_NATIVE_AUDIO_EXTRACTION_FAILED:${timelineItem.shotId}`);
        const acceptedPlacement = {...placement, extracted_stem_path: stem};
        placements.push(acceptedPlacement);
        accepted.push(acceptedPlacement);
      } else placements.push(placement);
    }
    const bedPath = path.join(outputRoot, 'native-generated-audio-bed.wav');
    const args: string[] = [
      '-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi',
      '-i', `anullsrc=r=48000:cl=stereo:d=${input.totalDurationSeconds}`
    ];
    accepted.forEach((item) => args.push('-i', item.extracted_stem_path));
    const filters: string[] = [];
    const labels = ['[0:a]'];
    accepted.forEach((item, index) => {
      const delay = Math.round(item.start_seconds * 1000);
      const label = `native${index + 1}`;
      filters.push(`[${index + 1}:a]adelay=${delay}|${delay},volume=0.72[${label}]`);
      labels.push(`[${label}]`);
    });
    filters.push(`${labels.join('')}amix=inputs=${labels.length}:duration=first:normalize=0,alimiter=limit=0.65[out]`);
    args.push('-filter_complex', filters.join(';'), '-map', '[out]', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', bedPath);
    run(args, 'HSL_NATIVE_AUDIO_BED_FAILED');
    const planPath = path.join(outputRoot, 'native-generated-audio-plan.json');
    const result: HslNativeGeneratedAudioResult = {
      status: 'NATIVE_AUDIO_QA_PASS', bedPath, planPath, placements,
      acceptedCount: accepted.length,
      fallbackCount: placements.filter((item) => item.status === 'ABSENT_FALLBACK' || item.status === 'REJECTED_FALLBACK').length
    };
    writeJson(planPath, result);
    return result;
  }
}

export class HybridSoundBedAgent {
  mix(kenneyBedPath: string, nativeBedPath: string, outputPath: string): string {
    fs.mkdirSync(path.dirname(outputPath), {recursive: true});
    run([
      '-y', '-hide_banner', '-loglevel', 'error', '-i', kenneyBedPath, '-i', nativeBedPath,
      '-filter_complex', '[0:a]volume=0.9[kenney];[1:a]volume=1[native];[kenney][native]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.7[out]',
      '-map', '[out]', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', outputPath
    ], 'HSL_HYBRID_SOUND_BED_FAILED');
    return outputPath;
  }
}
