import { SceneVisualContract } from './sceneVisualContract';
import { RawSceneInput } from './buildSceneContracts';

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

/**
 * Constrói o prompt fotorealista 35mm do Firefly para uma cena documental.
 * REGRA INVIOLÁVEL: O prompt DEVE começar pelo SUBJECT físico substantivo (must_include),
 * seguido por categoria/domínio e SOMENTE DEPOIS pelo look cinematográfico 35mm.
 * PROIBIDO começar com "Denis Villeneuve cinematic industrial".
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

  // 1. Subject substantivo encabeça o prompt obrigatoriamente
  const mustIncludeClause = mustInclude.length > 0
    ? `Detailed authentic close-up of ${mustInclude.join(' and ')}`
    : 'Detailed authentic physical mechanism';

  // Higieniza o visualSubject para remover prefixos de estilo que possam ter sido injetados
  const cleanSubject = rawSubject
    .replace(/^extreme cinematic 35mm anamorphic still from a denis villeneuve film,?\s*/i, '')
    .replace(/^cinematic 35mm,?\s*/i, '')
    .replace(/^denis villeneuve style,?\s*/i, '')
    .trim();

  const domainAnchor = domainTags.length > 0 ? `context of ${domainTags.join(', ')} infrastructure` : '';
  const categoryAnchor = `technical category ${category.replace(/_/g, ' ')}`;

  // 2. Look Cinematográfico 35mm (aplicado APENAS após o subject substantivo)
  const cinematicLook = [
    'monumental industrial scale',
    'atmospheric chiaroscuro lighting with deep carbon blacks (#060709)',
    'subtle sodium-vapor amber highlights (#FF5500)',
    'sharp cyan laser telemetry reflections (#00F0FF)',
    'dense atmospheric steam and micro-fog',
    '35mm anamorphic filmic texture with shallow depth of field',
    'creamy anamorphic bokeh',
    'raw realistic documentary photography',
    '8k photoreal'
  ].join(', ');

  // Montagem final do prompt
  const fullPrompt = [
    mustIncludeClause,
    cleanSubject ? cleanSubject : null,
    domainAnchor ? domainAnchor : null,
    categoryAnchor,
    cinematicLook,
    'NO TEXT, NO HUD, NO NUMBERS, NO LOGO, NO HUMAN FACES'
  ].filter(Boolean).join(', ');

  // 3. Negative Prompt estrito
  const defaultNegatives = [
    'text',
    'watermark',
    'overlay',
    'hud',
    'numbers',
    'labels',
    'letters',
    'brand logo',
    'human face',
    'people looking at camera',
    'cgi render',
    '3d video game',
    'blurry',
    'distorted geometry',
    'cartoon'
  ];

  const combinedNegatives = Array.from(new Set([
    ...mustNot,
    ...defaultNegatives
  ]));

  const negativePrompt = combinedNegatives.join(', ');

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
