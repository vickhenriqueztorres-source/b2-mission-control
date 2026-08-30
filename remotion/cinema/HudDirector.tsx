import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { HudWindow } from '../../contracts/timelineContract';
import { AtomicStopwatch } from '../documentary/AtomicStopwatch';

export interface HudDirectorProps {
  totalFrames: number;
  hudWindows?: Array<HudWindow & { startFrame: number; durationFrames: number; endFrame: number }>;
  showMasterStopwatch?: boolean;
  accentColor?: string;
  telemetryColor?: string;
  children?: React.ReactNode;
}

/**
 * 🛰️ HudDirector: Diretor de HUDs Persistentes e Telemetria
 * Gerencia a renderização segura de elementos técnicos na tela,
 * respeitando áreas nobres e zonas seguras (safe zones).
 */
export const HudDirector: React.FC<HudDirectorProps> = ({
  totalFrames,
  hudWindows = [],
  showMasterStopwatch = true,
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF',
  children
}) => {
  const frame = useCurrentFrame();

  // Filtra as janelas de HUD ativas no frame atual
  const activeWindows = hudWindows.filter(
    (w) => frame >= w.startFrame && frame < w.endFrame
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* 1. Camada Base dos Filhos */}
      {children}

      {/* 2. Cronômetro Atômico de Telemetria no Topo Central (Safe Zone) */}
      {showMasterStopwatch && (
        <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 950 }}>
          <AtomicStopwatch totalFrames={totalFrames} />
        </div>
      )}

      {/* 3. Renderização de Janelas de HUD Específicas ativas */}
      {activeWindows.map((win) => {
        return (
          <div
            key={win.id}
            style={{
              position: 'absolute',
              top: '110px',
              right: '48px',
              padding: '12px 18px',
              backgroundColor: 'rgba(6, 7, 9, 0.85)',
              backdropFilter: 'blur(10px)',
              border: `1px solid rgba(0, 240, 255, 0.25)`,
              borderLeft: `3px solid ${accentColor}`,
              borderRadius: '4px',
              color: '#F4F4F0',
              fontFamily: 'monospace',
              fontSize: '12px',
              letterSpacing: '1px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              zIndex: 920,
              maxWidth: '380px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ color: telemetryColor, fontWeight: 'bold', fontSize: '11px' }}>
                // TELEMETRIA SISTÊMICA
              </span>
              <span style={{ color: '#8A8D9F', fontSize: '10px' }}>
                {win.id}
              </span>
            </div>
            <div style={{ color: '#F4F4F0', fontSize: '13px', lineHeight: 1.4 }}>
              {win.props?.title || win.component}
            </div>
            {win.props?.status && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: accentColor }}>
                STATUS: {win.props.status}
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
