import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {assertOfficialHslNarrationConfig} from '../config/hslProductionRules';
import {NarrationVoiceAgent} from '../hsl/postproduction/postproductionRuntime';

async function main(): Promise<void> {
  assertOfficialHslNarrationConfig();
  const productionId = process.env.HSL_VIDEO_4_RUN_ID || 'HSL-VIDEO-004';
  const runRoot = path.resolve(process.env.HSL_VIDEO_4_OUTPUT || path.join('runs', productionId));
  const executionRoot = path.join(runRoot, 'editorial', 'execution');
  const executionPlanPath = path.join(executionRoot, 'episode.execution.json');
  const plan = JSON.parse(fs.readFileSync(executionPlanPath, 'utf8')) as {scenes: string[]};
  const scenes = plan.scenes.map((relative) => JSON.parse(
    fs.readFileSync(path.resolve(executionRoot, relative), 'utf8')
  ) as {scene_id: string; voiceover: string});
  const text = scenes.map((scene) => scene.voiceover.trim()).filter(Boolean).join('\n\n');
  const outputPath = path.join(runRoot, 'postproduction', 'narration.mp3');
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
    process.stdout.write(`${JSON.stringify({
      status: 'NARRATION_ALREADY_PRESENT',
      official_voice: process.env.HSL_OFFICIAL_VOICE_NAME || 'Echo',
      provider: process.env.HSL_NARRATION_PROVIDER || 'voicebox',
      preset_voice_id: process.env.HSL_VOICEBOX_PRESET_VOICE_ID || null,
      scene_count: scenes.length,
      output_path: outputPath
    }, null, 2)}\n`);
    return;
  }
  await new NarrationVoiceAgent().generate(text, outputPath);
  process.stdout.write(`${JSON.stringify({
    status: 'NARRATION_GENERATED',
    official_voice: process.env.HSL_OFFICIAL_VOICE_NAME || 'Echo',
    provider: process.env.HSL_NARRATION_PROVIDER || 'voicebox',
    preset_voice_id: process.env.HSL_VOICEBOX_PRESET_VOICE_ID || null,
    scene_count: scenes.length,
    character_count: text.length,
    output_path: outputPath,
    byte_count: fs.statSync(outputPath).size
  }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
