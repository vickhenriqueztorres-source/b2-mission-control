import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export interface Iso20022PacketInspectorProps {
  pulserCount?: string;
  measuredVolume?: string;
  realDeliveredVolume?: string;
  discrepancyPercent?: string;
  transducerStatus?: string;
  sealStatus?: string;
  accentColor?: string;
  telemetryColor?: string;
  amount?: string;
  latencyMs?: number;
}

export const Iso20022PacketInspector: React.FC<Iso20022PacketInspectorProps> = ({
  pulserCount = '4.000 PULSOS GERADOS (200 p/L)',
  measuredVolume = '20,000 LITROS (PAINEL DIGITAL)',
  realDeliveredVolume = '18,400 LITROS (MEDIDOR PADRÃO)',
  discrepancyPercent = '-1.600 mL (-8,0% // ILEGAL)',
  transducerStatus = 'PULSE DISCREPANCY DETECTED // CHIP PARASITA 433MHz',
  sealStatus = 'LACRE INMETRO VIOLADO // PORTARIA 559 METROLOGIA LEGAL',
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const scanlineY = interpolate(frame % 90, [0, 90], [0, 100]);
  const packetSlide = spring({
    frame,
    fps,
    config: {damping: 15, stiffness: 100}
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'JetBrains Mono, Menlo, Consolas, monospace',
        backgroundColor: 'rgba(6, 7, 9, 0.85)'
      }}
    >
      <div
        style={{
          width: '78%',
          maxWidth: 1200,
          background: 'rgba(13, 14, 21, 0.95)',
          border: '1px solid #34384F',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.9), 0 0 40px rgba(0, 240, 255, 0.1)',
          transform: `translateY(${(1 - packetSlide) * 40}px)`,
          position: 'relative'
        }}
      >
        {/* Scanline de Inspeção */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${scanlineY}%`,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #00F0FF, transparent)',
            boxShadow: '0 0 15px #00F0FF',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />

        {/* Header da Inspeção */}
        <div
          style={{
            padding: '16px 24px',
            background: '#12141F',
            borderBottom: '1px solid #23263B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <div style={{width: 10, height: 10, borderRadius: '50%', backgroundColor: accentColor}} />
            <span style={{color: '#F4F4F0', fontWeight: 700, fontSize: 15, letterSpacing: '0.1em'}}>
              AUDITORIA METROLÓGICA FORENSE // CABEÇOTE COMPUTACIONAL DA BOMBA
            </span>
          </div>
          <div style={{color: telemetryColor, fontSize: 13}}>
            STATUS: <strong style={{color: accentColor}}>ANOMALIA DE PULSOS</strong>
          </div>
        </div>

        {/* Corpo dos Dados Forenses de Vazão */}
        <div style={{padding: 28, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24}}>
          {/* Lado Esquerdo: Telemetria da Bomba */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14}}>
            <div style={{borderBottom: '1px solid #1E2133', paddingBottom: 8}}>
              <span style={{color: '#656A8A'}}>Pulsador Óptico:</span>{' '}
              <span style={{color: accentColor, fontWeight: 600}}>{pulserCount}</span>
            </div>
            <div style={{borderBottom: '1px solid #1E2133', paddingBottom: 8}}>
              <span style={{color: '#656A8A'}}>Volume Mostrador:</span>{' '}
              <span style={{color: telemetryColor, fontWeight: 800, fontSize: 18}}>{measuredVolume}</span>
            </div>
            <div style={{borderBottom: '1px solid #1E2133', paddingBottom: 8}}>
              <span style={{color: '#656A8A'}}>Volume Real Entregue:</span>{' '}
              <span style={{color: '#F4F4F0'}}>{realDeliveredVolume}</span>
            </div>
            <div style={{borderBottom: '1px solid #1E2133', paddingBottom: 8}}>
              <span style={{color: '#656A8A'}}>Desvio Volumétrico:</span>{' '}
              <span style={{color: accentColor, fontWeight: 700}}>{discrepancyPercent}</span>
            </div>
          </div>

          {/* Lado Direito: Diagnóstico da Placa */}
          <div
            style={{
              background: '#090A10',
              padding: 16,
              borderRadius: 4,
              border: '1px solid #23263B',
              fontSize: 12,
              lineHeight: 1.6,
              color: '#8A8D9F'
            }}
          >
            <div style={{color: telemetryColor, fontWeight: 700, marginBottom: 8}}>
              [DIAGNÓSTICO ELETRÔNICO // INMETRO]
            </div>
            <div>STATUS PULSADOR: {transducerStatus}</div>
            <div>STATUS DO LACRE: {sealStatus}</div>
            <div>TOLERÂNCIA LEGAL: <span style={{color: '#00F0FF'}}>MÁXIMO ±0,5% (±100 mL / 20L)</span></div>
            <div style={{marginTop: 12, color: accentColor, fontSize: 11, fontWeight: 700}}>
              FRAUDE NA BOMBA CONFIRMADA: 1.600 mL RETIDOS NO TANQUE
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
