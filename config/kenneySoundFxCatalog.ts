import path from 'path';

export interface KenneySoundFxPack {
  readonly id: 'interface-sounds' | 'impact-sounds';
  readonly pageUrl: string;
  readonly downloadUrl: string;
  readonly zipSha256: string;
}

export interface KenneySoundFxSelection {
  readonly cueType: 'SNAP_POP' | 'SUBTLE_STRIKE' | 'CHAPTER_DROP';
  readonly canonicalName: string;
  readonly packId: KenneySoundFxPack['id'];
  readonly pathInPack: string;
  readonly sourceSha256: string;
  readonly ffmpegFilter: string;
  readonly maxDurationSeconds?: number;
}

export const KENNEY_CC0_LICENSE_URL = 'https://creativecommons.org/publicdomain/zero/1.0/';

export const KENNEY_SFX_PACKS: readonly KenneySoundFxPack[] = [
  {
    id: 'interface-sounds',
    pageUrl: 'https://kenney.nl/assets/interface-sounds',
    downloadUrl: 'https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip',
    zipSha256: 'f2193d072726d6758a5f7871b2dcc54dcce0d5c35c6f0a62f92549b327c81232'
  },
  {
    id: 'impact-sounds',
    pageUrl: 'https://kenney.nl/assets/impact-sounds',
    downloadUrl: 'https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip',
    zipSha256: '029d734af1582474edf3a694d1b0cebc97c1c152f2f39fa34d4c2bafc5de77f8'
  }
];

export const KENNEY_SFX_SELECTIONS: readonly KenneySoundFxSelection[] = [
  {
    cueType: 'SNAP_POP', canonicalName: 'sfx_snap_pop.wav', packId: 'interface-sounds',
    pathInPack: 'Audio/pluck_001.ogg',
    sourceSha256: 'be97ec4893a02d6eccfb678daa76c83e34cb2583b834ec2593d2641def739fa4',
    ffmpegFilter: 'highpass=f=180,volume=0.9'
  },
  {
    cueType: 'SUBTLE_STRIKE', canonicalName: 'sfx_subtle_strike.wav', packId: 'impact-sounds',
    pathInPack: 'Audio/impactMetal_light_002.ogg',
    sourceSha256: '25a96f90a9a1f88a531e824e126f0519504625e5635e65a72e4f31611428db29',
    ffmpegFilter: 'highpass=f=90,lowpass=f=6500,volume=0.72'
  },
  {
    cueType: 'CHAPTER_DROP', canonicalName: 'sfx_heavy_sub_drop.wav', packId: 'impact-sounds',
    pathInPack: 'Audio/impactBell_heavy_001.ogg',
    sourceSha256: '9df61e3ae9a83dc65e5a1fd3ed19d480876f3b22b963a1b9ef6fa293592dcec4',
    ffmpegFilter: 'asetrate=34560,aresample=48000,lowpass=f=520,volume=0.68',
    maxDurationSeconds: 1.8
  }
];

export function kenneySoundFxRoot(projectRoot = process.cwd()): string {
  return path.resolve(projectRoot, 'assets', 'soundfx', 'kenney');
}
