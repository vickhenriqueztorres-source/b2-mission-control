import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  AnamorphicCinematicOverlay,
  AtomicStopwatch,
  CinematicKeyframeDossier,
  DynamicDocumentaryMedia,
  DynamicSpotlightFocus,
  Episode02SoundTrack,
  FlowDiscrepancyHUD,
  FlowMeterPulserSchematicHUD,
  IndustrialXRayHUD,
  KineticEditorialCallout,
  KineticNumberCounter
} from './documentary';
import {
  EPISODE_GASOLINA_TIMELINE,
  EPISODE_GASOLINA_TOTAL_FRAMES
} from './episodeGasolinaTimelineData';

export interface EpisodeGasolinaProps {
  accentColor?: string;
  telemetryColor?: string;
}

export const EpisodeGasolina: React.FC<EpisodeGasolinaProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', color: '#FFFFFF' }}>
      {/* 1. Trilha Sonora Master & Sound Design Industrial */}
      <Episode02SoundTrack />

      {/* 2. Áudio da Narração Master Sincronizado */}
      <Audio src={staticFile('postproduction_gasolina/narration.mp3')} volume={1.0} />

      {/* 3. Cronômetro Atômico de Telemetria no Topo (Anti-Collision: Topo Central) */}
      <AtomicStopwatch totalFrames={EPISODE_GASOLINA_TOTAL_FRAMES} />

      {/* 4. Sequência das 10 Cenas Cinematográficas 35mm */}
      {EPISODE_GASOLINA_TIMELINE.map((scene) => {
        const isDossier = scene.takeType === 'KEYFRAME_DOSSIER';

        return (
          <Sequence
            key={scene.sceneId}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
            name={`${scene.sceneId}_${scene.name}`}
          >
            <AbsoluteFill style={{ backgroundColor: '#060709' }}>
              {/* CENA 3D / HUD OU VÍDEO CINEMATOGRÁFICO 35MM */}
              {scene.sceneId === 'GAS_004' ? (
                <FlowMeterPulserSchematicHUD
                  accentColor={accentColor}
                  telemetryColor={telemetryColor}
                  durationInFrames={scene.durationFrames}
                />
              ) : scene.sceneId === 'GAS_007' ? (
                <FlowDiscrepancyHUD
                  accentColor={accentColor}
                  telemetryColor={telemetryColor}
                  durationInFrames={scene.durationFrames}
                />
              ) : (
                <DynamicDocumentaryMedia
                  sceneId={scene.sceneId}
                  kenBurns={scene.motionMode || 'slow_push_in'}
                  zoomIntensity={1.22}
                  durationInFrames={scene.durationFrames}
                  isDossierTake={isDossier}
                  dossierTag={`METROLOGIA FORENSE // ${scene.sceneId}`}
                />
              )}

              {/* Spotlight Chiaroscuro Denis Villeneuve */}
              <DynamicSpotlightFocus
                durationInFrames={scene.durationFrames}
                intensity={0.32}
              />

              {/* HUD Industrial de Telemetria X-Ray (Anti-Collision: Quadrante Superior) */}
              <IndustrialXRayHUD
                sceneNumber={scene.sceneId}
                title={scene.name.toUpperCase()}
                subtitle={scene.chapterTitle}
                accentColor={accentColor}
                telemetryColor={telemetryColor}
                latencyMs={scene.sceneId === 'GAS_008' ? 40 : 120}
                transactionsPerSec={scene.sceneId === 'GAS_004' ? '200 p/L' : '1.000 L/s'}
                systemStressPercent={scene.sceneId === 'GAS_007' ? 98 : 42}
                sourceText="FONTE: INMETRO // PORTARIA 559 METROLOGIA LEGAL"
                dateText="TELEMETRIA: BOMBA DE COMBUSTÍVEL DIGITAL"
              />

              {/* Contador Numérico Especial para Cena de Frequência de Pulsos */}
              {scene.sceneId === 'GAS_006' && (
                <div style={{ position: 'absolute', bottom: '90px', right: '60px', zIndex: 25 }}>
                  <KineticNumberCounter
                    endValue={200}
                    suffix=" p/L"
                    label="PADRÃO METROLÓGICO"
                    sublabel="PULSOS DO SENSOR HALL"
                    accentColor={accentColor}
                  />
                </div>
              )}

              {/* Tipografia Editorial Cinética (Anti-Collision: Quadrante Inferior Esquerdo com Delay) */}
              {scene.calloutMain && scene.sceneId !== 'GAS_007' && (
                <KineticEditorialCallout
                  mainText={scene.calloutMain}
                  subText={scene.calloutSub}
                  categoryText={scene.calloutCategory}
                  startFrame={20}
                  durationFrames={Math.max(60, scene.durationFrames - 25)}
                  position={scene.sceneId === 'GAS_010' ? 'center' : 'bottom_left'}
                  accentColor={accentColor}
                  telemetryColor={telemetryColor}
                />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* 5. Overlay Cinematográfico 35mm Master (Letterbox 2.39:1 + Grão + Retículas) */}
      <AnamorphicCinematicOverlay />
    </AbsoluteFill>
  );
};
