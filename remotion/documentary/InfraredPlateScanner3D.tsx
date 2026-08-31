import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';

export interface InfraredPlateScanner3DProps {
  accentColor?: string;
  telemetryColor?: string;
  sealNumber?: string;
  detectedPlate?: string;
  confidenceScore?: number;
  headerTag?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  panelTitle?: string;
  evidenceItems?: Array<{ label: string; value: string; color?: string }>;
  alertBoxText?: string;
  durationInFrames?: number;
}

export const InfraredPlateScanner3D: React.FC<InfraredPlateScanner3DProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  sealNumber = '',
  detectedPlate = '',
  confidenceScore = 0,
  headerTag = '',
  headerTitle = '',
  headerSubtitle = '',
  bannerTitle = '',
  bannerSubtitle = '',
  panelTitle = '',
  evidenceItems = [],
  alertBoxText = '',
  durationInFrames = 180
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {damping: 15, mass: 0.8, stiffness: 90}
  });

  const flashPulse = interpolate(frame, [15, 20, 35], [0, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const ocrProgress = interpolate(frame, [25, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const scanGridY = (frame * 6) % 360;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'rgba(6, 7, 9, 0.92)',
        backdropFilter: 'blur(14px)',
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', Menlo, Consolas, monospace",
        color: '#F4F4F0'
      }}
    >
      {/* 1. Flash Estroboscópico de Inspeção */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#FFFFFF',
          opacity: flashPulse,
          pointerEvents: 'none',
          zIndex: 10
        }}
      />

      {/* 2. Grid Forense de Auditoria */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.08) 0%, transparent 70%),
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          opacity: entrance
        }}
      />

      {/* 3. Cabeçalho Técnico */}
      <div style={{position: 'absolute', top: 70, left: 90, zIndex: 30}}>
        {headerTag ? (
          <div
            style={{
              fontSize: 13,
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

      {/* 4. Card 3D do Lacre Oficial com Bounding Box */}
      <div
        style={{
          position: 'absolute',
          top: '52%',
          left: '40%',
          transform: `translate(-50%, -50%) perspective(1000px) rotateY(-8deg) scale(${entrance})`,
          width: 580,
          height: 240,
          backgroundColor: '#0D0E15',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 8,
          boxShadow: '0 25px 50px rgba(0,0,0,0.9), inset 0 0 40px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 20,
          overflow: 'hidden'
        }}
      >
        {/* Faixa Superior */}
        {(bannerTitle || bannerSubtitle) ? (
          <div
            style={{
              height: 44,
              backgroundColor: '#1E2235',
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 16px',
              fontSize: 14,
              fontWeight: 800,
              color: '#FFFFFF'
            }}
          >
            <span>{bannerTitle}</span>
            <span style={{fontSize: 10, color: accentColor}}>{bannerSubtitle}</span>
          </div>
        ) : null}

        {/* Identificação do Lacre / Alvo */}
        {sealNumber ? (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 48,
              fontWeight: 900,
              letterSpacing: 6,
              color: '#F4F4F0',
              textAlign: 'center',
              margin: '10px 0',
              textShadow: '0 0 20px rgba(255,255,255,0.6)'
            }}
          >
            {sealNumber}
          </div>
        ) : null}

        {/* Linha de Scanner Laser Y */}
        <div
          style={{
            position: 'absolute',
            top: scanGridY,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: accentColor,
            boxShadow: `0 0 16px ${accentColor}`
          }}
        />

        {/* Bounding Box Algorítmico de Violação */}
        {confidenceScore > 0 ? (
          <div
            style={{
              position: 'absolute',
              inset: 10,
              border: `2px solid ${accentColor}`,
              opacity: ocrProgress,
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -12,
                left: 10,
                backgroundColor: '#060709',
                padding: '0 8px',
                fontSize: 11,
                color: accentColor,
                fontWeight: 700
              }}
            >
              DETECTADO // CONFIDÊNCIA {confidenceScore}%
            </div>
          </div>
        ) : null}
      </div>

      {/* 5. Painel Lateral de Metadados da Infração */}
      {(panelTitle || (evidenceItems && evidenceItems.length > 0) || alertBoxText) ? (
        <div
          style={{
            position: 'absolute',
            top: '52%',
            right: '8%',
            transform: 'translate(0, -50%)',
            width: 380,
            backgroundColor: 'rgba(13, 14, 21, 0.85)',
            border: '1px solid rgba(255, 85, 0, 0.3)',
            borderRadius: 12,
            padding: 24,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}
        >
          {panelTitle ? (
            <div style={{fontSize: 12, color: accentColor, letterSpacing: 2, marginBottom: 12}}>
              {panelTitle}
            </div>
          ) : null}

          {evidenceItems.map((item, idx) => (
            <div key={idx} style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
              <span style={{color: '#8A8D9F'}}>{item.label}:</span>
              <span style={{color: item.color || '#F4F4F0', fontWeight: 800}}>{item.value}</span>
            </div>
          ))}

          {alertBoxText ? (
            <div
              style={{
                marginTop: 18,
                padding: 12,
                backgroundColor: 'rgba(255, 85, 0, 0.15)',
                border: '1px solid #FF5500',
                borderRadius: 6,
                color: '#FF5500',
                fontSize: 12,
                fontWeight: 800,
                textAlign: 'center'
              }}
            >
              {alertBoxText}
            </div>
          ) : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
