import assert from 'node:assert/strict';
import test from 'node:test';
import { HslEpisodeBrief, validateHslEpisode } from '../production/hslEpisodeGate';

function episode(): HslEpisodeBrief {
  return {
    episode_id: 'HSL-PILOT-001',
    title: 'The Hidden System That Keeps Planes Flying',
    language: 'en',
    format: 'THE_JOURNEY',
    target_duration_minutes: 16,
    central_question: 'How does fuel move from a refinery to an aircraft without interrupting continuous airport operations?',
    original_thesis: 'Airports depend on timed redundant fuel logistics where storage quality control delivery and aircraft schedules remain synchronized.',
    object_or_flow: 'Jet fuel moving from refinery to aircraft wing',
    system_being_analyzed: 'Regional terminal airport fuel farm hydrant and tanker network',
    main_constraint: 'Storage safety quality control and delivery timing must remain synchronized',
    primary_consequence: 'A local fuel delay propagates into departure aircraft and crew scheduling disruption',
    hero_visual: 'A reversible refinery-to-wing flow map that reveals every handoff and capacity constraint',
    original_interpretation: 'The visible product is a flight but the hidden product is synchronized fuel logistics',
    counterargument_or_limitation: 'Airport supply designs vary by region so no single delivery mode represents every airport',
    sources: [
      {source_id: 'S1', category: 'primary', url: 'https://example.com/primary', accessed_at: '2026-08-19', claims: ['system layout'], limitations: []},
      {source_id: 'S2', category: 'technical', url: 'https://example.com/technical', accessed_at: '2026-08-19', claims: ['quality control'], limitations: []},
      {source_id: 'S3', category: 'independent', url: 'https://example.com/independent', accessed_at: '2026-08-19', claims: ['operational consequence'], limitations: []}
    ],
    scenes: [1, 2, 3].map((n) => ({
      scene_id: `HSL_00${n}`,
      claim_id: `C00${n}`,
      narrative_function: 'explain_mechanism',
      visual_mode: 'remotion_flow_trace',
      evidence_status: 'fact',
      asset_provenance: 'original_remotion',
      source_url: 'https://example.com/primary',
      license_status: 'not_applicable',
      original_contribution: 'custom causal system diagram for this episode',
      ai_disclosure_required: false
    })),
    human_approval_status: 'APPROVED'
  };
}

test('HSL episode gate approves a sourced original episode', () => {
  const result = validateHslEpisode(episode());
  assert.equal(result.status, 'PASS');
  assert.ok(result.originality_score >= 16);
});

test('HSL episode gate rejects AI footage used as factual evidence', () => {
  const value = episode();
  value.scenes[0].asset_provenance = 'generated_ai';
  value.scenes[0].evidence_status = 'fact';
  const result = validateHslEpisode(value);
  assert.equal(result.status, 'REJECT');
  assert.ok(result.errors.some((error) => error.startsWith('AI_CANNOT_BE_FACTUAL_EVIDENCE')));
});
