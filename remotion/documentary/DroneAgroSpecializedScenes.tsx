import React from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {CinematicParallaxMotion} from './CinematicParallaxMotion';

export interface DroneAgroSceneProps {
  sceneId: string;
  durationInFrames: number;
  mediaPath?: string;
  imageSrc?: string;
  title?: string;
  subtitle?: string;
  chapterTitle?: string;
  telemetryLine?: string;
  evidenceLine?: string;
  mechanismLine?: string;
  hectareProgress?: number;
  accentColor?: string;
  telemetryColor?: string;
}

const COLORS = {
  bg: '#060709',
  surface: '#0D0E15',
  text: '#F4F4F0',
  muted: '#8A8D9F',
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

function sceneNumber(sceneId: string): number {
  return Number(sceneId.match(/\d+/)?.[0] || 1);
}

function introOutroOpacity(frame: number, durationInFrames: number): number {
  return interpolate(
    frame,
    [0, 10, Math.max(11, durationInFrames - 18), Math.max(12, durationInFrames - 5)],
    [0, 1, 1, 0],
    clamp,
  );
}

const TelemetryStrip: React.FC<Pick<DroneAgroSceneProps, 'telemetryLine' | 'telemetryColor'>> = ({
  telemetryLine,
  telemetryColor = '#00F0FF',
}) => {
  if (!telemetryLine) return null;
  return (
    <div style={{
      position: 'absolute',
      top: 64,
      right: 76,
      maxWidth: 680,
      padding: '10px 14px',
      borderTop: `2px solid ${telemetryColor}`,
      background: 'rgba(6,7,9,0.66)',
      color: telemetryColor,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 15,
      lineHeight: 1.35,
      letterSpacing: 0,
    }}>
      {telemetryLine}
    </div>
  );
};

const HectareProgress: React.FC<Pick<DroneAgroSceneProps, 'hectareProgress' | 'accentColor'>> = ({
  hectareProgress = 0,
  accentColor = '#FF5500',
}) => (
  <div style={{position: 'absolute', left: 76, right: 76, bottom: 58, height: 2, background: 'rgba(244,244,240,0.16)'}}>
    <div style={{width: `${Math.max(2, Math.min(100, hectareProgress * 100))}%`, height: 2, background: accentColor}} />
  </div>
);

export const DroneAgroMatterScene: React.FC<DroneAgroSceneProps> = ({
  mediaPath,
  durationInFrames,
  title,
  subtitle,
  chapterTitle,
  telemetryLine,
  hectareProgress,
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
}) => {
  if (!mediaPath) {
    throw new Error('DRONE_AGRO_MATTER_REQUIRES_TEMPORAL_VIDEO');
  }
  const frame = useCurrentFrame();
  const captionOpacity = interpolate(frame, [8, 18, 70, 82], [0, 1, 1, 0], clamp);
  const captionY = interpolate(frame, [8, 20], [18, 0], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg, overflow: 'hidden'}}>
      <OffthreadVideo
        src={staticFile(mediaPath)}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,7,9,0.18) 0%, transparent 50%, rgba(6,7,9,0.72) 100%)'}} />
      <TelemetryStrip telemetryLine={telemetryLine} telemetryColor={telemetryColor} />
      <div style={{
        position: 'absolute',
        left: 76,
        bottom: 92,
        maxWidth: 980,
        opacity: captionOpacity,
        transform: `translateY(${captionY}px)`,
      }}>
        <div style={{fontFamily: 'JetBrains Mono, monospace', color: COLORS.muted, fontSize: 14, letterSpacing: 0}}>
          {chapterTitle}
        </div>
        <div style={{fontFamily: 'Arial, sans-serif', color: COLORS.text, fontWeight: 800, fontSize: 42, lineHeight: 1.08, marginTop: 7, letterSpacing: 0}}>
          {title}
        </div>
        {subtitle && <div style={{fontFamily: 'Arial, sans-serif', color: COLORS.text, fontSize: 20, marginTop: 8, letterSpacing: 0}}>{subtitle}</div>}
        <div style={{marginTop: 14, width: 84, height: 3, background: accentColor}} />
      </div>
      <HectareProgress hectareProgress={hectareProgress} accentColor={accentColor} />
    </AbsoluteFill>
  );
};

