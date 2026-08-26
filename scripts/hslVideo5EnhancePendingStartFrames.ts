import {spawnSync} from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

type Rgb = readonly [number, number, number];

type JobRow = {
  readonly id: number;
  readonly name: string;
  readonly image_path: string | null;
  readonly status: string;
};

type PlanItem = {
  readonly shot_id: string;
  readonly parent_scene_id: string;
  readonly start_frame_prompt?: string | null;
};

type PremiumFamily = 'cinematic-node' | 'journey-map' | 'last-meters' | 'delay-spread' | 'data-center' | 'ocean-backbone';

const WIDTH = 1280;
const HEIGHT = 720;
const BLACK: Rgb = [6, 8, 13];
const DEEP_BLUE: Rgb = [0, 43, 170];
const BLUE: Rgb = [0, 56, 255];
const YELLOW: Rgb = [255, 229, 0];
const ORANGE: Rgb = [255, 74, 0];
const WHITE: Rgb = [238, 238, 232];

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function shaFile(filePath: string): string {
  return `sha256_${crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')}`;
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function blend(buffer: Buffer, x: number, y: number, color: Rgb, alpha: number): void {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const offset = (Math.floor(y) * WIDTH + Math.floor(x)) * 3;
  buffer[offset] = clamp(buffer[offset] * (1 - alpha) + color[0] * alpha);
  buffer[offset + 1] = clamp(buffer[offset + 1] * (1 - alpha) + color[1] * alpha);
  buffer[offset + 2] = clamp(buffer[offset + 2] * (1 - alpha) + color[2] * alpha);
}

function rect(buffer: Buffer, x: number, y: number, w: number, h: number, color: Rgb, alpha = 1): void {
  for (let yy = Math.floor(y); yy < Math.floor(y + h); yy++) {
    for (let xx = Math.floor(x); xx < Math.floor(x + w); xx++) blend(buffer, xx, yy, color, alpha);
  }
}

function circle(buffer: Buffer, cx: number, cy: number, radius: number, color: Rgb, alpha = 1): void {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
      const d2 = (x - cx) ** 2 + (y - cy) ** 2;
      if (d2 <= r2) blend(buffer, x, y, color, alpha * (1 - d2 / r2 * 0.2));
    }
  }
}

function glow(buffer: Buffer, cx: number, cy: number, radius: number, color: Rgb, alpha = 0.35): void {
  for (let r = radius; r > 0; r -= 5) circle(buffer, cx, cy, r, color, alpha * (1 - r / radius) * 0.2);
}

function line(buffer: Buffer, x1: number, y1: number, x2: number, y2: number, color: Rgb, thickness = 3, alpha = 1): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    circle(buffer, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness, color, alpha);
  }
}

function curve(buffer: Buffer, points: readonly [number, number][], color: Rgb, thickness = 4, alpha = 1): void {
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    line(buffer, x1, y1, x2, y2, color, thickness, alpha);
  }
}

function fillCinematic(buffer: Buffer, seed: number): void {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const offset = (y * WIDTH + x) * 3;
      const vignette = Math.hypot((x - WIDTH / 2) / WIDTH, (y - HEIGHT / 2) / HEIGHT);
      const warmHorizon = Math.max(0, 1 - Math.abs(y - 350) / 230);
      const grain = (((x * 31 + y * 17 + seed * 47) % 101) - 50) * 0.75;
      buffer[offset] = clamp(BLACK[0] + 12 + warmHorizon * 30 - vignette * 32 + grain);
      buffer[offset + 1] = clamp(BLACK[1] + 16 + warmHorizon * 20 - vignette * 24 + grain * 0.65);
      buffer[offset + 2] = clamp(BLACK[2] + 24 + (y / HEIGHT) * 24 - vignette * 18 + grain * 0.45);
    }
  }
}

function addGrid(buffer: Buffer, seed: number): void {
  for (let x = -160 + (seed * 23) % 90; x < WIDTH + 160; x += 82) line(buffer, x, 0, x + 230, HEIGHT, [45, 55, 68], 1, 0.16);
  for (let y = 70 + (seed * 11) % 60; y < HEIGHT; y += 70) line(buffer, 0, y, WIDTH, y - 25, [42, 50, 62], 1, 0.14);
}

