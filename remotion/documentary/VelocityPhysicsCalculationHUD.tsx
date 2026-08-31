import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';

export interface VelocityPhysicsCalculationHUDProps {
  accentColor?: string;
  telemetryColor?: string;
  headerTag?: string;
  headerFormula?: string;
  headerFormulaSubtitle?: string;
  circuitTitle?: string;
  circuitFormula?: string;
  loop01Label?: string;
  loop02Label?: string;
  measuredIntervalLabel?: string;
  measuredValueFormatted?: string;
  calculatedValueLabel?: string;
  calculatedValueNumber?: number;
  calculatedUnit?: string;
  statusLines?: Array<{ label: string; value: string; color?: string }>;
  measuredSpeed?: number;
  timeDeltaMicros?: number;
  durationInFrames?: number;
}

export const VelocityPhysicsCalculationHUD: React.FC<VelocityPhysicsCalculationHUDProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  headerTag = '',
  headerFormula = '',
  headerFormulaSubtitle = '',
  circuitTitle = '',
  circuitFormula = '',
  loop01Label = '',
  loop02Label = '',
  measuredIntervalLabel = '',
  measuredValueFormatted = '',
  calculatedValueLabel = '',
  calculatedValueNumber = 0,
  calculatedUnit = '',
  statusLines = [],
  measuredSpeed = 0,
  timeDeltaMicros = 0,
  durationInFrames = 180
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {damping: 14, mass: 0.7, stiffness: 85}
  });

  // Contagem dinâmica de microssegundos
  const currentMicros = Math.floor(
    interpolate(frame, [0, 45], [0, timeDeltaMicros], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    })
  );

  // Cálculo da velocidade em tempo real
  const currentSpeed = Math.floor(
    interpolate(frame, [0, 55], [0, measuredSpeed], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    })
  );

  // Gráfico da onda senoidal de frequência LC (Passagem da massa metálica)
  const points: string[] = [];
  const waveWidth = 600;
  for (let x = 0; x <= waveWidth; x += 10) {
    const freqMod = 1 + Math.exp(-Math.pow((x - waveWidth * 0.5) / 120, 2)) * 1.5;
    const y = 80 + Math.sin((x * 0.05 * freqMod) - (frame * 0.2)) * (isActiveTime(frame) ? 45 : 25);
    points.push(`${x},${y}`);
  }
  const svgPath = `M 0,80 L ${points.join(' L ')}`;

  function isActiveTime(f: number) {
    return f > 20 && f < 90;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'rgba(6, 7, 9, 0.90)',
        backdropFilter: 'blur(14px)',
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', Menlo, Consolas, monospace",
        color: '#F4F4F0'
      }}
    >
      {/* 1. Grid Holográfica Circular de Radar */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          height: 900,
          borderRadius: '50%',
          border: '1px solid rgba(0, 240, 255, 0.08)',
          boxShadow: 'inset 0 0 100px rgba(0, 240, 255, 0.03)',
          opacity: entrance
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            border: '1px dashed rgba(255, 85, 0, 0.15)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            height: 300,
            borderRadius: '50%',
            border: '1px solid rgba(0, 240, 255, 0.12)'
          }}
        />
      </div>

      {/* 2. Cabeçalho da Equação Mestra */}
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
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: '#F4F4F0',
            display: 'flex',
            alignItems: 'center',
            gap: 20
          }}
        >
          {headerFormula ? <span>{headerFormula}</span> : null}
          {headerFormulaSubtitle ? (
            <span style={{fontSize: 24, color: accentColor, fontWeight: 700}}>
              {headerFormulaSubtitle}
            </span>
          ) : null}
        </div>
      </div>

      {/* 3. Bloco Central: Oscilador LC e Comparador de Onda */}
      <div
        style={{
          position: 'absolute',
          top: '48%',
          left: '32%',
          transform: 'translate(-50%, -50%)',
          width: 640,
          backgroundColor: 'rgba(13, 14, 21, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 12,
          padding: 24,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}>
          <span style={{fontSize: 13, color: telemetryColor, letterSpacing: 2}}>
            {circuitTitle}
          </span>
          <span style={{fontSize: 13, color: accentColor, fontWeight: 800}}>
            {circuitFormula}
          </span>
        </div>

        {/* Osciloscópio Digital SVG */}
        <div
          style={{
            width: '100%',
            height: 160,
            backgroundColor: '#060709',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: 6,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Grade do Osciloscópio */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(rgba(0,240,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.06) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          <svg width="100%" height="160" viewBox="0 0 600 160">
            <path
              d={svgPath}
              fill="none"
              stroke={accentColor}
              strokeWidth="3"
              strokeLinecap="round"
              style={{filter: `drop-shadow(0 0 8px ${accentColor})`}}
            />
          </svg>

          {/* Marcadores de Trigger T0 e T1 */}
          {loop01Label ? (
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 140,
                fontSize: 11,
                color: telemetryColor,
                backgroundColor: 'rgba(0,240,255,0.15)',
                padding: '2px 6px',
                borderRadius: 3
              }}
            >
              {loop01Label}
            </div>
          ) : null}
          {loop02Label ? (
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 140,
                fontSize: 11,
                color: accentColor,
                backgroundColor: 'rgba(255,85,0,0.15)',
                padding: '2px 6px',
                borderRadius: 3
              }}
            >
              {loop02Label}
            </div>
          ) : null}
        </div>

        {/* Barra de Progresso Temporal de Amostragem */}
        <div style={{marginTop: 16}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8A8D9F', marginBottom: 6}}>
            <span>{measuredIntervalLabel || 'INTERVALO MEDIDO:'}</span>
            <span style={{color: '#F4F4F0', fontWeight: 800, fontSize: 14}}>
              {measuredValueFormatted || (timeDeltaMicros > 0 ? `${currentMicros.toLocaleString('pt-BR')} µs` : '')}
            </span>
          </div>
          <div style={{width: '100%', height: 6, backgroundColor: '#060709', borderRadius: 3, overflow: 'hidden'}}>
            <div
              style={{
                width: `${timeDeltaMicros > 0 ? (currentMicros / timeDeltaMicros) * 100 : 100}%`,
                height: '100%',
                backgroundColor: accentColor,
                boxShadow: `0 0 10px ${accentColor}`
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Display Gigante de Valor Calculado à Direita */}
      <div
        style={{
          position: 'absolute',
          top: '48%',
          right: '8%',
          transform: 'translate(0, -50%)',
          width: 380,
          backgroundColor: 'rgba(13, 14, 21, 0.90)',
          border: `2px solid ${accentColor}`,
          borderRadius: 12,
          padding: 30,
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
          boxShadow: `0 0 50px ${accentColor}30, inset 0 0 30px rgba(0,0,0,0.8)`
        }}
      >
        {calculatedValueLabel ? (
          <div style={{fontSize: 13, color: telemetryColor, letterSpacing: 3, fontWeight: 800, marginBottom: 12}}>
            {calculatedValueLabel}
          </div>
        ) : null}

        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 92,
            fontWeight: 900,
            lineHeight: 0.95,
            color: '#F4F4F0',
            letterSpacing: '-0.03em',
            textShadow: `0 0 40px ${accentColor}80`
          }}
        >
          {calculatedValueNumber || currentSpeed}
        </div>
        {calculatedUnit ? (
          <div style={{fontSize: 20, color: accentColor, fontWeight: 800, letterSpacing: 4, marginTop: 8}}>
            {calculatedUnit}
          </div>
        ) : null}

        {statusLines && statusLines.length > 0 ? (
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: 12,
              color: '#8A8D9F',
              textAlign: 'left'
            }}
          >
            {statusLines.map((line, idx) => (
              <div key={idx} style={{marginBottom: 4}}>
                {line.label}: <strong style={{color: line.color || '#F4F4F0'}}>{line.value}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
