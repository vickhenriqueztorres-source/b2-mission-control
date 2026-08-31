import {
  DOCUMENTARY_FIELD_IDENTITY,
  FUTURISTIC_STYLE_BLACKLIST,
  GLOBAL_NEGATIVE,
  IDENTITY_SUFFIX,
  VISUAL_IDENTITY_VERSION,
} from './visualIdentity';

/** Compatibility facade for the HSL execution pipeline. */
export const HSL_VISUAL_IDENTITY_CONTRACT_VERSION = VISUAL_IDENTITY_VERSION;

export const HSL_PREMIUM_MOTION_REFERENCE_SET = Object.freeze({
  name: 'Documentary Field Reference Set V4',
  manifestPath: 'assets/visual_identity/documentary-field-v4/manifest.json',
  approvedAssetIds: Object.freeze([
    'OBSERVATIONAL_FIELD',
    'FIELD_REPORTAGE',
    'PHYSICAL_EVIDENCE',
    'OPERATIONAL_SCALE',
  ]),
});

export const HSL_VISUAL_IDENTITY_RULES = Object.freeze({
  contractVersion: HSL_VISUAL_IDENTITY_CONTRACT_VERSION,
  aesthetic: 'DOCUMENTARY_FIELD_INVESTIGATIVE',
  visualStandard: 'present-day physical reality + observational camera + restrained editorial evidence',
  distribution: DOCUMENTARY_FIELD_IDENTITY.distribution,
  colorGrammar: Object.freeze({
    rec709: 'natural base with moderate contrast and readable shadows',
    warm: 'only a practical warm source or one evidence accent',
    cyan: 'verified telemetry only, never a global grade',
    white: 'short factual annotation placed over natural negative space',
  }),
  allowedStartFrameSourceModes: Object.freeze([
    'REFERENCE_CONDITIONED_GENERATION',
    'APPROVED_PHOTOGRAPHIC_BASE',
    'LICENSED_REAL_BASE',
  ]),
  forbiddenStartFrameSourceModes: Object.freeze([
    'PROCEDURAL_PREVIS',
    'FLAT_VECTOR_TEMPLATE',
    'PLACEHOLDER',
    'LOCAL_PROXY',
  ]),
  minimumTextureBucketRatio: 0.018,
  requireExplicitHumanApproval: true,
  requireReferenceAssetLineage: true,
});

export interface HslStartFramePromptInput {
  readonly subject: string;
  readonly composition: string;
  readonly lens: string;
  readonly subjectAnchor: string;
  readonly negativeSpace?: string;
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function buildHslStartFramePrompt(input: HslStartFramePromptInput): string {
  const positive = [input.subject, input.composition, input.lens, `subject at ${input.subjectAnchor}`]
    .filter(Boolean)
    .join(' ');
  const normalized = normalize(positive);
  const forbidden = FUTURISTIC_STYLE_BLACKLIST.find((term) => normalized.includes(normalize(term)));
  if (forbidden) throw new Error(`HSL_VISUAL_IDENTITY_FUTURISM_FORBIDDEN:${forbidden}`);

  const framing = [
    input.composition,
    input.lens,
    `subject at ${input.subjectAnchor}`,
    input.negativeSpace ? `natural negative space ${input.negativeSpace}` : null,
  ].filter(Boolean).join(', ');

  return [
    `${input.subject}, physically present and clearly observable`,
    framing,
    'initial state before the main physical action',
    `Avoid: ${GLOBAL_NEGATIVE.join(', ')}`,
    IDENTITY_SUFFIX,
  ].filter(Boolean).join(', ');
}

export function assertHslStartFramePromptIdentity(prompt: string, shotId: string): void {
  const required: ReadonlyArray<readonly [RegExp, string]> = [
    [/physically present and clearly observable/i, 'PHYSICAL_SUBJECT_FIRST'],
    [/initial state before the main physical action/i, 'INITIAL_STATE'],
    [/present-day on-location investigative documentary photography/i, 'DOCUMENTARY_FIELD_AESTHETIC'],
    [/natural Rec\.709 color/i, 'REC709_BASE'],
    [/practical available lighting/i, 'PRACTICAL_LIGHT'],
    [/no HUD/i, 'NO_HUD'],
    [/no text/i, 'NO_EMBEDDED_TEXT'],
    [/--ar 16:9/i, 'ASPECT_RATIO'],
  ];
  for (const [pattern, rule] of required) {
    if (!pattern.test(prompt)) throw new Error(`HSL_VISUAL_IDENTITY_PROMPT_RULE_MISSING:${shotId}:${rule}`);
  }
  const positivePrompt = prompt.split(/\bAvoid:/i)[0];
  const normalizedPositive = normalize(positivePrompt);
  const forbidden = FUTURISTIC_STYLE_BLACKLIST.find((term) => normalizedPositive.includes(normalize(term)));
  if (forbidden) throw new Error(`HSL_VISUAL_IDENTITY_PROMPT_FORBIDDEN:${shotId}:${forbidden}`);
}
