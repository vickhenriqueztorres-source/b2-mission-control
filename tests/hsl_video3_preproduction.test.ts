import assert from 'node:assert/strict';
import test from 'node:test';
import {HSL_VIDEO_3_EPISODE_SEED} from '../hsl/editorial/config/video3EpisodeSeed';
import {CausalModelAgent} from '../hsl/editorial/editorialRuntime';

test('video 3 seed defines a water-to-tap causal system in English', () => {
  const seed = HSL_VIDEO_3_EPISODE_SEED;
  assert.equal(seed.episode_id, 'HSL-VIDEO-003');
  assert.equal(seed.human_approval_status, 'APPROVED');
  assert.ok(seed.scenes.length >= 50);
  assert.ok(seed.sources.length >= 6);
  assert.equal(new Set(seed.sources.map((source) => source.category)).size, 3);
  const wordCount = seed.scenes.flatMap((scene) => scene.voiceover.split(/\s+/).filter(Boolean)).length;
  assert.ok(wordCount >= 2200 && wordCount <= 2900, `unexpected narration word count: ${wordCount}`);
  assert.match(seed.title, /Water|Tap/);
  const script = seed.scenes.map((scene) => scene.voiceover).join(' ');
  assert.match(script, /pressure|treatment|tap/i);
  assert.doesNotMatch(script, /jet fuel|fuel farm|refinery|suitcase|baggage carousel/i);
});

test('video 3 causal model uses water infrastructure instead of earlier episode fallbacks', () => {
  const model = new CausalModelAgent().run(HSL_VIDEO_3_EPISODE_SEED);
  assert.deepEqual(model.flow, HSL_VIDEO_3_EPISODE_SEED.causal_flow);
  assert.deepEqual(model.interfaces, HSL_VIDEO_3_EPISODE_SEED.system_interfaces);
  assert.ok(model.flow.includes('treatment_barriers'));
  assert.ok(model.flow.includes('distribution_mains'));
  assert.ok(!model.flow.includes('refinery'));
  assert.ok(!model.flow.includes('exception_handling'));
});
