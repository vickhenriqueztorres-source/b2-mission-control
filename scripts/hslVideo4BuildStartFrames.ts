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
  | 'home-router'
  | 'wifi'
  | 'last-mile'
  | 'street-cabinet'
  | 'isp-pop'
  | 'backbone'
  | 'ixp'
  | 'dns'
  | 'cdn'
  | 'data-center'
  | 'submarine'
  | 'congestion'
  | 'fiber-cut'
  | 'return-path';

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
  const text = `${item.parent_scene_id} ${item.start_frame_prompt || ''}`.toLowerCase();
  if (/fiber cut|sever|break|detour|damaged|construction cut/.test(text)) return 'fiber-cut';
  if (/congestion|queue|packet loss|buffer/.test(text)) return 'congestion';
  if (/submarine|ocean|landing/.test(text)) return 'submarine';
  if (/data center|servers|server/.test(text)) return 'data-center';
  if (/cdn|cache|content delivery/.test(text)) return 'cdn';
  if (/dns|domain|resolver/.test(text)) return 'dns';
  if (/exchange|ixp/.test(text)) return 'ixp';
  if (/backbone|regional fiber|city nodes/.test(text)) return 'backbone';
  if (/point of presence|isp|router racks|provider/.test(text)) return 'isp-pop';
  if (/cabinet|splitter|patch panel|node/.test(text)) return 'street-cabinet';
  if (/last mile|drop|pole|outside the house/.test(text)) return 'last-mile';
  if (/wi-fi|wifi|radio|walls|interference/.test(text)) return 'wifi';
  if (/return|backward|screen/.test(text)) return 'return-path';
  return 'home-router';
}

function drawRacks(buffer: Buffer, x: number, y: number, count: number, seed: number): void {
  for (let i = 0; i < count; i++) {
    const rx = x + i * 82;
    rect(buffer, rx, y + i * 5, 58, 300, [22, 27, 34], 0.95);
    rect(buffer, rx + 6, y + 14 + i * 5, 46, 9, BLUE, 0.45);
    for (let p = 0; p < 12; p++) circle(buffer, rx + 14 + (p % 3) * 12, y + 44 + p * 18 + i * 5, 2.5, p % 4 === seed % 4 ? YELLOW : [80, 96, 130], 0.8);
  }
}

