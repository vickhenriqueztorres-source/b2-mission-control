import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

interface SubmarineCableCrossSection3DProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly activeLayerIndex?: number;
}

const LAYERS = [
  {name: '1. POLIETILENO EXTERNO', desc: 'Isolamento hidrofóbico contra salinidade extrema', color: '#71717A', radius: 340},
  {name: '2. FITA MYLAR BLINDADA', desc: 'Barreira dielétrica e retenção mecânica', color: '#A1A1AA', radius: 300},
  {name: '3. FIOS DE AÇO HELICOIDAIS', desc: 'Armadura estrutural de alta tração (400 atm)', color: '#D4D4D8', radius: 260},
  {name: '4. TUBO DE COBRE MACIÇO', desc: 'Condutor elétrico de 10.000 Volts DC', color: '#FF5500', radius: 210},
  {name: '5. POLICARBONATO ESTRUTURAL', desc: 'Câmara de amortecimento e suporte de pressão', color: '#52525B', radius: 160},
  {name: '6. GEL DE VASELINA HIDROFÓBICA', desc: 'Vedação química contra micro-fissuras', color: '#F59E0B', radius: 110},
  {name: '7. NÚCLEO: 12 PARES DE SÍLICA', desc: 'Fibras ópticas ultra-puras (200 Tbps a 200.000 km/s)', color: '#00F0FF', radius: 60}
];

export const SubmarineCableCrossSection3D: React.FC<SubmarineCableCrossSection3DProps> = ({
  title = 'ANATOMIA DO CABO SUBMARINO // 25MM',
  subtitle = 'CORTE TRANSVERSAL DEEP TECH — 7 CAMADAS DE BLINDAGEM'
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({frame, fps, config: {damping: 18, mass: 0.8, stiffness: 90}});
  const scanRotation = (frame * 0.8) % 360;
  const pulse = Math.sin(frame * 0.1) * 0.05 + 1;

  // Ciclo automático de destaque de camada
  const currentLayer = Math.min(LAYERS.length - 1, Math.floor((frame / 35) % LAYERS.length));
  const activeLayerData = LAYERS[currentLayer];

  return (
    <AbsoluteFill style={{backgroundColor: '#060709', color: '#F4F4F5', overflow: 'hidden'}}>
      {/* 1. Grade Isométrica de Fundo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(255,85,0,0.08) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 60px 60px, 60px 60px',
          opacity: entrance
        }}
      />

      {/* 2. Cabeçalho Editorial */}
      <div style={{position: 'absolute', top: 60, left: 80, zIndex: 20}}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
            color: '#00F0FF',
            letterSpacing: 4,
            fontWeight: 800,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <div style={{width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5500', boxShadow: '0 0 12px #FF5500'}} />
          RAIO-X 3D // INFRAESTRUTURA FÍSICA
        </div>
        <div style={{fontFamily: "'Inter', sans-serif", fontSize: 44, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em'}}>
          {title}
        </div>
        <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: '#A1A1AA', letterSpacing: 1.5, marginTop: 4}}>
          {subtitle}
        </div>
      </div>

      {/* 3. Render Central do Corte 3D em Anéis */}
      <div
        style={{
          position: 'absolute',
          top: '52%',
          left: '38%',
          transform: `translate(-50%, -50%) scale(${entrance})`,
          width: 720,
          height: 720,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* Laser Scanner de Rotação */}
        <div
          style={{
            position: 'absolute',
            width: 720,
            height: 720,
            borderRadius: '50%',
            border: '1px dashed rgba(255,85,0,0.3)',
            transform: `rotate(${scanRotation}deg)`,
            pointerEvents: 'none'
          }}
        />

        {/* Anéis das 7 Camadas */}
        {LAYERS.map((layer, idx) => {
          const isActive = idx === currentLayer;
          return (
            <div
              key={layer.name}
              style={{
                position: 'absolute',
                width: layer.radius * 2,
                height: layer.radius * 2,
                borderRadius: '50%',
                border: `2px solid ${isActive ? '#FF5500' : 'rgba(255,255,255,0.15)'}`,
                backgroundColor: isActive ? 'rgba(255,85,0,0.12)' : 'rgba(6,7,9,0.4)',
                boxShadow: isActive ? `0 0 35px ${layer.color}60, inset 0 0 20px ${layer.color}40` : 'none',
                transform: isActive ? `scale(${pulse})` : 'scale(1)',
                transition: 'all 0.3s ease-out'
              }}
            />
          );
        })}

        {/* Feixe Central de Fótons (Laser Ciano) */}
        <div
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#00F0FF',
            boxShadow: '0 0 40px #00F0FF, 0 0 80px #00F0FF'
          }}
        />

        {/* Linha de Cota de Diâmetro 25mm */}
        <div
          style={{
            position: 'absolute',
            bottom: -50,
            width: 680,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #FF5500',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            color: '#FF5500',
            paddingBottom: 6
          }}
        >
          <span>|</span>
          <span style={{fontWeight: 800, letterSpacing: 2}}>DIÂMETRO REAL: Ø 25.0 MM (1.0 POLEGADA)</span>
          <span>|</span>
        </div>
      </div>

      {/* 4. Painel Lateral de Telemetria da Camada Ativa */}
      <div
        style={{
          position: 'absolute',
          top: '32%',
          right: 80,
          width: 520,
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,85,0,0.3)',
          backdropFilter: 'blur(12px)',
          borderRadius: 8,
          padding: 32,
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#00F0FF', letterSpacing: 2, marginBottom: 12}}>
          INSPEÇÃO DE CAMADA [{currentLayer + 1}/7]
        </div>
        <div style={{fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 800, color: activeLayerData.color, marginBottom: 12}}>
          {activeLayerData.name}
        </div>
        <div style={{fontFamily: "'Inter', sans-serif", fontSize: 16, color: '#D4D4D8', lineHeight: 1.5, marginBottom: 24}}>
          {activeLayerData.desc}
        </div>

        {/* Métricas Técnicas da Camada */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16}}>
          <div>
            <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#71717A'}}>PRESSÃO SUPORTADA</div>
            <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: '#F4F4F5'}}>400 ATM (4.000M)</div>
          </div>
          <div>
            <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#71717A'}}>TENSÃO ELÉTRICA</div>
            <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: '#FF5500'}}>10.000V DC</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
