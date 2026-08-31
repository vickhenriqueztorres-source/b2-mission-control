import assert from 'node:assert/strict';
import test from 'node:test';
import { adaptKlingProviderPrompt, KlingPromptMotionPackage } from '../production-bridge/klingProviderPromptAdapter';

function generationPackage(duration = 5): KlingPromptMotionPackage {
  return {
    shot_id: 'HSL_004',
    generation_duration_seconds: duration,
    motion_prompt: `Create a ${duration}-second visualization of jet fuel moving through an airport hydrant network.`,
    start_state: 'The airport fuel manifold is still at dawn',
    motion_change: 'Jet fuel begins moving through the visible pipe network',
    end_state: 'The flow reaches the aircraft hydrant connection',
    camera_motion: 'slow stable lateral observation of the machinery'
  };
}

test('HSL Kling adapter preserves system action and applies documentary safety constraints', () => {
  const pkg = generationPackage();
  const artifact = adaptKlingProviderPrompt('HSL-PILOT-001', pkg);
  assert.equal(artifact.semantic_intent_validation.status, 'PASS');
  assert.equal(artifact.canonical_prompt, pkg.motion_prompt);
  assert.match(artifact.provider_prompt, /Landscape 16:9/i);
  assert.match(artifact.provider_prompt, /Jet fuel begins moving through the visible pipe network/i);
  assert.match(artifact.provider_prompt, /No human faces looking at camera/i);
  assert.match(artifact.provider_prompt, /No readable text/i);
  assert.doesNotMatch(artifact.provider_prompt, /presenter speaking|avatar|official references|identity locked/i);
});

test('HSL Kling adapter keeps configured duration', () => {
  for (const duration of [5, 10]) {
    const artifact = adaptKlingProviderPrompt('HSL-PILOT-001', generationPackage(duration));
    assert.equal(artifact.semantic_intent_validation.status, 'PASS');
    assert.match(artifact.provider_prompt, new RegExp(`${duration}-second present-day on-location documentary take`));
  }
});
