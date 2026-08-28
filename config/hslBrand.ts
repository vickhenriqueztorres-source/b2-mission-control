export const HSL_BRAND = {
  name: 'O Outro Lado',
  shortName: 'O Outro Lado',
  tagline: 'O que acontece depois que você clica, compra, liga ou aperta.',
  secondaryTagline: 'Investigar. Revelar. Compreender.',
  promise: 'Revelar a infraestrutura invisível que opera 24/7 no Brasil, acompanhando uma única unidade do ponto de origem ao destino final.',
  theme: 'Industrial X-Ray',
  format: {
    aspectRatio: '16:9',
    master: { width: 3840, height: 2160, fps: 30 },
    render: { width: 1920, height: 1080, fps: 30 },
    safeMarginPx1080: 64
  },
  colors: {
    background: '#060709', // Carbon Black (base void)
    surface: 'rgba(255, 255, 255, 0.05)',
    surfaceBorder: 'rgba(255, 85, 0, 0.3)',
    orange: '#FF5500', // Sodium-Vapor Orange (interior revelado, laser cut, gargalos)
    cyan: '#00F0FF', // Laser Cyan (fluxo de dados, telemetria)
    frostedGlass: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#F4F4F5', // Titanium White (títulos e peso)
    textMuted: '#71717A', // Muted Slate (telemetria e suporte)
    border: 'rgba(255, 85, 0, 0.3)',
    yellow: '#FFE500',
    blue: '#0038FF',
    green: '#00FF85'
  },
  fonts: {
    heading: 'Bebas Neue',
    body: 'Inter',
    mono: 'JetBrains Mono'
  },
  glass: {
    backdropBlur: '12px',
    border: '1px solid rgba(255, 85, 0, 0.3)'
  },
  springs: {
    laserWipe: { damping: 20, mass: 0.8, stiffness: 90 },
    glassFloat: { damping: 15, mass: 1.0, stiffness: 120 },
    telemetryScan: { damping: 30, mass: 0.5, stiffness: 200 },
    pop: { damping: 12, mass: 0.6, stiffness: 180 },
    pan: { damping: 20, mass: 1, stiffness: 80 },
    drop: { damping: 14, mass: 1.2, stiffness: 140 }
  },
  mediaMix: {
    remotion: { min: 50, max: 60 },
    real: { min: 20, max: 25 },
    generative: { min: 10, max: 20 },
    typography: { min: 5, max: 10 }
  }
} as const;

export const OUTRO_LADO_BRAND = HSL_BRAND;

export const HSL_KLING_MODIFIER = [
  'documentary cinematography',
  '35mm anamorphic lens',
  'dramatic moody lighting dominated by deep carbon black (#060709) and fiery sodium-vapor orange (#FF5500) glowing accents',
  'subtle cyan highlights (#00F0FF)',
  'volumetric steam and haze',
  'slow controlled tracking shot',
  'photorealistic metal textures',
  'high dynamic range',
  'no human faces visible',
  'pristine cinematic framing --motion 3'
].join(', ');
