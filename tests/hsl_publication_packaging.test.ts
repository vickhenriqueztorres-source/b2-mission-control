import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test, {after} from 'node:test';
import {
  HumanSelectionGate,
  PublicationPackagingQaAgent,
  ThumbnailArtDirectorAgent,
  TitlePackagingAgent,
  YouTubeMetadataAgent
} from '../hsl/postproduction/publicationPackagingRuntime';

const roots: string[] = [];
after(() => roots.forEach((root) => fs.rmSync(root, {recursive: true, force: true})));

function temporaryRoot(): string {
  const value = fs.mkdtempSync(path.join(os.tmpdir(), 'hsl-publication-'));
  roots.push(value);
  return value;
}

function image(filePath: string, size: string): void {
  const result = spawnSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', `color=c=0x0D0E15:s=${size}:d=0.1`,
    '-frames:v', '1', filePath
  ], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
}

const strategy = {
  promise: 'A visible departure depends on an invisible fuel chain.',
  mechanism: 'Quality, storage and delivery must remain synchronized.',
  human_conflict: 'Passengers see a routine departure while operators protect hidden throughput.',
  next_video_question: 'What happens when one bag misses its connection?',
  title_strategy: {
    selected_approved_title: 'The Hidden System That Keeps Planes Flying',
    candidates: [
      {title: 'The Hidden System That Keeps Planes Flying', role: 'APPROVED'},
      {title: 'How Jet Fuel Reaches an Aircraft', role: 'MECHANISM_VARIANT'},
      {title: 'The Fuel Bottleneck Beneath Every Departure', role: 'CONSEQUENCE_VARIANT'}
    ]
  },
  thumbnail_strategy: {subject: 'Refinery to wing map', tension: 'One blocked handoff delays the chain', text: 'BEFORE TAKEOFF'},
  hook_contract: {first_scene_id: 'S1', early_evidence_scene_id: 'S2'}
};

const brief = {
  episode_id: 'HSL-TEST', title: 'The Hidden System That Keeps Planes Flying', language: 'en',
  central_question: 'How does fuel reach an aircraft?', object_or_flow: 'Jet fuel moving to the aircraft wing',
  system_being_analyzed: 'Supply, storage, quality and delivery', main_constraint: 'The slowest safe handoff sets throughput',
  primary_consequence: 'A local restriction consumes schedule margin', hero_visual: 'A refinery to wing system map',
  original_interpretation: 'The hidden product is synchronization.', counterargument_or_limitation: 'Layouts vary by airport.'
};

test('publication agents produce three distinct title-thumbnail hypotheses and valid metadata', () => {
  const root = temporaryRoot();
  const bases = {A: path.join(root, 'A.png'), B: path.join(root, 'B.png'), C: path.join(root, 'C.png')};
  Object.values(bases).forEach((file) => image(file, '1280x720'));
  const titles = new TitlePackagingAgent().run(strategy as never);
  const concepts = new ThumbnailArtDirectorAgent().run({brief: brief as never, strategy: strategy as never, titles, baseImages: bases});
  assert.deepEqual(concepts.map((item) => item.role), ['MECHANISM', 'CONSEQUENCE', 'FINAL_HANDOFF']);
  assert.equal(new Set(titles.map((item) => item.title)).size, 3);
  assert.equal(new Set(concepts.map((item) => item.headline)).size, 3);
  concepts.forEach((item) => assert.ok(item.promise_evidence.length >= 3));

  const metadata = new YouTubeMetadataAgent().run({
    brief: brief as never, strategy: strategy as never,
    scenes: [
      {scene_id: 'S1', chapter_id: 'HOOK', narrative_function: 'introduce_system', planned_duration_seconds: 12, voiceover: 'Hook'},
      {scene_id: 'S2', chapter_id: 'THE CHAIN', narrative_function: 'establish_origin', planned_duration_seconds: 18, voiceover: 'Chain'},
      {scene_id: 'S3', chapter_id: 'THE CONSTRAINT', narrative_function: 'reveal_constraint', planned_duration_seconds: 20, voiceover: 'Constraint'}
    ]
  });
  assert.equal(metadata.chapters[0].timestamp, '00:00');
  assert.equal(metadata.chapters.length, 3);
  assert.match(metadata.description, /CHAPTERS/);
});

test('publication QA validates 4K assets and keeps human approval closed', () => {
  const root = temporaryRoot();
  const bases = {A: path.join(root, 'base-A.png'), B: path.join(root, 'base-B.png'), C: path.join(root, 'base-C.png')};
  Object.values(bases).forEach((file) => image(file, '1280x720'));
  const titles = new TitlePackagingAgent().run(strategy as never);
  const concepts = new ThumbnailArtDirectorAgent().run({brief: brief as never, strategy: strategy as never, titles, baseImages: bases});
  const renders = (['A', 'B', 'C'] as const).map((id) => {
    const thumbnailPath = path.join(root, `thumbnail-${id}.png`);
    const mobilePreviewPath = path.join(root, `mobile-${id}.png`);
    image(thumbnailPath, '3840x2160');
    image(mobilePreviewPath, '320x180');
    return {thumbnailPath, mobilePreviewPath};
  });
  const result = new PublicationPackagingQaAgent().validate({
    concepts, titles, renders, description: 'A complete documentary description.',
    chapters: [{time_seconds: 0}, {time_seconds: 12}, {time_seconds: 30}]
  });
  assert.equal(result.status, 'PUBLICATION_PACKAGING_QA_PASS');
  const gate = new HumanSelectionGate();
  const manifest = gate.createManifest('HSL-TEST');
  assert.equal(manifest.status, 'HUMAN_SELECTION_REQUIRED');
  assert.throws(() => gate.validate(manifest), /HSL_PUBLICATION_HUMAN_SELECTION_REQUIRED/);
});
