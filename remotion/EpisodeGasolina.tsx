import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  AnamorphicCinematicOverlay,
  AtomicStopwatch,
  CinematicKeyframeDossier,
  DynamicDocumentaryMedia,
  DynamicSpotlightFocus,
  FlowDiscrepancyHUD,
  FlowMeterPulserSchematicHUD,
  IndustrialXRayHUD,
  KineticEditorialCallout,
  KineticNumberCounter,
  TechnicalCutawaySchematic,
  Iso20022PacketInspector,
  OnScreenResearchLapse,
  LaserRevealWipe,
  InfraredPlateScanner3D,
  LaserScanDossier
} from './documentary';
import {
  EPISODE_GASOLINA_TIMELINE,
  EPISODE_GASOLINA_TOTAL_FRAMES,
  DOSSIER_SCENE_IDS
} from './episodeGasolinaTimelineData';

export interface EpisodeGasolinaProps {
  runId?: string;
  accentColor?: string;
  telemetryColor?: string;
}

export const EpisodeGasolina: React.FC<EpisodeGasolinaProps> = ({
  runId = 'latest',
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', color: '#FFFFFF' }}>
      {/* 1. Trilha Musical Oficial do Episódio */}
      <Audio
        src={staticFile(`episodes/gasolina-adulterada/audio/music/bed.mp3`)}
        volume={0.22}
      />

      {/* 2. Cronômetro Atômico de Telemetria no Topo (Anti-Collision: Topo Central) */}
      <AtomicStopwatch totalFrames={EPISODE_GASOLINA_TOTAL_FRAMES} />

      {/* 3. Sequência Canônica das 30 Cenas Contratadas */}
      {EPISODE_GASOLINA_TIMELINE.map((scene) => {
        const isDossier = scene.take_type === 'KEYFRAME_DOSSIER' && DOSSIER_SCENE_IDS.includes(scene.sceneId as any);

        return (
          <Sequence
            key={scene.sceneId}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
            name={`${scene.sceneId}_${scene.name}`}
          >
            <AbsoluteFill style={{ backgroundColor: '#060709' }}>
              {/* Áudio da Locução de Narração por Cena */}
              <Audio
                src={staticFile(scene.audioFile)}
                volume={1.0}
              />

              {/* Stem de SFX Específico da Cena */}
              <Audio
                src={staticFile(scene.sfxFile)}
                volume={0.45}
              />

              {/* RENDERIZAÇÃO CONDICIONAL: DOSSIÊ TÉCNICO vs CINEMATOGRÁFICO */}
              {isDossier ? (
                // ── 9 CENAS DE DOSSIÊ (REMOTION ONLY) ──
                <>
                  {scene.sceneId === 'GAS_004' && (
                    <FlowMeterPulserSchematicHUD
                      accentColor={accentColor}
                      telemetryColor={telemetryColor}
                      durationInFrames={scene.durationFrames}
                    />
                  )}
                  {scene.sceneId === 'GAS_005' && (
                    <TechnicalCutawaySchematic
                      accentColor={accentColor}
                      telemetryColor={telemetryColor}
                    />
                  )}
                  {scene.sceneId === 'GAS_008' && (
                    <FlowMeterPulserSchematicHUD
                      accentColor={accentColor}
                      telemetryColor={telemetryColor}
                      durationInFrames={scene.durationFrames}
                    />
                  )}
                  {scene.sceneId === 'GAS_013' && (
                    <Iso20022PacketInspector
                      accentColor={accentColor}
                      telemetryColor={telemetryColor}
                    />
                  )}
                  {scene.sceneId === 'GAS_015' && (
                    <FlowDiscrepancyHUD
                      accentColor={accentColor}
                      telemetryColor={telemetryColor}
                      durationInFrames={scene.durationFrames}
                    />
                  )}
                  {scene.sceneId === 'GAS_016' && (
                    <OnScreenResearchLapse
                      accentColor={accentColor}
                      telemetryColor={telemetryColor}
                    />
                  )}
                  {scene.sceneId === 'GAS_021' && (
                    <LaserRevealWipe
                      accentColor={accentColor}
                      telemetryColor={telemetryColor}
                    />
                  )}
                  {scene.sceneId === 'GAS_026' && (
                    <InfraredPlateScanner3D
                      accentColor={accentColor}
                      telemetryColor={telemetryColor}
                    />
                  )}
                  {scene.sceneId === 'GAS_027' && (
                    <LaserScanDossier
                      accentColor={accentColor}
                      telemetryColor={telemetryColor}
                    />
                  )}

                  {/* HUD Industrial de Telemetria X-Ray Exclusivo para Dossiê */}
                  <IndustrialXRayHUD
                    sceneNumber={scene.sceneId}
                    title={scene.name.toUpperCase()}
                    subtitle={scene.chapterTitle}
                    accentColor={accentColor}
                    telemetryColor={telemetryColor}
                    latencyMs={scene.sceneId === 'GAS_008' ? 40 : 120}
                    transactionsPerSec={scene.sceneId === 'GAS_004' ? '200 p/L' : '1.000 L/s'}
                    systemStressPercent={scene.sceneId === 'GAS_015' ? 98 : 42}
                    sourceText="FONTE: INMETRO // PORTARIA 559 METROLOGIA LEGAL"
                    dateText="TELEMETRIA: BOMBA DE COMBUSTÍVEL DIGITAL"
                  />
                </>
              ) : (
                // ── 21 CENAS CINEMATOGRÁFICAS 35MM (FIREFLY REAL ONLY) ──
                <>
                  <DynamicDocumentaryMedia
                    sceneId={scene.sceneId}
                    mediaPath={scene.videoFile}
                    kenBurns={scene.motionMode || 'slow_push_in'}
                    zoomIntensity={1.15}
                    durationInFrames={scene.durationFrames}
                    isDossierTake={false}
                    dossierTag={`EVIDÊNCIA FORENSE // ${scene.sceneId}`}
                  />
                </>
              )}

              {/* Spotlight Chiaroscuro Denis Villeneuve */}
              <DynamicSpotlightFocus
                durationInFrames={scene.durationFrames}
                intensity={0.28}
              />

              {/* Tipografia Editorial Cinética */}
              {scene.calloutMain && (
                <KineticEditorialCallout
                  mainText={scene.calloutMain}
                  subText={scene.calloutSub}
                  categoryText={scene.calloutCategory}
                  startFrame={15}
                  durationFrames={Math.max(60, scene.durationFrames - 20)}
                  position={scene.sceneId === 'GAS_030' ? 'center' : 'bottom_left'}
                  accentColor={accentColor}
                  telemetryColor={telemetryColor}
                />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* 4. Overlay Cinematográfico 35mm Master (Letterbox 2.39:1 + Grão + Retículas) */}
      <AnamorphicCinematicOverlay />
    </AbsoluteFill>
  );
};
