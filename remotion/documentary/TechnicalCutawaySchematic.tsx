import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export interface TechnicalCutawaySchematicProps {
  systemTitle?: string;
  compartmentName?: string;
  compartmentSpecs?: string[];
  schematicTag?: string;
  accentColor?: string;
  telemetryColor?: string;
}

/**
 * Componente Documental Estilo Neo (How the U.S. Doomsday Plane Works)
 * Esquema técnico 3D com corte transversal (Cutaway / X-Ray) e chamada HUD ancorada.
 */
export const TechnicalCutawaySchematic: React.FC<TechnicalCutawaySchematicProps> = ({
  systemTitle = 'BLOCO MEDIDOR HIDRÁULICO // 4 PISTÕES DE DESLOCAMENTO POSITIVO',
  compartmentName = 'CÂMARA DE MEDIÇÃO VOLUMÉTRICA & ACOPLAMENTO MAGNÉTICO',
  compartmentSpecs = [
    'DESLOCAMENTO: 0,500 L POR CICLO COMPLETO',
    'RESOLUÇÃO: 200 PULSOS POR LITRO (DISCO ÓPTICO)',
    'TOLERÂNCIA INMETRO: ±0,5% (PORTARIA 559)',
    'ACIONAMENTO: ACOPLAMENTO MAGNÉTICO BLINDADO'
  ],
  schematicTag = 'CORTE TRANSVERSAL METROLÓGICO // INMETRO',
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Curva de mola suave para revelação da telemetria
  const revealProgress = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: {damping: 16, stiffness: 70}
  });

  const cameraScale = interpolate(frame, [0, 150], [1.0, 1.07]);
  const cameraPanX = interpolate(frame, [0, 150], [0, -25]);

  const calloutLineLength = interpolate(revealProgress, [0, 1], [0, 220]);
  const cardOpacity = interpolate(revealProgress, [0.3, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0A0B10',
        overflow: 'hidden',
        fontFamily: 'JetBrains Mono, Courier, monospace',
        color: '#F4F4F0'
      }}
    >
      {/* Grid de Engenharia de Fundo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Cabeçalho Técnico Superior */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 80,
          zIndex: 10,
          maxWidth: 900
        }}
      >
        <div style={{fontSize: 12, color: telemetryColor, letterSpacing: 2}}>
          {schematicTag}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 1.5,
            color: '#F4F4F0'
          }}
        >
          {systemTitle}
        </div>
      </div>

      {/* Corpo da Reconstrução 3D / Wireframe com Câmera Push-in */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${cameraScale}) translateX(${cameraPanX}px)`,
          transformOrigin: 'center center'
        }}
      >
        {/* Silhueta Vetorial do Sistema / Fuselagem */}
        <svg viewBox="0 0 1600 800" style={{width: '90%', height: '80%'}}>
          {/* Contorno Geral da Estrutura (Fuselagem Translúcida) */}
          <path
            d="M 200,400 Q 300,320 800,320 L 1300,340 Q 1450,380 1500,400 Q 1450,420 1300,460 L 800,480 Q 300,480 200,400 Z"
            fill="rgba(22, 24, 36, 0.6)"
            stroke="rgba(244, 244, 240, 0.2)"
            strokeWidth="2"
          />

          {/* Divisões de Compartimentos Internos */}
          <line x1="450" y1="330" x2="450" y2="470" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
          <line x1="700" y1="325" x2="700" y2="475" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
          <line x1="980" y1="330" x2="980" y2="470" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />

          {/* Compartimento Ativo Iluminado em Neon Laranja (#FF5500) */}
          <rect
            x="710"
            y="340"
            width="260"
            height="120"
            rx="4"
            fill="rgba(255, 85, 0, 0.22)"
            stroke={accentColor}
            strokeWidth="3"
            style={{
              filter: `drop-shadow(0 0 20px ${accentColor})`
            }}
          />

          {/* Ponto de Ancoragem Focal da Telemetria */}
          <circle cx="840" cy="400" r="7" fill={accentColor} style={{filter: `drop-shadow(0 0 10px ${accentColor})`}} />
          <circle cx="840" cy="400" r="14" fill="none" stroke={telemetryColor} strokeWidth="1.5" />
        </svg>

        {/* Linha de Conexão HUD para o Card Técnico */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <path
            d={`M 980,480 L 1150,320 L ${1150 + calloutLineLength},320`}
            fill="none"
            stroke={telemetryColor}
            strokeWidth="2"
            strokeDasharray="6 3"
          />
        </svg>

        {/* Card Flutuante de Especificações HUD */}
        <div
          style={{
            position: 'absolute',
            left: 1170,
            top: 210,
            width: 440,
            backgroundColor: 'rgba(6, 7, 9, 0.92)',
            border: `1px solid ${accentColor}`,
            borderLeft: `4px solid ${accentColor}`,
            boxShadow: '0 15px 40px rgba(0,0,0,0.85)',
            padding: '24px 28px',
            opacity: cardOpacity,
            transform: `translateY(${(1 - cardOpacity) * 15}px)`
          }}
        >
          <div style={{color: accentColor, fontWeight: 900, fontSize: 16, letterSpacing: 1.5}}>
            {compartmentName}
          </div>
          <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10}}>
            {compartmentSpecs.map((spec, idx) => (
              <div key={idx} style={{fontSize: 12, color: '#C5C7D0', display: 'flex', alignItems: 'center'}}>
                <span style={{color: telemetryColor, marginRight: 8, fontSize: 14}}>▸</span>
                <span>{spec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