export const DroneAgroEvidenceScene: React.FC<DroneAgroSceneProps> = ({
  sceneId,
  imageSrc,
  durationInFrames,
  title,
  subtitle,
  evidenceLine,
  telemetryLine,
  hectareProgress,
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
}) => {
  if (!imageSrc) throw new Error(`DRONE_AGRO_EVIDENCE_IMAGE_MISSING:${sceneId}`);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const panel = spring({frame: Math.max(0, frame - 8), fps, config: {damping: 18, stiffness: 75}});
  const scanX = interpolate(frame, [12, Math.max(45, durationInFrames - 18)], [8, 92], clamp);
  const focusScale = interpolate(frame, [0, durationInFrames], [1.02, 1.1], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, width: '65%', overflow: 'hidden'}}>
        <CinematicParallaxMotion mode="pan_left" durationInFrames={durationInFrames} zoomIntensity={1.12}>
          <Img src={staticFile(imageSrc)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${focusScale})`}} />
        </CinematicParallaxMotion>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${scanX}%`, width: 2, background: accentColor, boxShadow: `0 0 20px ${accentColor}`}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 30%, rgba(6,7,9,0.64) 58%, #060709 72%)'}} />
      <section style={{
        position: 'absolute',
        right: 84,
        top: 170,
        width: 610,
        minHeight: 520,
        padding: '34px 38px',
        borderLeft: `4px solid ${accentColor}`,
        background: 'rgba(13,14,21,0.9)',
        opacity: panel,
        transform: `translateX(${(1 - panel) * 80}px)`,
      }}>
        <div style={{fontFamily: 'JetBrains Mono, monospace', fontSize: 15, color: accentColor, letterSpacing: 0}}>
          EVIDENCIA FISICA // {sceneId}
        </div>
        <h2 style={{fontFamily: 'Arial, sans-serif', fontSize: 46, lineHeight: 1.05, color: COLORS.text, margin: '28px 0 0', letterSpacing: 0}}>{title}</h2>
        {subtitle && <p style={{fontFamily: 'Arial, sans-serif', fontSize: 22, lineHeight: 1.35, color: COLORS.text, margin: '18px 0 0'}}>{subtitle}</p>}
        <div style={{height: 1, background: 'rgba(244,244,240,0.18)', margin: '32px 0'}} />
        <p style={{fontFamily: 'JetBrains Mono, monospace', fontSize: 18, lineHeight: 1.55, color: COLORS.muted, margin: 0, letterSpacing: 0}}>{evidenceLine}</p>
      </section>
      <TelemetryStrip telemetryLine={telemetryLine} telemetryColor={telemetryColor} />
      <HectareProgress hectareProgress={hectareProgress} accentColor={accentColor} />
    </AbsoluteFill>
  );
};

export const DroneAgroRouteMapScene: React.FC<DroneAgroSceneProps> = ({
  sceneId,
  imageSrc,
  durationInFrames,
  title,
  subtitle,
  telemetryLine,
  hectareProgress,
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
}) => {
  if (!imageSrc) throw new Error(`DRONE_AGRO_MAP_IMAGE_MISSING:${sceneId}`);
  const frame = useCurrentFrame();
  const seed = sceneNumber(sceneId);
  const routeProgress = interpolate(frame, [8, Math.min(92, durationInFrames - 8)], [1, 0], clamp);
  const mapScale = interpolate(frame, [0, durationInFrames], [1.08, 1.02], clamp);
  const pulse = 0.8 + Math.sin(frame * 0.18) * 0.2;
  const route = seed % 2 === 0
    ? 'M150 810 C390 710 410 390 690 460 S1040 790 1240 570 S1510 260 1760 330'
    : 'M120 740 C350 520 560 680 760 450 S1080 220 1260 430 S1550 730 1790 410';

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg, overflow: 'hidden'}}>
      <Img src={staticFile(imageSrc)} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28, filter: 'grayscale(1) contrast(1.25)', transform: `scale(${mapScale})`}} />
      <AbsoluteFill style={{background: 'rgba(6,7,9,0.48)'}} />
      <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        <defs>
          <pattern id={`field-grid-${sceneId}`} width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M64 0H0V64" fill="none" stroke="rgba(244,244,240,0.07)" strokeWidth="1" />
          </pattern>
          <filter id={`route-glow-${sceneId}`}><feGaussianBlur stdDeviation="7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <rect width="1920" height="1080" fill={`url(#field-grid-${sceneId})`} />
        {[250, 390, 530, 670, 810].map((y) => <path key={y} d={`M80 ${y} C500 ${y - 70} 1150 ${y + 70} 1840 ${y - 20}`} fill="none" stroke="rgba(244,244,240,0.09)" strokeWidth="2" />)}
        <path d={route} pathLength={1} fill="none" stroke="rgba(255,85,0,0.22)" strokeWidth="18" />
        <path d={route} pathLength={1} fill="none" stroke={accentColor} strokeWidth="5" strokeDasharray={1} strokeDashoffset={routeProgress} filter={`url(#route-glow-${sceneId})`} />
        <circle cx={seed % 2 === 0 ? 1760 : 1790} cy={seed % 2 === 0 ? 330 : 410} r={18 * pulse} fill="none" stroke={telemetryColor} strokeWidth="3" />
        <circle cx={seed % 2 === 0 ? 1760 : 1790} cy={seed % 2 === 0 ? 330 : 410} r="6" fill={accentColor} />
      </svg>
      <div style={{position: 'absolute', left: 80, top: 78, width: 720}}>
        <div style={{fontFamily: 'JetBrains Mono, monospace', color: telemetryColor, fontSize: 15, letterSpacing: 0}}>ROTA AUTONOMA // TALHAO {sceneId}</div>
        <div style={{fontFamily: 'Arial, sans-serif', color: COLORS.text, fontWeight: 800, fontSize: 52, lineHeight: 1.04, marginTop: 16, letterSpacing: 0}}>{title}</div>
        {subtitle && <div style={{fontFamily: 'Arial, sans-serif', color: COLORS.muted, fontSize: 22, marginTop: 12}}>{subtitle}</div>}
      </div>
      <TelemetryStrip telemetryLine={telemetryLine} telemetryColor={telemetryColor} />
      <HectareProgress hectareProgress={hectareProgress} accentColor={accentColor} />
    </AbsoluteFill>
  );
};

