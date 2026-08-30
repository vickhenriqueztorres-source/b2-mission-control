/**
 * @legacy-composition
 * AVISO PARA AGENTES: Esta composição utiliza o formato artesanal legado.
 * NÃO USE ESTE ARQUIVO COMO TEMPLATE PARA NOVOS EPISÓDIOS.
 * O padrão canônico e obrigatório para todos os novos episódios é:
 * `contracts/episodes/<id>.episode.json` + `TimelineContract` + `<CinematicEpisode />` em `remotion/cinema/CinematicEpisode.tsx`.
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile
} from 'remotion';
import {
  AnamorphicCinematicOverlay,
  AtomicStopwatch,
  CinematicParallaxMotion,
  CyberMapTrace,
  DynamicDocumentaryMedia,
  DynamicSpotlightFocus,
  Episode02SoundTrack,
  KineticEditorialCallout,
  KineticNumberCounter,
  LaserRevealWipe,
  LaserScanDossier
} from './documentary';
import { EPISODE_04_SCENES, EPISODE_04_TOTAL_FRAMES } from './episode04TimelineData';

export interface Episode04GpsTempoProps {
  accentColor?: string;
  telemetryColor?: string;
}

// Callouts editoriais sincronizados para as 50 cenas da investigação de GPS & Tempo
const EDITORIAL_CALLOUTS: Record<
  string,
  {
    mainText: string;
    subText: string;
    categoryText?: string;
    position?: 'center' | 'bottom_left' | 'top_right' | 'center_left';
  }
> = {
  SC_001: {
    mainText: 'O CLIQUE NO MAPA',
    subText: 'O MITO DO SATÉLITE QUE TE OLHA',
    categoryText: 'INVESTIGAÇÃO // EP. 04',
    position: 'bottom_left'
  },
  SC_002: {
    mainText: 'GRITANDO AS HORAS',
    subText: 'SATÉLITES NÃO RASTREIAM O SEU CELULAR',
    categoryText: 'FÍSICA DA TRANSMISSÃO',
    position: 'center'
  },
  SC_003: {
    mainText: 'APAGÃO ORBITAL',
    subText: 'SE OS 31 SATÉLITES DESLIGASSEM AGORA',
    categoryText: 'EXPERIMENTO MENTAL',
    position: 'bottom_left'
  },
  SC_004: {
    mainText: 'COLAPSO EM 10 MINUTOS',
    subText: 'BANCOS, PIX E 5G FORA DO AR',
    categoryText: 'VULNERABILIDADE SISTÊMICA',
    position: 'center'
  },
  SC_005: {
    mainText: 'O RELÓGIO DA CIVILIZAÇÃO',
    subText: 'A INFRAESTRUTURA INVISÍVEL DO TEMPO',
    categoryText: 'REVELAÇÃO FÍSICA',
    position: 'bottom_left'
  },
  SC_006: {
    mainText: 'O NANOSSEGUNDO',
    subText: '1/1.000.000.000 DE SEGUNDO',
    categoryText: 'ESCALA TEMPORAL',
    position: 'center'
  },
  SC_009: {
    mainText: 'ÓRBITA MÉDIA: 20.200 KM',
    subText: '14.000 KM/H // 2 VOLTAS POR DIA',
    categoryText: 'CONSTELAÇÃO GPS',
    position: 'bottom_left'
  },
  SC_010: {
    mainText: 'CÉSIO-133 & RUBÍDIO',
    subText: 'O CORAÇÃO ATÔMICO DO SATÉLITE',
    categoryText: 'HARDWARE ORBITAL',
    position: 'center'
  },
  SC_011: {
    mainText: '9.192.631.770 HZ',
    subText: 'A TRANSIÇÃO HIPERFINA DO CÉSIO',
    categoryText: 'FÍSICA QUÂNTICA',
    position: 'center'
  },
  SC_014: {
    mainText: 'D = C × ΔT',
    subText: 'A DISTÂNCIA É APENAS O TEMPO DA LUZ',
    categoryText: 'MATEMÁTICA DA TRILATERAÇÃO',
    position: 'center'
  },
  SC_016: {
    mainText: 'A 4ª DIMENSÃO',
    subText: 'CORRIGINDO O RELÓGIO DO SMARTPHONE',
    categoryText: 'GEOMETRIA TEMPORAL',
    position: 'bottom_left'
  },
  SC_018: {
    mainText: 'FARIA LIMA & WALL STREET',
    subText: 'DATA CENTERS NO MESMO COMPASSO',
    categoryText: 'FINANÇAS DE ALTA FREQUÊNCIA',
    position: 'bottom_left'
  },
  SC_020: {
    mainText: 'DESCOMPASSO DE 1µs',
    subText: 'O RISCO DA DUPLICIDADE DE ORDENS',
    categoryText: 'MERCADO DE CAPITAIS',
    position: 'center'
  },
  SC_022: {
    mainText: 'PROTOCOLO PTP (IEEE 1588)',
    subText: 'SINCRONISMO < 10 NANOSSEGUNDOS',
    categoryText: 'ENGENHARIA DE REDES',
    position: 'bottom_left'
  },
  SC_023: {
    mainText: 'BEAMFORMING 5G',
    subText: 'FASE MILIMÉTRICA NO ESPAÇO AÉREO',
    categoryText: 'TELECOMUNICAÇÕES',
    position: 'center'
  },
  SC_026: {
    mainText: 'O PARADOXO DE EINSTEIN',
    subText: 'QUANDO A RELATIVIDADE AFETA A ENGENHARIA',
    categoryText: 'FÍSICA TEÓRICA NA PRÁTICA',
    position: 'center'
  },
  SC_027: {
    mainText: 'RELATIVIDADE ESPECIAL',
    subText: '-7,2 MICROSSEGUNDOS / DIA (VELOCIDADE)',
    categoryText: 'DILATAÇÃO CINEMÁTICA',
    position: 'bottom_left'
  },
  SC_028: {
    mainText: 'RELATIVIDADE GERAL',
    subText: '+45,9 MICROSSEGUNDOS / DIA (GRAVIDADE)',
    categoryText: 'DISTORÇÃO GRAVITACIONAL',
    position: 'bottom_left'
  },
  SC_029: {
    mainText: '+38,7 MICROSSEGUNDOS',
    subText: 'O SALDO LÍQUIDO ACUMULADO A CADA 24H',
    categoryText: 'DEDUÇÃO RELATIVÍSTICA',
    position: 'center'
  },
  SC_030: {
    mainText: 'ERRO DE 11,6 KM POR DIA',
    subText: 'A VELOCIDADE DA LUZ NÃO PERDOA',
    categoryText: 'CONSEQUÊNCIA GEOMÉTRICA',
    position: 'center'
  },
  SC_033: {
    mainText: 'CORREÇÃO DE FÁBRICA: 10,22999999543 MHZ',
    subText: 'DESACELERANDO O QUARTZO NO SOLO',
    categoryText: 'SOLUÇÃO DE ENGENHARIA',
    position: 'center'
  },
  SC_035: {
    mainText: 'BASE ESPACIAL DE SCHRIEVER',
    subText: '2º ESQUADRÃO DE OPERAÇÕES ESPACIAIS',
    categoryText: 'COMANDO TERRESTRE',
    position: 'bottom_left'
  },
  SC_037: {
    mainText: 'OBSERVATÓRIO NACIONAL (RIO)',
    subText: 'HORA LEGAL BRASILEIRA // PADRÃO UTC',
    categoryText: 'METROLOGIA NACIONAL',
    position: 'bottom_left'
  },
  SC_039: {
    mainText: 'GPS SPOOFING & JAMMING',
    subText: 'A GUERRA ELETRÔNICA DO SINAL FALSO',
    categoryText: 'AMEAÇA CRÍTICA',
    position: 'center'
  },
  SC_040: {
    mainText: 'REDES DE FIBRA ÓPTICA ATÔMICA',
    subText: 'A BLINDAGEM TERRESTRE DE BACKUP',
    categoryText: 'REDUNDÂNCIA CIVIL',
    position: 'bottom_left'
  },
  SC_046: {
    mainText: 'O TRIUNFO DE EINSTEIN',
    subText: 'UMA TEORIA QUE IMPEDE O COLAPSO',
    categoryText: 'TRIBUTO CIENTÍFICO',
    position: 'center'
  },
  SC_050: {
    mainText: 'O OUTRO LADO DO TEMPO',
    subText: 'A MÁQUINA INVISÍVEL QUE NUNCA PARA',
    categoryText: 'O OUTRO LADO',
    position: 'center'
  }
};

const SCENE_MOTION_MODES: Record<
  string,
  'crash_push_in' | 'slow_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift'
> = {
  SC_004: 'crash_push_in',
  SC_006: 'slow_push_in',
  SC_011: 'cinematic_drift',
  SC_014: 'slow_push_in',
  SC_022: 'pan_right',
  SC_029: 'dramatic_pull_out',
  SC_050: 'slow_push_in'
};

export const Episode04GpsTempo: React.FC<Episode04GpsTempoProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', color: '#FFFFFF' }}>
      {/* 1. Trilha Sonora Master & Efeitos Ambientes */}
      <Episode02SoundTrack />

      {/* 2. Áudio da Narração Master Sincronizado */}
      <Audio src={staticFile('postproduction_ep04/narration.mp3')} volume={1.0} />

      {/* 3. Cronômetro Atômico de Telemetria no Topo */}
      <AtomicStopwatch totalFrames={EPISODE_04_TOTAL_FRAMES} />

      {/* 4. Sequência das 50 Cenas */}
      {EPISODE_04_SCENES.map((scene, index) => {
        const callout = EDITORIAL_CALLOUTS[scene.sceneId];
        const motionMode = SCENE_MOTION_MODES[scene.sceneId] || 'slow_push_in';

        return (
          <Sequence
            key={scene.sceneId}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
            name={`${scene.sceneId}_${scene.name}`}
          >
            <AbsoluteFill style={{ backgroundColor: '#060709' }}>
              {/* CENA CINEMATOGRÁFICA 35MM (Firefly Video Take ou Keyframe Dossier 2.5D) */}
              <DynamicDocumentaryMedia
                sceneId={scene.sceneId}
                kenBurns={motionMode}
                zoomIntensity={1.22}
                durationInFrames={scene.durationFrames}
              />

              {/* Spotlight Chiaroscuro */}
              <DynamicSpotlightFocus
                durationInFrames={scene.durationFrames}
                intensity={0.40}
              />

              {/* Efeitos Especiais Gráficos */}
              {scene.sceneId === 'SC_011' && (
                <KineticNumberCounter
                  endValue={9192631770}
                  suffix=" HZ"
                  label="OSCILAÇÃO DO ÁTOMO DE CÉSIO-133"
                  sublabel="PADRÃO INTERNACIONAL DE 1 SEGUNDO"
                  accentColor={accentColor}
                />
              )}

              {scene.sceneId === 'SC_030' && (
                <KineticNumberCounter
                  endValue={11.6}
                  suffix=" KM / DIA"
                  label="ERRO ACUMULADO POR 38.7 MICROSSEGUNDOS"
                  sublabel="SEM CORREÇÃO DA RELATIVIDADE DE EINSTEIN"
                  accentColor={accentColor}
                />
              )}

              {/* Tipografia Editorial Dinâmica */}
              {callout && (
                <KineticEditorialCallout
                  mainText={callout.mainText}
                  subText={callout.subText}
                  categoryText={callout.categoryText}
                  startFrame={15}
                  durationFrames={Math.max(60, scene.durationFrames - 25)}
                  position={callout.position || 'center'}
                  accentColor={accentColor}
                />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* 5. Granulação Anamórfica 35mm e Vinheta Global */}
      <AnamorphicCinematicOverlay />
    </AbsoluteFill>
  );
};
