import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export interface FlowDiscrepancyHUDProps {
  accentColor?: string;
  telemetryColor?: string;
  durationInFrames: number;
}

export const FlowDiscrepancyHUD: React.FC<FlowDiscrepancyHUDProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  durationInFrames
}) => {
  const frame = useCurrentFrame();

  // Progressão do abastecimento simulado de 0 a 50 Litros
  const displayLiters = interpolate(frame, [0, durationInFrames], [0, 50.0], {
    extrapolateRight: 'clamp'
  });
  // Tanque real recebe apenas 92% (desvio de 8%)
  const realLiters = displayLiters * 0.92;
  const deviation = displayLiters > 0 ? ((displayLiters - realLiters) / displayLiters) * 100 : 0;
  const financialLoss = displayLiters > 0 ? (displayLiters - realLiters) * 6.15 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', overflow: 'hidden' }}>
      {/* Grid de Fundo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          opacity: 0.5
        }}
      />

      {/* Painel Central Comparativo (Anti-Collision: Centro Perfeito) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '900px',
          display: 'flex',
          gap: '30px',
          zIndex: 10
        }}
      >
        {/* Card 1: Display da Bomba (O que o consumidor vê e paga) */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'rgba(13, 14, 21, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderTop: `4px solid ${telemetryColor}`,
            padding: '30px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.8)'
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              color: telemetryColor,
              letterSpacing: '2px'
            }}
          >
            DISPLAY DIGITAL DA BOMBA
          </div>
          <div
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '68px',
              color: '#F4F4F0',
              lineHeight: '1.1',
              margin: '10px 0'
            }}
          >
            {displayLiters.toFixed(2)} <span style={{ fontSize: '28px' }}>L</span>
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              color: '#8A8D9F'
            }}
          >
            VALOR COBRADO: R$ {(displayLiters * 6.15).toFixed(2)}
          </div>
        </div>

        {/* Card 2: Volume Real Entregue no Tanque (A Fraude) */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'rgba(13, 14, 21, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderTop: `4px solid ${accentColor}`,
            padding: '30px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.8)'
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              color: accentColor,
              letterSpacing: '2px'
            }}
          >
            VOLUME REAL NO TANQUE (MEDIDO)
          </div>
          <div
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '68px',
              color: accentColor,
              lineHeight: '1.1',
              margin: '10px 0'
            }}
          >
            {realLiters.toFixed(2)} <span style={{ fontSize: '28px' }}>L</span>
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              color: '#F4F4F0'
            }}
          >
            DESVIO FRAUDULENTO: -{deviation.toFixed(1)}% (-{(displayLiters - realLiters).toFixed(2)} L)
          </div>
        </div>
      </div>

      {/* Banner Inferior com Prejuízo Financeiro Instantâneo */}
      <div
        style={{
          position: 'absolute',
          bottom: '90px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          padding: '16px 24px',
          backgroundColor: 'rgba(255, 85, 0, 0.12)',
          border: `1px solid ${accentColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(12px)'
        }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
            color: '#F4F4F0',
            fontWeight: 600
          }}
        >
          PREJUÍZO DIRETO POR TANQUE DE 50 LITROS:
        </span>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '16px',
            color: accentColor,
            fontWeight: 800
          }}
        >
          - R$ {financialLoss.toFixed(2)} / ABASTECIMENTO
        </span>
      </div>
    </AbsoluteFill>
  );
};
