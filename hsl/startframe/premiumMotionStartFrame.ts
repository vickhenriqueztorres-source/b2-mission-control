import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {HslExecutableVisualShot} from '../execution/types/execution';

export interface HslPremiumStartFramePackageResult {
  readonly status: 'PREMIUM_START_FRAME_APPROVED';
  readonly packageDirectory: string;
  readonly baseFramePath: string;
  readonly previewCompositePath: string;
  readonly overlaySpecPath: string;
  readonly motionPathSpecPath: string;
  readonly audioIntentPath: string;
  readonly negativeMotionRulesPath: string;
  readonly approvalManifestPath: string;
}

function writeJson(filePath: string, value: unknown): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function sha256(filePath: string): string {
  return `sha256_${crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')}`;
}

export class PremiumMotionStartFrameAgent {
  package(input: Readonly<{
    shot: HslExecutableVisualShot;
    approvedFramePath: string;
    approvedFrameSha256: string;
    reviewer: string;
    reviewedAt: string;
    outputDirectory: string;
  }>): HslPremiumStartFramePackageResult | null {
    if (!input.shot.veo_motion || !input.shot.motion_family) return null;
    const outputRoot = path.resolve(input.outputDirectory);
    fs.mkdirSync(outputRoot, {recursive: true});
    const extension = path.extname(input.approvedFramePath).toLowerCase() || '.png';
    const baseFramePath = path.join(outputRoot, `start-frame-base${extension}`);
    const previewCompositePath = path.join(outputRoot, `start-frame-preview-composite${extension}`);
    fs.copyFileSync(input.approvedFramePath, baseFramePath);
    fs.copyFileSync(input.approvedFramePath, previewCompositePath);

    const overlaySpecPath = path.join(outputRoot, 'overlay-spec.json');
    writeJson(overlaySpecPath, {
      schema: 'hsl.premium-motion.overlay-spec.v1', shot_id: input.shot.shot_id,
      render_engine: 'REMOTION', exact_text_policy: 'REMOTION_ONLY',
      source: input.shot.motion_design || null,
      safe_area: {left_percent: 5, right_percent: 5, top_percent: 6, bottom_percent: 7},
      rules: ['Never ask Veo to rewrite exact labels.', 'Keep overlays outside the principal physical action.']
    });
    const motionPathSpecPath = path.join(outputRoot, 'motion-path-spec.json');
    writeJson(motionPathSpecPath, {
      schema: 'hsl.premium-motion.path-spec.v1', shot_id: input.shot.shot_id,
      family: input.shot.motion_family, color_grammar: {
        yellow: 'tracked moving flow', blue: 'persistent infrastructure',
        orange: 'constraint or blockage', white: 'editorial information'
      },
      beats: input.shot.veo_motion.beats, camera_policy: 'LOCKED_OR_SUBTLE_DOCUMENTARY_MOVE'
    });
    const audioIntentPath = path.join(outputRoot, 'audio-intent.json');
    writeJson(audioIntentPath, {
      schema: 'hsl.premium-motion.audio-intent.v1', shot_id: input.shot.shot_id,
      strategy: input.shot.audio_strategy, generate_audio: input.shot.veo_motion.generate_audio,
      ...input.shot.veo_motion.audio_intent
    });
    const negativeMotionRulesPath = path.join(outputRoot, 'negative-motion-rules.json');
    writeJson(negativeMotionRulesPath, {
      schema: 'hsl.premium-motion.negative-rules.v1', shot_id: input.shot.shot_id,
      rules: input.shot.veo_motion.negative_motion_rules
    });
    const approvalManifestPath = path.join(outputRoot, 'approval-manifest.json');
    writeJson(approvalManifestPath, {
      schema: 'hsl.premium-motion.approval.v1', status: 'PREMIUM_START_FRAME_APPROVED',
      shot_id: input.shot.shot_id, family: input.shot.motion_family,
      generation_strategy: input.shot.generation_strategy,
      base_frame_sha256: sha256(baseFramePath), source_approval_sha256: input.approvedFrameSha256,
      preview_composite_sha256: sha256(previewCompositePath), reviewer: input.reviewer,
      reviewed_at: input.reviewedAt
    });
    return {
      status: 'PREMIUM_START_FRAME_APPROVED', packageDirectory: outputRoot,
      baseFramePath, previewCompositePath, overlaySpecPath, motionPathSpecPath,
      audioIntentPath, negativeMotionRulesPath, approvalManifestPath
    };
  }
}
