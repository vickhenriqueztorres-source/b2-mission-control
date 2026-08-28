import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export interface CyberMapTraceProps {
  cityName?: string;
  coordinates?: string;
  routeTitle?: string;
  pathD?: string;
  pathLength?: number;
  accentColor?: string;
  telemetryColor?: string;
}

/**
 * Módulo 2: O Mapa Cyber-Industrial 3D (Estilo Johnny Harris)
 * Renderiza um mapa vetorial em perspectiva 3D com a rota acendendo em Laranja Vapor de Sódio (#FF5500)
 * e coordenadas ciano pulsando (#00F0FF).
 */
export const CyberMapTrace: React.FC<CyberMapTraceProps> = ({
  cityName = 'BARUERI // SP',
  coordinates = '-23.5057, -46.8789',
  routeTitle = 'DUTO DE DADOS FIBRA SUBTERRÂNEA CIP',
  pathD = 'M 250,850 Q 700,450 1450,320',
  pathLength = 1200,
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  const frame = useCurrentFrame();

  // Animação de traçado contínuo da rota
  const strokeProgress = interpolate(frame, [0, 80], [pathLength, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp'
  });

  // Inclinação 3D contínua
  const cameraTilt = interpolate(frame, [0, 150], [24, 34]);
  const pulse = Math.sin(frame * 0.15) * 0.3 + 0.7;

  return (
    <AbsoluteFill
      style={{
        perspective: 1000,
        backgroundColor: '#060709',
        overflow: 'hidden'
      }}
    >
      {/* Grid de Fundo em Perspectiva */}
      <div
        style={{
          position: 'absolute',
          inset: -200,
          transform: `rotateX(${cameraTilt}deg) rotateZ(-12deg) scale(1.18)`,
          transformOrigin: 'center center'
        }}
      >
        <svg viewBox="0 0 1920 1080" style={{width: '100%', height: '100%'}}>
          <defs>
            <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />

          {/* Linha de Trajeto com Glow Laser Laranja */}
          <path
            d={pathD}
            fill="none"
            stroke={accentColor}
            strokeWidth="6"
            strokeDasharray={pathLength}
            strokeDashoffset={strokeProgress}
            style={{
              filter: `drop-shadow(0 0 14px ${accentColor})`
            }}
          />
        </svg>

        {/* Ponto Focal de Destino com Telemetria Pulsante */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '74%',
            color: telemetryColor,
            fontFamily: 'JetBrains Mono, Courier, monospace',
            fontSize: 14,
            fontWeight: 700,
            textShadow: `0 0 10px rgba(0, 240, 255, 0.7)`
          }}
        >
          <div
            style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: accentColor,
              boxShadow: `0 0 18px ${accentColor}`,
              transform: `scale(${pulse})`,
              marginRight: 10
            }}
          />
          <span>{cityName} // {coordinates}</span>
          <div style={{marginTop: 6, fontSize: 11, color: 'rgba(244,244,240,0.65)'}}>
            {routeTitle}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
