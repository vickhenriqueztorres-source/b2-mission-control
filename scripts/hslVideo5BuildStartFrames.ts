import {spawnSync} from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  HSL_PREMIUM_MOTION_REFERENCE_SET,
  HSL_VISUAL_IDENTITY_CONTRACT_VERSION
} from '../config/hslVisualIdentity';

type ShotPlanItem = {
  readonly shot_id: string;
  readonly parent_scene_id: string;
  readonly variant?: string;
  readonly start_frame_prompt?: string | null;
  readonly motion_prompt?: string | null;
};

type Family =
  | 'storm-street'
  | 'surface-flow'
  | 'debris-inlet'
  | 'catch-basin'
  | 'pipe-network'
  | 'trunk-gallery'
  | 'detention-basin'
  | 'green-infra'
  | 'pump-station'
  | 'underpass'
  | 'outfall'
  | 'backwater'
  | 'flood-spread'
  | 'maintenance';

type Rgb = readonly [number, number, number];

const WIDTH = 1280;
const HEIGHT = 720;
const BLACK: Rgb = [8, 10, 16];
const BLUE: Rgb = [0, 56, 255];
const YELLOW: Rgb = [255, 229, 0];
const ORANGE: Rgb = [255, 74, 0];
const WHITE: Rgb = [236, 236, 232];

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function shaFile(filePath: string): string {
  return `sha256_${crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')}`;
}

function shaText(value: string): string {
  return `sha256_${crypto.createHash('sha256').update(value, 'utf8').digest('hex')}`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function blend(buffer: Buffer, x: number, y: number, color: Rgb, alpha: number): void {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const offset = (Math.floor(y) * WIDTH + Math.floor(x)) * 3;
  buffer[offset] = clamp(buffer[offset] * (1 - alpha) + color[0] * alpha);
  buffer[offset + 1] = clamp(buffer[offset + 1] * (1 - alpha) + color[1] * alpha);
  buffer[offset + 2] = clamp(buffer[offset + 2] * (1 - alpha) + color[2] * alpha);
}

function fill(buffer: Buffer, seed: number): void {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const offset = (y * WIDTH + x) * 3;
      const vignette = Math.hypot((x - WIDTH / 2) / WIDTH, (y - HEIGHT / 2) / HEIGHT);
      const horizon = y / HEIGHT;
      const noise = (((x * 37 + y * 17 + seed * 53) % 97) - 48) * 1.05;
      const fine = (((x * 113 + y * 71 + seed * 29) % 41) - 20) * 0.9;
      const structuralTexture = ((Math.floor(x / 19) + Math.floor(y / 13) + seed) % 2) * 13;
      buffer[offset] = clamp(BLACK[0] + 34 + horizon * 34 - vignette * 18 + noise + fine + structuralTexture);
      buffer[offset + 1] = clamp(BLACK[1] + 34 + horizon * 34 - vignette * 16 + noise * 0.75 - fine * 0.25 + structuralTexture * 0.8);
      buffer[offset + 2] = clamp(BLACK[2] + 36 + horizon * 46 - vignette * 10 + noise * 0.55 + fine + structuralTexture * 0.65 + Math.sin((x + seed) / 80) * 8);
    }
  }
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
      if (d2 <= r2) blend(buffer, x, y, color, alpha * (1 - d2 / r2 * 0.35));
    }
  }
}

function glow(buffer: Buffer, cx: number, cy: number, radius: number, color: Rgb, alpha = 0.35): void {
  for (let r = radius; r > 0; r -= 4) circle(buffer, cx, cy, r, color, alpha * (1 - r / radius) * 0.18);
}

function line(buffer: Buffer, x1: number, y1: number, x2: number, y2: number, color: Rgb, thickness = 3, alpha = 1): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    circle(buffer, x, y, thickness, color, alpha);
  }
}