function drawScene(buffer: Buffer, item: ShotPlanItem, index: number): Family {
  const family = familyFor(item);
  grid(buffer, index + family.length);
  const pulseX = 170 + (index * 67) % 880;
  const pulseY = 160 + (index * 41) % 360;
  glow(buffer, pulseX, pulseY, 130, family === 'congestion' || family === 'fiber-cut' ? ORANGE : YELLOW, 0.55);

  if (family === 'home-router') {
    rect(buffer, 130, 420, 1020, 150, [18, 21, 26], 0.86);
    rect(buffer, 460, 308, 250, 92, [35, 37, 42], 1);
    rect(buffer, 492, 282, 14, 35, WHITE, 0.75);
    rect(buffer, 664, 282, 14, 35, WHITE, 0.75);
    circle(buffer, 510, 354, 8, YELLOW, 0.95);
    line(buffer, 585, 400, 1070, 584, YELLOW, 6, 0.95);
    line(buffer, 720, 386, 1090, 515, BLUE, 3, 0.65);
  } else if (family === 'wifi') {
    rect(buffer, 0, 445, WIDTH, 140, [16, 18, 22], 0.9);
    rect(buffer, 252, 188, 110, 290, [45, 47, 51], 0.74);
    rect(buffer, 690, 140, 86, 340, [38, 40, 45], 0.78);
    for (let r = 80; r <= 360; r += 70) circle(buffer, 560, 430, r, BLUE, 0.045);
    line(buffer, 140, 505, 980, 520, YELLOW, 5, 0.9);
  } else if (family === 'last-mile') {
    rect(buffer, 0, 492, WIDTH, 160, [18, 16, 15], 0.92);
    for (let i = 0; i < 5; i++) rect(buffer, 80 + i * 170, 340 - i * 12, 90, 92, [42, 38, 34], 0.8);
    for (let i = 0; i < 6; i++) {
      const px = 160 + i * 170;
      line(buffer, px, 205, px, 510, [62, 59, 52], 4, 0.95);
      line(buffer, px, 226, px + 155, 255, BLUE, 3, 0.6);
    }
    line(buffer, 86, 548, 1160, 438, YELLOW, 5, 0.95);
  } else if (family === 'street-cabinet') {
    rect(buffer, 488, 158, 310, 420, [33, 38, 44], 1);
    rect(buffer, 520, 200, 246, 314, [14, 18, 24], 0.86);
    for (let i = 0; i < 9; i++) line(buffer, 540, 230 + i * 31, 746, 232 + i * 18, i % 2 ? BLUE : YELLOW, 3, 0.8);
    line(buffer, 120, 610, 610, 515, YELLOW, 7, 0.9);
    line(buffer, 680, 520, 1160, 600, BLUE, 5, 0.72);
  } else if (family === 'isp-pop' || family === 'data-center' || family === 'cdn') {
    drawRacks(buffer, 290, 170, family === 'data-center' ? 8 : 5, index);
    line(buffer, 120, 610, 618, 504, YELLOW, 6, 0.95);
    line(buffer, 645, 504, 1130, 302, family === 'cdn' ? YELLOW : BLUE, 4, 0.78);
    if (family === 'cdn') {
      rect(buffer, 840, 218, 174, 92, [40, 44, 50], 0.9);
      circle(buffer, 910, 263, 24, YELLOW, 0.86);
    }
  } else if (family === 'backbone' || family === 'ixp' || family === 'dns' || family === 'return-path') {
    const nodes = [[150, 520], [330, 410], [520, 460], [710, 310], [910, 372], [1110, 250]];
    nodes.forEach(([x, y], n) => {
      glow(buffer, x, y, 52, n <= index % 6 ? YELLOW : BLUE, 0.38);
      circle(buffer, x, y, 12, n <= index % 6 ? YELLOW : BLUE, 0.95);
    });
    for (let i = 0; i < nodes.length - 1; i++) line(buffer, nodes[i][0], nodes[i][1], nodes[i + 1][0], nodes[i + 1][1], i <= index % 5 ? YELLOW : BLUE, 5, 0.82);
    if (family === 'dns') {
      rect(buffer, 770, 148, 280, 134, [22, 25, 31], 0.92);
      for (let i = 0; i < 4; i++) rect(buffer, 805, 178 + i * 24, 204 - i * 22, 7, i === 1 ? YELLOW : WHITE, 0.72);
    }
  } else if (family === 'submarine') {
    rect(buffer, 0, 390, WIDTH, 260, [8, 26, 44], 0.75);
    for (let i = 0; i < 80; i++) blend(buffer, (i * 73 + index * 19) % WIDTH, 418 + (i * 31) % 190, [28, 72, 110], 0.45);
    line(buffer, 60, 560, 508, 500, YELLOW, 7, 0.95);
    line(buffer, 508, 500, 880, 435, YELLOW, 7, 0.95);
    rect(buffer, 882, 298, 210, 140, [38, 39, 37], 0.88);
    line(buffer, 884, 438, 1170, 340, BLUE, 4, 0.7);
  } else if (family === 'congestion') {
    rect(buffer, 530, 188, 260, 220, [32, 36, 44], 0.96);
    for (let i = 0; i < 10; i++) circle(buffer, 165 + i * 38, 500 - Math.min(i, 6) * 18, 10, YELLOW, 0.85);
    line(buffer, 150, 510, 540, 384, YELLOW, 7, 0.9);
    glow(buffer, 662, 302, 160, ORANGE, 0.85);
    line(buffer, 790, 296, 1140, 200, ORANGE, 5, 0.78);
  } else if (family === 'fiber-cut') {
    rect(buffer, 0, 488, WIDTH, 170, [34, 24, 18], 0.9);
    line(buffer, 70, 560, 570, 522, YELLOW, 7, 0.9);
    line(buffer, 700, 500, 1190, 430, YELLOW, 7, 0.9);
    line(buffer, 588, 450, 654, 605, ORANGE, 8, 0.95);
    glow(buffer, 626, 526, 150, ORANGE, 0.75);
    line(buffer, 180, 620, 1040, 310, BLUE, 3, 0.55);
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
  if (result.status !== 0) throw new Error(`HSL_VIDEO_4_START_FRAME_RENDER_FAILED:${result.stderr || result.stdout}`);
}

function main(): void {
  const productionId = process.env.HSL_VIDEO_4_RUN_ID || 'HSL-VIDEO-004';
  const runRoot = path.resolve(process.env.HSL_VIDEO_4_OUTPUT || path.join('runs', productionId));
  const candidateRoot = path.join(runRoot, 'start-frame-candidates');
  const planPath = path.join(candidateRoot, 'start-frame-shot-plan.json');
  if (!fs.existsSync(planPath)) throw new Error(`HSL_VIDEO_4_START_FRAME_PLAN_REQUIRED:${planPath}`);
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
    schema: 'hsl.video-4.start-frame-build.v1',
    schema_version: '1.0.0',
    production_id: productionId,
    status: 'PROCEDURAL_PREVIS_ONLY',
    production_eligible: false,
    rejection_reason: 'Procedural frames are planning references only and cannot enter production generation.',
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
      generator: 'hslVideo4BuildStartFrames.ts:procedural-previs',
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
