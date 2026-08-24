import crypto from 'crypto';

export interface VeoProviderPromptArtifact {
  readonly schema: 'hsl.veo-provider-prompt.v1';
  readonly provider: 'Veo 3.1 Fast';
  readonly shot_id: string;
  readonly provider_prompt: string;
  readonly provider_prompt_hash: string;
  readonly semantic_intent_validation: Readonly<{status: 'PASS'; errors: readonly []}>;
}

export function adaptVeoProviderPrompt(shotId: string, prompt: string): VeoProviderPromptArtifact {
  const value = prompt.trim();
  if (!value) throw new Error('VEO_PROVIDER_PROMPT_REQUIRED');
  const required = ['exact first frame', 'Do not alter the geometry', 'No cuts'];
  const missing = required.filter((term) => !value.includes(term));
  if (missing.length) throw new Error(`VEO_PROVIDER_PROMPT_SAFETY_RULES_MISSING:${missing.join(',')}`);
  return {
    schema: 'hsl.veo-provider-prompt.v1', provider: 'Veo 3.1 Fast', shot_id: shotId,
    provider_prompt: value,
    provider_prompt_hash: `sha256_${crypto.createHash('sha256').update(value, 'utf8').digest('hex')}`,
    semantic_intent_validation: {status: 'PASS', errors: []}
  };
}
