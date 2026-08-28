import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export interface Iso20022PacketInspectorProps {
  txId?: string;
  amount?: string;
  senderCpfMasked?: string;
  receiverCpfMasked?: string;
  routingKey?: string;
  encryptionStandard?: string;
  latencyMs?: number;
}

export const Iso20022PacketInspector: React.FC<Iso20022PacketInspectorProps> = ({
  txId = 'E00038166202608242109S881920',
  amount = 'R$ 1,00',
  senderCpfMasked = '***.842.199-**',
  receiverCpfMasked = '***.103.488-**',
  routingKey = 'pix@bacen.gov.br (DICT_HASH)',
  encryptionStandard = 'AES-256-GCM + RSA-4096 (HSM FIPS 140-2)',
  latencyMs = 1.4
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const scanlineY = interpolate(frame % 90, [0, 90], [0, 100]);
  const packetSlide = spring({
    frame,
    fps,
    config: {damping: 15, stiffness: 100}
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'JetBrains Mono, Menlo, Consolas, monospace',
        backgroundColor: 'rgba(6, 7, 9, 0.85)'
      }}
    >
      <div
        style={{
          width: '78%',
          maxWidth: 1200,
          background: 'rgba(13, 14, 21, 0.95)',
          border: '1px solid #34384F',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.9), 0 0 40px rgba(0, 240, 255, 0.1)',
          transform: `translateY(${(1 - packetSlide) * 40}px)`,
          position: 'relative'
        }}
      >
        {/* Scanline de Inspeção */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${scanlineY}%`,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #00F0FF, transparent)',
            boxShadow: '0 0 15px #00F0FF',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />

        {/* Header da Inspeção */}
        <div
          style={{
            padding: '16px 24px',
            background: '#12141F',
            borderBottom: '1px solid #23263B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <div style={{width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5500'}} />
            <span style={{color: '#F4F4F0', fontWeight: 700, fontSize: 15, letterSpacing: '0.1em'}}>
              SPI PACKET INSPECTOR — ISO 20022 (pacs.008.001.08)
            </span>
          </div>
          <div style={{color: '#00F0FF', fontSize: 13}}>
            TEMPO DECORRIDO: <strong style={{color: '#FF5500'}}>{latencyMs}ms</strong>
          </div>
        </div>

        {/* Corpo do Pacote Hex / Estruturado */}
        <div style={{padding: 28, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24}}>
          {/* Lado Esquerdo: Tags Estruturadas */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14}}>
            <div style={{borderBottom: '1px solid #1E2133', paddingBottom: 8}}>
              <span style={{color: '#656A8A'}}>EndToEndId:</span>{' '}
              <span style={{color: '#FF5500', fontWeight: 600}}>{txId}</span>
            </div>
            <div style={{borderBottom: '1px solid #1E2133', paddingBottom: 8}}>
              <span style={{color: '#656A8A'}}>IntrBkSttlmAmt (Valor):</span>{' '}
              <span style={{color: '#00F0FF', fontWeight: 800, fontSize: 18}}>{amount} BRL</span>
            </div>
            <div style={{borderBottom: '1px solid #1E2133', paddingBottom: 8}}>
              <span style={{color: '#656A8A'}}>Dbtr / Cdtr (Partes):</span>{' '}
              <span style={{color: '#F4F4F0'}}>{senderCpfMasked} ➔ {receiverCpfMasked}</span>
            </div>
            <div style={{borderBottom: '1px solid #1E2133', paddingBottom: 8}}>
              <span style={{color: '#656A8A'}}>RmtInf (Chave DICT):</span>{' '}
              <span style={{color: '#8A8D9F'}}>{routingKey}</span>
            </div>
          </div>

          {/* Lado Direito: Criptografia de Hardware */}
          <div
            style={{
              background: '#090A10',
              padding: 16,
              borderRadius: 4,
              border: '1px solid #23263B',
              fontSize: 12,
              lineHeight: 1.6,
              color: '#8A8D9F'
            }}
          >
            <div style={{color: '#00F0FF', fontWeight: 700, marginBottom: 8}}>
              [HARDWARE HSM STATUS]
            </div>
            <div>PADRÃO: {encryptionStandard}</div>
            <div>ASSINATURA: ICP-BRASIL / RSASSA-PSS</div>
            <div>STATUS LIQUIDAÇÃO: <span style={{color: '#00F0FF'}}>ATÔMICA (SEM DUPLICIDADE)</span></div>
            <div style={{marginTop: 12, color: '#FF5500', fontSize: 11}}>
              INTEGRIDADE MATEMÁTICA CONFIRMADA (SHA-256)
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
