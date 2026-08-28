import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import {
  DynamicDocumentaryMedia,
  DynamicSpotlightFocus,
  KineticEditorialCallout,
  KineticNumberCounter,
  AtomicStopwatch,
  AnamorphicCinematicOverlay,
  InductionLoopCrossSection3D,
  VelocityPhysicsCalculationHUD,
  InfraredPlateScanner3D,
  AsphaltThermalDeformation3D
} from './documentary';
import sceneTimingsJson from '../runs/OOL-EP05-RADAR-ASFALTO/postproduction/scene_timings.json';

export interface SceneTimingItem {
  sceneId: string;
  name: string;
  chapterId: string;
  chapterTitle: string;
  callout?: string;
  motionMode: 'slow_push_in' | 'crash_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift';
  startFrame: number;
  durationFrames: number;
  audioPath: string;
}

export const EPISODE05RADARASFALTO_TOTAL_FRAMES = sceneTimingsJson.totalDurationFrames; // 10447 frames (348.23s)
export const EPISODE05RADARASFALTO_TIMELINE: SceneTimingItem[] = sceneTimingsJson.scenes as SceneTimingItem[];

export interface Episode05RadarAsfaltoProps {
  accentColor?: string;
  telemetryColor?: string;
}

export const Episode05RadarAsfalto: React.FC<Episode05RadarAsfaltoProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', color: '#FFFFFF' }}>
      {/* 1. Cronômetro Atômico de Telemetria no Topo */}
      <AtomicStopwatch totalFrames={EPISODE05RADARASFALTO_TOTAL_FRAMES} />

      {/* 2. Sequência das 50 Cenas Cinematográficas 35mm + Módulos 3D Exclusivos */}
      {EPISODE05RADARASFALTO_TIMELINE.map((scene) => {
        return (
          <Sequence
            key={scene.sceneId}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
            name={`${scene.sceneId}_${scene.name}`}
          >
            <AbsoluteFill style={{ backgroundColor: '#060709' }}>
              {/* 3D MOTION GRAPHIC 1: Corte Isométrico do Asfalto e Laços Indutivos (Capítulo 2) */}
              {scene.sceneId === 'OOL_009' || scene.sceneId === 'OOL_010' ? (
                <InductionLoopCrossSection3D
                  accentColor={accentColor}
                  telemetryColor={telemetryColor}
                  durationInFrames={scene.durationFrames}
                />
              ) : /* 3D MOTION GRAPHIC 2: Física dos Microssegundos & Equação V = ΔS / ΔT (Capítulo 3) */
              scene.sceneId === 'OOL_016' || scene.sceneId === 'OOL_017' ? (
                <VelocityPhysicsCalculationHUD
                  accentColor={accentColor}
                  telemetryColor={telemetryColor}
                  measuredSpeed={118}
                  timeDeltaMicros={91525}
                  durationInFrames={scene.durationFrames}
                />
              ) : /* 3D MOTION GRAPHIC 3: Câmera Estroboscópica Infravermelha & Leitura OCR 850nm (Capítulo 4) */
              scene.sceneId === 'OOL_026' || scene.sceneId === 'OOL_027' ? (
                <InfraredPlateScanner3D
                  accentColor={accentColor}
                  telemetryColor={telemetryColor}
                  detectedPlate="BRA-2E19"
                  confidenceScore={99.4}
                  durationInFrames={scene.durationFrames}
                />
              ) : /* 3D MOTION GRAPHIC 4: Dilatação Térmica a 58°C & Auditoria do 3º Laço do INMETRO (Capítulo 5) */
              scene.sceneId === 'OOL_038' || scene.sceneId === 'OOL_039' ? (
                <AsphaltThermalDeformation3D
                  accentColor={accentColor}
                  telemetryColor={telemetryColor}
                  temperatureCelsius={58.4}
                  toleranceLimitSec={0.001}
                  durationInFrames={scene.durationFrames}
                />
              ) : (
                /* CENA CINEMATOGRÁFICA 35MM (Parallax 2.5D Denis Villeneuve) */
                <DynamicDocumentaryMedia
                  sceneId={scene.sceneId}
                  kenBurns={scene.motionMode}
                  zoomIntensity={1.20}
                  durationInFrames={scene.durationFrames}
                />
              )}

              {/* Spotlight Chiaroscuro Denis Villeneuve */}
              <DynamicSpotlightFocus
                durationInFrames={scene.durationFrames}
                intensity={0.28}
              />

              {/* Contador Numérico Especial para Delta de Tempo em Microssegundos */}
              {scene.sceneId === 'OOL_015' && (
                <KineticNumberCounter
                  endValue={60000}
                  suffix=" µs"
                  label="INTERVALO DE PASSAGEM ENTRE OS LAÇOS"
                  sublabel="DELTA DE TEMPO MEDIDO PELO PROCESSADOR"
                  accentColor={accentColor}
                />
              )}

              {/* Tipografia Editorial Cinética Elegante */}
              {scene.callout && (
                <KineticEditorialCallout
                  text={scene.callout}
                  durationInFrames={scene.durationFrames}
                  accentColor={accentColor}
                  telemetryColor={telemetryColor}
                />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* 3. Overlay Anamórfico Cinematográfico (Letterbox 2.39:1 + 35mm Grain) */}
      <AnamorphicCinematicOverlay />
    </AbsoluteFill>
  );
};
