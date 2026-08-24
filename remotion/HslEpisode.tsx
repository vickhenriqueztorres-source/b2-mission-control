import React from 'react';
import {AbsoluteFill, Audio, Sequence, Video, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {HslEpisodeRenderProps, HslRenderScene} from './types';
import {MotionModule} from './motion/MotionModules';
import {buildMotionDesign, stripShotIntent} from '../hsl/motion/motionDesign';

const colors = {
  background: '#0D0E15', surface: '#161824', border: '#34384F', yellow: '#FFE500',
  blue: '#0038FF', orange: '#FF2E00', text: '#F4F4F0', muted: '#9A9EB2'
};

const Grid: React.FC = () => <AbsoluteFill style={{
  backgroundColor: colors.background,
  backgroundImage: 'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
  backgroundSize: '80px 80px'
}} />;

function accentFor(scene: HslRenderScene): string {
  if (scene.motionDesign?.accent === 'orange') return colors.orange;
  if (scene.motionDesign?.accent === 'blue') return colors.blue;
  if (scene.motionDesign?.accent === 'yellow') return colors.yellow;
  const value = `${scene.narrativeFunction} ${scene.visualSubject}`.toLowerCase();
  if (/delay|blocked|constraint|bottleneck|hold/.test(value)) return colors.orange;
  if (/quality|filter|verification|information/.test(value)) return colors.blue;
  return colors.yellow;
}

const TypographyScene: React.FC<{scene: HslRenderScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const accent = accentFor(scene);
  const text = stripShotIntent(scene.visualSubject);
  const words = text.toUpperCase().split(/\s+/).filter(Boolean);
  const emphasis = words.findIndex((word) => /NOT|NO|HIDDEN|TIME|FLOW|CHAIN|SYNCHRONIZATION|CONTINUITY/.test(word));
  const fontSize = text.length > 85 ? 62 : text.length > 58 ? 74 : 92;
  const line = interpolate(frame, [6, Math.min(34, scene.durationInFrames * .28)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const kicker = interpolate(frame, [scene.durationInFrames * .58, scene.durationInFrames * .76], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '150px 150px 120px'}}>
    <div style={{fontFamily: 'Arial', fontWeight: 900, fontSize, lineHeight: 1.08, color: colors.text, maxWidth: 1540}}>
      {words.map((word, index) => {
        const start = 8 + index * Math.max(2, Math.floor(28 / Math.max(1, words.length)));
        const wordReveal = interpolate(frame, [start, start + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return <span key={`${word}-${index}`} style={{display: 'inline-block', marginRight: 20, color: index === emphasis ? accent : colors.text, opacity: wordReveal, transform: `translateY(${(1 - wordReveal) * 26}px)`}}>{word}</span>;
      })}
    </div>
    <div style={{width: 260, height: 10, background: accent, marginTop: 42, transformOrigin: 'left center', transform: `scaleX(${line})`}} />
    <div style={{height: 32, marginTop: 24, fontFamily: 'Arial', color: accent, fontSize: 18, fontWeight: 900, opacity: kicker, transform: `translateY(${(1 - kicker) * 12}px)`}}>
      {scene.variant === 'CONSEQUENCE' ? 'THE SYSTEM BEHIND THE OUTCOME' : 'LOOK PAST THE VISIBLE EVENT'}
    </div>
  </AbsoluteFill>;
};

const HybridOverlay: React.FC<{scene: HslRenderScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const design = scene.motionDesign;
  if (!design) return null;
  const reveal = interpolate(frame, [4, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const stageIndex = Math.min(
    design.stages.length - 1,
    Math.floor((frame / Math.max(1, scene.durationInFrames)) * design.stages.length)
  );
  const accent = design.accent === 'orange' ? colors.orange : design.accent === 'blue' ? colors.blue : colors.yellow;
  return <>
    <div style={{position: 'absolute', left: 62, top: 112, opacity: reveal, maxWidth: 570}}>
      <div style={{display: 'inline-block', color: accent, border: `1px solid ${accent}`, padding: '8px 12px', fontFamily: 'Arial', fontSize: 15, fontWeight: 900}}>{design.eyebrow}</div>
      <div style={{marginTop: 16, color: colors.text, fontFamily: 'Arial', fontSize: 42, lineHeight: 1.02, fontWeight: 900, textShadow: '0 3px 18px rgba(0,0,0,.85)'}}>{design.headline}</div>
    </div>
    <div style={{position: 'absolute', right: 62, bottom: 92, display: 'flex', gap: 8}}>
      {design.stages.map((stage, index) => <div key={`${stage}-${index}`} style={{
        padding: '10px 13px', fontFamily: 'Arial', fontSize: 14, fontWeight: 900,
        color: index <= stageIndex ? colors.background : colors.text,
        background: index <= stageIndex ? accent : 'rgba(13,14,21,.78)',
        border: `1px solid ${index <= stageIndex ? accent : colors.border}`,
        opacity: reveal
      }}>{stage}</div>)}
    </div>
  </>;
};

const SceneBody: React.FC<{scene: HslRenderScene; showGlobalOverlays: boolean; showHybridTextOverlay: boolean}> = ({
  scene, showGlobalOverlays, showHybridTextOverlay
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, scene.durationInFrames - 10, scene.durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = interpolate(frame, [0, scene.durationInFrames], [1.015, 1.065]);
  const progress = Math.max(0, Math.min(1, frame / Math.max(1, scene.durationInFrames - 1)));
  const accent = accentFor(scene);
  return <AbsoluteFill style={{opacity, overflow: 'hidden', backgroundColor: colors.background}}>
    <Grid />
    {(scene.visualMode === 'generated_ai' || scene.visualMode === 'licensed_real') && scene.mediaSrc ? <>
      <Video src={staticFile(scene.mediaSrc)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`}} />
      <AbsoluteFill style={{background: 'rgba(13,14,21,.12)'}} />
    </> : null}
    {scene.visualMode === 'remotion' ? <MotionModule durationInFrames={scene.durationInFrames} design={scene.motionDesign || buildMotionDesign({
      narrativeFunction: scene.narrativeFunction, visualSubject: scene.visualSubject, variant: scene.variant
    })} /> : null}
    {showHybridTextOverlay && scene.generationStrategy === 'VEO_REMOTION_HYBRID' ? <HybridOverlay scene={scene} /> : null}
    {scene.visualMode === 'typography' ? <TypographyScene scene={scene} /> : null}
    {showGlobalOverlays ? <>
      <div style={{position: 'absolute', top: 50, left: 62, color: colors.text, fontFamily: 'Arial', fontWeight: 900, fontSize: 25}}>HSL DOCS</div>
      <div style={{position: 'absolute', top: 56, right: 62, color: colors.muted, fontFamily: 'Arial', fontWeight: 700, fontSize: 15}}>{scene.shotId}</div>
      <div style={{position: 'absolute', left: 62, bottom: 58, color: accent, fontFamily: 'Arial', fontSize: 21, fontWeight: 800}}>{scene.chapterTitle.toUpperCase()}</div>
      <div style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: 7, background: colors.border}}>
        <div style={{height: '100%', width: `${progress * 100}%`, background: accent}} />
      </div>
      {scene.aiDisclosureRequired ? <div style={{position: 'absolute', right: 62, bottom: 55, color: colors.text, background: 'rgba(13,14,21,.72)', padding: '9px 13px', fontFamily: 'Arial', fontSize: 16}}>AI VISUALIZATION</div> : null}
    </> : null}
  </AbsoluteFill>;
};

export const HslEpisode: React.FC<HslEpisodeRenderProps> = (props) => {
  let from = 0;
  const showGlobalOverlays = props.showGlobalOverlays ?? true;
  const showHybridTextOverlay = props.showHybridTextOverlay ?? true;
  return <AbsoluteFill style={{backgroundColor: colors.background}}>
    {props.scenes.map((scene) => {
      const start = from;
      from += scene.durationInFrames;
      return <Sequence key={scene.shotId} from={start} durationInFrames={scene.durationInFrames} premountFor={15}>
        <SceneBody scene={scene} showGlobalOverlays={showGlobalOverlays} showHybridTextOverlay={showHybridTextOverlay} />
      </Sequence>;
    })}
    {props.narrationSrc ? <Audio src={staticFile(props.narrationSrc)} volume={1} /> : null}
    {props.soundFxSrc ? <Audio src={staticFile(props.soundFxSrc)} volume={props.soundFxVolume ?? 1} /> : null}
  </AbsoluteFill>;
};
