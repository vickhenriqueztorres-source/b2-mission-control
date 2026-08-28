import json

ts_content = """import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile
} from 'remotion';
import {
  AnamorphicCinematicOverlay,
  AtlanticBathymetryMap,
  AtomicStopwatch,
  BgpFailoverInspector,
  CinematicParallaxMotion,
  CyberMapTrace,
  DynamicDocumentaryMedia,
  DynamicSpotlightFocus,
  Episode02SoundTrack,
  ErbiumOpticalAmplifier,
  KineticEditorialCallout,
  KineticNumberCounter,
  LaserRevealWipe,
  LaserScanDossier,
  SubmarineCableCrossSection3D,
  TechnicalCutawaySchematic
} from './documentary';
import {EPISODE_02_SCENES, EPISODE_02_TOTAL_FRAMES} from './episode02TimelineData';

export interface Episode02CabosProps {
  accentColor?: string;
  telemetryColor?: string;
}

// Callouts editoriais sincronizados para as 50 cenas da investigação
const EDITORIAL_CALLOUTS: Record<
  string,
  {
    mainText: string;
    subText: string;
    categoryText?: string;
    startFrame?: number;
    durationFrames?: number;
    position?: 'center' | 'bottom_left' | 'top_right' | 'center_left';
  }
> = {
  SC_001: {
    mainText: 'O CLIQUE EM 4K',
    subText: 'O MITO DOS SATÉLITES DA INTERNET',
    categoryText: 'INVESTIGAÇÃO // EP. 02',
    position: 'bottom_left'
  },
  SC_002: {
    mainText: 'MENOS DE 1% NO ESPAÇO',
    subText: 'SATÉLITES NÃO SUPORTAM A DEMANDA GLOBAL',
    categoryText: 'FÍSICA DA PROPAGAÇÃO',
    position: 'center'
  },
  SC_003: {
    mainText: '99% DEBAIXO D\\'ÁGUA',
    subText: 'OCEANO ATLÂNTICO // 4.000M PROFUNDIDADE',
    categoryText: 'INFRAESTRUTURA FÍSICA',
    position: 'center'
  },
  SC_004: {
    mainText: '25 MILÍMETROS',
    subText: 'A ESPESSURA QUE CONECTA O BRASIL',
    categoryText: 'ENGENHARIA OCULTA',
    position: 'bottom_left'
  },
  SC_005: {
    mainText: 'MANGUEIRA DE JARDIM',
    subText: 'A ESCALA INACREDITÁVEL DO CABO SUBMARINO',
    categoryText: 'ANATOMIA DO SISTEMA',
    position: 'center'
  },
  SC_006: {
    mainText: 'O OUTRO LADO // DOC',
    subText: 'A REDE INVISÍVEL NO LEITO DO ATLÂNTICO',
    categoryText: 'SISTEMAS ESCONDIDOS',
    position: 'center'
  },
  SC_009: {
    mainText: 'AS 7 CAMADAS DE BLINDAGEM',
    subText: 'RESISTÊNCIA A 400 ATMOSFERAS DE PRESSÃO',
    categoryText: 'CIÊNCIA DOS MATERIAIS',
    position: 'bottom_left'
  },
  SC_010: {
    mainText: 'POLIETILENO DE ALTA DENSIDADE',
    subText: 'BARREIRA QUÍMICA CONTRA A ÁGUA SALGADA',
    categoryText: 'BLINDAGEM EXTERNA',
    position: 'center'
  },
  SC_011: {
    mainText: 'ARMADURA DE AÇO HELICOIDAL',
    subText: 'RESISTÊNCIA MECÂNICA A DEZENAS DE TONELADAS',
    categoryText: 'TRAÇÃO MECÂNICA',
    position: 'bottom_left'
  },
  SC_012: {
    mainText: '10.000 VOLTS DC',
    subText: 'CONDUTOR DE COBRE PARA ALIMENTAÇÃO SUBMARINA',
    categoryText: 'ENERGIA EM ALTA TENSÃO',
    position: 'center'
  },
  SC_013: {
    mainText: 'GEL HIDROFÓBICO',
    subText: 'BLOQUEIO TOTAL CONTRA INFILTRAÇÃO D\\'ÁGUA',
    categoryText: 'VEDAÇÃO QUÍMICA',
    position: 'bottom_left'
  },
  SC_014: {
    mainText: '12 PARES DE SÍLICA PURA',
    subText: 'FIBRAS ÓPTICAS DO TAMANHO DE UM CABELO',
    categoryText: 'NÚCLEO TRANSMISSOR',
    position: 'center'
  },
  SC_015: {
    mainText: '250 TERABITS / SEGUNDO',
    subText: 'TECNOLOGIA DWDM // MULTIPLEXAÇÃO POR ONDA',
    categoryText: 'CAPACIDADE QUÂNTICA',
    position: 'center'
  },
  SC_017: {
    mainText: '4.000 METROS // 400 ATM',
    subText: 'PESO DE UM ELEFANTE POR CENTÍMETRO QUADRADO',
    categoryText: 'ABISMO OCEÂNICO',
    position: 'bottom_left'
  },
  SC_019: {
    mainText: 'REPETIDORES E.D.F.A.',
    subText: 'AMPLIFICAÇÃO ÓPTICA A CADA 80 QUILÔMETROS',
    categoryText: 'ENGENHARIA SUBMARINA',
    position: 'center'
  },
  SC_020: {
    mainText: 'DOPAGEM COM ÉRBIO',
    subText: 'ÁTOMOS EXCITADOS POR LASER DE BOMBEAMENTO',
    categoryText: 'FÍSICA QUÂNTICA',
    position: 'bottom_left'
  },
  SC_021: {
    mainText: 'EMISSÃO ESTIMULADA',
    subText: 'MULTIPLICAÇÃO DE FÓTONS SEM CONVERSÃO ELÉTRICA',
    categoryText: 'AMPLIFICAÇÃO PURA',
    position: 'center'
  },
  SC_022: {
    mainText: '10.000 VOLTS NO MAR',
    subText: 'INJEÇÃO DE ENERGIA PELAS ESTAÇÕES COSTEIRAS',
    categoryText: 'MALHA ENERGÉTICA',
    position: 'bottom_left'
  },
  SC_023: {
    mainText: 'O OCEANO COMO TERRA',
    subText: 'ÁGUA SALGADA FECHANDO O CIRCUITO ELÉTRICO',
    categoryText: 'RETORNO GLOBAL',
    position: 'center'
  },
  SC_025: {
    mainText: 'FORTALEZA & PRAIA GRANDE',
    subText: 'OS DOIS CORAÇÕES DE CONEXÃO DO BRASIL',
    categoryText: 'ROTAS ESTRATÉGICAS',
    position: 'center'
  },
  SC_026: {
    mainText: 'PRAIA DO FUTURO // CE',
    subText: '2º MAIOR HUB DE CABOS SUBMARINOS DO MUNDO',
    categoryText: '16 CABOS INTERNACIONAIS',
    position: 'bottom_left'
  },
  SC_027: {
    mainText: 'DUTO DE PRAIA SUBTERRÂNEO',
    subText: 'PERFURAÇÃO HORIZONTAL A 3M SOB A AREIA',
    categoryText: 'ENGENHARIA CIVIL',
    position: 'center'
  },
  SC_028: {
    mainText: 'BÚNKERS C.L.S.',
    subText: 'CABLE LANDING STATIONS // PROTEÇÃO MILITAR',
    categoryText: 'SEGURANÇA NACIONAL',
    position: 'bottom_left'
  },
  SC_030: {
    mainText: 'SUBIDA DA SERRA DO MAR',
    subText: 'FIBRA TERRESTRE ATÉ OS DATACENTERS DE SP',
    categoryText: 'BACKBONE NACIONAL',
    position: 'center'
  },
  SC_031: {
    mainText: 'IX.BR // 30+ TBPS',
    subText: 'O MAIOR PONTO DE TROCA DE TRÁFEGO DO PLANETA',
    categoryText: 'INTERNET BRASILEIRA',
    position: 'center'
  },
  SC_033: {
    mainText: '70% DOS CORTES: ÂNCORAS',
    subText: 'NAVIO CARGUEIRO // 50.000 TONELADAS DE ARRASTO',
    categoryText: 'AMEAÇA REAL',
    position: 'bottom_left'
  },
  SC_034: {
    mainText: 'RUPTURA NO ABISMO',
    subText: 'PERDA INSTANTÂNEA DE FEIXES DE SÍLICA',
    categoryText: 'FALHA FÍSICA',
    position: 'center'
  },
  SC_035: {
    mainText: 'ALARME LOSS OF SIGNAL',
    subText: 'DETECÇÃO NO NOC EM 1 MILISSEGUNDO',
    categoryText: 'MONITORAMENTO 24/7',
    position: 'bottom_left'
  },
  SC_036: {
    mainText: 'TELEMETRIA LASER O.T.D.R.',
    subText: 'PRECISÃO DE METROS A MILHARES DE KM DA COSTA',
    categoryText: 'DIAGNÓSTICO ÓPTICO',
    position: 'center'
  },
  SC_037: {
    mainText: 'PROTOCOLO B.G.P. AUTÔNOMO',
    subText: 'REDIRECIONAMENTO DINÂMICO DE ROTAS',
    categoryText: 'ALGORITMO DE BORDA',
    position: 'bottom_left'
  },
  SC_038: {
    mainText: 'FAILOVER EM 14.2 MS',
    subText: 'REDIRECIONAMENTO ANTES DO USUÁRIO PERCEBER',
    categoryText: 'RESILIÊNCIA DA INTERNET',
    position: 'center'
  },
  SC_039: {
    mainText: 'NAVIO DE REPARO SUBMARINO',
    subText: 'OPERAÇÃO EM ALTO-MAR NO MEIO DO ATLÂNTICO',
    categoryText: 'LOGÍSTICA PESADA',
    position: 'bottom_left'
  },
  SC_040: {
    mainText: 'ROBÔ SUBMARINO R.O.V.',
    subText: 'RESGATE DO CABO A 4.000 METROS DE PROFUNDIDADE',
    categoryText: 'ROBÓTICA ABISSAL',
    position: 'center'
  },
  SC_041: {
    mainText: 'FUSÃO EM SALA LIMPA',
    subText: 'ARCO VOLTAICO FUNDINDO FIBRAS MICROCÓPICAS',
    categoryText: 'PRECISÃO EXTREMA',
    position: 'bottom_left'
  },
  SC_043: {
    mainText: 'A ILUSÃO DA NUVEM',
    subText: 'TODA A TECNOLOGIA É PROFUNDAMENTE FÍSICA',
    categoryText: 'REFLEXÃO DOCUMENTAL',
    position: 'center'
  },
  SC_046: {
    mainText: '25 MILÍMETROS DE VIDRO E AÇO',
    subText: 'A CIVILIZAÇÃO DIGITAL NO FUNDO DO MAR',
    categoryText: 'O OUTRO LADO // DOC',
    position: 'center'
  },
  SC_048: {
    mainText: 'INVESTIGAR. REVELAR. COMPREENDER.',
    subText: 'A ENGENHARIA OCULTA POR TRÁS DO SEU MUNDO',
    categoryText: 'O OUTRO LADO',
    position: 'center'
  }
};

export const Episode02Cabos: React.FC<Episode02CabosProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  return (
    <AbsoluteFill style={{backgroundColor: '#060709', overflow: 'hidden'}}>
      {/* 1. Trilha Sonora e Efeitos Sonoros Mixados com Ducking a -24dB */}
      <Episode02SoundTrack />

      {/* 2. Narração Contínua do Narrador Chris (ElevenLabs) */}
      <Audio
        src={staticFile('postproduction_ep02/narration.mp3')}
        volume={1.0}
      />

      {/* 3. Renderização Dinâmica das 50 Cenas */}
      {EPISODE_02_SCENES.map((scene) => {
        const callout = EDITORIAL_CALLOUTS[scene.scene_id];
        const is3DMotionGraphic = [
          'cable_cross_section_3d',
          'bathymetry_map',
          'erbium_amplifier',
          'bgp_inspector',
          'kinetic_counter'
        ].includes(scene.type);

        return (
          <Sequence
            key={scene.scene_id}
            from={scene.start_frame}
            durationInFrames={scene.duration_frames}
            name={`${scene.scene_id}_${scene.name}`}
          >
            <AbsoluteFill style={{backgroundColor: '#060709'}}>
              {/* COMPONENTES MOTION GRAPHICS 3D */}
              {scene.type === 'cable_cross_section_3d' && (
                <SubmarineCableCrossSection3D
                  title="ANATOMIA DO CABO // 25MM"
                  subtitle="7 CAMADAS DE BLINDAGEM SUBMARINA (400 ATM)"
                />
              )}

              {scene.type === 'bathymetry_map' && (
                <AtlanticBathymetryMap
                  title="ROTAS SUBMARINAS DO ATLÂNTICO // 4.000M"
                />
              )}

              {scene.type === 'erbium_amplifier' && (
                <ErbiumOpticalAmplifier
                  title="REPETIDOR ÓPTICO DE ÉRBIO (EDFA) // 10.000V"
                />
              )}

              {scene.type === 'bgp_inspector' && (
                <BgpFailoverInspector
                  title="RUPTURA SUBMARINA // FAILOVER BGP EM 14.2MS"
                />
              )}

              {scene.type === 'kinetic_counter' && (
                <KineticNumberCounter
                  endValue={scene.scene_id === 'SC_007' ? 204000 : scene.scene_id === 'SC_015' ? 250 : 14}
                  suffix={scene.scene_id === 'SC_007' ? ' KM/S' : scene.scene_id === 'SC_015' ? ' TBPS' : ' MS'}
                  label={scene.scene_id === 'SC_007' ? 'VELOCIDADE DA LUZ NA SÍLICA' : scene.scene_id === 'SC_015' ? 'CAPACIDADE DWDM DO CABO' : 'TEMPO DE RESPOSTA DO BGP'}
                  sublabel={scene.scene_id === 'SC_007' ? '~68% DA VELOCIDADE NO VÁCUO' : scene.scene_id === 'SC_015' ? '12 PARES DE FIBRAS ÓPTICAS' : 'FAILOVER AUTÔNOMO INSTANTÂNEO'}
                  accentColor={accentColor}
                />
              )}

              {/* CENAS CINEMATOGRÁFICAS 35MM (Firefly Video Take / Parallax) */}
              {!is3DMotionGraphic && (
                <>
                  <DynamicDocumentaryMedia
                    sceneId={scene.scene_id}
                    kenBurns="slow_push_in"
                    zoomIntensity={1.25}
                    durationInFrames={scene.duration_frames}
                  />

                  {/* Spotlight Chiaroscuro */}
                  <DynamicSpotlightFocus
                    durationInFrames={scene.duration_frames}
                    intensity={0.45}
                  />

                  {/* Tipografia Editorial Dinâmica */}
                  {callout && (
                    <KineticEditorialCallout
                      mainText={callout.mainText}
                      subText={callout.subText}
                      categoryText={callout.categoryText}
                      startFrame={callout.startFrame || 20}
                      durationFrames={callout.durationFrames || Math.max(60, scene.duration_frames - 30)}
                      position={callout.position || 'center'}
                      accentColor={accentColor}
                    />
                  )}
                </>
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* 4. Vinheta e Granulação Anamórfica 35mm Global */}
      <AnamorphicCinematicOverlay />
    </AbsoluteFill>
  );
};
"""

with open(r"remotion/Episode02Cabos.tsx", "w", encoding="utf-8") as f_out:
    f_out.write(ts_content)

print("Updated remotion/Episode02Cabos.tsx with 50 scenes and 3D motion graphics!")
