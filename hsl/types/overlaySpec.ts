export type VisualSceneType =
  | 'cinematic_real'
  | 'industrial_xray'
  | 'map_data'
  | 'document_evidence'
  | 'typography_chapter';

export interface LaserConfig {
  direction: 'vertical' | 'horizontal';
  position: number; // 0.0 to 1.0
  color: string;
  startFrame: number;
  sweepDurationFrames?: number;
  sweepSpeed?: number;
}

export interface TelemetryMetric {
  type: 'metric' | 'stress' | 'chart' | 'status' | 'code' | 'flow';
  label: string;
  value: string | number;
  unit?: string;
  idealThreshold?: string;
  accentColor?: string;
  sparklineData?: number[];
}

export interface VerificationFlowStage {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

export interface BrandingConfig {
  showLogo: boolean;
  showTagline: boolean;
  channelHandle?: string;
  taglineText?: string;
}

export interface RegulatorySourceConfig {
  sourceName: string;
  documentTitle: string;
  timestamp: string;
}

export interface HslOverlaySpecV1 {
  schema: 'hsl.overlay.spec.v1';
  sceneId: string;
  visualType: VisualSceneType;
  title: string;
  subtitle?: string;
  chapterTag?: string;
  laser?: LaserConfig;
  telemetry: TelemetryMetric[];
  verificationFlow?: VerificationFlowStage[];
  regulatorySource?: RegulatorySourceConfig;
  branding: BrandingConfig;
  targetResolution: {
    width: number;
    height: number;
    aspectRatio: '16:9' | '2.39:1';
  };
}
