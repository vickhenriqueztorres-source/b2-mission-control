export const HSL_VISUAL_IDENTITY_CONTRACT_VERSION = 'HSL_VISUAL_IDENTITY_V2' as const;

export const HSL_PREMIUM_MOTION_REFERENCE_SET = Object.freeze({
  name: 'HSL Premium Motion Reference Set V1',
  manifestPath: 'assets/hsl/motion-reference-set-v1/manifest.json',
  approvedAssetIds: Object.freeze([
    'BUFFER_AND_FLOW',
    'FLOW_JOURNEY_MAP',
    'LAST_METERS',
    'DELAY_SPREADS',
    'SYSTEMS_IN_MOTION'
  ])
});

export const HSL_VISUAL_IDENTITY_RULES = Object.freeze({
  contractVersion: HSL_VISUAL_IDENTITY_CONTRACT_VERSION,
  aesthetic: 'KINETIC_POP_DOCUMENTARY',
  visualStandard: 'cinematic realism + spatial infographic + narrative progression',
  palette: Object.freeze({
    background: '#0D0E15',
    yellow: '#FFE500',
    blue: '#0038FF',
    orange: '#FF2E00',
    white: '#F4F4F0'
  }),
  colorGrammar: Object.freeze({
    yellow: 'active tracked flow only',
    blue: 'persistent infrastructure only',
    orange: 'constraint, blockage or risk only',
    white: 'exact editorial information added after generation only'
  }),
  allowedStartFrameSourceModes: Object.freeze([
    'REFERENCE_CONDITIONED_GENERATION',
    'APPROVED_PHOTOGRAPHIC_BASE',
    'LICENSED_REAL_BASE'
  ]),
  forbiddenStartFrameSourceModes: Object.freeze([
    'PROCEDURAL_PREVIS',
    'FLAT_VECTOR_TEMPLATE',
    'PLACEHOLDER',
    'LOCAL_PROXY'
  ]),
  minimumTextureBucketRatio: 0.018,
  requireExplicitHumanApproval: true,
  requireReferenceAssetLineage: true
});

export interface HslStartFramePromptInput {
  readonly subject: string;
  readonly composition: string;
  readonly lens: string;
  readonly subjectAnchor: string;
  readonly negativeSpace?: string;
}

export function buildHslStartFramePrompt(input: HslStartFramePromptInput): string {
  const framing = [
    input.composition,
    input.lens,
    `subject at ${input.subjectAnchor}`,
    input.negativeSpace ? `negative space ${input.negativeSpace}` : null
  ].filter(Boolean).join(', ');
  return [
    `HSL visual identity contract ${HSL_VISUAL_IDENTITY_CONTRACT_VERSION}.`,
    `Original Hidden Systems Lab Kinetic Pop-Documentary start frame showing ${input.subject}.`,
    'Create a photoreal cinematic documentary image built from credible real-world infrastructure, never a flat illustration or generic dark diagram.',
    `${framing}.`,
    'Use realistic industrial materials, coherent practical lighting, preserved shadow detail, atmospheric depth, readable geometry and one dominant visual subject.',
    'Integrate restrained spatial infographic accents into the photographed world: acid yellow only for the active tracked flow, electric blue only for persistent infrastructure, hyper orange only for a real bottleneck, blockage or risk.',
    'Show the initial state before the main transformation, with one primary luminous focus and enough clean space for later editorial overlays.',
    'No embedded titles, readable words, numbers, labels, logos, UI panels, presenter, identifiable company, abstract grid template, excessive particles, crushed blacks or multiple competing focal points.',
    `Minimum visual reference: ${HSL_PREMIUM_MOTION_REFERENCE_SET.name}.`
  ].join(' ');
}

export function assertHslStartFramePromptIdentity(prompt: string, shotId: string): void {
  const required: ReadonlyArray<readonly [RegExp, string]> = [
    [/HSL_VISUAL_IDENTITY_V2/i, 'CONTRACT_VERSION'],
    [/Kinetic Pop-Documentary/i, 'AESTHETIC'],
    [/photoreal cinematic documentary/i, 'PHOTOREAL_BASE'],
    [/acid yellow only for the active tracked flow/i, 'YELLOW_GRAMMAR'],
    [/electric blue only for persistent infrastructure/i, 'BLUE_GRAMMAR'],
    [/hyper orange only for a real bottleneck/i, 'ORANGE_GRAMMAR'],
    [/initial state before the main transformation/i, 'INITIAL_STATE'],
    [/No embedded titles/i, 'NO_EMBEDDED_TEXT'],
    [/HSL Premium Motion Reference Set V1/i, 'REFERENCE_SET']
  ];
  for (const [pattern, rule] of required) {
    if (!pattern.test(prompt)) throw new Error(`HSL_VISUAL_IDENTITY_PROMPT_RULE_MISSING:${shotId}:${rule}`);
  }
}
