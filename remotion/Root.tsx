import React from 'react';
import {Composition} from 'remotion';
import {HslEpisode} from './HslEpisode';
import {Episode01Pix} from './Episode01Pix';
import {Episode02Cabos} from './Episode02Cabos';
import {Episode04GpsTempo} from './Episode04GpsTempo';
import {Episode05RadarAsfalto, EPISODE05RADARASFALTO_TOTAL_FRAMES} from './Episode05RadarAsfalto';
import {EpisodeTest1Min} from './EpisodeTest1Min';
import {EPISODE_TEST_1MIN_TOTAL_FRAMES} from './episodeTest1MinTimelineData';
import {EpisodeGasolina} from './EpisodeGasolina';
import {EPISODE_GASOLINA_TOTAL_FRAMES} from './episodeGasolinaTimelineData';
import {EpisodeGps} from './EpisodeGps';
import {EPISODE_GPS_TOTAL_FRAMES} from './episodeGpsTimelineData';
import {HslThumbnail, HslThumbnailProps} from './HslThumbnail';
import {HslEpisodeRenderProps} from './types';

import {HSL_FPS, HSL_VIDEO_RESOLUTION} from '../spec/hsl-spec';
import {EPISODE_01_TIMELINE_TOTAL_FRAMES} from './episode01TimelineData';
import {EPISODE_02_TOTAL_FRAMES} from './episode02TimelineData';
import {EPISODE_04_TOTAL_FRAMES} from './episode04TimelineData';
import {EPISODE_05_TOTAL_FRAMES} from './episode05TimelineData';

const defaults: HslEpisodeRenderProps = {
  title: 'O Outro Lado', fps: HSL_FPS, width: HSL_VIDEO_RESOLUTION.WIDTH, height: HSL_VIDEO_RESOLUTION.HEIGHT, totalDurationInFrames: HSL_FPS,
  scenes: [{sceneId: 'OUTRO_LADO_DEFAULT', shotId: 'OUTRO_LADO_DEFAULT_V01', variant: 'ESTABLISH', chapterTitle: 'O Outro Lado', narrativeFunction: 'title', visualMode: 'typography', visualSubject: 'O Outro Lado', durationInFrames: HSL_FPS, aiDisclosureRequired: false, transition: 'CUT'}]
};

const thumbnailDefaults: HslThumbnailProps = {
  baseImageSrc: 'identity/logo.png',
  headlineLines: ['O OUTRO', 'LADO'],
  textSide: 'LEFT',
  role: 'MECHANISM'
};

export const RemotionRoot: React.FC = () => <>
  <Composition
    id="Episode01Pix"
    component={Episode01Pix}
    durationInFrames={EPISODE_01_TIMELINE_TOTAL_FRAMES}
    fps={HSL_FPS}
    width={HSL_VIDEO_RESOLUTION.WIDTH}
    height={HSL_VIDEO_RESOLUTION.HEIGHT}
  />
  <Composition
    id="Episode02Cabos"
    component={Episode02Cabos}
    durationInFrames={EPISODE_02_TOTAL_FRAMES}
    fps={HSL_FPS}
    width={HSL_VIDEO_RESOLUTION.WIDTH}
    height={HSL_VIDEO_RESOLUTION.HEIGHT}
  />
  <Composition
    id="Episode04GpsTempo"
    component={Episode04GpsTempo}
    durationInFrames={EPISODE_04_TOTAL_FRAMES}
    fps={HSL_FPS}
    width={HSL_VIDEO_RESOLUTION.WIDTH}
    height={HSL_VIDEO_RESOLUTION.HEIGHT}
  />
  <Composition
    id="Episode05RadarAsfalto"
    component={Episode05RadarAsfalto}
    durationInFrames={EPISODE05RADARASFALTO_TOTAL_FRAMES}
    fps={HSL_FPS}
    width={HSL_VIDEO_RESOLUTION.WIDTH}
    height={HSL_VIDEO_RESOLUTION.HEIGHT}
  />
  <Composition
    id="EpisodeTest1Min"
    component={EpisodeTest1Min}
    durationInFrames={EPISODE_TEST_1MIN_TOTAL_FRAMES}
    fps={HSL_FPS}
    width={HSL_VIDEO_RESOLUTION.WIDTH}
    height={HSL_VIDEO_RESOLUTION.HEIGHT}
  />
  <Composition
    id="EpisodeGasolina"
    component={EpisodeGasolina}
    durationInFrames={EPISODE_GASOLINA_TOTAL_FRAMES}
    fps={HSL_FPS}
    width={HSL_VIDEO_RESOLUTION.WIDTH}
    height={HSL_VIDEO_RESOLUTION.HEIGHT}
  />
  <Composition
    id="EpisodeGps"
    component={EpisodeGps}
    durationInFrames={EPISODE_GPS_TOTAL_FRAMES}
    fps={HSL_FPS}
    width={HSL_VIDEO_RESOLUTION.WIDTH}
    height={HSL_VIDEO_RESOLUTION.HEIGHT}
  />
  <Composition
    id="HslEpisode"
    component={HslEpisode}
    durationInFrames={defaults.totalDurationInFrames}
    fps={defaults.fps}
    width={defaults.width}
    height={defaults.height}
    defaultProps={defaults}
    calculateMetadata={({props}) => ({
      durationInFrames: props.totalDurationInFrames,
      fps: props.fps,
      width: props.width,
      height: props.height,
      props
    })}
  />
  <Composition
    id="HslThumbnail"
    component={HslThumbnail}
    durationInFrames={1}
    fps={30}
    width={3840}
    height={2160}
    defaultProps={thumbnailDefaults}
  />
  </>;