function addDiagonalMasks(buffer: Buffer, seed: number): void {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (x < 80 + y * 0.54 || x > WIDTH - 120 + y * 0.28) blend(buffer, x, y, BLACK, 0.55);
    }
  }
  if (seed % 2 === 0) {
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        if (x > 760 + y * 0.78) blend(buffer, x, y, BLACK, 0.38);
      }
    }
  }
}

function drawPerspectiveRoad(buffer: Buffer): void {
  rect(buffer, 0, 485, WIDTH, 170, [16, 18, 23], 0.72);
  for (let i = 0; i < 12; i++) line(buffer, 140 + i * 92, 665, 540 + i * 42, 470, [62, 66, 70], 1, 0.34);
}

function drawServerCity(buffer: Buffer, seed: number, centerX = 650): void {
  for (let i = 0; i < 10; i++) {
    const h = 210 + ((i * 37 + seed) % 130);
    const x = centerX - 370 + i * 76;
    rect(buffer, x, 470 - h, 48, h, [18, 23, 32], 0.95);
    rect(buffer, x + 5, 486 - h, 38, 7, BLUE, 0.42);
    for (let p = 0; p < 15; p++) circle(buffer, x + 13 + (p % 3) * 11, 520 - h + p * 17, 2, p % 5 === seed % 5 ? YELLOW : [70, 83, 110], 0.72);
  }
}

function drawRouterSilhouette(buffer: Buffer, x: number, y: number): void {
  rect(buffer, x, y, 230, 82, [26, 30, 36], 0.98);
  rect(buffer, x + 34, y - 42, 12, 42, WHITE, 0.72);
  rect(buffer, x + 181, y - 42, 12, 42, WHITE, 0.72);
  circle(buffer, x + 58, y + 42, 6, YELLOW, 0.9);
  circle(buffer, x + 84, y + 42, 4, BLUE, 0.8);
}

function familyFor(item: PlanItem): PremiumFamily {
  const text = `${item.parent_scene_id} ${item.start_frame_prompt || ''}`.toLowerCase();
  const variant = item.shot_id.match(/_V(\d+)$/)?.[1] || '01';
  if (/cut|sever|break|damaged|congestion|queue|packet loss|buffer/.test(text)) {
    if (variant === '02') return 'last-meters';
    if (variant === '03') return 'journey-map';
    return 'delay-spread';
  }
  if (/submarine|ocean|landing/.test(text)) return 'ocean-backbone';
  if (/data center|server|cdn|cache/.test(text)) {
    if (variant === '02') return 'journey-map';
    if (variant === '03') return 'cinematic-node';
    return 'data-center';
  }
  if (/last mile|drop|pole|cabinet|splitter|patch|home/.test(text)) return 'last-meters';
  if (/dns|exchange|ixp|backbone|route|return/.test(text)) return 'journey-map';
  return 'cinematic-node';
}

function drawJourneyMap(buffer: Buffer, seed: number): void {
  addGrid(buffer, seed);
  const pts: [number, number][] = [[115, 505], [310, 430], [510, 470], [710, 330], [930, 385], [1135, 265]];
  const infra: [number, number][] = [[80, 340], [300, 300], [535, 330], [770, 245], [1040, 290], [1210, 180]];
  curve(buffer, infra, BLUE, 4, 0.55);
  curve(buffer, pts, YELLOW, 7, 0.96);
  pts.forEach(([x, y], i) => {
    glow(buffer, x, y, i === 5 ? 100 : 64, i < 4 ? YELLOW : BLUE, 0.5);
    circle(buffer, x, y, 12, i < 4 ? YELLOW : BLUE, 0.95);
    circle(buffer, x, y, 32, WHITE, 0.08);
  });
}

function drawLastMeters(buffer: Buffer, seed: number): void {
  drawPerspectiveRoad(buffer);
  rect(buffer, 725, 190, 250, 310, [32, 36, 42], 0.95);
  rect(buffer, 758, 235, 186, 205, [13, 18, 25], 0.88);
  for (let i = 0; i < 8; i++) line(buffer, 780, 260 + i * 22, 925, 250 + i * 16, i % 2 ? DEEP_BLUE : YELLOW, 3, 0.82);
  for (let i = 0; i < 5; i++) {
    const poleX = 140 + i * 150;
    line(buffer, poleX, 230, poleX, 575, [50, 52, 49], 5, 0.9);
    line(buffer, poleX, 250, poleX + 150, 275 - i * 5, BLUE, 3, 0.62);
  }
  curve(buffer, [[70, 612], [340, 565], [595, 515], [760, 455], [1120, 360]], YELLOW, 7, 0.96);
  glow(buffer, 805 + (seed % 3) * 24, 420, 115, YELLOW, 0.46);
}

