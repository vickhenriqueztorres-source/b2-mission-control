import fs from 'fs';
import path from 'path';
import {spawnSync} from 'child_process';

function main(): void {
  const productionId = process.env.HSL_VIDEO_2_RUN_ID || 'HSL-VIDEO-002';
  const runRoot = path.resolve(process.env.HSL_VIDEO_2_OUTPUT || path.join('runs', productionId));
  const executionRoot = path.join(runRoot, 'editorial', 'execution');
  const plan = JSON.parse(fs.readFileSync(path.join(executionRoot, 'episode.execution.json'), 'utf8')) as {scenes: string[]};
  const text = plan.scenes.map((relative) => {
    const scene = JSON.parse(fs.readFileSync(path.resolve(executionRoot, relative), 'utf8')) as {voiceover: string};
    return scene.voiceover.trim();
  }).filter(Boolean).join('\r\n\r\n');
  const outputRoot = path.join(runRoot, 'postproduction');
  fs.mkdirSync(outputRoot, {recursive: true});
  const textPath = path.join(outputRoot, 'narration-review-script.txt');
  const outputPath = path.join(outputRoot, 'narration-review-fallback.wav');
  fs.writeFileSync(textPath, text, 'utf8');
  const result = spawnSync('powershell.exe', [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.resolve('scripts/renderWindowsNarration.ps1'),
    '-TextPath', textPath, '-OutputPath', outputPath
  ], {encoding: 'utf8', maxBuffer: 1024 * 1024 * 10});
  if (result.status !== 0) throw new Error(`HSL_WINDOWS_NARRATION_FAILED:${result.stderr || result.stdout || ''}`);
  process.stdout.write(`${JSON.stringify({
    status: 'REVIEW_NARRATION_GENERATED', final_voice_status: 'ELEVENLABS_QUOTA_BLOCKED',
    voice: 'Microsoft David Desktop', output_path: outputPath, byte_count: fs.statSync(outputPath).size
  }, null, 2)}\n`);
}

main();
