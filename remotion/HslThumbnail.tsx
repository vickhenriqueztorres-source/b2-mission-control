import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

export interface HslThumbnailProps extends Record<string, unknown> {
  readonly baseImageSrc: string;
  readonly headlineLines: readonly string[];
  readonly textSide: 'LEFT' | 'RIGHT';
  readonly role: 'MECHANISM' | 'CONSEQUENCE' | 'FINAL_HANDOFF';
}

const accentByRole: Record<HslThumbnailProps['role'], string> = {
  MECHANISM: '#FFE500',
  CONSEQUENCE: '#FF2E00',
  FINAL_HANDOFF: '#FFE500'
};

export const HslThumbnail: React.FC<HslThumbnailProps> = ({baseImageSrc, headlineLines, textSide, role}) => {
  const isLeft = textSide === 'LEFT';
  const longest = Math.max(...headlineLines.map((line) => line.length), 1);
  const fontSize = longest > 18 ? 300 : longest > 13 ? 350 : 420;
  const accent = accentByRole[role];
  return <AbsoluteFill style={{backgroundColor: '#0D0E15', overflow: 'hidden'}}>
    <Img src={staticFile(baseImageSrc)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <AbsoluteFill style={{
      background: isLeft
        ? 'linear-gradient(90deg, rgba(5,6,10,.98) 0%, rgba(5,6,10,.90) 27%, rgba(5,6,10,.34) 52%, rgba(5,6,10,0) 72%)'
        : 'linear-gradient(270deg, rgba(5,6,10,.98) 0%, rgba(5,6,10,.90) 27%, rgba(5,6,10,.34) 52%, rgba(5,6,10,0) 72%)'
    }} />
    <div style={{
      position: 'absolute', top: 220, bottom: 220, width: 1780,
      left: isLeft ? 210 : undefined, right: isLeft ? undefined : 210,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: isLeft ? 'flex-start' : 'flex-end',
      textAlign: isLeft ? 'left' : 'right'
    }}>
      <div style={{width: 230, height: 22, backgroundColor: accent, marginBottom: 66}} />
      {headlineLines.map((line, index) => <div key={`${line}-${index}`} style={{
        color: index === headlineLines.length - 1 ? accent : '#F4F4F0',
        fontFamily: 'Impact, Bebas Neue, Arial Black, sans-serif', fontSize, lineHeight: .88,
        letterSpacing: 0, textTransform: 'uppercase', textShadow: '0 16px 44px rgba(0,0,0,.85)',
        WebkitTextStroke: '3px rgba(0,0,0,.12)', whiteSpace: 'nowrap'
      }}>{line}</div>)}
    </div>
  </AbsoluteFill>;
};
