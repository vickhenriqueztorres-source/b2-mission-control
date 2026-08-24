import assert from 'node:assert/strict';
import test from 'node:test';
import {HSL_VIDEO_2_EPISODE_SEED} from '../hsl/editorial/config/video2EpisodeSeed';
import {CausalModelAgent} from '../hsl/editorial/editorialRuntime';

test('video 2 seed defines a baggage-specific causal system in English', () => {
  const seed = HSL_VIDEO_2_EPISODE_SEED;
  assert.equal(seed.episode_id, 'HSL-VIDEO-002');
  assert.equal(seed.human_approval_status, 'APPROVED');
  assert.ok(seed.scenes.length >= 50);
  assert.ok(seed.sources.length >= 3);
  assert.equal(new Set(seed.sources.map((source) => source.category)).size, 3);
  const wordCount = seed.scenes.flatMap((scene) => scene.voiceover.split(/\s+/).filter(Boolean)).length;
  assert.ok(wordCount >= 2200 && wordCount <= 2700, `unexpected narration word count: ${wordCount}`);
  assert.match(seed.title, /Bag/);
  assert.doesNotMatch(seed.scenes.map((scene) => scene.voiceover).join(' '), /jet fuel|fuel farm|refinery/i);
});

test('causal model uses the episode flow instead of the fuel pilot fallback', () => {
  const model = new CausalModelAgent().run(HSL_VIDEO_2_EPISODE_SEED);
  assert.deepEqual(model.flow, HSL_VIDEO_2_EPISODE_SEED.causal_flow);
  assert.deepEqual(model.interfaces, HSL_VIDEO_2_EPISODE_SEED.system_interfaces);
  assert.ok(model.flow.includes('exception_handling'));
  assert.ok(!model.flow.includes('refinery'));
});
