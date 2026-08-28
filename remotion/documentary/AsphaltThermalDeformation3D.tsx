import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';

export interface AsphaltThermalDeformation3DProps {
  accentColor?: string;
  telemetryColor?: string;
  temperatureCelsius?: number;
  toleranceLimitSec?: number;
  durationInFrames?: number;
}

/**
 * Simulador 3D de Gargalo Físico & Auditoria do INMETRO (O Outro Lado / HSL)
 * Demonstra a dilatação térmica do asfalto sob calor extremo,
 * a compressão mecânica por carretas pesadas, o ruído eletromagnético
 * e o algoritmo de descarte do 3º laço do INMETRO com tolerância de 0,001s.
 */
export const AsphaltThermalDeformation3D: React.FC<AsphaltThermalDeformation3DProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  temperatureCelsius = 58.4,
  toleranceLimitSec = 0.001,
  durationInFrames = 180
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {damping: 16, mass: 0.8, stiffness: 85}
  });

  const thermalHeatWave = Math.sin(frame * 0.2) * 8;
  const vibrationNoise = Math.sin(frame * 0.8) * (frame > 30 && frame < 90 ? 4 : 1);

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
      {/* 1. Grid Térmica de Fundo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 60% 40%, rgba(255, 85, 0, 0.15) 0%, transparent 65%),
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 50px 50px, 50px 50px',
          opacity: entrance
        }}
      />

      {/* 2. Cabeçalho Editorial do Gargalo Metrológico */}
      <div style={{position: 'absolute', top: 70, left: 90, zIndex: 30}}>
        <div
          style={{
            fontSize: 13,
            color: accentColor,
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
              backgroundColor: '#FF3333',
              boxShadow: '0 0 12px #FF3333'
            }}
          />
          AUDITORIA METROLÓGICA // LIMITES FÍSICOS DO HARDWARE
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
          DILATAÇÃO TÉRMICA & TOLERÂNCIA DE 0,001s (INMETRO)
        </div>
        <div style={{fontSize: 14, color: '#8A8D9F', letterSpacing: 1.5, marginTop: 4}}>
          VALIDAÇÃO CRUZADA DE 3 LAÇOS // MARGEM DE SEGURANÇA JURÍDICA: ±7 KM/H
        </div>
      </div>

      {/* 3. Simulação 3D de Deformação Térmica e Compressão */}
      <div
        style={{
          position: 'absolute',
          top: '52%',
          left: '36%',
          transform: `translate(-50%, -50%) perspective(1000px) rotateX(25deg) scale(${entrance})`,
          width: 620,
          height: 320,
          backgroundColor: '#0D0E15',
          border: '2px solid rgba(255, 85, 0, 0.4)',
          borderRadius: 10,
          boxShadow: '0 30px 60px rgba(0,0,0,0.9), inset 0 0 50px rgba(255, 85, 0, 0.15)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}
      >
        {/* Mapa de Calor / Termografia do Asfalto */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle at 50% ${50 + thermalHeatWave}%, rgba(255,85,0,0.3) 0%, rgba(255,0,0,0.1) 50%, transparent 80%)`,
            pointerEvents: 'none'
          }}
        />

        <div style={{display: 'flex', justifyContent: 'space-between', zIndex: 10}}>
          <span style={{fontSize: 14, color: '#F4F4F0', fontWeight: 800}}>
            TEMPERATURA DO PAVIMENTO: <strong style={{color: '#FF5500'}}>{temperatureCelsius}°C</strong>
          </span>
          <span style={{fontSize: 12, color: telemetryColor}}>
            DILATAÇÃO LINEAR: + 0,18 mm
          </span>
        </div>

        {/* 3 Laços com Auditoria de Discrepância Temporal */}
        <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '20px 0', zIndex: 10}}>
          {[
            {name: 'LAÇO 1', time: '0,0000 s', status: 'OK', color: '#00F0FF'},
            {name: 'LAÇO 2', time: '0,0915 s', status: 'OK', color: '#FF5500'},
            {name: 'LAÇO 3 (AUDITOR)', time: '0,0916 s', status: 'VALIDADO (Δ < 1ms)', color: '#00FF66'}
          ].map((l, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'rgba(6, 7, 9, 0.85)',
                border: `1px solid ${l.color}`,
                borderRadius: 6,
                padding: '12px 16px',
                textAlign: 'center',
                boxShadow: `0 0 15px ${l.color}30`
              }}
            >
              <div style={{fontSize: 11, color: '#8A8D9F', marginBottom: 4}}>{l.name}</div>
              <div style={{fontSize: 16, fontWeight: 800, color: '#F4F4F0', marginBottom: 4}}>{l.time}</div>
              <div style={{fontSize: 10, color: l.color, fontWeight: 700}}>{l.status}</div>
            </div>
          ))}
        </div>

        <div style={{fontSize: 11, color: '#8A8D9F', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, zIndex: 10}}>
          SE ΔT LAÇO 2 vs LAÇO 3 {'>'} 0,001s ➔ A MEDIÇÃO É AUTOMATICAMENTE ANULADA NO GATEWAY.
        </div>
      </div>

      {/* 4. Card de Tolerância do INMETRO */}
      <div
        style={{
          position: 'absolute',
          top: '52%',
          right: '8%',
          transform: 'translate(0, -50%)',
          width: 380,
          backgroundColor: 'rgba(13, 14, 21, 0.90)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          borderRadius: 12,
          padding: 26,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{fontSize: 12, color: telemetryColor, letterSpacing: 2, marginBottom: 12}}>
          MARGEM REGULAMENTAR INMETRO
        </div>

        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 54,
            fontWeight: 900,
            color: '#F4F4F0',
            letterSpacing: '-0.02em',
            marginBottom: 6
          }}
        >
          ± 7 <span style={{fontSize: 22, color: accentColor}}>KM/H</span>
        </div>
        <div style={{fontSize: 12, color: '#8A8D9F', marginBottom: 16}}>
          (OU ± 7% PARA VELOCIDADES ACIMA DE 100 KM/H)
        </div>

        <div style={{fontSize: 12, color: '#F4F4F0', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14}}>
          A tolerância não perdoa o excesso: ela protege a medição contra incertezas térmicas do solo e deformação do asfalto.
        </div>
      </div>
    </AbsoluteFill>
  );
};
