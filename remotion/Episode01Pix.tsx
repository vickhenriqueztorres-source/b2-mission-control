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
  Episode01SoundTrack,
  Iso20022PacketInspector,
  KineticEditorialCallout,
  KineticNumberCounter,
  LaserRevealWipe,
  LaserScanDossier,
  OnScreenResearchLapse,
  SmartphoneBankingMockup,
  TechnicalCutawaySchematic
} from './documentary';
import {EPISODE_01_SCENES} from './episode01TimelineData';

export interface Episode01PixProps {
  accentColor?: string;
  telemetryColor?: string;
}

// Catálogo de Callouts Editoriais Sincronizados com a fala do narrador George
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
  OOL_001: {
    mainText: 'EM MENOS DE 2 SEGUNDOS',
    subText: 'R$ 1,00 TRANSFERIDO VIA SPI',
    categoryText: 'EXPERIÊNCIA DO USUÁRIO',
    startFrame: 45,
    durationFrames: 120,
    position: 'bottom_left'
  },
  OOL_002: {
    mainText: 'INFRAESTRUTURA INVISÍVEL',
    subText: 'BACEN // REDE DO SISTEMA FINANCEIRO NACIONAL',
    categoryText: 'ARQUITETURA OCULTA',
    startFrame: 20,
    durationFrames: 110,
    position: 'center'
  },
  OOL_003: {
    mainText: '140 MILHÕES / DIA',
    subText: 'TRANSAÇÕES PROCESSADAS SEM PARAR',
    categoryText: 'VOLUME EM TEMPO REAL',
    startFrame: 30,
    durationFrames: 140,
    position: 'center'
  },
  OOL_004: {
    mainText: '8.432 TX / SEGUNDO',
    subText: 'PICO DE LIQUIDAÇÃO INSTANTÂNEA',
    categoryText: 'CAPACIDADE MÁXIMA',
    startFrame: 25,
    durationFrames: 140,
    position: 'center'
  },
  OOL_005: {
    mainText: '1,4 SEGUNDO',
    subText: 'TEMPO MÉDIO DE LIQUIDAÇÃO BRUTA',
    categoryText: 'LATÊNCIA ATÔMICA',
    startFrame: 20,
    durationFrames: 120,
    position: 'bottom_left'
  },
  OOL_006: {
    mainText: 'CAMADA 01: O CLIENTE',
    subText: 'APLICATIVO BANCÁRIO CRIPTOGRAFADO',
    categoryText: 'ORIGEM DA TRANSAÇÃO',
    startFrame: 20,
    durationFrames: 110,
    position: 'center_left'
  },
  OOL_007: {
    mainText: 'ASSINATURA DIGITAL',
    subText: 'CERTIFICADO DIGITAL ICP-BRASIL',
    categoryText: 'CHAVE CRIPTOGRÁFICA',
    startFrame: 20,
    durationFrames: 110,
    position: 'center'
  },
  OOL_008: {
    mainText: 'REDE RSFN',
    subText: 'FIBRA ÓPTICA DEDICADA DE BAIXA LATÊNCIA',
    categoryText: 'INFRAESTRUTURA FÍSICA',
    startFrame: 25,
    durationFrames: 130,
    position: 'bottom_left'
  },
  OOL_009: {
    mainText: 'PADRÃO ISO 20022',
    subText: 'MENSAGEM FINANCEIRA PACS.008',
    categoryText: 'PROTOCOLO GLOBAL',
    startFrame: 30,
    durationFrames: 120,
    position: 'center'
  },
  OOL_010: {
    mainText: 'COFRES HSM',
    subText: 'MÓDULOS DE HARDWARE CRIPTOGRÁFICO AES-256',
    categoryText: 'SEGURANÇA FÍSICA',
    startFrame: 25,
    durationFrames: 120,
    position: 'bottom_left'
  },
  OOL_011: {
    mainText: '12 MILISSEGUNDOS',
    subText: 'SÃO PAULO ➔ BARUERI ➔ BRASÍLIA',
    categoryText: 'TEMPO DE TRÂNSITO',
    startFrame: 20,
    durationFrames: 130,
    position: 'bottom_left'
  },
  OOL_012: {
    mainText: 'SPI: O CORAÇÃO DO BACEN',
    subText: 'SISTEMA DE PAGAMENTOS INSTANTÂNEOS',
    categoryText: 'NÚCLEO CENTRAL',
    startFrame: 20,
    durationFrames: 110,
    position: 'center'
  },
  OOL_013: {
    mainText: 'VALIDAÇÃO DE DESTINO',
    subText: 'DIRETÓRIO DE IDENTIFICADORES DICT',
    categoryText: 'ROTEAMENTO DE CHAVES',
    startFrame: 15,
    durationFrames: 100,
    position: 'center'
  },
  OOL_014: {
    mainText: 'CONSULTA DISTRIBUÍDA',
    subText: 'BANCO DE DADOS EM MEMÓRIA RAM',
    categoryText: 'LATÊNCIA ULTRA-BAIXA',
    startFrame: 20,
    durationFrames: 120,
    position: 'center_left'
  },
  OOL_015: {
    mainText: '800 MILHÕES DE CHAVES',
    subText: 'CPF, E-MAIL, TELEFONE E EVP',
    categoryText: 'DIRETÓRIO DICT',
    startFrame: 25,
    durationFrames: 130,
    position: 'center'
  },
  OOL_016: {
    mainText: 'BUSCA EM < 8ms',
    subText: 'RESOLUÇÃO DE CHAVE EM TEMPO REAL',
    categoryText: 'VELOCIDADE DE BUSCA',
    startFrame: 25,
    durationFrames: 130,
    position: 'center'
  },
  OOL_017: {
    mainText: 'CONTA PI (BACEN)',
    subText: 'SALDO RESERVADO DAS INSTITUIÇÕES',
    categoryText: 'LIQUIDEZ SISTÊMICA',
    startFrame: 20,
    durationFrames: 110,
    position: 'bottom_left'
  },
  OOL_018: {
    mainText: 'LIQUIDAÇÃO ATÔMICA BRUTA',
    subText: 'TRANSFERÊNCIA DEFINITIVA E IRREVOGÁVEL',
    categoryText: 'LIQUIDAÇÃO EM TEMPO REAL',
    startFrame: 30,
    durationFrames: 160,
    position: 'center'
  },
  OOL_019: {
    mainText: 'ZERO INTERMEDIÁRIOS',
    subText: 'DÉBITO E CRÉDITO SIMULTÂNEOS',
    categoryText: 'EFICIÊNCIA BANCÁRIA',
    startFrame: 20,
    durationFrames: 120,
    position: 'center'
  },
  OOL_020: {
    mainText: 'AUTORIZAÇÃO DE DÉBITO',
    subText: 'NOTIFICAÇÃO CRIPTOGRÁFICA DO SPI',
    categoryText: 'CONFIRMAÇÃO',
    startFrame: 20,
    durationFrames: 110,
    position: 'center_left'
  },
  OOL_021: {
    mainText: 'CICLO COMPLETO EM 1,4s',
    subText: 'CONTA DE DESTINO CREDITADA',
    categoryText: 'FINALIZAÇÃO',
    startFrame: 20,
    durationFrames: 110,
    position: 'bottom_left'
  },
  OOL_022: {
    mainText: 'ESCUDO INVISÍVEL',
    subText: 'CAMADA DE DEFESA ANTI-FRAUDE',
    categoryText: 'SEGURANÇA ATIVA',
    startFrame: 20,
    durationFrames: 110,
    position: 'center'
  },
  OOL_023: {
    mainText: 'IA EM 800 MILISSEGUNDOS',
    subText: 'ANÁLISE DE PADRÕES COMPORTAMENTAIS',
    categoryText: 'MOTOR COGNITIVO',
    startFrame: 25,
    durationFrames: 120,
    position: 'center'
  },
  OOL_024: {
    mainText: 'SCORE DE RISCO',
    subText: 'GEOLOCALIZAÇÃO, HORÁRIO E DISPOSITIVO',
    categoryText: 'DETECÇÃO DE GOLPES',
    startFrame: 25,
    durationFrames: 130,
    position: 'center_left'
  },
  OOL_025: {
    mainText: 'MECANISMO MED (BACEN)',
    subText: 'MECANISMO ESPECIAL DE DEVOLUÇÃO',
    categoryText: 'PROTOCOLO DE SEGURANÇA',
    startFrame: 25,
    durationFrames: 130,
    position: 'center'
  },
  OOL_026: {
    mainText: 'RETENÇÃO CAUTELAR',
    subText: 'BLOQUEIO PREVENTIVO DE ATÉ 72 HORAS',
    categoryText: 'PROTEÇÃO AO USUÁRIO',
    startFrame: 25,
    durationFrames: 140,
    position: 'center'
  },
  OOL_027: {
    mainText: 'BLINDAGEM BANCÁRIA',
    subText: 'ISOLAMENTO DE CONTAS-FANTASMA',
    categoryText: 'NEUTRALIZAÇÃO',
    startFrame: 20,
    durationFrames: 110,
    position: 'center'
  },
  OOL_028: {
    mainText: '24 HORAS POR DIA',
    subText: 'OPERAÇÃO ININTERRUPTA 365 DIAS',
    categoryText: 'DISPONIBILIDADE',
    startFrame: 15,
    durationFrames: 90,
    position: 'bottom_left'
  },
  OOL_029: {
    mainText: 'TOLERÂNCIA A FALHAS',
    subText: 'ARQUITETURA ATIVA-ATIVA SEM DOWNTIME',
    categoryText: 'RESILIÊNCIA CRÍTICA',
    startFrame: 20,
    durationFrames: 110,
    position: 'center'
  },
  OOL_030: {
    mainText: 'DATA CENTERS GÊMEOS',
    subText: 'SÃO PAULO E BRASÍLIA SINCRONIZADOS',
    categoryText: 'REDUNDÂNCIA GEOGRÁFICA',
    startFrame: 20,
    durationFrames: 110,
    position: 'center'
  },
  OOL_031: {
    mainText: 'CORTE DE FIBRA',
    subText: 'SIMULAÇÃO DE RUPTURA DA ROTA PRINCIPAL',
    categoryText: 'TESTE DE CONTINGÊNCIA',
    startFrame: 25,
    durationFrames: 130,
    position: 'center'
  },
  OOL_032: {
    mainText: 'DESVIO EM 15ms',
    subText: 'ROTEAMENTO AUTOMÁTICO DE BACKUP',
    categoryText: 'AUTOCURA DE REDE',
    startFrame: 25,
    durationFrames: 130,
    position: 'center'
  },
  OOL_033: {
    mainText: 'GERADORES DIESEL EM 2s',
    subText: 'AUTONOMIA TOTAL EM APAGÕES',
    categoryText: 'INFRAESTRUTURA ENERGÉTICA',
    startFrame: 20,
    durationFrames: 120,
    position: 'bottom_left'
  },
  OOL_034: {
    mainText: 'TESTE: BLACK FRIDAY',
    subText: '> 15.000 TRANSAÇÕES POR SEGUNDO',
    categoryText: 'ESTRESSE MÁXIMO',
    startFrame: 25,
    durationFrames: 140,
    position: 'center'
  },
  OOL_035: {
    mainText: 'ESCALA ELÁSTICA',
    subText: 'CLUSTER DISTRIBUÍDO DE PROCESSAMENTO',
    categoryText: 'ALTA PERFORMANCE',
    startFrame: 20,
    durationFrames: 110,
    position: 'center'
  },
  OOL_036: {
    mainText: 'ZERO FILAS',
    subText: 'PROCESSAMENTO EM PARALELO MASSIVO',
    categoryText: 'FLUXO CONTÍNUO',
    startFrame: 20,
    durationFrames: 120,
    position: 'center'
  },
  OOL_037: {
    mainText: 'O FUTURO DO PIX',
    subText: 'PIX AUTOMÁTICO E PIX INTERNACIONAL',
    categoryText: 'PRÓXIMA EVOLUÇÃO',
    startFrame: 15,
    durationFrames: 100,
    position: 'center'
  },
  OOL_038: {
    mainText: 'INTEGRAÇÃO GLOBAL',
    subText: 'CONEXÃO COM SISTEMAS NEXUS & BIS',
    categoryText: 'PAGAMENTO TRANSFRONTEIRIÇO',
    startFrame: 20,
    durationFrames: 120,
    position: 'center'
  },
  OOL_039: {
    mainText: 'REVOLUÇÃO SILENCIOSA',
    subText: 'A MAIOR REDE DE PAGAMENTOS DO PLANETA',
    categoryText: 'IMPACTO GLOBAL',
    startFrame: 30,
    durationFrames: 160,
    position: 'center'
  },
  OOL_040: {
    mainText: 'ENGENHARIA BRASILEIRA',
    subText: '1,4 SEGUNDO QUE MOVE O PAÍS',
    categoryText: 'ORGULHO TECNOLÓGICO',
    startFrame: 30,
    durationFrames: 170,
    position: 'center'
  },
  OOL_041: {
    mainText: 'A MÁQUINA NUNCA DORME',
    subText: 'INFRAESTRUTURA DE SOBERANIA NACIONAL',
    categoryText: 'OPERANDO AGORA',
    startFrame: 25,
    durationFrames: 130,
    position: 'center'
  },
  OOL_042: {
    mainText: 'O OUTRO LADO',
    subText: 'DOCUMENTÁRIOS DE ENGENHARIA OCULTA',
    categoryText: 'CANAL OFICIAL',
    startFrame: 15,
    durationFrames: 100,
    position: 'center'
  }
};