function drawDelaySpread(buffer: Buffer, seed: number): void {
  drawPerspectiveRoad(buffer);
  glow(buffer, 560, 388, 160, ORANGE, 0.8);
  rect(buffer, 488, 280, 220, 150, [31, 34, 42], 0.98);
  curve(buffer, [[90, 565], [250, 525], [390, 480], [510, 405]], YELLOW, 7, 0.96);
  for (let i = 0; i < 8; i++) circle(buffer, 170 + i * 42, 535 - Math.min(i, 5) * 24, 9, YELLOW, 0.84);
  for (let i = 0; i < 7; i++) line(buffer, 648, 348, 930 + i * 28, 190 + i * 55, i % 2 ? ORANGE : YELLOW, 4, 0.78);
  line(buffer, 520, 284, 610, 445, ORANGE, 8, 0.95);
}

function drawDataCenter(buffer: Buffer, seed: number): void {
  drawServerCity(buffer, seed);
  glow(buffer, 485, 410, 145, YELLOW, 0.42);
  glow(buffer, 970, 280, 130, BLUE, 0.34);
  curve(buffer, [[105, 610], [320, 565], [545, 505], [760, 430], [1115, 260]], YELLOW, 6, 0.94);
  curve(buffer, [[210, 210], [470, 250], [700, 215], [995, 155], [1190, 195]], BLUE, 4, 0.5);
}

function drawOceanBackbone(buffer: Buffer, seed: number): void {
  rect(buffer, 0, 365, WIDTH, 300, [5, 25, 43], 0.82);
  for (let i = 0; i < 110; i++) blend(buffer, (i * 79 + seed * 13) % WIDTH, 390 + (i * 37) % 220, [36, 88, 135], 0.33);
  curve(buffer, [[70, 560], [320, 535], [545, 500], [785, 435], [1040, 360]], YELLOW, 7, 0.96);
  rect(buffer, 930, 260, 230, 135, [36, 36, 34], 0.88);
  line(buffer, 1030, 395, 1210, 315, BLUE, 4, 0.68);
  glow(buffer, 805, 435, 100, YELLOW, 0.42);
}

function drawCinematicNode(buffer: Buffer, seed: number): void {
  drawPerspectiveRoad(buffer);
  drawRouterSilhouette(buffer, 500, 300);
  for (let r = 92; r <= 310; r += 66) circle(buffer, 620, 344, r, BLUE, 0.035);
  curve(buffer, [[95, 610], [350, 550], [560, 383], [850, 435], [1190, 300]], YELLOW, 6, 0.95);
  glow(buffer, 610, 348, 115, YELLOW, 0.42);
}

function renderPremium(item: PlanItem, seed: number): {buffer: Buffer; family: PremiumFamily} {
  const buffer = Buffer.alloc(WIDTH * HEIGHT * 3);
  fillCinematic(buffer, seed);
  addGrid(buffer, seed);
  const family = familyFor(item);
  if (family === 'journey-map') drawJourneyMap(buffer, seed);
  else if (family === 'last-meters') drawLastMeters(buffer, seed);
  else if (family === 'delay-spread') drawDelaySpread(buffer, seed);
  else if (family === 'data-center') drawDataCenter(buffer, seed);
  else if (family === 'ocean-backbone') drawOceanBackbone(buffer, seed);
  else drawCinematicNode(buffer, seed);
  addDiagonalMasks(buffer, seed);
  return {buffer, family};
}

function writePpm(buffer: Buffer, filePath: string, width = WIDTH, height = HEIGHT): void {
  fs.writeFileSync(filePath, Buffer.concat([Buffer.from(`P6\n${width} ${height}\n255\n`, 'ascii'), buffer]));
}

