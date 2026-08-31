import fs from 'fs';
import path from 'path';
import scenes from '../contracts/episodes/drones-agro-noturnos.scenes.json';
import {HslSoundFxRuntime} from '../hsl/postproduction/soundFxRuntime';

const episodeId = 'drones-agro-noturnos';
const root = process.cwd();
const output = path.join(root, 'runs', episodeId, 'postproduction', 'soundfx');
const executable = (scenes as any[]).map((scene, index) => ({
  schema: 'hsl.execution.scene.v1', schema_version: '1.0.0', episode_id: episodeId,
  scene_id: scene.sceneId, chapter_id: scene.chapter, narrative_function: scene.title,
  voiceover: scene.voiceover, visual_mode: scene.required_category === 'matter' ? 'generated_ai' : 'remotion',
  visual_subject: scene.visualSubject, planned_duration_seconds: scene.targetSeconds,
  micro_events: [{at_percent: 58, action: /gargalo|falha|limite|deriva|obstáculo/i.test(scene.voiceover) ? 'gargalo' : 'processo', subject: scene.title}],
  remotion_choreography: index % 4 === 0 ? [{at_percent: 36, type: 'flow_line', color_role: 'orange'}] : [],
})) as any;

const result = new HslSoundFxRuntime().run({scenes: executable, outputDirectory: output, fps: 30});
const publicDir = path.join(root, 'public', 'episodes', episodeId, 'audio', 'sfx');
fs.mkdirSync(publicDir, {recursive: true}); fs.copyFileSync(result.bedPath, path.join(publicDir, 'soundfx-bed.wav'));
const manifestPath = path.join(root, 'runs', episodeId, 'run-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.stages.sfx = {status: 'DONE', plan: result.planPath, bed: result.bedPath, qa: result.qa}; manifest.updatedAt = new Date().toISOString();
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({status: 'SFX_DONE', plan: result.planPath, bed: result.bedPath, qa: result.qa}, null, 2));
