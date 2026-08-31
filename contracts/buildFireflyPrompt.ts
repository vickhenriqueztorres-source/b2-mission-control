import { SceneVisualContract } from './sceneVisualContract';
import { RawSceneInput } from './buildSceneContracts';
import {
  FUTURISTIC_STYLE_BLACKLIST,
  GLOBAL_NEGATIVE,
  IDENTITY_SUFFIX,
  LEGACY_STYLE_PREFIX_REGEX,
} from '../config/visualIdentity';

export interface FireflyPromptOutput {
  sceneId: string;
  category: string;
  domainTags: string[];
  mustInclude: string[];
  mustNot: string[];
  prompt: string;
  negativePrompt: string;
  aspectRatio: '16:9';
}

export interface FireflyPromptInput {
  sceneId?: string;
  scene_id?: string;
  voiceover?: string;
  visualSubject?: string;
  visual_subject?: string;
  visual_must_include?: string[];
  visual_must_not?: string[];
  required_category?: string;
  domainTags?: string[];
  allowed_sources?: string[];
  take_type?: string;
  targetSeconds?: number;
}

function normalizeIdentityText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Fail closed before a positive scene description can reintroduce the legacy look. */
export function assertDocumentaryRealityPrompt(input: string, sceneId: string): void {
  const normalized = normalizeIdentityText(input);
  const forbidden = FUTURISTIC_STYLE_BLACKLIST.find((term) => normalized.includes(normalizeIdentityText(term)));
  if (forbidden) {
    throw new Error(`VISUAL_IDENTITY_FUTURISM_FORBIDDEN:${sceneId}:${forbidden}`);
  }
}

/**
 * Constrói o prompt documental contemporâneo do Firefly para uma cena.
 * REGRA INVIOLÁVEL: O prompt DEVE começar pelo SUBJECT físico substantivo (must_include),
 * seguido por contexto real e SOMENTE DEPOIS pela identidade (IDENTITY_SUFFIX).
 */
export function buildFireflyPrompt(scene: SceneVisualContract | RawSceneInput | FireflyPromptInput): FireflyPromptOutput {
  const sceneId = ('sceneId' in scene && scene.sceneId) ? scene.sceneId : (('scene_id' in scene && scene.scene_id) ? scene.scene_id : 'UNKNOWN_SCENE');
  const mustInclude = scene.visual_must_include || [];
  const mustNot = scene.visual_must_not || [];
  const domainTags = scene.domainTags || ('tags' in scene && Array.isArray((scene as any).tags) ? (scene as any).tags : []);
  const category = scene.required_category || 'forensic_investigation';
  const rawSubject: string = String(
    ('visualSubject' in scene && scene.visualSubject)
      ? scene.visualSubject
      : (('visual_subject' in scene && (scene as any).visual_subject) ? (scene as any).visual_subject : '')
  );

  // Higieniza o visualSubject para remover prefixos de estilo que possam ter sido injetados
  const cleanSubject = rawSubject
    .replace(LEGACY_STYLE_PREFIX_REGEX, '')
    .trim();

  assertDocumentaryRealityPrompt([cleanSubject, ...mustInclude].join(' '), sceneId);

  // 1. Subject substantivo encabeça o prompt obrigatoriamente (visual_must_include em AND + visual_subject)
  const mustIncludeClause = mustInclude.length > 0
    ? `${mustInclude.join(' and ')}, physically present and clearly observable`
    : (cleanSubject ? `${cleanSubject}, physically present and clearly observable` : 'Authentic physical mechanism, clearly observable');

  const domainAnchor = domainTags.length > 0 ? `real present-day context of ${domainTags.join(', ')}` : '';
  const categoryAnchor = `documentary evidence category ${category.replace(/_/g, ' ')}`;

  // 2. Negative Prompt estrito: união de GLOBAL_NEGATIVE + visual_must_not da cena
  const combinedNegatives = Array.from(new Set([
    ...GLOBAL_NEGATIVE,
    ...mustNot
  ]));

  const negativePrompt = combinedNegatives.join(', ');

  // 3. O bot do Firefly aceita um único campo de prompt. Os negativos entram antes
  // da identidade para que GLOBAL_NEGATIVE seja aplicado e IDENTITY_SUFFIX permaneça por último.
  const fullPrompt = [
    mustIncludeClause,
    cleanSubject && !mustIncludeClause.toLowerCase().includes(cleanSubject.toLowerCase()) ? cleanSubject : null,
    domainAnchor ? domainAnchor : null,
    categoryAnchor,
    `Avoid: ${negativePrompt}`,
    IDENTITY_SUFFIX
  ].filter(Boolean).join(', ');

  return {
    sceneId,
    category,
    domainTags,
    mustInclude,
    mustNot,
    prompt: fullPrompt,
    negativePrompt,
    aspectRatio: '16:9'
  };
}