export const DroneAgroTechnicalRevealScene: React.FC<DroneAgroSceneProps> = ({
  sceneId,
  imageSrc,
  durationInFrames,
  title,
  subtitle,
  mechanismLine,
  telemetryLine,
  hectareProgress,
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
}) => {
  if (!imageSrc) throw new Error(`DRONE_AGRO_REVEAL_IMAGE_MISSING:${sceneId}`);
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [12, Math.min(90, durationInFrames - 12)], [18, 82], clamp);
  const opacity = introOutroOpacity(frame, durationInFrames);
  const rotor = frame * 5;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg, overflow: 'hidden'}}>
      <Img src={staticFile(imageSrc)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.14) brightness(0.72)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(6,7,9,0.76), rgba(6,7,9,0.14) 56%, rgba(6,7,9,0.58))'}} />
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - wipe}% 0 0)`, background: 'rgba(0,240,255,0.045)'}}>
        <svg viewBox="0 0 1920 1080" style={{width: '100%', height: '100%'}}>
          <g transform={`translate(1110 410) rotate(${rotor})`} opacity="0.76">
            {[0, 45, 90, 135].map((angle) => <ellipse key={angle} cx="0" cy="0" rx="380" ry="34" transform={`rotate(${angle})`} fill="none" stroke={telemetryColor} strokeWidth="3" />)}
          </g>
          {[0, 1, 2, 3, 4, 5, 6].map((index) => {
            const x = 760 + index * 118;
            const drop = 500 + ((frame * (5 + index)) % 350);
            return <circle key={index} cx={x} cy={drop} r={4 + (index % 3)} fill={index % 2 ? accentColor : telemetryColor} opacity="0.75" />;
          })}
          <path d="M700 510 Q1080 720 1510 535" fill="none" stroke={accentColor} strokeWidth="5" strokeDasharray="18 12" opacity="0.8" />
          <path d="M720 560 Q1080 860 1490 580" fill="none" stroke={telemetryColor} strokeWidth="2" strokeDasharray="8 10" opacity="0.65" />
        </svg>
      </div>
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${wipe}%`, width: 3, background: accentColor, boxShadow: `0 0 28px ${accentColor}`}} />
      <div style={{position: 'absolute', left: 78, top: 160, width: 650, opacity}}>
        <div style={{fontFamily: 'JetBrains Mono, monospace', color: accentColor, fontSize: 15, letterSpacing: 0}}>CORTE TECNICO // {sceneId}</div>
        <h2 style={{fontFamily: 'Arial, sans-serif', color: COLORS.text, fontSize: 48, lineHeight: 1.04, margin: '20px 0 0', letterSpacing: 0}}>{title}</h2>
        {subtitle && <p style={{fontFamily: 'Arial, sans-serif', color: COLORS.text, fontSize: 21, lineHeight: 1.35, margin: '14px 0 0'}}>{subtitle}</p>}
        <div style={{marginTop: 30, padding: '18px 20px', borderLeft: `3px solid ${telemetryColor}`, background: 'rgba(6,7,9,0.72)', fontFamily: 'JetBrains Mono, monospace', color: telemetryColor, fontSize: 17, lineHeight: 1.45, letterSpacing: 0}}>{mechanismLine}</div>
      </div>
      <TelemetryStrip telemetryLine={telemetryLine} telemetryColor={telemetryColor} />
      <HectareProgress hectareProgress={hectareProgress} accentColor={accentColor} />
    </AbsoluteFill>
  );
};
