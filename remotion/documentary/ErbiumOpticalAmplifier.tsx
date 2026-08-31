import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

interface ErbiumOpticalAmplifierProps {
  readonly title?: string;
  readonly distanceKm?: number;
}

export const ErbiumOpticalAmplifier: React.FC<ErbiumOpticalAmplifierProps> = ({
  title = ''
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({frame, fps, config: {damping: 18, mass: 0.8, stiffness: 90}});
  const laserPulse = (frame * 6) % 100;
  const glowIntensity = Math.sin(frame * 0.15) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{backgroundColor: '#060709', color: '#F4F4F5', overflow: 'hidden'}}>
      {/* 1. Grade Isométrica */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(255,85,0,0.06) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 50px 50px, 50px 50px',
          opacity: entrance
        }}
      />

      {/* 2. Cabeçalho */}
      <div style={{position: 'absolute', top: 60, left: 80, zIndex: 20}}>
        <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: '#FF5500', letterSpacing: 4, fontWeight: 800, marginBottom: 8}}>
          FÍSICA QUÂNTICA // AMPLIFICAÇÃO DIRETA DE FÓTONS
        </div>
        <div style={{fontFamily: "'Inter', sans-serif", fontSize: 40, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em'}}>
          {title}
        </div>
        <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: '#A1A1AA', letterSpacing: 1.5, marginTop: 4}}>
          ESTAÇÕES DE AMPLIFICAÇÃO REPETIDAS A CADA 80 KM NO FUNDO DO MAR
        </div>
      </div>

      {/* 3. Diagrama Esquemático do Repetidor Submarino */}
      <div
        style={{
          position: 'absolute',
          top: '52%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${entrance})`,
          width: 1400,
          height: 500,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Entrada: Sinal Atenuado (Fraco) */}
        <div style={{textAlign: 'center', width: 260}}>
          <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#71717A', marginBottom: 8}}>ENTRADA (KM 80)</div>
          <div style={{fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 800, color: '#A1A1AA'}}>Sinal Atenuado</div>
          <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#EF4444', marginTop: 4}}>-28 dBm (Fótons Fracos)</div>
          <div style={{width: 120, height: 4, backgroundColor: 'rgba(0, 240, 255, 0.3)', margin: '16px auto', borderRadius: 2}} />
        </div>

        {/* Chassi do Repetidor de Titânio Blindado */}
        <div
          style={{
            position: 'relative',
            width: 720,
            height: 320,
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '2px solid #FF5500',
            borderRadius: 16,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 0 50px rgba(255,85,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24
          }}
        >
          <div style={{position: 'absolute', top: 16, left: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#00F0FF'}}>
            CILINDRO DE TITÂNIO // PRESSÃO RESISTIDA: 400 ATM
          </div>
          <div style={{position: 'absolute', top: 16, right: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#FF5500', fontWeight: 800}}>
            10.000V DC POWER FEED
          </div>

          {/* Bobina de Fibra Dopada com Érbio */}
          <div
            style={{
              width: 380,
              height: 120,
              border: `2px dashed rgba(255, 85, 0, ${glowIntensity})`,
              borderRadius: 60,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255,85,0,0.08)',
              boxShadow: `0 0 30px rgba(255,85,0,0.3)`
            }}
          >
            <div style={{textAlign: 'center'}}>
              <div style={{fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 900, color: '#FF5500'}}>FIBRA DOPADA COM ÉRBIO (Er³⁺)</div>
              <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#F4F4F5', marginTop: 4}}>EMISSÃO ESTIMULADA DE FÓTONS (1550nm)</div>
            </div>
          </div>

          {/* Laser de Bombeamento 980nm */}
          <div style={{marginTop: 20, display: 'flex', gap: 24, alignItems: 'center'}}>
            <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#00F0FF'}}>
              LASER DE BOMBEAMENTO: <span style={{fontWeight: 800}}>980 NM (PUMP LASER)</span>
            </div>
            <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#00FF85'}}>
              GANHO ÓPTICO: <span style={{fontWeight: 800}}>+30 dB</span>
            </div>
          </div>
        </div>

        {/* Saída: Sinal Re-amplificado (Forte) */}
        <div style={{textAlign: 'center', width: 260}}>
          <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#71717A', marginBottom: 8}}>SAÍDA (RUMO AO KM 160)</div>
          <div style={{fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 800, color: '#00F0FF'}}>Sinal Amplificado</div>
          <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#00FF85', marginTop: 4}}>+2 dBm (200 Tbps Restaurados)</div>
          <div style={{width: 120, height: 6, backgroundColor: '#00F0FF', margin: '16px auto', borderRadius: 3, boxShadow: '0 0 16px #00F0FF'}} />
        </div>
      </div>

      {/* 4. Rodapé Técnico */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 80,
          right: 80,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          color: '#71717A',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 16
        }}
      >
        <span>VELOCIDADE DE PROPAGAÇÃO: ~204.000 KM/S (68% DA VELOCIDADE DA LUZ NO VÁCUO)</span>
        <span>LATÊNCIA FORTALEZA-LISBOA: 58 MILISSEGUNDOS</span>
      </div>
    </AbsoluteFill>
  );
};