function renderPng(buffer: Buffer, outputPath: string, width = WIDTH, height = HEIGHT): void {
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  const temp = `${outputPath}.${process.pid}.ppm`;
  writePpm(buffer, temp, width, height);
  const result = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', temp, '-frames:v', '1', outputPath], {encoding: 'utf8'});
  fs.rmSync(temp, {force: true});
  if (result.status !== 0) throw new Error(`HSL_VIDEO_5_PREMIUM_FRAME_RENDER_FAILED:${result.stderr || result.stdout}`);
}

function copyIfDifferent(source: string, destination: string): void {
  fs.mkdirSync(path.dirname(destination), {recursive: true});
  fs.copyFileSync(source, destination);
}

function shotIdFromJobName(jobName: string): string {
  return jobName.replace(/_TAKE_\d+$/, '');
}

function referenceForFamily(family: PremiumFamily): string {
  if (family === 'journey-map') return 'FLOW_JOURNEY_MAP';
  if (family === 'last-meters') return 'LAST_METERS';
  if (family === 'delay-spread') return 'DELAY_SPREADS';
  if (family === 'data-center') return 'BUFFER_AND_FLOW';
  if (family === 'ocean-backbone') return 'FLOW_JOURNEY_MAP';
  return 'SYSTEMS_IN_MOTION';
}

function premiumPrompt(originalPrompt: string, item: PlanItem, family: PremiumFamily): string {
  const reference = referenceForFamily(family);
  const styleBlock = [
    `HSL PREMIUM MOTION REFERENCE SET V1: follow the approved ${reference} design language already established for this channel.`,
    'Design target: cinematic realism plus spatial infographic, not a flat dark diagram.',
    'The provided first frame is the exact start frame. Animate from this initial state, do not jump to a different composition.',
    'Yellow is the active moving flow. Blue is persistent infrastructure. Orange appears only for constraint, blockage or alert.',
    'Use one primary luminous focus, restrained particles, preserved shadow detail, diagonal documentary framing and real camera depth.',
    'No embedded titles, no readable words, no numbers, no labels, no logos, no UI panels with text. Critical text is added later in Remotion.',
    'Motion should reveal one clear transformation in 5 seconds: pulse, route travel, handoff, blockage, propagation, or scale reveal.'
  ].join('\n');
  return [
    originalPrompt,
    '',
    styleBlock,
    '',
    `Shot design family: ${family}. Parent scene: ${item.parent_scene_id}.`
  ].join('\n');
}

function makeContactSheet(buffers: readonly {shotId: string; buffer: Buffer}[], outputPath: string): void {
  const cellW = 320;
  const cellH = 180;
  const cols = 4;
  const rows = Math.ceil(buffers.length / cols);
  const sheet = Buffer.alloc(cellW * cellH * cols * rows * 3, 0);
  buffers.forEach((item, index) => {
    const ox = (index % cols) * cellW;
    const oy = Math.floor(index / cols) * cellH;
    for (let y = 0; y < cellH; y++) {
      for (let x = 0; x < cellW; x++) {
        const sx = Math.floor(x * WIDTH / cellW);
        const sy = Math.floor(y * HEIGHT / cellH);
        const source = (sy * WIDTH + sx) * 3;
        const target = ((oy + y) * cellW * cols + ox + x) * 3;
        sheet[target] = item.buffer[source];
        sheet[target + 1] = item.buffer[source + 1];
        sheet[target + 2] = item.buffer[source + 2];
      }
    }
  });
  renderPng(sheet, outputPath, cellW * cols, cellH * rows);
}

