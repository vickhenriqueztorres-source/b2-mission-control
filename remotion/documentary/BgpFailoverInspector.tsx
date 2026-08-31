import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

interface BgpFailoverInspectorProps {
  readonly title?: string;
  readonly failoverTimeMs?: number;
}

export const BgpFailoverInspector: React.FC<BgpFailoverInspectorProps> = ({
  title = ''
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({frame, fps, config: {damping: 18, mass: 0.8, stiffness: 90}});
  const isCut = frame > 45;
  const isRerouted = frame > 75;

  return (
    <AbsoluteFill style={{backgroundColor: '#060709', color: '#F4F4F5', overflow: 'hidden'}}>
      {/* 1. Grade Isométrica */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(239,68,68,0.06) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 60px 60px, 60px 60px',
          opacity: entrance
        }}
      />

      {/* 2. Cabeçalho */}
      <div style={{position: 'absolute', top: 60, left: 80, zIndex: 20}}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
            color: isCut ? '#EF4444' : '#00F0FF',
            letterSpacing: 4,
            fontWeight: 800,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: isCut ? '#EF4444' : '#00F0FF',
              boxShadow: `0 0 12px ${isCut ? '#EF4444' : '#00F0FF'}`
            }}
          />
          PROTOCOLO BGP (BORDER GATEWAY PROTOCOL) // TELEMETRIA DE REDE
        </div>
        <div style={{fontFamily: "'Inter', sans-serif", fontSize: 40, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em'}}>
          {title}
        </div>
      </div>

      {/* 3. Painel de Status das Fibras */}
      <div
        style={{
          position: 'absolute',
          top: '52%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${entrance})`,
          width: 1300,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 40
        }}
      >
        {/* Cabo Primário (Monet / Submarino) */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: `2px solid ${isCut ? '#EF4444' : '#00F0FF'}`,
            borderRadius: 12,
            padding: 32,
            boxShadow: isCut ? '0 0 40px rgba(239,68,68,0.2)' : '0 0 30px rgba(0,240,255,0.1)'
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}}>
            <span style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#71717A'}}>ROTA PRINCIPAL: MONET (BR-EUA)</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: 800,
                color: isCut ? '#EF4444' : '#00FF85',
                backgroundColor: isCut ? 'rgba(239,68,68,0.15)' : 'rgba(0,255,133,0.15)',
                padding: '4px 12px',
                borderRadius: 4
              }}
            >
              {isCut ? 'RUPTURA DETECTADA (0.00 THz)' : 'ONLINE (64 Tbps)'}
            </span>
          </div>

          <div style={{fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 800, color: isCut ? '#EF4444' : '#F4F4F5', marginBottom: 8}}>
            {isCut ? 'ÂNCORA / CORTE FÍSICO A 2.200M' : '12 Pares de Fibras Ativos'}
          </div>

          <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#A1A1AA', lineHeight: 1.6}}>
            Perda instantânea de reflexão óptica (OTDR). O feixe de luz infravermelho de 1550nm foi interrompido.
          </div>
        </div>

        {/* Cabo de Contingência (EllaLink / Seabras-1) */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: `2px solid ${isRerouted ? '#00FF85' : '#71717A'}`,
            borderRadius: 12,
            padding: 32,
            boxShadow: isRerouted ? '0 0 40px rgba(0,255,133,0.2)' : 'none'
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}}>
            <span style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#71717A'}}>ROTA DE CONTINGÊNCIA: ELLALINK / SEABRAS-1</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: 800,
                color: isRerouted ? '#00FF85' : '#71717A',
                backgroundColor: isRerouted ? 'rgba(0,255,133,0.15)' : 'rgba(255,255,255,0.05)',
                padding: '4px 12px',
                borderRadius: 4
              }}
            >
              {isRerouted ? 'TRÁFEGO REDIRECIONADO EM 14.2 MS' : 'STANDBY ATIVO'}
            </span>
          </div>

          <div style={{fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 800, color: isRerouted ? '#00FF85' : '#A1A1AA', marginBottom: 8}}>
            {isRerouted ? 'Chaveamento Autônomo Concluído' : 'Aguardando Gatilho de Rota BGP'}
          </div>

          <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#A1A1AA', lineHeight: 1.6}}>
            Os roteadores de borda atualizaram as tabelas de rotas BGP autônomas antes que qualquer usuário percebesse queda.
          </div>
        </div>
      </div>

      {/* 4. Contador de Tempo de Failover */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          backgroundColor: 'rgba(6,7,9,0.9)',
          border: '1px solid rgba(255,85,0,0.3)',
          padding: '16px 48px',
          borderRadius: 8
        }}
      >
        <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#71717A'}}>TEMPO DE RESPOSTA DO PROTOCOLO BGP</div>
        <div style={{fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 900, color: '#FF5500', marginTop: 4}}>
          14.2 MILISSEGUNDOS
        </div>
      </div>
    </AbsoluteFill>
  );
};
