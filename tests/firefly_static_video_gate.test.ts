import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {spawnSync} from 'child_process';
import {PipelineContractGate} from '../pipeline/pipelineContractGate';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hsl-motion-gate-'));
const frozen = path.join(dir, 'frozen.mp4');
const moving = path.join(dir, 'moving.mp4');

spawnSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=gray:s=640x360:r=25:d=3', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', frozen]);
spawnSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=640x360:r=25:d=3', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', moving]);

const frozenRatio = PipelineContractGate.calculateFrozenRatio(frozen, 3);
const movingRatio = PipelineContractGate.calculateFrozenRatio(moving, 3);

assert.ok(frozenRatio >= 0.85, `frozen ratio should fail: ${frozenRatio}`);
assert.ok(movingRatio < 0.2, `moving ratio should pass: ${movingRatio}`);

fs.rmSync(dir, {recursive: true, force: true});
console.log('firefly_static_video_gate.test.ts: PASS');