function grid(buffer: Buffer, seed: number): void {
  for (let x = (seed * 13) % 80; x < WIDTH; x += 80) line(buffer, x, 0, x - 90, HEIGHT, [42, 50, 62], 1, 0.22);
  for (let y = 40 + (seed * 7) % 50; y < HEIGHT; y += 64) line(buffer, 0, y, WIDTH, y - 40, [42, 50, 62], 1, 0.2);
}

function familyFor(item: ShotPlanItem): Family {
  const byScene: Record<string, Family> = {
    HSL5_001: 'storm-street',
    HSL5_002: 'debris-inlet',
    HSL5_003: 'pipe-network',
    HSL5_004: 'surface-flow',
    HSL5_005: 'surface-flow',
    HSL5_006: 'debris-inlet',
    HSL5_007: 'catch-basin',
    HSL5_008: 'debris-inlet',
    HSL5_009: 'debris-inlet',
    HSL5_010: 'pipe-network',
    HSL5_011: 'trunk-gallery',
    HSL5_012: 'trunk-gallery',
    HSL5_013: 'detention-basin',
    HSL5_014: 'green-infra',
    HSL5_015: 'detention-basin',
    HSL5_016: 'pump-station',
    HSL5_017: 'underpass',
    HSL5_018: 'pump-station',
    HSL5_019: 'outfall',
    HSL5_020: 'backwater',
    HSL5_021: 'flood-spread',
    HSL5_022: 'maintenance',
    HSL5_023: 'pipe-network',
    HSL5_024: 'storm-street'
  };
  if (byScene[item.parent_scene_id]) return byScene[item.parent_scene_id];
  const text = `${item.parent_scene_id} ${item.start_frame_prompt || ''}`.toLowerCase();
  if (/maintenance|crew|clear|grate/.test(text)) return 'maintenance';
  if (/aerial|spread|disrupt|network failure/.test(text)) return 'flood-spread';
  if (/backwater|pushing back|destination is full/.test(text)) return 'backwater';
  if (/outfall|channel|river|sea|harbor|ocean|receiving water/.test(text)) return 'outfall';
  if (/underpass|sump|lowest point|transportation corridor/.test(text)) return 'underpass';
  if (/pump|wet well|generator|mechanical|power/.test(text)) return 'pump-station';
  if (/green|rain garden|permeable|planted/.test(text)) return 'green-infra';
  if (/detention|basin|reservoir|storage|overflow/.test(text)) return 'detention-basin';
  if (/gallery|junction|underground rivers|main sewer|tunnel/.test(text)) return 'trunk-gallery';
  if (/lateral|pipe|merge|branches|storm sewer/.test(text)) return 'pipe-network';
  if (/catch basin|curb inlet|inlet|grate|blocked|debris|sediment/.test(text)) return text.includes('debris') || text.includes('blocked') ? 'debris-inlet' : 'catch-basin';
  if (/surface|rooftop|asphalt|street grade|intersection|pavement|runoff/.test(text)) return 'surface-flow';
  return 'storm-street';
}

function rain(buffer: Buffer, seed: number, alpha = 0.32): void {
  for (let i = 0; i < 420; i++) {
    const x = (i * 83 + seed * 31) % WIDTH;
    const y = (i * 47 + seed * 61) % HEIGHT;
    line(buffer, x, y, x - 14, y + 46, [150, 164, 178], 1, alpha);
  }
}

function buildings(buffer: Buffer, yBase = 432): void {
  for (let i = 0; i < 11; i++) {
    const w = 64 + (i % 4) * 24;
    const h = 150 + ((i * 53) % 180);
    const x = 40 + i * 112;
    rect(buffer, x, yBase - h, w, h, [20, 23, 28], 0.88);
    for (let yy = yBase - h + 20; yy < yBase - 12; yy += 34) {
      for (let xx = x + 10; xx < x + w - 8; xx += 22) {
        if ((xx + yy + i) % 3 === 0) rect(buffer, xx, yy, 8, 4, [240, 177, 85], 0.36);
      }
    }
  }
}

