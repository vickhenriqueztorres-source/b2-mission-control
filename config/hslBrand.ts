export const HSL_BRAND = {
  name: 'Hidden Systems Lab',
  shortName: 'HSL Docs',
  promise: 'We reveal the hidden systems that keep modern life moving.',
  format: {
    aspectRatio: '16:9',
    master: {width: 3840, height: 2160, fps: 30},
    render: {width: 1920, height: 1080, fps: 30},
    safeMarginPx1080: 64
  },
  colors: {
    background: '#0D0E15',
    surface: '#161824',
    border: '#26293D',
    yellow: '#FFE500',
    blue: '#0038FF',
    orange: '#FF2E00',
    green: '#00FF85',
    textPrimary: '#F4F4F0',
    textMuted: '#8C90A4'
  },
  fonts: {
    heading: 'Bebas Neue',
    body: 'Inter',
    mono: 'JetBrains Mono'
  },
  springs: {
    pop: {damping: 12, mass: 0.6, stiffness: 180},
    pan: {damping: 20, mass: 1, stiffness: 80},
    drop: {damping: 14, mass: 1.2, stiffness: 140}
  },
  mediaMix: {
    remotion: {min: 50, max: 60},
    real: {min: 20, max: 25},
    generative: {min: 10, max: 20},
    typography: {min: 5, max: 10}
  }
} as const;

export const HSL_KLING_MODIFIER = [
  'documentary cinematography',
  '35mm lens',
  'shot on Arri Alexa',
  'industrial palette with matte charcoal and controlled vibrant yellow highlights',
  'volumetric haze',
  'slow continuous mechanical movement',
  'hyper-realistic textures',
  'no human faces looking at camera',
  'clean architectural framing'
].join(', ');
