import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

interface AtlanticBathymetryMapProps {
  readonly title?: string;
  readonly activeRoute?: string;
}

const CABLE_ROUTES = [
  {name: 'ELLALINK', from: 'Fortaleza (BR)', to: 'Sines (PT)', distance: '6.000 km', capacity: '100 Tbps', path: 'M 350 480 Q 550 320 820 180', color: '#00F0FF'},
  {name: 'MONET', from: 'Praia Grande (BR)', to: 'Boca Raton (EUA)', distance: '10.556 km', capacity: '64 Tbps', path: 'M 310 540 Q 220 340 260 140', color: '#FF5500'},
  {name: 'SEABRAS-1', from: 'Praia Grande (BR)', to: 'Nova York (EUA)', distance: '10.800 km', capacity: '72 Tbps', path: 'M 310 540 Q 180 300 290 100', color: '#00FF85'},
  {name: 'SAEx1', from: 'Fortaleza (BR)', to: 'Cidade do Cabo (ZA)', distance: '6.800 km', capacity: '40 Tbps', path: 'M 350 480 Q 600 620 880 720', color: '#FFE500'}
];

export const AtlanticBathymetryMap: React.FC<AtlanticBathymetryMapProps> = ({
  title = ''
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({frame, fps, config: {damping: 20, mass: 1, stiffness: 80}});
  const pulseDash = (frame * 3) % 40;

  return (
    <AbsoluteFill style={{backgroundColor: '#060709', color: '#F4F4F5', overflow: 'hidden'}}>
      {/* 1. Grade Batimétrica e Topografia Submarina */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: entrance
        }}
        viewBox="0 0 1920 1080"
      >
        <defs>
          <radialGradient id="oceanGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(0, 240, 255, 0.08)" />
            <stop offset="60%" stopColor="rgba(6, 7, 9, 0.8)" />
            <stop offset="100%" stopColor="#060709" />
          </radialGradient>
        </defs>

        {/* Fundo Oceânico */}
        <rect width="1920" height="1080" fill="url(#oceanGlow)" />

        {/* Curvas de Nível Batimétricas (4.000m) */}
        {[800, 650, 500, 350, 200].map((r, i) => (
          <ellipse
            key={i}
            cx="960"
            cy="540"
            rx={r * 1.5}
            ry={r}
            fill="none"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
        ))}

        {/* Silhueta Abstrata dos Continentes (América do Sul e África/Europa) */}
        <path
          d="M 150 200 Q 280 350 350 480 T 310 540 T 260 750 T 180 900"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />
        <path
          d="M 800 120 Q 860 220 820 180 T 820 400 T 880 720"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />

        {/* Rotas dos Cabos Submarinos com Feixe de Laser Pulsante */}
        {CABLE_ROUTES.map((cable, idx) => (
          <g key={cable.name}>
            <path
              d={cable.path}
              fill="none"
              stroke={cable.color}
              strokeWidth="3"
              strokeDasharray="12 8"
              strokeDashoffset={-pulseDash * (idx + 1)}
              style={{filter: `drop-shadow(0 0 12px ${cable.color})`}}
            />
          </g>
        ))}

        {/* Pontos de Aterrissagem (Landing Stations) */}
        {/* Fortaleza */}
        <circle cx="350" cy="480" r="10" fill="#FF5500" style={{filter: 'drop-shadow(0 0 15px #FF5500)'}} />
        <text x="375" y="485" fill="#FF5500" fontFamily="JetBrains Mono" fontSize="16" fontWeight="bold">
          FORTALEZA (16 CABOS)
        </text>

        {/* Praia Grande */}
        <circle cx="310" cy="540" r="10" fill="#00F0FF" style={{filter: 'drop-shadow(0 0 15px #00F0FF)'}} />
        <text x="130" y="545" fill="#00F0FF" fontFamily="JetBrains Mono" fontSize="16" fontWeight="bold">
          PRAIA GRANDE
        </text>

        {/* Miami */}
        <circle cx="260" cy="140" r="8" fill="#F4F4F5" />
        <text x="280" y="145" fill="#A1A1AA" fontFamily="JetBrains Mono" fontSize="14">
          BOCA RATON / MIAMI
        </text>

        {/* Lisboa */}
        <circle cx="820" cy="180" r="8" fill="#F4F4F5" />
        <text x="840" y="185" fill="#A1A1AA" fontFamily="JetBrains Mono" fontSize="14">
          SINES / LISBOA
        </text>
      </svg>

      {/* 2. Cabeçalho Editorial */}
      <div style={{position: 'absolute', top: 60, left: 80}}>
        <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: '#00F0FF', letterSpacing: 4, fontWeight: 800, marginBottom: 8}}>
          TELEMETRIA GLOBAL // INFRAESTRUTURA SUBMERSA
        </div>
        <div style={{fontFamily: "'Inter', sans-serif", fontSize: 42, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em'}}>
          {title}
        </div>
      </div>

      {/* 3. Painel de Rotas Ativas (Canto Inferior Direito) */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          right: 80,
          width: 480,
          backgroundColor: 'rgba(6, 7, 9, 0.85)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          backdropFilter: 'blur(12px)',
          borderRadius: 8,
          padding: 24
        }}
      >
        <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#00F0FF', letterSpacing: 2, marginBottom: 12}}>
          PRINCIPAIS DORSAL SUBMARINAS DO BRASIL
        </div>
        {CABLE_ROUTES.map((c) => (
          <div key={c.name} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13}}>
            <span style={{color: c.color, fontWeight: 800}}>• {c.name}</span>
            <span style={{color: '#A1A1AA'}}>{c.from} ➔ {c.to}</span>
            <span style={{color: '#F4F4F5'}}>{c.capacity}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
