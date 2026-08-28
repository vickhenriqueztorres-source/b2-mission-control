import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  AnamorphicCinematicOverlay,
  AtomicStopwatch,
  CinematicKeyframeDossier,
  DynamicDocumentaryMedia,
  DynamicSpotlightFocus,
  Episode02SoundTrack,
  InductionLoopCrossSection3D,
  IndustrialXRayHUD,
  KineticEditorialCallout,
  KineticNumberCounter,
  VelocityPhysicsCalculationHUD
} from './documentary';
import {
  EPISODE_TEST_1MIN_TIMELINE,
  EPISODE_TEST_1MIN_TOTAL_FRAMES
} from './episodeTest1MinTimelineData';

export interface EpisodeTest1MinProps {
  accentColor?: string;
  telemetryColor?: string;
}

export const EpisodeTest1Min: React.FC<EpisodeTest1MinProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', color: '#FFFFFF' }}>
      {/* 1. Trilha Sonora Master & Sound Design Industrial */}
      <Episode02SoundTrack />

      {/* 2. Áudio da Narração Master Sincronizado */}
      <Audio src={staticFile('postproduction_test1min/narration.mp3')} volume={1.0} />

      {/* 3. Cronômetro Atômico de Telemetria no Topo */}
      <AtomicStopwatch totalFrames={EPISODE_TEST_1MIN_TOTAL_FRAMES} />

      {/* 4. Sequência das 10 Cenas Cinematográficas 35mm */}
      {EPISODE_TEST_1MIN_TIMELINE.map((scene) => {
        const isDossier = scene.takeType === 'KEYFRAME_DOSSIER';

        return (
          <Sequence
            key={scene.sceneId}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
            name={`${scene.sceneId}_${scene.name}`}
          >
            <AbsoluteFill style={{ backgroundColor: '#060709' }}>
              {/* CENA 3D OU CENA CINEMATOGRÁFICA 35MM */}
              {scene.sceneId === 'OOL_004' ? (
                <InductionLoopCrossSection3D
                  accentColor={accentColor}
                  telemetryColor={telemetryColor}
                  durationInFrames={scene.durationFrames}
                />
              ) : scene.sceneId === 'OOL_007' ? (
                <VelocityPhysicsCalculationHUD
                  accentColor={accentColor}
                  telemetryColor={telemetryColor}
                  measuredSpeed={118}
                  timeDeltaMicros={91525}
                  durationInFrames={scene.durationFrames}
                />
              ) : (
                <DynamicDocumentaryMedia
                  sceneId={scene.sceneId}
                  kenBurns={scene.motionMode || 'slow_push_in'}
                  zoomIntensity={1.22}
                  durationInFrames={scene.durationFrames}
                  isDossierTake={isDossier}
                  dossierTag={`EVIDÊNCIA DE CAMPO // ${scene.sceneId}`}
                />
              )}

              {/* Spotlight Chiaroscuro Denis Villeneuve */}
              <DynamicSpotlightFocus
                durationInFrames={scene.durationFrames}
                intensity={0.32}
              />

              {/* HUD Industrial de Telemetria X-Ray */}
              <IndustrialXRayHUD
                sceneNumber={scene.sceneId}
                title={scene.name.toUpperCase()}
                subtitle={scene.chapterTitle}
                accentColor={accentColor}
                telemetryColor={telemetryColor}
                latencyMs={scene.sceneId === 'OOL_007' ? 42 : 115}
                transactionsPerSec={scene.sceneId === 'OOL_007' ? '60.000 µs' : '4.210 tx/s'}
                systemStressPercent={scene.sceneId === 'OOL_008' ? 94 : 45}
                sourceText="FONTE: DEPARTAMENTO DE ESTRADAS & METROLOGIA LEGAL"
                dateText="DATA: REGISTRO DE TELEMETRIA EM TEMPO REAL"
              />

              {/* Contador Numérico Especial para Cena de Frequência ou Latência */}
              {scene.sceneId === 'OOL_005' && (
                <KineticNumberCounter
                  endValue={50}
                  suffix=" kHz"
                  label="FREQUÊNCIA DE OSCILAÇÃO DO LAÇO"
                  sublabel="CAMPO ELETROMAGNÉTICO CONTÍNUO"
                  accentColor={accentColor}
                />
              )}

              {/* Tipografia Editorial Cinética */}
              {scene.calloutMain && (
                <KineticEditorialCallout
                  mainText={scene.calloutMain}
                  subText={scene.calloutSub}
                  categoryText={scene.calloutCategory}
                  startFrame={15}
                  durationFrames={Math.max(60, scene.durationFrames - 20)}
                  position={scene.sceneId === 'OOL_010' ? 'center' : 'bottom_left'}
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
