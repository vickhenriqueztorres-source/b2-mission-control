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
    'mechanical specificity'
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
