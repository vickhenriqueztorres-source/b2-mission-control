import fs from 'fs';
import path from 'path';
import {
  HSL_MIN_EPISODE_DURATION_SECONDS,
  HSL_MAX_EPISODE_DURATION_SECONDS
} from '../spec/hsl-spec';

export type EvidenceStatus = 'fact' | 'estimate' | 'inference' | 'illustrative' | 'not_evidence';
export type AssetProvenance = 'original_remotion' | 'licensed_stock' | 'public_domain' | 'generated_ai';

export interface HslSource {
  source_id: string;
  category: 'primary' | 'technical' | 'independent';
  url: string;
  accessed_at: string;
  claims: string[];
  limitations: string[];
}

export interface HslScene {
  scene_id: string;
  claim_id: string | null;
  narrative_function: string;
  visual_mode: string;
  evidence_status: EvidenceStatus;
  asset_provenance: AssetProvenance;
  source_url: string | null;
  license_status: string;
  original_contribution: string;
  ai_disclosure_required: boolean;
  on_screen_label?: string;
}

export interface HslEpisodeBrief {
  episode_id: string;
  title: string;
  language: 'en' | 'pt' | 'pt-BR';
  format: 'THE_JOURNEY' | 'SYSTEM_ANATOMY' | 'BOTTLENECK' | 'FAILURE';
  target_duration_minutes: number;
  central_question: string;
  original_thesis: string;
  object_or_flow: string;
  system_being_analyzed: string;
  main_constraint: string;
  primary_consequence: string;
  hero_visual: string;
  original_interpretation: string;
  counterargument_or_limitation: string;
  sources: HslSource[];
  scenes: HslScene[];
  human_approval_status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface HslEpisodeGateResult {
  status: 'PASS' | 'REVIEW' | 'REJECT';
  originality_score: number;
  errors: string[];
  warnings: string[];
}

export function validateHslEpisode(episode: HslEpisodeBrief): HslEpisodeGateResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const requiredText: Array<[keyof HslEpisodeBrief, string]> = [
    ['title', 'TITLE_REQUIRED'],
    ['central_question', 'CENTRAL_QUESTION_REQUIRED'],
    ['original_thesis', 'ORIGINAL_THESIS_REQUIRED'],
    ['object_or_flow', 'OBJECT_OR_FLOW_REQUIRED'],
    ['system_being_analyzed', 'SYSTEM_REQUIRED'],
    ['main_constraint', 'MAIN_CONSTRAINT_REQUIRED'],
    ['primary_consequence', 'PRIMARY_CONSEQUENCE_REQUIRED'],
    ['hero_visual', 'UNIQUE_HERO_VISUAL_REQUIRED'],
    ['original_interpretation', 'ORIGINAL_INTERPRETATION_REQUIRED'],
    ['counterargument_or_limitation', 'LIMITATION_REQUIRED']
  ];
  for (const [field, code] of requiredText) {
    if (!String(episode[field] || '').trim()) errors.push(code);
  }
  if (!['en', 'pt', 'pt-BR'].includes(episode.language)) {
    errors.push('AUDIENCE_LANGUAGE_INVALID');
  }
  if (episode.target_duration_minutes < 5 || episode.target_duration_minutes > 22) {
    errors.push('DURATION_OUTSIDE_5_TO_22_MINUTES');
  }

  const sourceCategories = new Set((episode.sources || []).map((source) => source.category));
  for (const category of ['primary', 'technical', 'independent']) {
    if (!sourceCategories.has(category as HslSource['category'])) errors.push(`SOURCE_CATEGORY_MISSING:${category}`);
  }
  for (const source of episode.sources || []) {
    if (!source.url || !source.accessed_at || !source.claims?.length) errors.push(`SOURCE_INCOMPLETE:${source.source_id}`);
  }

  if (!episode.scenes?.length) errors.push('SCENE_PLAN_REQUIRED');
  for (const scene of episode.scenes || []) {
    if (!scene.original_contribution.trim()) errors.push(`ORIGINAL_CONTRIBUTION_REQUIRED:${scene.scene_id}`);
    if (scene.asset_provenance === 'generated_ai') {
      if (scene.evidence_status === 'fact') errors.push(`AI_CANNOT_BE_FACTUAL_EVIDENCE:${scene.scene_id}`);
      if (!scene.ai_disclosure_required) errors.push(`AI_DISCLOSURE_REQUIRED:${scene.scene_id}`);
      if (scene.on_screen_label !== 'AI VISUALIZATION') errors.push(`AI_LABEL_REQUIRED:${scene.scene_id}`);
    }
    if (scene.asset_provenance === 'licensed_stock' && !scene.source_url) {
      errors.push(`LICENSED_ASSET_SOURCE_REQUIRED:${scene.scene_id}`);
    }
    if (scene.evidence_status === 'fact' && !scene.claim_id) errors.push(`FACT_CLAIM_ID_REQUIRED:${scene.scene_id}`);
  }

  if (episode.human_approval_status !== 'APPROVED') errors.push('HUMAN_APPROVAL_REQUIRED');

  const originalityScore = calculateOriginalityScore(episode);
  if (originalityScore < 12) errors.push('ORIGINALITY_SCORE_REJECTED');
  else if (originalityScore < 16) warnings.push('ORIGINALITY_REQUIRES_EDITORIAL_REVIEW');

  return {
    status: errors.length ? 'REJECT' : warnings.length ? 'REVIEW' : 'PASS',
    originality_score: originalityScore,
    errors,
    warnings
  };
}

export function calculateOriginalityScore(episode: HslEpisodeBrief): number {
  const categories = new Set((episode.sources || []).map((source) => source.category));
  const originalScenes = (episode.scenes || []).filter((scene) => scene.asset_provenance === 'original_remotion');
  const criteria = [
    specificity(episode.central_question),
    specificity(episode.original_thesis),
    specificity(episode.hero_visual),
    categories.has('primary') ? 2 : 0,
    categories.has('independent') ? 2 : 0,
    specificity(episode.original_interpretation),
    specificity(episode.counterargument_or_limitation),
    episode.format ? 2 : 0,
    originalScenes.length >= 3 ? 2 : originalScenes.length ? 1 : 0,
    specificity(`${episode.object_or_flow} ${episode.system_being_analyzed} ${episode.main_constraint}`)
  ];
  return criteria.reduce((sum, value) => sum + value, 0);
}

function specificity(value: string): number {
  const words = String(value || '').trim().split(/\s+/).filter(Boolean);
  return words.length >= 8 ? 2 : words.length >= 4 ? 1 : 0;
}

function runCli(): void {
  const inputPath = process.env.HSL_EPISODE_BRIEF;
  if (!inputPath) throw new Error('HSL_EPISODE_BRIEF_REQUIRED');
  const absolutePath = path.resolve(inputPath);
  const episode = JSON.parse(fs.readFileSync(absolutePath, 'utf8')) as HslEpisodeBrief;
  const result = validateHslEpisode(episode);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.status !== 'PASS') process.exitCode = 1;
}

if (require.main === module) runCli();
