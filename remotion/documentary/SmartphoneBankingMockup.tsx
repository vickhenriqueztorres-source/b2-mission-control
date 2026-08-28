import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export interface SmartphoneBankingMockupProps {
  amount?: string;
  recipientName?: string;
  recipientKey?: string;
  stage?: 'typing' | 'confirming' | 'processing' | 'approved';
}

export const SmartphoneBankingMockup: React.FC<SmartphoneBankingMockupProps> = ({
  amount = 'R$ 1,00',
  recipientName = 'CARLOS EDUARDO SILVA',
  recipientKey = 'pix@exemplo.com.br',
  stage = 'confirming'
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const phonePop = spring({
    frame,
    fps,
    config: {damping: 15, stiffness: 100}
  });

  const pulse = (Math.sin(frame * 0.15) + 1) / 2;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Moldura do Smartphone Escuro */}
      <div
        style={{
          width: 380,
          height: 760,
          borderRadius: 48,
          background: '#0B0C12',
          border: '4px solid #282A3A',
          boxShadow: '0 30px 100px rgba(0,0,0,0.9), 0 0 50px rgba(255, 85, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          transform: `scale(${phonePop})`
        }}
      >
        {/* Dynamic Island / Câmera */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 110,
            height: 28,
            borderRadius: 20,
            backgroundColor: '#000',
            zIndex: 10
          }}
        />

        {/* Barra de Status */}
        <div
          style={{
            padding: '16px 28px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            fontWeight: 600,
            color: '#8A8D9F'
          }}
        >
          <span>21:42</span>
          <span>5G • 100%</span>
        </div>

        {/* App Banking Screen */}
        <div style={{flex: 1, padding: '24px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
          <div>
            <div style={{fontSize: 14, color: '#8A8D9F', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em'}}>
              TRANSFERÊNCIA PIX
            </div>
            <div style={{fontSize: 38, fontWeight: 900, color: '#F4F4F0', marginTop: 16}}>
              {amount}
            </div>

            {/* Cartão de Destino */}
            <div
              style={{
                marginTop: 24,
                background: '#141622',
                padding: 16,
                borderRadius: 12,
                border: '1px solid #23263B'
              }}
            >
              <div style={{fontSize: 12, color: '#656A8A'}}>Para:</div>
              <div style={{fontSize: 15, fontWeight: 700, color: '#F4F4F0', marginTop: 4}}>
                {recipientName}
              </div>
              <div style={{fontSize: 13, color: '#00F0FF', marginTop: 2, fontFamily: 'monospace'}}>
                {recipientKey}
              </div>
            </div>
          </div>

          {/* Botão de Ação / Confirmação */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <div
              style={{
                background: '#FF5500',
                color: '#FFF',
                padding: '18px 0',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 16,
                textAlign: 'center',
                letterSpacing: '0.05em',
                boxShadow: `0 0 ${20 + pulse * 20}px rgba(255, 85, 0, ${0.4 + pulse * 0.3})`
              }}
            >
              CONFIRMAR TRANSFERÊNCIA
            </div>

            <div style={{textAlign: 'center', fontSize: 11, color: '#656A8A'}}>
              LIQUIDAÇÃO INSTANTÂNEA • BANCO CENTRAL DO BRASIL
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