// Modos variados de movimento de câmera por cena para criar dinamismo visual constante
const CAMERA_MODES: Array<'crash_push_in' | 'slow_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift'> = [
  'crash_push_in',
  'pan_right',
  'slow_push_in',
  'dramatic_pull_out',
  'pan_left',
  'cinematic_drift',
  'crash_push_in',
  'pan_right',
  'slow_push_in',
  'dramatic_pull_out'
];

/**
 * Composição Mestre Oficial do Episódio 01: "O Outro Lado do Pix: A Máquina Invisível de 1,4 Segundo"
 * Renderização Hiperdinâmica (Padrão neo / Johnny Harris / Vox) com 42 Cenas Individuais,
 * Cortes Rápidos a Cada 3s, Parallax 2.5D, Tipografia Cinética Editorial e Motion Graphics Nativos.
 */
export const Episode01Pix: React.FC<Episode01PixProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  return (
    <AbsoluteFill style={{backgroundColor: '#060709', color: '#F4F4F0', overflow: 'hidden'}}>
      {/* 1. Trilha Contínua de Narração Oficial — GEORGE (ElevenLabs) Nivelada em -16 LUFS */}
      <Audio src={staticFile('postproduction/narration.mp3')} volume={1.0} />

      {/* 1.1 Suíte Completa de Sound Design: SFX, Foley, Risers, Impacts, Braams & Dynamic Music Bed Ducking (-24dB) */}
      <Episode01SoundTrack />

      {/* 2. Execução Sequencial das 42 Cenas Dinâmicas */}
      {EPISODE_01_SCENES.map((scene, sceneIndex) => {
        const {type, config} = scene.visual;
        const callout = EDITORIAL_CALLOUTS[scene.id];
        const cameraMode = CAMERA_MODES[sceneIndex % CAMERA_MODES.length];

        return (
          <Sequence
            key={scene.id}
            from={scene.from}
            durationInFrames={scene.durationInFrames}
            name={scene.id}
          >
            <AbsoluteFill style={{backgroundColor: '#060709'}}>
              {/* CAMADA 1: Base Fotográfica / Vídeo 35mm com Câmera Parallax 2.5D Agressiva */}
              {type === 'smartphone_mockup' && (
                <>
                  <DynamicDocumentaryMedia
                    sceneId={scene.id}
                    durationInFrames={scene.durationInFrames}
                    kenBurns={cameraMode}
                    zoomIntensity={1.25}
                    opacity={0.35}
                    filter="blur(3px)"
                  />
                  <SmartphoneBankingMockup
                    amount={config?.amount || 'R$ 1,00'}
                    stage={config?.stage || 'confirming'}
                  />
                </>
              )}

              {type === 'kinetic_counter' && (
                <>
                  <DynamicDocumentaryMedia
                    sceneId={scene.id}
                    durationInFrames={scene.durationInFrames}
                    kenBurns={cameraMode}
                    zoomIntensity={1.28}
                    opacity={0.28}
                    filter="blur(3px)"
                  />
                  <KineticNumberCounter
                    startValue={config?.startValue || 0}
                    endValue={config?.endValue || 1000000}
                    suffix={config?.suffix || ''}
                    label={config?.label || ''}
                    sublabel={config?.sublabel || ''}
                    durationInFrames={Math.min(60, scene.durationInFrames)}
                    accentColor={accentColor}
                  />
                </>
              )}

              {type === 'stopwatch' && (
                <>
                  <DynamicDocumentaryMedia
                    sceneId={scene.id}
                    durationInFrames={scene.durationInFrames}
                    kenBurns={cameraMode}
                    zoomIntensity={1.28}
                    opacity={0.25}
                    filter="blur(4px)"
                  />
                  <AtomicStopwatch
                    startMs={config?.startMs || 0}
                    endMs={config?.endMs || 1400}
                    durationInFrames={scene.durationInFrames}
                    label={config?.label}
                    sublabel={config?.sublabel}
                  />
                </>
              )}

              {type === 'iso20022_packet' && (
                <>
                  <DynamicDocumentaryMedia
                    sceneId={scene.id}
                    durationInFrames={scene.durationInFrames}
                    kenBurns={cameraMode}
                    zoomIntensity={1.26}
                    opacity={0.25}
                  />
                  <Iso20022PacketInspector
                    amount={config?.amount || 'R$ 1,00'}
                    latencyMs={config?.latencyMs || 1.4}
                  />
                </>
              )}

              {type === 'cyber_map' && (
                <CyberMapTrace
                  cityName="SÃO PAULO ➔ BARUERI ➔ BRASÍLIA"
                  coordinates="-23.5505, -46.6333"
                  routeTitle="DUTO DE FIBRA SUBTERRÂNEA RSFN // SPI-01"
                  accentColor={accentColor}
                  telemetryColor={telemetryColor}
                />
              )}

              {type === 'research_lapse' && (
                <OnScreenResearchLapse
                  queryText={config?.query || 'BACEN // SPI PROTOCOL // DICT_DIRECTORY'}
                  sourceText={config?.source || 'BANCO CENTRAL DO BRASIL'}
                />
              )}

              {type === 'laser_wipe_schematic' && (
                <LaserRevealWipe
                  baseMedia={
                    <DynamicDocumentaryMedia
                      sceneId={scene.id}
                      mediaPath={config?.media}
                      kenBurns={cameraMode}
                      durationInFrames={scene.durationInFrames}
                    />
                  }
                  xrayMedia={
                    <TechnicalCutawaySchematic
                      systemTitle={config?.title || 'SPI DATA CORE - CLUSTER SP-01'}
                      compartmentName={config?.compartment || 'MÓDULO DE HARDWARE HSM (AES-256)'}
                    />
                  }
                  direction="vertical"
                  splitPosition={0.5}
                  animateSweep={true}
                  sweepStartFrame={15}
                  sweepDurationFrames={45}
                />
              )}

              {type === 'laser_wipe_dossier' && (
                <LaserRevealWipe
                  baseMedia={
                    <DynamicDocumentaryMedia
                      sceneId={scene.id}
                      mediaPath={config?.media}
                      kenBurns={cameraMode}
                      durationInFrames={scene.durationInFrames}
                    />
                  }
                  xrayMedia={
                    <LaserScanDossier
                      documentTitle={config?.title || 'BACEN — PROTOCOLO DE RETENÇÃO CAUTELAR (MED)'}
                      criticalClause="CLÁUSULA 7.1: BLOQUEIO PREVENTIVO EM 72 HORAS"
                    />
                  }
                  direction="vertical"
                  splitPosition={0.52}
                  animateSweep={true}
                  sweepStartFrame={10}
                  sweepDurationFrames={40}
                />
              )}

              {type === 'firefly_take' && (
                <>
                  <DynamicDocumentaryMedia
                    sceneId={scene.id}
                    mediaPath={config?.media}
                    kenBurns={cameraMode}
                    zoomIntensity={1.30}
                    durationInFrames={scene.durationInFrames}
                  />

                  {/* CAMADA 2: Iluminação Spotlight Volumétrica Chiaroscuro na Base Visual */}
                  <DynamicSpotlightFocus
                    durationInFrames={scene.durationInFrames}
                    intensity={0.45}
                  />

                  {/* CAMADA 3: Tipografia Cinética Editorial (Apenas em Cenas Cinematográficas Puras) */}
                  {callout && (
                    <KineticEditorialCallout
                      mainText={callout.mainText}
                      subText={callout.subText}
                      categoryText={callout.categoryText}
                      startFrame={callout.startFrame || 20}
                      durationFrames={callout.durationFrames || Math.max(60, scene.durationInFrames - 30)}
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

      {/* 3. Acabamento Global Cinematográfico Denis Villeneuve 35mm (Formato de Publicação Limpo) */}
      <AnamorphicCinematicOverlay
        showLetterbox={true}
        showFramingBrackets={false}
        showFilmGrain={true}
        accentColor={accentColor}
      />
    </AbsoluteFill>
  );
};
