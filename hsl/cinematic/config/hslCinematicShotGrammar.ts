import {CINEMATIC_RULESET, HslCinematicBrandRules} from '../types/cinematicPlans';

export const HSL_CINEMATIC_BRAND_RULES: HslCinematicBrandRules = Object.freeze({
  ruleset: CINEMATIC_RULESET,
  principles: Object.freeze([
    'clear subject',
    'intentional composition',
    'motivated camera',
    'controlled depth',
    'readable geometry',
    'room for information',
    'mechanical specificity',
    'photoreal documentary base',
    'kinetic pop documentary identity',
    'acid yellow active flow only',
    'electric blue infrastructure only',
    'hyper orange constraint only',
    'one dominant luminous focus',
    'approved premium motion reference lineage',
    'no embedded text in generated start frames',
    'no procedural previs in production'
  ]),
  maximumCameraIntensity: 'MEDIUM',
  defaultDocumentaryLens: 'DOCUMENTARY_35'
});

export const HSL_CAMERA_BLACKLIST = Object.freeze([
  'ORBIT_360',
  'FAST_ZOOM',
  'CRASH_ZOOM',
  'RANDOM_SHAKE',
  'DRONE_SPIN',
  'HANDHELD_CHAOTIC',
  'WHIP_CAMERA',
  'FISHEYE_SWING',
  'UNMOTIVATED_ORBIT'
] as const);
