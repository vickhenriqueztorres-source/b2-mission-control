import fs from 'fs';
import path from 'path';

type ShotPlanItem = {
  shot_id: string;
  candidate_path: string;
  motion_prompt: string;
  planned_duration_seconds?: number;
};

type ShotPlan = {
  episode_id: string;
  items: ShotPlanItem[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function safeDuration(seconds: number | undefined): number {
  const rounded = Math.ceil(Number(seconds || 5));
  return Math.max(4, Math.min(8, rounded));
}

function main(): void {
  const repoRoot = process.cwd();
  const runRoot = path.join(repoRoot, 'runs', 'OOL-EP06-SEMAFORO');
  const planPath = path.join(runRoot, 'start-frame-candidates', 'start-frame-shot-plan.json');
  const guideRoot = path.join(runRoot, 'firefly-guide');
  const imagesDir = path.join(guideRoot, 'imagens');
  fs.mkdirSync(imagesDir, {recursive: true});

  const plan = readJson<ShotPlan>(planPath);
  if (plan.episode_id !== 'OOL-EP06-SEMAFORO') {
    throw new Error(`Unexpected episode_id: ${plan.episode_id}`);
  }

  const items = plan.items.map((item) => {
    if (!fs.existsSync(item.candidate_path)) {
      throw new Error(`Missing candidate frame: ${item.candidate_path}`);
    }
    const imageName = `${item.shot_id}.png`;
    fs.copyFileSync(item.candidate_path, path.join(imagesDir, imageName));
    return {
      name: `${item.shot_id}_TAKE_01`,
      image: imageName,
      prompt: [
        item.motion_prompt,
        'Cinematic 35mm industrial documentary motion, wet asphalt reflections, carbon-black shadows, sodium-vapor orange only on critical signal flow, laser-cyan telemetry only as restrained x-ray evidence.',
        'Preserve the first frame composition, no titles, no readable text, no logos, no presenter, no identifiable human faces, no morphing, no extra vehicles appearing suddenly, stable camera motion, realistic rain and practical lighting.'
      ].join(' '),
      model: 'Kling 3.0',
      resolution: '720p',
      aspect_ratio: '16:9',
      duration_seconds: safeDuration(item.planned_duration_seconds),
      generate_audio: false
    };
  });

  const guide = {
    batch_name: 'OOL-EP06-SEMAFORO_firefly_video',
    source_run: 'OOL-EP06-SEMAFORO',
    model: 'Kling 3.0',
    resolution: '720p',
    aspect_ratio: '16:9',
    duration_seconds: 6,
    generate_audio: false,
    items
  };

  const guidePath = path.join(guideRoot, 'firefly-guide.json');
  fs.writeFileSync(guidePath, `${JSON.stringify(guide, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({
    status: 'FIREFLY_GUIDE_READY',
    guide_path: guidePath,
    image_count: items.length,
    first_item: items[0]?.name,
    last_item: items[items.length - 1]?.name
  }, null, 2)}\n`);
}

main();