function pipe(buffer: Buffer, x1: number, y1: number, x2: number, y2: number, color: Rgb, thickness = 9, alpha = 0.7): void {
  line(buffer, x1, y1, x2, y2, [12, 18, 27], thickness + 5, 0.82);
  line(buffer, x1, y1, x2, y2, color, thickness, alpha);
  line(buffer, x1, y1 - thickness * 0.42, x2, y2 - thickness * 0.42, WHITE, 1, 0.18);
}

function routeMap(buffer: Buffer, nodes: Array<readonly [number, number]>, activeUntil: number, alert = false): void {
  nodes.forEach(([x, y], i) => {
    glow(buffer, x, y, 72, i <= activeUntil ? YELLOW : BLUE, 0.38);
    circle(buffer, x, y, 14, i <= activeUntil ? YELLOW : BLUE, 0.92);
  });
  for (let i = 0; i < nodes.length - 1; i++) {
    const color = alert && i === activeUntil ? ORANGE : i < activeUntil ? YELLOW : BLUE;
    line(buffer, nodes[i][0], nodes[i][1], nodes[i + 1][0], nodes[i + 1][1], color, 6, i <= activeUntil ? 0.9 : 0.46);
  }
}

function drawScene(buffer: Buffer, item: ShotPlanItem, index: number): Family {
  const family = familyFor(item);
  grid(buffer, index + family.length);
  const pulseX = 170 + (index * 67) % 880;
  const pulseY = 160 + (index * 41) % 360;
  const alertFamilies: Family[] = ['debris-inlet', 'underpass', 'backwater', 'flood-spread'];
  glow(buffer, pulseX, pulseY, 132, alertFamilies.includes(family) ? ORANGE : YELLOW, 0.5);
  rain(buffer, index, family === 'green-infra' ? 0.2 : 0.36);

  if (family === 'storm-street') {
    buildings(buffer, 438);
    rect(buffer, 0, 462, WIDTH, 170, [15, 18, 22], 0.94);
    line(buffer, 90, 592, 1150, 515, YELLOW, 8, 0.94);
    pipe(buffer, 260, 626, 1050, 610, BLUE, 5, 0.5);
    for (let i = 0; i < 5; i++) rect(buffer, 210 + i * 188, 502, 42, 8, [76, 82, 88], 0.9);
  } else if (family === 'surface-flow') {
    buildings(buffer, 420);
    rect(buffer, 0, 454, WIDTH, 190, [16, 18, 21], 0.96);
    for (let i = 0; i < 6; i++) line(buffer, 90 + i * 190, 430, 250 + i * 150, 602, YELLOW, 4, 0.68);
    line(buffer, 80, 606, 1180, 558, YELLOW, 7, 0.95);
    line(buffer, 70, 646, 1190, 646, BLUE, 3, 0.45);
  } else if (family === 'debris-inlet') {
    rect(buffer, 0, 430, WIDTH, 210, [20, 20, 19], 0.96);
    rect(buffer, 485, 430, 260, 96, [10, 12, 16], 0.96);
    for (let i = 0; i < 12; i++) rect(buffer, 500 + i * 19, 428, 7, 104, [85, 90, 96], 0.78);
    glow(buffer, 610, 462, 190, ORANGE, 0.82);
    line(buffer, 92, 575, 540, 468, YELLOW, 8, 0.92);
    line(buffer, 690, 475, 1180, 608, ORANGE, 7, 0.76);
    for (let i = 0; i < 23; i++) circle(buffer, 450 + (i * 37) % 250, 420 + (i * 29) % 122, 4 + (i % 5), [94, 72, 42], 0.82);
  } else if (family === 'catch-basin') {
    rect(buffer, 0, 348, WIDTH, 150, [19, 21, 23], 0.92);
    rect(buffer, 450, 286, 300, 320, [31, 35, 39], 0.95);
    rect(buffer, 486, 330, 226, 206, [8, 12, 18], 0.88);
    rect(buffer, 486, 518, 226, 36, [58, 43, 30], 0.76);
    line(buffer, 90, 412, 492, 390, YELLOW, 7, 0.9);
    pipe(buffer, 700, 460, 1130, 520, BLUE, 10, 0.68);
    glow(buffer, 606, 402, 96, YELLOW, 0.46);
  } else if (family === 'pipe-network') {
    rect(buffer, 0, 336, WIDTH, 106, [19, 21, 24], 0.9);
    rect(buffer, 0, 442, WIDTH, 210, [14, 12, 12], 0.94);
    pipe(buffer, 90, 558, 430, 520, BLUE, 8, 0.74);
    pipe(buffer, 222, 612, 510, 526, BLUE, 7, 0.62);
    pipe(buffer, 455, 522, 895, 496, YELLOW, 9, 0.9);
    pipe(buffer, 895, 496, 1160, 410, BLUE, 8, 0.56);
    circle(buffer, 460, 522, 28, YELLOW, 0.85);
  } else if (family === 'trunk-gallery') {
    rect(buffer, 0, 302, WIDTH, 112, [25, 27, 28], 0.88);
    rect(buffer, 0, 414, WIDTH, 240, [10, 12, 16], 0.98);
    rect(buffer, 232, 400, 760, 178, [36, 39, 44], 0.88);
    rect(buffer, 272, 430, 680, 104, [13, 19, 28], 0.94);
    line(buffer, 288, 504, 934, 500, YELLOW, 13, 0.9);
    line(buffer, 140, 458, 326, 498, BLUE, 6, 0.58);
    line(buffer, 955, 500, 1160, 432, BLUE, 6, 0.58);
  } else if (family === 'detention-basin') {
    buildings(buffer, 366);
    rect(buffer, 0, 384, WIDTH, 92, [17, 21, 25], 0.87);
    rect(buffer, 190, 474, 790, 126, [14, 31, 44], 0.9);
    line(buffer, 170, 486, 970, 486, WHITE, 2, 0.3);
    line(buffer, 108, 548, 378, 530, YELLOW, 8, 0.9);
    line(buffer, 852, 540, 1150, 500, BLUE, 6, 0.62);
    glow(buffer, 466, 520, 190, YELLOW, 0.42);
  } else if (family === 'green-infra') {
    buildings(buffer, 370);
    rect(buffer, 0, 420, WIDTH, 162, [18, 21, 21], 0.92);
    for (let i = 0; i < 18; i++) circle(buffer, 250 + (i * 42) % 620, 430 + (i * 31) % 120, 22, [38, 96, 61], 0.62);
    rect(buffer, 230, 438, 650, 112, [28, 54, 38], 0.65);
    line(buffer, 80, 558, 420, 496, YELLOW, 4, 0.72);
    line(buffer, 760, 510, 1160, 572, BLUE, 5, 0.52);
  } else if (family === 'pump-station') {
    rect(buffer, 0, 430, WIDTH, 190, [12, 17, 22], 0.96);
    rect(buffer, 210, 205, 360, 252, [28, 32, 36], 0.94);
    for (let i = 0; i < 3; i++) {
      circle(buffer, 280 + i * 102, 374, 38, [38, 44, 50], 0.95);
      circle(buffer, 280 + i * 102, 374, 17, BLUE, 0.72);
    }
    rect(buffer, 740, 190, 220, 328, [32, 35, 39], 0.9);
    line(buffer, 110, 558, 388, 390, YELLOW, 9, 0.92);
    pipe(buffer, 488, 370, 1110, 294, BLUE, 10, 0.66);
    glow(buffer, 390, 370, 135, YELLOW, 0.48);
  } else if (family === 'underpass') {
    rect(buffer, 0, 324, WIDTH, 96, [28, 30, 32], 0.9);
    rect(buffer, 0, 420, WIDTH, 202, [16, 19, 23], 0.96);
    line(buffer, 120, 590, 590, 506, YELLOW, 8, 0.9);
    line(buffer, 590, 506, 1080, 592, ORANGE, 10, 0.8);
    glow(buffer, 640, 534, 190, ORANGE, 0.74);
    pipe(buffer, 560, 604, 880, 492, BLUE, 7, 0.58);
  } else if (family === 'outfall') {
    rect(buffer, 0, 440, WIDTH, 190, [10, 30, 44], 0.82);
    rect(buffer, 0, 344, WIDTH, 96, [26, 28, 30], 0.86);
    rect(buffer, 124, 372, 300, 102, [36, 38, 40], 0.9);
    pipe(buffer, 158, 426, 506, 474, YELLOW, 11, 0.9);
    line(buffer, 500, 474, 1160, 516, BLUE, 7, 0.58);
    glow(buffer, 506, 474, 118, YELLOW, 0.46);
  } else if (family === 'backwater') {
    rect(buffer, 0, 438, WIDTH, 202, [10, 27, 44], 0.88);
    rect(buffer, 0, 336, WIDTH, 102, [24, 27, 30], 0.9);
    pipe(buffer, 110, 480, 590, 488, YELLOW, 10, 0.78);
    pipe(buffer, 610, 488, 1130, 454, ORANGE, 12, 0.82);
    glow(buffer, 675, 482, 185, ORANGE, 0.72);
    line(buffer, 1110, 430, 700, 450, ORANGE, 5, 0.86);
  } else if (family === 'flood-spread') {
    const nodes: Array<readonly [number, number]> = [[160, 520], [330, 430], [520, 464], [694, 350], [880, 404], [1100, 278]];
    routeMap(buffer, nodes, 3, true);
    rect(buffer, 0, 590, WIDTH, 60, [26, 22, 18], 0.7);
    for (let i = 0; i < 10; i++) line(buffer, 100 + i * 120, 120, 40 + i * 120, 640, [48, 54, 62], 1, 0.25);
    glow(buffer, 520, 464, 210, ORANGE, 0.55);
  } else if (family === 'maintenance') {
    rect(buffer, 0, 432, WIDTH, 198, [20, 20, 19], 0.96);
    rect(buffer, 500, 426, 260, 98, [10, 12, 16], 0.96);
    for (let i = 0; i < 11; i++) rect(buffer, 520 + i * 18, 424, 7, 104, [92, 98, 104], 0.78);
    rect(buffer, 310, 300, 68, 178, [54, 56, 52], 0.88);
    rect(buffer, 388, 324, 92, 142, [42, 42, 38], 0.86);
    line(buffer, 456, 382, 600, 458, WHITE, 5, 0.72);
    line(buffer, 100, 570, 620, 468, YELLOW, 6, 0.82);
    pipe(buffer, 660, 530, 1150, 604, BLUE, 6, 0.55);
  }
  return family;
}

