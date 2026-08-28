import crypto from 'crypto';

export const KLING_PROVIDER_PROMPT_ADAPTER_VERSION = 'hsl-kling-provider-prompt-adapter-v3';

export interface KlingPromptMotionPackage {
  shot_id: string;
  motion_prompt: string;
  generation_duration_seconds: number;
  start_state: string;
  motion_change: string;
  end_state: string;
  camera_motion?: string;
  environment_motion?: string;
}

export interface KlingProviderPromptArtifact {
  production_id: string;
  shot_id: string;
  canonical_prompt: string;
  canonical_prompt_hash: string;
  provider: 'Kling 3.0';
  provider_prompt: string;
  provider_prompt_hash: string;
  transformations_applied: string[];
  adapter_version: string;
  prompt_adapter_reason: 'PROVIDER_PROMPT_NORMALIZATION';
  semantic_intent_validation: {
    status: 'PASS' | 'PROVIDER_PROMPT_SEMANTIC_DRIFT';
    primary_action: string;
    start_state: string;
    end_state: string;
    continuity_constraints: string[];
    camera_intent: string;
    errors: string[];
  };
}

type ShotIntent = {
  primaryAction: string;
  startState: string;
  endState: string;
  continuity: string[];
  cameraIntent: string;
};

export function adaptKlingProviderPrompt(
  productionId: string,
  motionPackage: KlingPromptMotionPackage
): KlingProviderPromptArtifact {
  const intent = buildIntent(motionPackage);
  const duration = Number(motionPackage.generation_duration_seconds);
  const providerPrompt = [
    `Landscape 16:9 hyper-realistic ${duration}-second documentary visualization.`,
    `Use the provided first frame as the exact visual starting point for ${motionPackage.shot_id}.`,
    `Primary action: ${intent.primaryAction}.`,
    `Start state: ${intent.startState}.`,
    `Motion change: ${String(motionPackage.motion_change || '').trim()}.`,
    `End state: ${intent.endState}.`,
    'Preserve the industrial structure, machine geometry, material scale, lighting direction and spatial relationships visible in the first frame.',
    `Camera: ${intent.cameraIntent}. Denis Villeneuve 35mm anamorphic documentary cinematography, shallow depth of field, creamy bokeh, clean architectural framing.`,
    'Carbon black (#060709) and deep steel (#0D0E15) chiaroscuro industrial palette with glowing sodium-vapor amber reflections (#FF5500) and sharp laser cyan telemetry lights (#00F0FF), dense volumetric fog and steam, slow continuous mechanical movement and hyper-realistic industrial textures.',
    'No human faces looking at camera. No presenter. No dialogue. No readable text, logos, brand marks, news graphics or fabricated documentary evidence.',
    'Do not add machinery, workers, locations or operations that are not required by the declared action or supported by the first frame.'
  ].join('\n\n');

  const validation = validateProviderPromptIntent(motionPackage, providerPrompt, intent);
  return {
    production_id: productionId,
    shot_id: motionPackage.shot_id,
    canonical_prompt: String(motionPackage.motion_prompt || ''),
    canonical_prompt_hash: `sha256_${sha256Text(String(motionPackage.motion_prompt || ''))}`,
    provider: 'Kling 3.0',
    provider_prompt: providerPrompt,
    provider_prompt_hash: `sha256_${sha256Text(providerPrompt)}`,
    transformations_applied: [
      'removed_internal_pipeline_language',
      'normalized_to_hsl_documentary_visualization',
      'preserved_primary_action_start_end_camera_and_continuity',
      'added_no_presenter_no_logo_no_false_evidence_constraints'
    ],
    adapter_version: KLING_PROVIDER_PROMPT_ADAPTER_VERSION,
    prompt_adapter_reason: 'PROVIDER_PROMPT_NORMALIZATION',
    semantic_intent_validation: validation
  };
}

export function validateProviderPromptIntent(
  motionPackage: KlingPromptMotionPackage,
  providerPrompt: string,
  intent: ShotIntent = buildIntent(motionPackage)
): KlingProviderPromptArtifact['semantic_intent_validation'] {
  const prompt = providerPrompt.toLowerCase();
  const errors: string[] = [];
  for (const term of ['provided first frame', 'landscape 16:9', 'no human faces looking at camera', 'no readable text', 'no presenter']) {
    if (!prompt.includes(term)) errors.push(`MISSING_REQUIRED_TERM:${term}`);
  }
  for (const forbidden of ['official references', 'identity locked', 'motion package', 'start frame hash', 'usable action', 'handles']) {
    if (prompt.includes(forbidden)) errors.push(`FORBIDDEN_PROVIDER_TERM:${forbidden}`);
  }
  if (!prompt.includes(intent.primaryAction.toLowerCase())) errors.push('MISSING_PRIMARY_ACTION');
  if (!prompt.includes(intent.startState.toLowerCase())) errors.push('MISSING_START_STATE');
  if (!prompt.includes(intent.endState.toLowerCase())) errors.push('MISSING_END_STATE');

  return {
    status: errors.length ? 'PROVIDER_PROMPT_SEMANTIC_DRIFT' : 'PASS',
    primary_action: intent.primaryAction,
    start_state: intent.startState,
    end_state: intent.endState,
    continuity_constraints: intent.continuity,
    camera_intent: intent.cameraIntent,
    errors
  };
}

function buildIntent(motionPackage: KlingPromptMotionPackage): ShotIntent {
  const motionPrompt = String(motionPackage.motion_prompt || '').trim();
  const startState = String(motionPackage.start_state || '').trim();
  const motionChange = String(motionPackage.motion_change || '').trim();
  const endState = String(motionPackage.end_state || '').trim();
  return {
    primaryAction: motionChange || motionPrompt || `Execute the declared system action for ${motionPackage.shot_id}`,
    startState,
    endState,
    continuity: ['same system', 'same machine geometry', 'same materials', 'same location', 'same lighting direction', 'same physical scale'],
    cameraIntent: String(motionPackage.camera_motion || '').trim() || 'slow stable observational movement without artificial transitions'
  };
}

function sha256Text(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}
