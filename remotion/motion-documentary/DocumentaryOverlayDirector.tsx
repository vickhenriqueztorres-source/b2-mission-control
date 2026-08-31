import React from 'react';
import {AbsoluteFill, Freeze, Sequence, useCurrentFrame} from 'remotion';
import {DocumentaryMotionRecipe} from '../../contracts/documentaryMotionContract';
import {
  AreaOutlineMotion,
  ComparisonMotion,
  DataBarsMotion,
  DocumentHighlightMotion,
  EvidenceFreezeMotion,
  FieldMarkerMotion,
  LocationStampMotion,
  MeasurementBracketMotion,
  ProcessChainMotion,
  RiskMarkerMotion,
  RouteTraceMotion,
  SourceCaptionMotion,
  TimelineMarksMotion,
  VerifiedCounterMotion,
} from './motions';

export interface DocumentaryOverlayDirectorProps {
  recipes?: readonly DocumentaryMotionRecipe[];
  fps: number;
}

function renderRecipe(recipe: DocumentaryMotionRecipe, durationInFrames: number): React.ReactNode {
  switch (recipe.type) {
    case 'field_marker': return <FieldMarkerMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'evidence_freeze': return <EvidenceFreezeMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'measurement_bracket': return <MeasurementBracketMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'verified_counter': return <VerifiedCounterMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'source_caption': return <SourceCaptionMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'process_chain': return <ProcessChainMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'route_trace': return <RouteTraceMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'comparison': return <ComparisonMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'document_highlight': return <DocumentHighlightMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'data_bars': return <DataBarsMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'timeline_marks': return <TimelineMarksMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'location_stamp': return <LocationStampMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'area_outline': return <AreaOutlineMotion recipe={recipe} durationInFrames={durationInFrames} />;
    case 'risk_marker': return <RiskMarkerMotion recipe={recipe} durationInFrames={durationInFrames} />;
    default: return null;
  }
}

export const DocumentaryOverlayDirector: React.FC<DocumentaryOverlayDirectorProps> = ({recipes = [], fps}) => (
  <AbsoluteFill style={{pointerEvents: 'none', zIndex: 80}}>
    {recipes.map((recipe) => {
      const from = Math.round(recipe.startSeconds * fps);
      const durationInFrames = Math.max(1, Math.round(recipe.durationSeconds * fps));
      return (
        <Sequence key={recipe.id} from={from} durationInFrames={durationInFrames} name={`motion_${recipe.type}_${recipe.id}`}>
          {renderRecipe(recipe, durationInFrames)}
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

export function remapFrameForEvidenceFreeze(
  frame: number,
  recipes: readonly DocumentaryMotionRecipe[],
  fps: number
): number {
  const freezes = recipes
    .filter((recipe): recipe is Extract<DocumentaryMotionRecipe, {type: 'evidence_freeze'}> => recipe.type === 'evidence_freeze')
    .slice()
    .sort((a, b) => a.startSeconds - b.startSeconds);
  let completedFreezeFrames = 0;
  for (const freeze of freezes) {
    const start = Math.round(freeze.startSeconds * fps);
    const duration = Math.max(1, Math.round(freeze.durationSeconds * fps));
    if (frame < start) break;
    if (frame < start + duration) return Math.max(0, start - completedFreezeFrames);
    completedFreezeFrames += duration;
  }
  return Math.max(0, frame - completedFreezeFrames);
}

export const DocumentaryMotionStage: React.FC<DocumentaryOverlayDirectorProps & {children: React.ReactNode}> = ({
  recipes = [],
  fps,
  children,
}) => {
  const frame = useCurrentFrame();
  const mediaFrame = remapFrameForEvidenceFreeze(frame, recipes, fps);
  return <Freeze frame={mediaFrame}>{children}</Freeze>;
};
