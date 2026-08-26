import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {spawnSync} from 'child_process';
import {validateVideoWithFfprobe} from '../media/mediaValidator';
import {assertOfficialHslNarrationConfig} from '../config/hslProductionRules';

type RenderScene = {
  readonly shotId: string;
  readonly durationInFrames: number;
  readonly mediaSrc?: string;
};

type RenderProps = {
  readonly fps: number;
  readonly scenes: RenderScene[];
};

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function runFfmpeg(args: readonly string[], errorCode: string): void {
  const result = spawnSync('ffmpeg', [...args], {encoding: 'utf8', maxBuffer: 1024 * 1024 * 80});
  if (result.status !== 0) throw new Error(`${errorCode}:${result.stderr || result.stdout || ''}`);
}

function mediaPathFromStatic(mediaSrc: string): string {
  return path.resolve('public', mediaSrc);
}

function nearestMediaScene(scenes: readonly RenderScene[], index: number): RenderScene {
  for (let distance = 1; distance < scenes.length; distance += 1) {
    const previous = scenes[index - distance];
    if (previous?.mediaSrc) return previous;
    const next = scenes[index + distance];
    if (next?.mediaSrc) return next;
  }
  throw new Error('HSL_VIDEO_5_FAST_FINISH_NO_GENERATED_MEDIA_AVAILABLE');
}

