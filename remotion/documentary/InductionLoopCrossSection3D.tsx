import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';

export interface InductionLoopCrossSection3DProps {
  accentColor?: string;
  telemetryColor?: string;
  activeSensor?: number; // 1, 2 or 3
  headerTag?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  subterraneanLayers?: string[];
  diagnosticTitle?: string;
  diagnosticItems?: Array<{ label: string; value: string; color?: string }>;
  durationInFrames?: number;
}

export const InductionLoopCrossSection3D: React.FC<InductionLoopCrossSection3DProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  headerTag = '',
  headerTitle = '',
  headerSubtitle = '',
  subterraneanLayers = [],
  diagnosticTitle = '',
  diagnosticItems = [],
  durationInFrames = 180
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {damping: 15, mass: 0.8, stiffness: 80}
  });

  const cameraTilt = interpolate(frame, [0, durationInFrames], [22, 28], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  const cameraZoom = interpolate(frame, [0, durationInFrames], [0.95, 1.08]);
  const magneticPulse = Math.sin(frame * 0.15) * 0.5 + 0.5;
  const scanLineY = (frame * 4) % 400;

  // Sensor ativo baseado no tempo
  const sensorActive = Math.floor((frame / 40) % 3) + 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'rgba(6, 7, 9, 0.88)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', Menlo, Consolas, monospace",
        color: '#F4F4F0'
      }}
    >
      {/* 1. Grid Isométrica 3D de Engenharia */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255, 85, 0, 0.12) 0%, transparent 65%),
            linear-gradient(rgba(0, 240, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 50px 50px, 50px 50px',
          opacity: entrance
        }}
      />

      {/* 2. Cabeçalho Técnico / Telemetria */}
      <div style={{position: 'absolute', top: 70, left: 90, zIndex: 30}}>
        {headerTag ? (
          <div
            style={{
              fontSize: 14,
              color: telemetryColor,
              letterSpacing: 4,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 6
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: accentColor,
                boxShadow: `0 0 12px ${accentColor}`
              }}
            />
            {headerTag}
          </div>
        ) : null}
        {headerTitle ? (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}
          >
            {headerTitle}
          </div>
        ) : null}
        {headerSubtitle ? (
          <div style={{fontSize: 14, color: '#8A8D9F', letterSpacing: 1.5, marginTop: 4}}>
            {headerSubtitle}
          </div>
        ) : null}
      </div>

      {/* 3. Bloco 3D Isométrico do Asfalto em Corte Transversal */}
      <div
        style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: `translate(-50%, -50%) perspective(1200px) rotateX(${cameraTilt}deg) rotateZ(-18deg) scale(${entrance * cameraZoom})`,
          width: 900,
          height: 480,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Bloco Superior do Asfalto (Camada de Rolamento) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#0D0E15',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.9), inset 0 0 40px rgba(0,0,0,0.8)'
          }}
        >
          {/* Faixa da Rodovia */}
          <div
            style={{
              position: 'absolute',
              top: '48%',
              left: 0,
              right: 0,
              height: 4,
              borderTop: '2px dashed rgba(244, 244, 240, 0.25)'
            }}
          />

          {/* 3 Ranhuras de Diamante com Laços Indutivos */}
          {[
            {id: 1, x: 180, label: 'LAÇO INDUTIVO 01 (GATILHO T0)'},
            {id: 2, x: 450, label: 'SENSOR PIEZOELÉTRICO (MASSA)'},
            {id: 3, x: 720, label: 'LAÇO INDUTIVO 02 (CÁLCULO T1)'}
          ].map((sensor) => {
            const isActive = sensorActive === sensor.id;
            return (
              <div
                key={sensor.id}
                style={{
                  position: 'absolute',
                  top: 40,
                  bottom: 40,
                  left: sensor.x,
                  width: 32,
                  backgroundColor: isActive ? 'rgba(255, 85, 0, 0.35)' : 'rgba(0, 240, 255, 0.08)',
                  border: `2px solid ${isActive ? accentColor : telemetryColor}`,
                  boxShadow: isActive
                    ? `0 0 30px ${accentColor}, inset 0 0 15px ${accentColor}`
                    : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 8,
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Espiras de Cobre no Interior do Corte */}
                <div
                  style={{
                    width: 4,
                    height: '100%',
                    backgroundColor: isActive ? '#FFE500' : accentColor,
                    boxShadow: isActive ? '0 0 12px #FFE500' : 'none'
                  }}
                />

                {/* Campo Magnético Pulsante 3D */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 140 + magneticPulse * 40,
                      height: 380 + magneticPulse * 40,
                      borderRadius: '50%',
                      border: `2px dashed ${accentColor}`,
                      opacity: 0.6 + magneticPulse * 0.4,
                      pointerEvents: 'none',
                      boxShadow: `0 0 25px ${accentColor}40`
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Scanner a Laser sobre o Asfalto */}
          <div
            style={{
              position: 'absolute',
              top: scanLineY,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: telemetryColor,
              boxShadow: `0 0 16px ${telemetryColor}`
            }}
          />
        </div>

        {/* Camada Subterrânea em Corte Transversal (X-Ray Raio-X) */}
        <div
          style={{
            position: 'absolute',
            top: 480,
            left: 0,
            right: 0,
            height: 120,
            backgroundColor: '#060709',
            border: '2px solid rgba(255, 85, 0, 0.3)',
            borderTop: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 40px',
            transform: 'rotateX(-90deg)',
            transformOrigin: 'top center'
          }}
        >
        {subterraneanLayers && subterraneanLayers.length > 0 ? (
          subterraneanLayers.map((layer, idx) => (
            <div key={idx} style={{fontSize: 12, color: idx === 0 ? accentColor : idx === 1 ? telemetryColor : '#8A8D9F'}}>
              {layer}
            </div>
          ))
        ) : null}
        </div>
      </div>

      {/* 4. Painel de Dados Laterais HUD em Vidro Fosco */}
      {(diagnosticTitle || (diagnosticItems && diagnosticItems.length > 0)) ? (
        <div
          style={{
            position: 'absolute',
            bottom: 70,
            right: 90,
            width: 420,
            backgroundColor: 'rgba(13, 14, 21, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 8,
            padding: 24,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}
        >
          {diagnosticTitle ? (
            <div style={{fontSize: 12, color: telemetryColor, letterSpacing: 2, marginBottom: 10}}>
              {diagnosticTitle}
            </div>
          ) : null}
          {diagnosticItems.map((item, idx) => (
            <div key={idx} style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <span style={{color: '#8A8D9F'}}>{item.label}:</span>
              <span style={{color: item.color || '#F4F4F0', fontWeight: 700}}>{item.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