function main(): void {
  throw new Error('HSL_PROCEDURAL_START_FRAME_ENHANCEMENT_FORBIDDEN: generate reference-conditioned photographic Start Frames and register hsl.start-frame.provenance.v2 instead');
  /* istanbul ignore next -- legacy implementation retained only for audit history. */
  const productionId = process.env.HSL_VIDEO_5_RUN_ID || 'HSL-VIDEO-005';
  const runRoot = path.resolve(process.env.HSL_VIDEO_5_OUTPUT || path.join('runs', productionId));
  const dbPath = process.env.FIREFLY_AUTOMATION_DB || 'C:/B2-AI-STUDIO/links/firefly-automation/data/firefly_jobs.db';
  const planPath = path.join(runRoot, 'start-frame-candidates', 'start-frame-shot-plan.json');
  if (!fs.existsSync(planPath)) throw new Error(`HSL_VIDEO_5_START_FRAME_PLAN_REQUIRED:${planPath}`);

  const db = new Database(dbPath);
  const pendingJobs = db.prepare("select id,name,image_path,status from jobs where name like 'HSL5_%' and status = 'pending' order by id").all() as JobRow[];
  const updatePrompt = db.prepare("update jobs set prompt = ?, updated_at = ? where id = ? and status = 'pending'");
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8')) as {items: PlanItem[]};
  const planByShot = new Map(plan.items.map((item) => [item.shot_id, item]));

  const enhancedBuffers: {shotId: string; buffer: Buffer}[] = [];
  const enhanced = pendingJobs.map((job, index) => {
    const shotId = shotIdFromJobName(job.name);
    const item = planByShot.get(shotId);
    if (!item) throw new Error(`HSL_VIDEO_5_PENDING_SHOT_NOT_IN_PLAN:${shotId}`);
    if (!job.image_path) throw new Error(`HSL_VIDEO_5_PENDING_JOB_WITHOUT_IMAGE:${job.name}`);
    const {buffer, family} = renderPremium(item, job.id + index * 17);
    const candidatePath = path.join(runRoot, 'start-frame-candidates', `${shotId}.png`);
    const generationPath = path.join(runRoot, 'generation', 'start-frames', shotId, `START_FRAME_${shotId}.png`);
    const shotImagePath = path.join(runRoot, 'firefly', 'shots', shotId, 'imagens', `${job.name}_start.png`);
    renderPng(buffer, candidatePath);
    copyIfDifferent(candidatePath, generationPath);
    copyIfDifferent(candidatePath, job.image_path);
    copyIfDifferent(candidatePath, shotImagePath);
    const currentPrompt = db.prepare('select prompt from jobs where id = ?').get(job.id) as {prompt: string} | undefined;
    const promptUpdate = currentPrompt
      ? updatePrompt.run(premiumPrompt(currentPrompt.prompt, item, family), Date.now() / 1000, job.id).changes
      : 0;
    enhancedBuffers.push({shotId, buffer});
    return {
      job_id: job.id,
      job_name: job.name,
      shot_id: shotId,
      premium_family: family,
      candidate_path: candidatePath,
      generation_start_frame_path: generationPath,
      provider_image_path: job.image_path,
      prompt_update_status: promptUpdate === 1 ? 'UPDATED' : 'SKIPPED_NOT_PENDING',
      reference_asset_id: referenceForFamily(family),
      sha256: shaFile(candidatePath)
    };
  });

  const familyCounts = enhanced.reduce<Record<string, number>>((counts, item) => {
    counts[item.premium_family] = (counts[item.premium_family] || 0) + 1;
    return counts;
  }, {});
  const contactSheetPath = path.join(runRoot, 'start-frame-candidates', 'premium-pending-contact-sheet.png');
  if (enhancedBuffers.length > 0) makeContactSheet(enhancedBuffers, contactSheetPath);
  const manifestPath = path.join(runRoot, 'start-frame-candidates', 'premium-pending-enhancement-manifest.json');
  writeJson(manifestPath, {
    schema: 'hsl.video-5.premium-pending-start-frame-enhancement.v1',
    production_id: productionId,
    status: 'PENDING_START_FRAMES_ENHANCED',
    preserved_done_and_generating_jobs: true,
    no_embedded_text_policy: 'critical text remains outside provider frames',
    reference_intent: [
      'cinematic dark documentary base',
      'yellow active flow',
      'blue passive infrastructure',
      'orange bottleneck or failure only',
      'diagonal matte framing',
      'spatial infographic without readable text'
    ],
    enhanced_count: enhanced.length,
    premium_family_counts: familyCounts,
    contact_sheet_path: contactSheetPath,
    items: enhanced,
    created_at: new Date().toISOString()
  });

  process.stdout.write(`${JSON.stringify({
    status: 'PENDING_START_FRAMES_ENHANCED',
    enhanced_count: enhanced.length,
    premium_family_counts: familyCounts,
    contact_sheet_path: contactSheetPath,
    manifest_path: manifestPath
  }, null, 2)}\n`);
}

main();