function main(): void {
  assertOfficialHslNarrationConfig();
  const productionId = process.env.HSL_VIDEO_5_RUN_ID || 'HSL-VIDEO-005';
  const runRoot = path.resolve(process.env.HSL_VIDEO_5_OUTPUT || path.join('runs', productionId));
  const postRoot = path.join(runRoot, 'postproduction');
  const propsPath = path.join(postRoot, 'remotion-props.json');
  const narrationPath = path.join(postRoot, 'narration-timeline-fit.mp3');
  const soundFxPath = path.join(postRoot, 'soundfx', 'hybrid-soundfx-bed.wav');
  for (const required of [propsPath, narrationPath, soundFxPath]) {
    if (!fs.existsSync(required)) throw new Error(`HSL_VIDEO_5_FAST_FINISH_INPUT_REQUIRED:${required}`);
  }

  const props = JSON.parse(fs.readFileSync(propsPath, 'utf8')) as RenderProps;
  const fps = Number(props.fps || 30);
  const segmentRoot = path.join(postRoot, 'fast-segments');
  fs.mkdirSync(segmentRoot, {recursive: true});
  const segmentPaths: string[] = [];
  props.scenes.forEach((scene, index) => {
    const mediaScene = scene.mediaSrc ? scene : nearestMediaScene(props.scenes, index);
    const inputPath = mediaPathFromStatic(mediaScene.mediaSrc!);
    if (!fs.existsSync(inputPath)) throw new Error(`HSL_VIDEO_5_FAST_FINISH_MEDIA_MISSING:${scene.shotId}:${inputPath}`);
    const durationSeconds = Math.max(0.1, Number(scene.durationInFrames || fps) / fps);
    const outputPath = path.join(segmentRoot, `${String(index + 1).padStart(3, '0')}_${scene.shotId}.mp4`);
    const replacement = mediaScene.shotId === scene.shotId ? '' : ` media=${mediaScene.shotId}`;
    process.stderr.write(`HSL_VIDEO_5_FAST_SEGMENT ${index + 1}/${props.scenes.length} ${scene.shotId}${replacement}\n`);
    runFfmpeg([
      '-y', '-hide_banner', '-loglevel', 'error',
      '-stream_loop', '-1', '-i', inputPath,
      '-t', durationSeconds.toFixed(3),
      '-vf', 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p',
      '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-movflags', '+faststart',
      outputPath
    ], `HSL_VIDEO_5_FAST_SEGMENT_FAILED:${scene.shotId}`);
    segmentPaths.push(outputPath);
  });

  const concatListPath = path.join(segmentRoot, 'concat-list.txt');
  fs.writeFileSync(concatListPath, `${segmentPaths.map((item) => `file '${item.replace(/'/g, "'\\''")}'`).join('\n')}\n`, 'utf8');
  const videoOnlyPath = path.join(postRoot, 'HSL_FINAL_DOCUMENTARY.video-only.mp4');
  runFfmpeg([
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', concatListPath,
    '-c', 'copy', videoOnlyPath
  ], 'HSL_VIDEO_5_FAST_CONCAT_FAILED');

  const finalVideoPath = path.join(postRoot, 'HSL_FINAL_DOCUMENTARY.mp4');
  runFfmpeg([
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', videoOnlyPath,
    '-i', narrationPath,
    '-i', soundFxPath,
    '-filter_complex', '[1:a]volume=1.0,aformat=channel_layouts=stereo[a1];[2:a]volume=0.72,aformat=channel_layouts=stereo[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11,aformat=sample_rates=48000:channel_layouts=stereo[a]',
    '-map', '0:v:0', '-map', '[a]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-shortest', '-movflags', '+faststart',
    finalVideoPath
  ], 'HSL_VIDEO_5_FAST_AUDIO_MUX_FAILED');

  const contactSheetPath = path.join(postRoot, 'contact-sheet.png');
  runFfmpeg([
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', finalVideoPath,
    '-vf', 'fps=1/60,scale=640:-1,tile=4x2:padding=8:margin=8:color=0x0D0E15',
    '-frames:v', '1', contactSheetPath
  ], 'HSL_VIDEO_5_FAST_CONTACT_SHEET_FAILED');

  const validation = validateVideoWithFfprobe(finalVideoPath);
  if (!validation.valid) throw new Error(`HSL_VIDEO_5_FAST_FINAL_INVALID:${validation.ffprobe_stderr}`);
  const renderManifestPath = path.join(postRoot, 'render-manifest.json');
  const finalRenderManifestPath = path.join(postRoot, 'final-render-manifest.json');
  const renderManifest = {
    schema: 'hsl.video-5.fast-render-manifest.v1',
    production_id: productionId,
    status: 'FINAL_RENDER_QA_PASS',
    render_engine: 'ffmpeg_direct_recovery',
    overlay_policy: {hsl_docs: false, ai_visualization: false, loading_line: false, hybrid_text: false},
    scene_count: props.scenes.length,
    final_video_path: finalVideoPath,
    contact_sheet_path: contactSheetPath,
    validation,
    completed_at: new Date().toISOString()
  };
  writeJson(renderManifestPath, {
    ...renderManifest
  });
  writeJson(finalRenderManifestPath, renderManifest);
  const finalManifestPath = path.join(runRoot, 'video-5-final-manifest.json');
  writeJson(finalManifestPath, {
    schema: 'hsl.video-5.final-manifest.v1',
    schema_version: '1.0.0',
    status: 'HSL_VIDEO_5_COMPLETE',
    production_id: productionId,
    title: 'The Invisible System That Keeps a City from Flooding',
    narration_status: 'VOICEBOX_LOCAL_FINAL',
    narration_source_path: path.join(postRoot, 'narration.mp3'),
    fitted_narration_path: narrationPath,
    soundfx_provider: 'Kenney',
    soundfx_license: 'CC0-1.0',
    soundfx_bed_path: soundFxPath,
    overlays: {hsl_docs: false, ai_visualization: false, loading_line: false, hybrid_text: false},
    final_video_path: finalVideoPath,
    final_render_manifest_path: finalRenderManifestPath,
    contact_sheet_path: contactSheetPath,
    final_render: validation,
    completed_at: new Date().toISOString()
  });
  process.stdout.write(`${JSON.stringify({
    status: 'HSL_VIDEO_5_COMPLETE',
    render_engine: 'ffmpeg_direct_recovery',
    title: 'The Invisible System That Keeps a City from Flooding',
    final_video_path: finalVideoPath,
    contact_sheet_path: contactSheetPath,
    final_manifest_path: finalManifestPath,
    duration_seconds: validation.duration_seconds,
    sha256: validation.sha256
  }, null, 2)}\n`);
}

main();
