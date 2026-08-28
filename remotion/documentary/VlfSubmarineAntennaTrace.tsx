import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export interface VlfSubmarineAntennaTraceProps {
  title?: string;
  altitudeLabel?: string;
  oceanDepthLabel?: string;
  antennaLengthLabel?: string;
  accentColor?: string;
  telemetryColor?: string;
}

/**
 * Componente Documental Estilo Neo (VLF Submarine Link & Trailing Wire)
 * Diagrama de corte atmosférico/oceânico com o avião em curva orbital de sustentação,
 * soltando o cabo de transmissão que penetra nas águas até o submarino.
 */
export const VlfSubmarineAntennaTrace: React.FC<VlfSubmarineAntennaTraceProps> = ({
  title = 'PROPAGAÇÃO DE ONDAS VLF // PENETRAÇÃO OCEÂNICA',
  altitudeLabel = 'ALTITUDE: 31.000 FT (CURVAS DE SUSTENTAÇÃO)',
  oceanDepthLabel = 'PROFUNDIDADE: -120M (SUBMARINO SSBN)',
  antennaLengthLabel = 'EXTENSÃO DO CABO: 5 MILHAS (8 KM)',
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  const frame = useCurrentFrame();

  // Curva de propagação das ondas de rádio
  const waveOffset = (frame * 3) % 60;
  const cableProgress = interpolate(frame, [0, 90], [1000, 0], {
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#060709',
        overflow: 'hidden',
        fontFamily: 'JetBrains Mono, Courier, monospace',
        color: '#F4F4F0'
      }}
    >
      {/* Camada Superior: Atmosfera / Céu Escuro */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '55%',
          backgroundColor: '#0A0B10',
          borderBottom: `2px dashed rgba(0, 240, 255, 0.4)`
        }}
      >
        <div style={{position: 'absolute', top: 40, left: 60}}>
          <div style={{fontSize: 12, color: telemetryColor, letterSpacing: 2}}>
            ENLACE ELETROMAGNÉTICO DE EMERGÊNCIA
          </div>
          <div style={{marginTop: 8, fontSize: 24, fontWeight: 900, color: '#F4F4F0'}}>
            {title}
          </div>
        </div>

        {/* Indicador de Altitude do Avião */}
        <div style={{position: 'absolute', top: 120, right: 80, fontSize: 13, color: '#A0A3BD'}}>
          ✈ {altitudeLabel}
        </div>
      </div>

      {/* Camada Inferior: Profundezas Oceânicas */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '45%',
          background: 'linear-gradient(180deg, #041220 0%, #02070D 100%)'
        }}
      >
        <div style={{position: 'absolute', bottom: 40, right: 80, fontSize: 13, color: telemetryColor}}>
          ⚓ {oceanDepthLabel}
        </div>
        <div style={{position: 'absolute', bottom: 40, left: 60, fontSize: 13, color: accentColor}}>
          ⚡ {antennaLengthLengthLabel(antennaLengthLabel)}
        </div>
      </div>

      {/* Traçado Vetorial do Avião, Cabo Trailing Wire e Ondas de Frequência */}
      <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        {/* Cabo de 5 Milhas (Curva Física Descendente) */}
        <path
          d="M 1400,240 Q 1100,500 700,750 T 400,900"
          fill="none"
          stroke={accentColor}
          strokeWidth="4"
          strokeDasharray="1000"
          strokeDashoffset={cableProgress}
          style={{filter: `drop-shadow(0 0 12px ${accentColor})`}}
        />

        {/* Ondas Eletromagnéticas VLF Pulsando no Oceano */}
        <circle
          cx="400"
          cy="900"
          r={60 + waveOffset}
          fill="none"
          stroke="rgba(0, 240, 255, 0.4)"
          strokeWidth="2"
          opacity={1 - waveOffset / 60}
        />
        <circle
          cx="400"
          cy="900"
          r={120 + waveOffset}
          fill="none"
          stroke="rgba(0, 240, 255, 0.25)"
          strokeWidth="1.5"
          opacity={1 - waveOffset / 60}
        />

        {/* Marcador do Submarino */}
        <rect x="350" y="890" width="100" height="20" rx="6" fill="#161824" stroke={telemetryColor} strokeWidth="2" />
        <circle cx="400" cy="900" r="4" fill={telemetryColor} />
      </svg>
    </AbsoluteFill>
  );
};

function antennaLengthLengthLabel(text: string): string {
  return text;
}
