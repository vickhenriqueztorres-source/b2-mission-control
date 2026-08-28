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
  detectedPlate?: string;
  confidenceScore?: number;
  durationInFrames?: number;
}

/**
 * Scanner 3D Infravermelho & OCR Noturno de Placas (O Outro Lado / HSL)
 * Demonstra a captura da câmera estroboscópica a 850nm no escuro total,
 * o flash infravermelho de 1/10.000s, a camada retrorrefletiva da placa Mercosul
 * e o algoritmo OCR de visão computacional.
 */
export const InfraredPlateScanner3D: React.FC<InfraredPlateScanner3DProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  detectedPlate = 'BRA-2E19',
  confidenceScore = 99.4,
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
      {/* 1. Flash Estroboscópico Infravermelho de 1/10.000s */}
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

      {/* 2. Grid de Visão Noturna Infravermelha (850nm Monocromática) */}
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

      {/* 3. Cabeçalho Técnico / Câmera Estroboscópica */}
      <div style={{position: 'absolute', top: 70, left: 90, zIndex: 30}}>
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
          CÂMERA ESTROBOSCÓPICA INFRAVERMELHA // ESPECTRO 850 NM
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase'
          }}
        >
          RECONHECIMENTO AUTOMÁTICO DE PLACAS (ALPR / OCR)
        </div>
        <div style={{fontSize: 14, color: '#8A8D9F', letterSpacing: 1.5, marginTop: 4}}>
          OBTURADOR GLOBAL: 1/10.000S // VELOCIDADE MÁXIMA ALVO: 250 KM/H NA ESCURIDÃO
        </div>
      </div>

      {/* 4. Mockup 3D da Placa com Bounding Box e Extração de Caracteres */}
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
        {/* Faixa Superior Mercosul */}
        <div
          style={{
            height: 44,
            backgroundColor: '#002244',
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
          <span>BRASIL</span>
          <span style={{fontSize: 10, color: '#00F0FF'}}>MERCOSUL RETRORREFLETIVO</span>
        </div>

        {/* Caracteres da Placa em Alto Contraste Retrorrefletivo */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 68,
            fontWeight: 900,
            letterSpacing: 12,
            color: '#F4F4F0',
            textAlign: 'center',
            margin: '10px 0',
            textShadow: '0 0 20px rgba(255,255,255,0.6)'
          }}
        >
          {detectedPlate}
        </div>

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

        {/* Bounding Box Algorítmico de IA */}
        <div
          style={{
            position: 'absolute',
            inset: 10,
            border: `2px solid ${telemetryColor}`,
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
              color: telemetryColor,
              fontWeight: 700
            }}
          >
            CONFIDÊNCIA OCR: {confidenceScore}%
          </div>
        </div>
      </div>

      {/* 5. Painel Lateral de Metadados da Infração */}
      <div
        style={{
          position: 'absolute',
          top: '52%',
          right: '8%',
          transform: 'translate(0, -50%)',
          width: 380,
          backgroundColor: 'rgba(13, 14, 21, 0.85)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          borderRadius: 12,
          padding: 24,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{fontSize: 12, color: telemetryColor, letterSpacing: 2, marginBottom: 12}}>
          PACOTE DE EVIDÊNCIA DIGITAL
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
          <span style={{color: '#8A8D9F'}}>PLACA IDENTIFICADA:</span>
          <span style={{color: '#F4F4F0', fontWeight: 800}}>{detectedPlate}</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
          <span style={{color: '#8A8D9F'}}>EXPOSIÇÃO:</span>
          <span style={{color: accentColor, fontWeight: 700}}>0,000100 s (100 µs)</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
          <span style={{color: '#8A8D9F'}}>ILUMINAÇÃO:</span>
          <span style={{color: '#F4F4F0', fontWeight: 700}}>LED INFRAVERMELHO 850nm</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
          <span style={{color: '#8A8D9F'}}>ASSINATURA DIGITAL:</span>
          <span style={{color: telemetryColor, fontWeight: 700, fontSize: 11}}>SHA-256 / ICP-BRASIL</span>
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 12,
            backgroundColor: 'rgba(0, 255, 102, 0.1)',
            border: '1px solid #00FF66',
            borderRadius: 6,
            color: '#00FF66',
            fontSize: 12,
            fontWeight: 800,
            textAlign: 'center'
          }}
        >
          ✓ EVIDÊNCIA FÍSICA E ÓTICA HOMOLOGADA
        </div>
      </div>
    </AbsoluteFill>
  );
};