function writePpm(buffer: Buffer, filePath: string): void {
  fs.writeFileSync(filePath, Buffer.concat([Buffer.from(`P6\n${WIDTH} ${HEIGHT}\n255\n`, 'ascii'), buffer]));
}

function renderPng(buffer: Buffer, outputPath: string): void {
  const temp = `${outputPath}.${process.pid}.ppm`;
  writePpm(buffer, temp);
  const result = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', temp, '-frames:v', '1', outputPath], {encoding: 'utf8'});
  fs.rmSync(temp, {force: true});
  if (result.status !== 0) throw new Error(`HSL_VIDEO_5_START_FRAME_RENDER_FAILED:${result.stderr || result.stdout}`);
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_5_RUN_ID || 'HSL-VIDEO-005';
  const runRoot = path.resolve(process.env.HSL_VIDEO_5_OUTPUT || path.join('runs', productionId));
  const candidateRoot = path.join(runRoot, 'start-frame-candidates');
  const planPath = path.join(candidateRoot, 'start-frame-shot-plan.json');
  if (!fs.existsSync(planPath)) throw new Error(`HSL_VIDEO_5_START_FRAME_PLAN_REQUIRED:${planPath}`);
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8')) as {items: ShotPlanItem[]};
  const created = plan.items.map((item, index) => {
    const outputPath = path.join(candidateRoot, `${item.shot_id}.png`);
    const buffer = Buffer.alloc(WIDTH * HEIGHT * 3);
    fill(buffer, index + item.shot_id.length);
    const family = drawScene(buffer, item, index);
    renderPng(buffer, outputPath);
    return {
      shot_id: item.shot_id,
      parent_scene_id: item.parent_scene_id,
      source_family: family,
      source_mode: 'PROCEDURAL_PREVIS' as const,
      identity_eligible: false,
      path: outputPath,
      sha256: shaFile(outputPath),
      width: WIDTH,
      height: HEIGHT
    };
  });
  const familyCounts = created.reduce<Record<string, number>>((counts, item) => {
    counts[item.source_family] = (counts[item.source_family] || 0) + 1;
    return counts;
  }, {});
  const updatedItems = plan.items.map((item) => {
    const createdItem = created.find((candidate) => candidate.shot_id === item.shot_id)!;
    return {...item, candidate_status: 'PREVIS_ONLY', candidate_path: createdItem.path, candidate_sha256: createdItem.sha256};
  });
  writeJson(planPath, {...plan, candidate_available_count: 0, generation_required_count: updatedItems.length, items: updatedItems});
  const manifestPath = path.join(candidateRoot, 'start-frame-build-manifest.json');
  writeJson(manifestPath, {
    schema: 'hsl.video-5.start-frame-build.v1',
    schema_version: '1.0.0',
    production_id: productionId,
    status: 'PROCEDURAL_PREVIS_ONLY',
    production_eligible: false,
    rejection_reason: 'Procedural frames are planning references only and cannot enter Firefly.',
    generated_count: created.length,
    source_family_counts: familyCounts,
    duplicate_sha256_count: created.length - new Set(created.map((item) => item.sha256)).size,
    items: created,
    manifest_sha256: shaFile(planPath),
    created_at: new Date().toISOString()
  });
  const referenceManifestPath = path.resolve(HSL_PREMIUM_MOTION_REFERENCE_SET.manifestPath);
  const provenancePath = path.join(candidateRoot, 'start-frame-provenance.json');
  writeJson(provenancePath, {
    schema: 'hsl.start-frame.provenance.v2',
    status: 'PROCEDURAL_PREVIS_ONLY',
    identity_contract_version: HSL_VISUAL_IDENTITY_CONTRACT_VERSION,
    reference_set_manifest_path: HSL_PREMIUM_MOTION_REFERENCE_SET.manifestPath,
    reference_set_manifest_sha256: shaFile(referenceManifestPath),
    items: created.map((item) => ({
      shot_id: item.shot_id,
      frame_sha256: item.sha256,
      prompt_sha256: shaText(plan.items.find((candidate) => candidate.shot_id === item.shot_id)?.start_frame_prompt || ''),
      source_mode: 'PROCEDURAL_PREVIS',
      generator: 'hslVideo5BuildStartFrames.ts:procedural-previs',
      identity_contract_version: HSL_VISUAL_IDENTITY_CONTRACT_VERSION,
      reference_asset_ids: []
    }))
  });
  process.stdout.write(`${JSON.stringify({
    status: 'PROCEDURAL_PREVIS_ONLY',
    production_eligible: false,
    generated_count: created.length,
    source_family_counts: familyCounts,
    manifest_path: manifestPath,
    provenance_path: provenancePath
  }, null, 2)}\n`);
}

main();
