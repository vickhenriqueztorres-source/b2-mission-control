import React from 'react';
import {Composition} from 'remotion';
import {HslEpisode} from './HslEpisode';
import {HslThumbnail, HslThumbnailProps} from './HslThumbnail';
import {HslEpisodeRenderProps} from './types';

const defaults: HslEpisodeRenderProps = {
  title: 'Hidden Systems Lab', fps: 30, width: 1920, height: 1080, totalDurationInFrames: 30,
  scenes: [{sceneId: 'HSL_DEFAULT', shotId: 'HSL_DEFAULT_V01', variant: 'ESTABLISH', chapterTitle: 'Hidden Systems Lab', narrativeFunction: 'title', visualMode: 'typography', visualSubject: 'Hidden Systems Lab', durationInFrames: 30, aiDisclosureRequired: false, transition: 'CUT'}]
};

const thumbnailDefaults: HslThumbnailProps = {
  baseImageSrc: 'identity/logo.png',
  headlineLines: ['HIDDEN', 'SYSTEM'],
  textSide: 'LEFT',
  role: 'MECHANISM'
};

export const RemotionRoot: React.FC = () => <>
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
