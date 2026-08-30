import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export interface LaserScanDossierProps {
  documentTitle?: string;
  documentSource?: string;
  criticalClause?: string;
  clauseContext?: string;
  stampText?: string;
  accentColor?: string;
}

/**
 * Módulo 3: O Dossiê com Corte Laser (Documentos Investigativos Sob Vidro)
 * Mostra documento técnico/regulatório real sob vidro escuro com lâmina laser (#FF5500)
 * varrendo a página e destacando o número ou cláusula crítica.
 */
export const LaserScanDossier: React.FC<LaserScanDossierProps> = ({
  documentTitle = 'AUTO DE INFRAÇÃO METROLÓGICA // FRAUDE NA MEDIÇÃO VOLUMÉTRICA',
  documentSource = 'FONTE: INMETRO / IPEM / PROCESSO ADMINISTRATIVO SANÇÃO',
  criticalClause = 'DESVIO VOLUMÉTRICO DE -8,0% DETECTADO EM BICO ELETRÔNICO MEDIDOR',
  clauseContext = 'A perícia constatou a adulteração do circuito eletrônico do cabeçote da bomba de combustível, alterando a contagem de pulsos por litro em desfavor do consumidor sem alterar o visor digital.',
  stampText = 'PERÍCIA CONCLUÍDA // AUTUAÇÃO',
  accentColor = '#FF5500'
}) => {
  const frame = useCurrentFrame();

  // Varredura da lâmina laser de 0% a 100% da altura
  const laserY = interpolate(frame, [10, 65], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const highlightOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#060709',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 120px',
        overflow: 'hidden'
      }}
    >
      {/* Moldura do Dossiê sob Vidro Escuro */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1100,
          backgroundColor: '#0D0E15',
          border: '1px solid #34384F',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
          padding: '48px 56px',
          fontFamily: 'JetBrains Mono, Courier, monospace',
          color: '#F4F4F0'
        }}
      >
        {/* Carimbo Superior */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 36,
            border: `2px solid ${accentColor}`,
            color: accentColor,
            padding: '4px 12px',
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 2,
            transform: 'rotate(-4deg)'
          }}
        >
          {stampText}
        </div>

        {/* Cabeçalho do Documento */}
        <div style={{fontSize: 13, color: '#9A9EB2', letterSpacing: 1.5}}>
          {documentSource}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 24,
            fontWeight: 900,
            color: '#F4F4F0',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: 16
          }}
        >
          {documentTitle}
        </div>

        {/* Texto do Dossiê */}
        <div style={{marginTop: 28, fontSize: 16, lineHeight: 1.6, color: '#C5C7D0'}}>
          {clauseContext}
        </div>

        {/* Cláusula Crítica com Destaque Neon */}
        <div
          style={{
            marginTop: 24,
            padding: '16px 20px',
            backgroundColor: `rgba(255, 85, 0, ${highlightOpacity * 0.18})`,
            borderLeft: `4px solid ${accentColor}`,
            fontSize: 20,
            fontWeight: 900,
            color: highlightOpacity > 0.5 ? '#FFF' : '#F4F4F0',
            textShadow: highlightOpacity > 0.5 ? `0 0 12px ${accentColor}` : 'none',
            transition: 'background-color 0.2s'
          }}
        >
          {criticalClause}
        </div>

        {/* Lâmina Laser Horizontal de Varredura */}
        {laserY > 0 && laserY < 100 ? (
          <div
            style={{
              position: 'absolute',
              top: `${laserY}%`,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: accentColor,
              boxShadow: `0 0 16px 4px ${accentColor}`,
              pointerEvents: 'none'
            }}
          />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
