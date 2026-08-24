import fs from 'fs';
import path from 'path';
import {FireflyAdapter} from '../adapters/fireflyAdapter';
import {HslGenerationHandoff, MotionToFireflyBridge} from '../production-bridge/motionToFirefly';

export interface HslFireflyPreparedBatch {
  readonly masterGuidePath: string;
  readonly jobNames: readonly string[];
  readonly lineageByJobName: Readonly<Record<string, {motion_package_hash: string; start_frame_sha256: string; model?: string; generate_audio?: boolean; start_frame_path?: string; generation_strategy?: string}>>;
}

export class HslFireflyGenerationRuntime {
  prepare(handoffs: readonly HslGenerationHandoff[], outputDirectory: string): HslFireflyPreparedBatch {
    if (!handoffs.length) throw new Error('HSL_FIREFLY_HANDOFF_SET_EMPTY');
    const outputRoot = path.resolve(outputDirectory);
    const items: Array<{name: string; image: string; prompt: string; model: string; resolution: string; aspect_ratio: string; duration_seconds: number; generate_audio: boolean; source_shot_id: string; source_start_frame_sha256: string; motion_package_sha256: string}> = [];
    const lineageByJobName: Record<string, {motion_package_hash: string; start_frame_sha256: string; model?: string; generate_audio?: boolean; start_frame_path?: string; generation_strategy?: string}> = {};
    for (const handoff of handoffs) {
      const shotDir = path.join(outputRoot, 'shots', handoff.shot_id);
      const receipt = MotionToFireflyBridge.convertHslHandoff(handoff, path.join(shotDir, 'firefly-guide.json'));
      const item = receipt.guide[0];
      const masterImages = path.join(outputRoot, 'imagens');
      fs.mkdirSync(masterImages, {recursive: true});
      const masterImage = path.join(masterImages, path.basename(receipt.copied_start_frame_path));
      fs.copyFileSync(receipt.copied_start_frame_path, masterImage);
      items.push({
        name: item.name, image: path.basename(masterImage), prompt: item.prompt,
        model: item.model, resolution: '720p', aspect_ratio: item.aspect_ratio,
        duration_seconds: item.duration_seconds, generate_audio: item.generate_audio || false,
        source_shot_id: handoff.shot_id, source_start_frame_sha256: handoff.start_frame_sha256,
        motion_package_sha256: handoff.motion_package_sha256
      });
      lineageByJobName[item.name] = {
        motion_package_hash: handoff.motion_package_sha256, start_frame_sha256: handoff.start_frame_sha256,
        model: item.model, generate_audio: item.generate_audio || false,
        start_frame_path: handoff.start_frame_path, generation_strategy: handoff.generation_strategy
      };
    }
    const masterGuidePath = path.join(outputRoot, 'firefly-production-guide.json');
    fs.writeFileSync(masterGuidePath, `${JSON.stringify({
      schema: 'hsl.firefly.multi-provider-guide.v2', model: 'Kling 3.0', resolution: '720p',
      aspect_ratio: '16:9', duration_seconds: 5, generate_audio: false, items
    }, null, 2)}\n`, 'utf8');
    return {masterGuidePath, jobNames: items.map((item) => item.name), lineageByJobName};
  }

  async dispatch(productionId: string, prepared: Readonly<HslFireflyPreparedBatch>, adapter: FireflyAdapter): Promise<{success: boolean; completedJobs: Array<{name: string; output_path: string}>}> {
    if (process.env.HSL_ALLOW_PAID_FIREFLY_DISPATCH !== 'true') throw new Error('HSL_PAID_FIREFLY_DISPATCH_NOT_AUTHORIZED');
    return adapter.feedGuideAndRun(productionId, prepared.masterGuidePath);
  }
}
