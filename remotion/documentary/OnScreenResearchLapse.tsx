import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export interface OnScreenResearchLapseProps {
  researchMedia?: React.ReactNode;
  queryText?: string;
  sourceText?: string;
  accentColor?: string;
}

/**
 * Módulo 6: On-Screen Research Time-Lapse (Dossiê de Tela Estilizado)
 * Gravação de pesquisa de dados estilizada com textura de vidro e zoom progressivo.
 */
export const OnScreenResearchLapse: React.FC<OnScreenResearchLapseProps> = ({
  researchMedia,
  queryText = 'QUERY: "CONCILIAÇÃO CIP FLUXO NÃO-AUTORIZADO"',
  sourceText = 'DATABASE: SISBACEN / AUDITORIA FORENSE',
  accentColor = '#FF5500'
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 120], [1.0, 1.09], {
    extrapolateRight: 'clamp'
  });

  const scanlineY = interpolate(frame % 45, [0, 45], [0, 100]);

  return (
    <AbsoluteFill style={{backgroundColor: '#060709', overflow: 'hidden'}}>
      {/* 1. Mídia de Pesquisa em Time-Lapse */}
      <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: 'center center'}}>
        {researchMedia || (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#0D0E15',
              padding: '60px',
              fontFamily: 'JetBrains Mono, Courier, monospace',
              color: '#8A8D9F'
            }}
          >
            <div style={{color: accentColor, fontWeight: 700, fontSize: 18}}>
              {queryText}
            </div>
            <div style={{marginTop: 8, fontSize: 13, color: '#00F0FF'}}>
              {sourceText}
            </div>
            <div
              style={{
                marginTop: 32,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                opacity: 0.65
              }}
            >
              <div style={{border: '1px solid #34384F', padding: 16}}>
                [REG_01] IP: 187.32.11.90 - REQ: VALIDATE_TOKEN - STATUS: TIMEOUT
              </div>
              <div style={{border: '1px solid #34384F', padding: 16}}>
                [REG_02] TX_ID: #882199 - VAL: R$ 42.000,00 - ROUTE: SP {'->'} RJ
              </div>
              <div style={{border: '1px solid #34384F', padding: 16}}>
                [REG_03] AUTH: BYPASS_FLAG_DETECTED - LATENCY: 2.1ms
              </div>
              <div style={{border: '1px solid #34384F', padding: 16}}>
                [REG_04] LOG_HASH: 0x88fbc923a102 - CONFIRMATION: ZERO_PROOF
              </div>
            </div>
          </div>
        )}
      </AbsoluteFill>

      {/* 2. Textura de Tela / Vidro Glass Look */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none'
        }}
      />

      {/* 3. Scanline Laser de Monitor */}
      <div
        style={{
          position: 'absolute',
          top: `${scanlineY}%`,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: 'rgba(0, 240, 255, 0.4)',
          boxShadow: '0 0 10px rgba(0, 240, 255, 0.6)',
          pointerEvents: 'none'
        }}
      />
    </AbsoluteFill>
  );
};
