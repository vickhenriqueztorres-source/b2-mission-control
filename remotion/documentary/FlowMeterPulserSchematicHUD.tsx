import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export interface FlowMeterPulserSchematicHUDProps {
  accentColor?: string;
  telemetryColor?: string;
  durationInFrames: number;
}

export const FlowMeterPulserSchematicHUD: React.FC<FlowMeterPulserSchematicHUDProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  durationInFrames
}) => {
  const frame = useCurrentFrame();

  // Rotação contínua do disco medidor de pulsos
  const rotation = interpolate(frame, [0, durationInFrames], [0, 720]);
  const pulseOpacity = Math.sin(frame * 0.4) > 0 ? 1 : 0.2;
  const pulseCount = Math.floor(interpolate(frame, [0, durationInFrames], [0, 800]));

  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', overflow: 'hidden' }}>
      {/* Grid de Fundo Técnico */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.6
        }}
      />

      {/* Esquema Central do Medidor de Deslocamento Positivo */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Carcaça Cilíndrica do Medidor */}
        <div
          style={{
            position: 'absolute',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            border: `2px solid ${telemetryColor}`,
            boxShadow: `0 0 30px ${telemetryColor}33`,
            opacity: 0.85
          }}
        />

        {/* Anel de Dentes Magnéticos em Rotação */}
        <div
          style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            border: `3px dashed rgba(255, 255, 255, 0.4)`,
            transform: `rotate(${rotation}deg)`
          }}
        />

        {/* 4 Pistões Opostos a 90 Graus */}
        {[0, 90, 180, 270].map((angle, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '40px',
              height: '110px',
              backgroundColor: '#0D0E15',
              border: `2px solid ${accentColor}`,
              transform: `rotate(${angle + rotation}deg) translateY(-140px)`,
              boxShadow: `0 0 15px ${accentColor}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F4F4F0',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            P-{i + 1}
          </div>
        ))}

        {/* Sensor Magnético Hall Fixo */}
        <div
          style={{
            position: 'absolute',
            top: '30px',
            width: '28px',
            height: '28px',
            backgroundColor: accentColor,
            borderRadius: '4px',
            boxShadow: `0 0 25px ${accentColor}`,
            opacity: pulseOpacity
          }}
        />

        {/* Núcleo Central de Telemetria */}
        <div
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            backgroundColor: 'rgba(13, 14, 21, 0.95)',
            border: `1px solid rgba(255, 255, 255, 0.15)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              color: telemetryColor,
              letterSpacing: '2px'
            }}
          >
            PULSOS TOTAIS
          </span>
          <span
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '44px',
              color: '#F4F4F0',
              lineHeight: '1'
            }}
          >
            {pulseCount}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              color: accentColor,
              letterSpacing: '1px'
            }}
          >
            200 PULSOS = 1,000 L
          </span>
        </div>
      </div>

      {/* Card Lateral de Especificação Técnica INMETRO (Anti-Collision: Lado Direito Inferior) */}
      <div
        style={{
          position: 'absolute',
          bottom: '100px',
          right: '80px',
          width: '380px',
          padding: '20px',
          backgroundColor: 'rgba(6, 7, 9, 0.85)',
          borderLeft: `3px solid ${accentColor}`,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.9)'
        }}
      >
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: telemetryColor,
            letterSpacing: '2px',
            marginBottom: '6px'
          }}
        >
          METROLOGIA // PORTARIA INMETRO 559
        </div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: '#F4F4F0',
            fontWeight: 600,
            lineHeight: '1.4'
          }}
        >
          Bloco Medidor de 4 Pistões com Acoplamento Magnético Hall
        </div>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: '#8A8D9F',
            marginTop: '8px'
          }}
        >
          ERRO MÁXIMO PERMITIDO: ± 0,5%
        </div>
      </div>
    </AbsoluteFill>
  );
};
