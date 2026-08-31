/**
 * Canonical visual identity contract: Documentario de Campo Investigativo v4.0.
 * Human-readable authority: /IDENTIDADE_VISUAL.md.
 */

import {HSL_COLOR_TOKENS, HSL_BRAND_IDENTITY, HSL_VIDEO_RESOLUTION} from '../spec/hsl-spec';

export const VISUAL_IDENTITY_VERSION = 'HSL_DOCUMENTARY_FIELD_V4' as const;

export const DOCUMENTARY_FIELD_IDENTITY = Object.freeze({
  name: 'Documentario de Campo Investigativo',
  thesis: 'A imagem nasce da realidade atual; a edicao organiza a evidencia.',
  distribution: Object.freeze({matter: 0.55, evidence: 0.20, maps: 0.15, reveal: 0.10}),
  shotDurationSeconds: Object.freeze({min: 2.5, max: 4.5}),
  evidenceFreezeSeconds: Object.freeze({min: 0.8, max: 1.2}),
  overlayMaximumFrameRatio: 0.12,
  crossfadeFrames: Object.freeze({min: 6, max: 8}),
});

/** Appended after the physical subject. It must stay topic-agnostic. */
export const IDENTITY_SUFFIX = [
  'present-day on-location investigative documentary photography',
  'current commercially plausible equipment and environments',
  'camera physically present inside the real operation',
  'natural Rec.709 color with moderate contrast and readable shadow detail',
  'slightly restrained location colors without a global cyan shift',
  'practical available lighting with neutral work lights preserved',
  'warm sodium-orange (' + HSL_COLOR_TOKENS.SODIUM_ORANGE + ') only from a real practical source or one evidence accent',
  'fine irregular 35mm grain',
  'subtle halation only around real lamps',
  'low bloom and gentle vignette',
  'atmosphere only when physically caused by dust, vapor, spray or weather',
  'authentic material texture and observational framing',
  HSL_VIDEO_RESOLUTION.WIDTH + 'x' + HSL_VIDEO_RESOLUTION.HEIGHT,
  'no text',
  'no HUD',
  'no numbers',
  'no logo',
  'no posed human faces',
  '--ar 16:9',
].join(', ');

export const GLOBAL_NEGATIVE: readonly string[] = Object.freeze([
  'generic stock footage',
  'unrelated lifestyle b-roll',
  'posed commercial photography',
  'smiling person looking at camera',
  'presenter addressing camera',
  'invented machinery',
  'anachronistic technology',
  'science fiction',
  'cyberpunk',
  'futuristic interface',
  'hologram',
  'holographic',
  'floating interface',
  'floating HUD',
  'decorative laser grid',
  'neon tunnel',
  'dominant neon cyan',
  'sci-fi',
  'wireframe world',
  'heavy teal-orange grade',
  'staged volumetric fog',
  'fake wet reflective ground',
  'permanent black title bar',
  'cgi',
  'cartoon',
  'text',
  'watermark',
  'logo',
  '720p upscale',
]);

export const FUTURISTIC_STYLE_BLACKLIST: readonly string[] = Object.freeze([
  'cyberpunk',
  'hologram',
  'holographic',
  'futuristic interface',
  'floating interface',
  'laser grid',
  'neon tunnel',
  'sci-fi',
  'science fiction',
  'wireframe world',
]);

export const STOCK_TAG_BLACKLIST: readonly string[] = Object.freeze([
  'generic_stock',
  'corporate_smile',
  'lifestyle_pose',
  'unrelated_broll',
  'futuristic',
  'cyberpunk',
  'showroom',
]);

export const ALLOWED_COLOR_TONES: readonly string[] = Object.freeze([
  'natural-rec709',
  'practical-light',
  'documentary-low-key',
  'neutral-led',
  'restrained-sodium',
  'natural-location-color',
  'carbon-black',
]);

export const MIN_RESOLUTION = Object.freeze({
  width: HSL_VIDEO_RESOLUTION.WIDTH,
  height: HSL_VIDEO_RESOLUTION.HEIGHT,
});

export const CANONICAL_PROPORTIONS = Object.freeze({
  matterMin: 0.50,
  matterMax: 0.60,
  evidenceMin: 0.20,
  evidenceMax: 0.30,
  mapsMin: 0.10,
  mapsMax: 0.20,
  revealMin: 0.05,
  revealMax: 0.15,
});

export const LEGACY_STYLE_PREFIX_REGEX = /^(?:extreme\s+cinematic\s+35mm(?:\s+anamorphic\s+still\s+from\s+a\s+denis\s+villeneuve\s+film)?|denis\s+villeneuve\s+style|cinematic\s+35mm|cyber[- ]industrial),?\s*/i;

export {HSL_COLOR_TOKENS, HSL_BRAND_IDENTITY, HSL_VIDEO_RESOLUTION};
