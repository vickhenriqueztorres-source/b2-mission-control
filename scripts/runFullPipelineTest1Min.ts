import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync, execSync } from 'child_process';
import { ElevenLabsAdapter } from '../adapters/elevenLabsAdapter';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';
import { PrdComplianceChecker } from '../pipeline/prdComplianceChecker';
import { ArtifactRegistry } from '../pipeline/artifactRegistry';
import { ProductionSafetyGuard } from '../config/productionSafetyGuard';
import { HybridVideoEngine, HybridSceneInput } from '../pipeline/hybridVideoEngine';

const EPISODE_ID = 'OOL-TEST-1MIN';
const RUN_DIR = path.join(process.cwd(), 'runs', EPISODE_ID);
const EXECUTION_DIR = path.join(RUN_DIR, 'editorial', 'execution', 'scenes');
const POSTPROD_DIR = path.join(RUN_DIR, 'postproduction');
const THUMB_DIR = path.join(POSTPROD_DIR, 'thumbnails');
const AUDIO_SCENES_DIR = path.join(RUN_DIR, 'audio_scenes');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PUBLIC_TEST_DIR = path.join(PUBLIC_DIR, 'postproduction_test1min');
const PUBLIC_EXECUTION_DIR = path.join(PUBLIC_DIR, 'editorial', 'execution');

// Assegura criação de todas as pastas necessárias
fs.mkdirSync(EXECUTION_DIR, { recursive: true });
fs.mkdirSync(POSTPROD_DIR, { recursive: true });
fs.mkdirSync(THUMB_DIR, { recursive: true });
fs.mkdirSync(AUDIO_SCENES_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_TEST_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_EXECUTION_DIR, { recursive: true });

export const TEST_1MIN_SCENES: HybridSceneInput[] = [
  {
    scene_id: 'OOL_001',
    chapter_id: 'CH_01',
    chapter_title: 'O EFEITO COTIDIANO',
    name: 'O Corte Oculto no Pavimento',
    voiceover_text: 'Toda vez que você passa por uma rodovia ou cruza um semáforo inteligente, você pisa sobre uma fenda cortada a laser no asfalto.',
    visual_subject: 'Câmera avançando em direção a estrutura de concreto monumental e asfalto com fenda escura cortada a laser em 35mm chiaroscuro.',
    take_type: 'CINEMATIC_TAKE',
    callout_main: 'FENDA DE DIAMANTE',
    callout_sub: 'CORTE MILIMÉTRICO NO PAVIMENTO ASFÁLTICO',
    callout_category: 'EVIDÊNCIA DE CAMPO // NÓ 01',
    motion_mode: 'slow_push_in',
    tags: ['concreto', 'estrutura', 'rodovia', 'asfalto', 'camera_push', '35mm'],
    required_category: 'infrastructure'
  },
  {
    scene_id: 'OOL_002',
    chapter_id: 'CH_01',
    chapter_title: 'O EFEITO COTIDIANO',
    name: 'A Resina Epóxi de Selagem',
    voiceover_text: 'Essa linha preta não é uma rachadura qualquer. Ela é selada com resina de poliuretano industrial para resistir a quarenta toneladas de pressão.',
    visual_subject: 'Carro cruzando rua residencial observada em ângulo documental 35mm com asfalto e selagem de polímero.',
    take_type: 'CINEMATIC_TAKE',
    callout_main: 'POLÍMERO INDUSTRIAL',
    callout_sub: 'SELAGEM HERMÉTICA CONTRA ÁGUA E IMPACTO',
    callout_category: 'ENGENHARIA DE MATERIAIS // RESINA',
    motion_mode: 'pan_right',
    tags: ['carro', 'veiculo', 'rua', 'transito', 'asfalto'],
    required_category: 'infrastructure'
  },
  {
    scene_id: 'OOL_003',
    chapter_id: 'CH_02',
    chapter_title: 'O MECANISMO OCULTO',
    name: 'A Bobina de Cobre Subterrânea',
    voiceover_text: 'Apenas cinco centímetros abaixo da superfície, há uma espira retangular com quatro voltas de cabo de cobre puro.',
    visual_subject: 'Conector de dados e cabo óptico com feixes de laser e dados transmitidos em alta velocidade.',
    take_type: 'CINEMATIC_TAKE',
    callout_main: 'ESPIRA DE COBRE',
    callout_sub: 'BOBINA DE INDUÇÃO ENTERRADA A 5 CM',
    callout_category: 'INFRAESTRUTURA // CONDUTOR',
    motion_mode: 'crash_push_in',
    tags: ['fibra_otica', 'conector', 'dados', 'cabo', 'rede'],
    required_category: 'cyber_telemetry'
  },
  {
    scene_id: 'OOL_004',
    chapter_id: 'CH_02',
    chapter_title: 'O MECANISMO OCULTO',
    name: 'O Intervalo Métrico de Calibração',
    voiceover_text: 'Exatamente três metros à frente, uma segunda espira idêntica espera a chegada do veículo.',
    visual_subject: 'Painel técnico de engenharia com diagrama esquemático mostrando dois laços indutivos com cota métrica de 3,00 metros.',
    take_type: 'KEYFRAME_DOSSIER',
    integrated_text: 'DISTÂNCIA PADRÃO: 3,00 METROS',
    callout_main: '3,00 METROS',
    callout_sub: 'DISTÂNCIA FIXA ENTRE LAÇOS INDUTIVOS',
    callout_category: 'CALIBRAÇÃO MÉTRICA // INMETRO',
    motion_mode: 'slow_push_in'
  },
  {
    scene_id: 'OOL_005',
    chapter_id: 'CH_03',
    chapter_title: 'A FÍSICA DO SISTEMA',
    name: 'O Campo Magnético de Alta Frequência',
    voiceover_text: 'O sistema emite uma corrente contínua oscilando entre vinte e cinquenta quilohertz, gerando uma barreira invisível de fluxo magnético.',
    visual_subject: 'Mão com luva industrial operando válvula de precisão e controle de fluxo em tubulação de alta pressão.',
    take_type: 'CINEMATIC_TAKE',
    callout_main: '20 A 50 KHZ',
    callout_sub: 'CAMPO OSCILATÓRIO DE ALTA FREQUÊNCIA',
    callout_category: 'FÍSICA ELETROMAGNÉTICA // CAMPO',
    motion_mode: 'cinematic_drift',
    tags: ['valvula', 'mao', 'luva', 'pressao', 'operador'],
    required_category: 'industrial'
  },
  {
    scene_id: 'OOL_006',
    chapter_id: 'CH_03',
    chapter_title: 'A FÍSICA DO SISTEMA',
    name: 'A Perturbação de Indutância',
    voiceover_text: 'Quando a carcaça de metal do seu carro entra no campo, as correntes de Foucault reduzem a indutância da bobina em milissegundos.',
    visual_subject: 'Trem de carga pesado com carcaça de aço maciço em movimento lateral sobre trilhos em chiaroscuro.',
    take_type: 'CINEMATIC_TAKE',
    callout_main: 'DELTA INDUTÂNCIA',
    callout_sub: 'VARIAÇÃO PROVOCADA PELA MASSA DO CHASSI',
    callout_category: 'CORRENTES DE FOUCAULT // FLUXO',
    motion_mode: 'pan_left',
    tags: ['trem', 'ferrovia', 'carga', 'trilhos', 'locomotiva'],
    required_category: 'infrastructure'
  },
  {
    scene_id: 'OOL_007',
    chapter_id: 'CH_04',
    chapter_title: 'O CÁLCULO INSTANTÂNEO',
    name: 'O Processamento em Microssegundos',
    voiceover_text: 'O oscilador eletrônico registra o intervalo exato entre o primeiro e o segundo laço, dividindo a distância pelo tempo em tempo real.',
    visual_subject: 'Gabinete de servidor rodoviário com processador digital DSP e LEDs de telemetria ciano calculando tempo delta.',
    take_type: 'KEYFRAME_DOSSIER',
    integrated_text: 'V = ΔS / ΔT (MICROSSEGUNDOS)',
    callout_main: 'V = ΔS / ΔT',
    callout_sub: 'CÁLCULO EXECUTADO EM MENOS DE 1 MS',
    callout_category: 'CINEMÁTICA PURA // DSP',
    motion_mode: 'slow_push_in'
  },
  {
    scene_id: 'OOL_008',
    chapter_id: 'CH_05',
    chapter_title: 'O PONTO CRÍTICO',
    name: 'A Deformação do Asfalto a 60°C',
    voiceover_text: 'Mas o asfalto dilata com o calor escaldante de sessenta graus, criando o risco de micro-distorções na distância real.',
    visual_subject: 'Nuvens densas e atmosfera carregada se movendo sobre área urbana em escala documental.',
    take_type: 'CINEMATIC_TAKE',
    callout_main: 'DILATAÇÃO 60°C',
    callout_sub: 'PONTO DE FALHA: DEFORMAÇÃO TÉRMICA DA PISTA',
    callout_category: 'ALERTA CRÍTICO // GARGALO',
    motion_mode: 'dramatic_pull_out',
    tags: ['nuvens', 'timelapse', 'bairro', 'ceu', 'atmosfera'],
    required_category: 'atmospheric'
  },
  {
    scene_id: 'OOL_009',
    chapter_id: 'CH_05',
    chapter_title: 'A AUDITORIA REGULATÓRIA',
    name: 'A Margem Legal do INMETRO',
    voiceover_text: 'É exatamente por essa variação física que a metrologia brasileira exige a tolerância de sete quilômetros por hora.',
    visual_subject: 'Selo oficial de metrologia legal e documento regulatório com marca d água do INMETRO em vidro fosco.',
    take_type: 'KEYFRAME_DOSSIER',
    integrated_text: 'TOLERÂNCIA INMETRO: ±7 KM/H',
    callout_main: '±7 KM/H',
    callout_sub: 'MARGEM REGULATÓRIA OBRIGATÓRIA POR LEI',
    callout_category: 'AUDITORIA OFICIAL // INMETRO',
    motion_mode: 'slow_push_in'
  },
  {
    scene_id: 'OOL_010',
    chapter_id: 'CH_06',
    chapter_title: 'A ASSINATURA EDITORIAL',
    name: 'Investigar. Revelar. Compreender.',
    voiceover_text: 'O sistema não descansa. Investigar, revelar e compreender o que acontece depois que você acelera.',
    visual_subject: 'Skyline urbano de metrópole ao amanhecer com luz suave, horizonte amplo e névoa atmosférica 35mm.',
    take_type: 'CINEMATIC_TAKE',
    callout_main: 'INVESTIGAR. REVELAR. COMPREENDER.',
    callout_sub: 'O QUE ACONTECE DEPOIS QUE VOCÊ CLICA, COMPRA OU ACELERA',
    callout_category: 'CANAL O OUTRO LADO // MASTER',
    motion_mode: 'slow_push_in',
    tags: ['skyline', 'cidade', 'amanhecer', 'predios', 'horizonte'],
    required_category: 'atmospheric'
  }
];

async function runTestPipeline() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║ 🚀 TESTE END-TO-END DO PIPELINE COMPLETO // O OUTRO LADO (1 MINUTO) ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  ProductionSafetyGuard.assertSafeForProduction();

  // ══════════════════════════════════════════════════════════════════════
  // ETAPA 1: Narração Neural Oficial ElevenLabs (Chris) & scene_timings.json
  // ══════════════════════════════════════════════════════════════════════
  console.log('🎙️ [ETAPA 1/7] Síntese de Narração Oficial (ElevenLabs — Chris)...');
  const elevenLabs = new ElevenLabsAdapter();
  await elevenLabs.initialize();

  const sceneTimings: any[] = [];
  let currentFrame = 0;
  const audioFilesToConcat: string[] = [];

  for (let i = 0; i < TEST_1MIN_SCENES.length; i++) {
    const sc = TEST_1MIN_SCENES[i];
    const outAudioPath = path.join(AUDIO_SCENES_DIR, `${sc.scene_id}.mp3`);

    console.log(`  [${i + 1}/${TEST_1MIN_SCENES.length}] Sintetizando áudio para ${sc.scene_id} (${sc.name})...`);
    try {
      await elevenLabs.synthesizeText(sc.voiceover_text, outAudioPath);
    } catch (err: any) {
      console.warn(`    ⚠️ ElevenLabs API (${err.message}). Usando síntese neural de contingência.`);
      execSync(`python -m edge_tts --voice pt-BR-AntonioNeural --text "${sc.voiceover_text.replace(/"/g, '')}" --write-media "${outAudioPath}"`);
    }

    // Mede a duração física exata com ffprobe
    const probe = spawnSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      outAudioPath
    ], { encoding: 'utf8' });

    let dur = parseFloat(probe.stdout.trim()) || 5.5;
    dur = Math.round(dur * 100) / 100;
    const frames = Math.round(dur * 30);

    sceneTimings.push({
      sceneId: sc.scene_id,
      chapterId: sc.chapter_id,
      chapterTitle: sc.chapter_title,
      name: sc.name,
      voiceover: sc.voiceover_text,
      durationSeconds: dur,
      durationFrames: frames,
      startFrame: currentFrame,
      endFrame: currentFrame + frames,
      audioFile: outAudioPath,
      takeType: sc.take_type,
      integratedText: sc.integrated_text,
      calloutMain: sc.callout_main,
      calloutSub: sc.callout_sub,
      calloutCategory: sc.callout_category,
      motionMode: sc.motion_mode
    });

    currentFrame += frames;
    audioFilesToConcat.push(outAudioPath);
  }

  // Concatenação e Nivelamento Master (-16 LUFS EBU R128)
  const concatListPath = path.join(RUN_DIR, 'concat_list.txt');
  fs.writeFileSync(concatListPath, audioFilesToConcat.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'), 'utf8');

  const rawNarrationPath = path.join(POSTPROD_DIR, 'raw_narration.mp3');
  execSync(`ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i "${concatListPath}" -c copy "${rawNarrationPath}"`);

  const masterNarrationPath = path.join(POSTPROD_DIR, 'narration.mp3');
  execSync(`ffmpeg -y -hide_banner -loglevel error -i "${rawNarrationPath}" -af "loudnorm=I=-16:TP=-1.5:LRA=7" -ar 48000 -b:a 256k "${masterNarrationPath}"`);

  // Mede com precisão a duração final do arquivo master narration.mp3
  const probeMaster = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    masterNarrationPath
  ], { encoding: 'utf8' });
  const masterDurationSeconds = parseFloat(probeMaster.stdout.trim()) || (currentFrame / 30);
  const totalFrames = Math.round(masterDurationSeconds * 30);

  // Alinha milimetricamente o último frame
  const lastScene = sceneTimings[sceneTimings.length - 1];
  lastScene.endFrame = totalFrames;
  lastScene.durationFrames = lastScene.endFrame - lastScene.startFrame;
  lastScene.durationSeconds = lastScene.durationFrames / 30;

  // Copia para a pasta public do Remotion
  fs.copyFileSync(masterNarrationPath, path.join(PUBLIC_TEST_DIR, 'narration.mp3'));
  fs.unlinkSync(concatListPath);
  fs.unlinkSync(rawNarrationPath);

  console.log(`  ✅ Narração Master gerada! Duração: ${masterDurationSeconds.toFixed(2)}s (${totalFrames} frames a 30 FPS)`);

  // Salva scene_timings.json com o formato compatível com o gate
  const timingsData = {
    totalDurationSeconds: masterDurationSeconds,
    totalDurationFrames: totalFrames,
    scenes: sceneTimings
  };
  fs.writeFileSync(path.join(POSTPROD_DIR, 'scene_timings.json'), JSON.stringify(timingsData, null, 2), 'utf8');

  // Atualiza remotion/episodeTest1MinTimelineData.ts com os timings reais
  const timelineTs = `export interface SceneTimelineItem {
  sceneId: string;
  chapterId: string;
  chapterTitle: string;
  name: string;
  voiceover: string;
  durationSeconds: number;
  durationFrames: number;
  startFrame: number;
  endFrame: number;
  takeType: 'KEYFRAME_DOSSIER' | 'CINEMATIC_TAKE';
  integratedText?: string;
  calloutMain?: string;
  calloutSub?: string;
  calloutCategory?: string;
  motionMode?: 'slow_push_in' | 'crash_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift';
  audioFile?: string;
}

export const EPISODE_TEST_1MIN_TOTAL_FRAMES = ${totalFrames};
export const EPISODE_TEST_1MIN_TOTAL_SECONDS = ${masterDurationSeconds.toFixed(2)};

export const EPISODE_TEST_1MIN_TIMELINE: SceneTimelineItem[] = ${JSON.stringify(sceneTimings, null, 2)};
`;
  fs.writeFileSync(path.join(process.cwd(), 'remotion', 'episodeTest1MinTimelineData.ts'), timelineTs, 'utf8');

  // ══════════════════════════════════════════════════════════════════════
  // ETAPA 2 & 3: Video Engine Híbrido (VideoRepositoryMatcher + Firefly On-Demand)
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n🎬 [ETAPA 2 & 3/7] Video Engine Híbrido (Banco de Vídeos + Firefly On-Demand)...');
  const hybridEngine = new HybridVideoEngine();
  const videoResult = await hybridEngine.processEpisodeScenes({
    runId: EPISODE_ID,
    scenes: TEST_1MIN_SCENES,
    runDirectory: RUN_DIR,
    publicExecutionDirectory: PUBLIC_EXECUTION_DIR,
    mode: 'smart'
  });

  console.log(`  📊 Resumo do Engine Híbrido:`);
  console.log(`     • Cenas do Banco de Vídeos: ${videoResult.matchedFromBank}`);
  console.log(`     • Cenas Geradas no Firefly: ${videoResult.generatedByFirefly}`);
  console.log(`     • Cenas Dossiê 2.5D: ${videoResult.dossiers25D}`);

  // ══════════════════════════════════════════════════════════════════════
  // ETAPA 4: YouTube Packaging RAG & Metadados SEO
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📦 [ETAPA 4/7] Geração do Pacote de Publicação & Metadados SEO...');
  const packaging = {
    episode_id: EPISODE_ID,
    video_title_candidates: [
      "O Segredo Subterrâneo no Asfalto que Você Cruza Todo Dia",
      "Como o Radar Sabe Sua Velocidade no Escuro Absoluto",
      "A Física Invisível que Mede Seu Carro em Microssegundos",
      "A Armadilha Magnética Debaixo do Pavimento"
    ],
    selected_title: "O Segredo Subterrâneo no Asfalto que Você Cruza Todo Dia",
    seo_tags: [
      "laco indutivo", "radar de velocidade", "engenharia de transito", "como funciona radar",
      "o outro lado", "ciencia e tecnologia", "fisica eletromagnetica", "inmetro radar"
    ],
    description_blocks: {
      hook: "Você pisa no freio quando vê a torre de radar, mas o verdadeiro sensor está enterrado sob as suas rodas.",
      investigation_summary: "Neste episódio teste de 1 minuto de O Outro Lado, investigamos o corte de diamante no asfalto, a física da bobina de indução de 50 kHz e o cálculo de velocidade executado em microssegundos.",
      timestamps: [
        "0:00 - O Corte Oculto no Pavimento",
        "0:12 - A Bobina de Cobre Subterrânea",
        "0:24 - O Campo Magnético de 50 kHz",
        "0:36 - O Cálculo em Microssegundos (V = ΔS / ΔT)",
        "0:48 - O Ponto de Falha e Margem INMETRO"
      ],
      brand_signature: "INVESTIGAR. REVELAR. COMPREENDER.\nO Outro Lado // O que acontece depois que você clica, compra, liga ou aperta."
    }
  };

  fs.writeFileSync(path.join(POSTPROD_DIR, 'youtube-metadata.json'), JSON.stringify(packaging, null, 2), 'utf8');

  const descriptionTxt = `${packaging.selected_title}

${packaging.description_blocks.hook}

${packaging.description_blocks.investigation_summary}

TIMESTAMPS:
${packaging.description_blocks.timestamps.join('\n')}

TAGS:
${packaging.seo_tags.join(', ')}

${packaging.description_blocks.brand_signature}
`;
  fs.writeFileSync(path.join(POSTPROD_DIR, 'description.txt'), descriptionTxt, 'utf8');

  // ══════════════════════════════════════════════════════════════════════
  // ETAPA 5: Renderização das 3 Thumbnails 4K (3840x2160 Industrial X-Ray)
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n🎨 [ETAPA 5/7] Renderização das 3 Thumbnails 4K (3840x2160)...');
  generate4KThumbnails(THUMB_DIR);

  // ══════════════════════════════════════════════════════════════════════
  // ETAPA 6: Gatekeeper Determinístico de Contratos & Registro Canônico
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n🛡️ [ETAPA 6/7] Auditoria de Contratos (PipelineContractGate) & Artifact Registry...');
  const auditReport = PipelineContractGate.auditRun({
    runId: EPISODE_ID,
    stageScope: 'FULL_PACKAGE'
  });
  PipelineContractGate.printReport(auditReport);

  if (!auditReport.passed) {
    console.error('❌ O Gatekeeper Determinístico detectou falhas contratuais!');
    process.exit(1);
  }

  const registry = new ArtifactRegistry();
  const regSummary = registry.registerRun(RUN_DIR, EPISODE_ID);
  console.log(`  🏷️ Handle Canônico Atribuído: ${regSummary.handle}`);

  // ══════════════════════════════════════════════════════════════════════
  // ETAPA 7: Renderização Remotion Master (1080p MP4)
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n🎞️ [ETAPA 7/7] Renderização do Vídeo Master via Remotion (1080p, 60s)...');
  const finalVideoPath = path.join(RUN_DIR, 'final_master.mp4');

  const remotionCmd = `npx remotion render remotion/index.ts EpisodeTest1Min "${finalVideoPath}" --concurrency=2 --gl=angle`;
  console.log(`  Executando: ${remotionCmd}`);
  execSync(remotionCmd, { stdio: 'inherit' });

  // Validação final do vídeo gerado com ffprobe
  const finalProbe = PipelineContractGate.probeMedia(finalVideoPath);
  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log('🎉 PIPELINE COMPLETO TESTADO E CONCLUÍDO COM 100% DE SUCESSO!');
  console.log(`📹 Vídeo Master: ${finalVideoPath}`);
  console.log(`⏱️ Duração: ${finalProbe.duration.toFixed(2)}s | Resolução: ${finalProbe.width}x${finalProbe.height} | Codec: ${finalProbe.codec}`);
  console.log('══════════════════════════════════════════════════════════════════════\n');
}

function generate4KThumbnails(targetDir: string) {
  const variants = [
    {
      name: 'variant_a_mechanism',
      filename: 'thumbnail_variant_a_mechanism.png',
      props: {
        baseImageSrc: 'editorial/execution/OOL_001/firefly_start_frame.png',
        headlineLines: ['O SEGREDO', 'SOB O', 'ASFALTO.'],
        subheadline: 'A FÍSICA INVISÍVEL QUE CALCULA SUA VELOCIDADE NO ESCURO.',
        coordinates: '23.5505° S, 46.6333° W',
        textSide: 'LEFT',
        accentColor: '#FF5500',
        telemetryColor: '#00F0FF',
        revealPercentage: 88
      }
    },
    {
      name: 'variant_b_consequence',
      filename: 'thumbnail_variant_b_consequence.png',
      props: {
        baseImageSrc: 'editorial/execution/OOL_004/firefly_start_frame.png',
        headlineLines: ['NÃO É A', 'CÂMERA NO', 'POSTE.'],
        subheadline: 'O VERDADEIRO SENSOR ENTERRADO NA PISTA.',
        coordinates: '22.9068° S, 43.1729° W',
        textSide: 'LEFT',
        accentColor: '#FF5500',
        telemetryColor: '#00F0FF',
        revealPercentage: 94
      }
    },
    {
      name: 'variant_c_final_handoff',
      filename: 'thumbnail_variant_c_final_handoff.png',
      props: {
        baseImageSrc: 'editorial/execution/OOL_007/firefly_start_frame.png',
        headlineLines: ['ARMADILHA', 'DE LAÇO', 'MAGNÉTICO.'],
        subheadline: 'COMO A INDUÇÃO MEDE O CARRO EM MICROSSEGUNDOS.',
        coordinates: '15.7975° S, 47.8919° W',
        textSide: 'LEFT',
        accentColor: '#FF5500',
        telemetryColor: '#00F0FF',
        revealPercentage: 76
      }
    }
  ];

  for (const v of variants) {
    const outPng = path.join(targetDir, v.filename);
    const propsJson = JSON.stringify(v.props, null, 2);
    const tempPropsPath = path.join(targetDir, `props_${v.name}.json`);
    fs.writeFileSync(tempPropsPath, propsJson, 'utf8');

    const cmd = `npx remotion still remotion/index.ts HslThumbnail "${outPng}" --props="${tempPropsPath}" --image-format=png --gl=angle`;
    console.log(`  🖼️ [4K THUMBNAIL] Renderizando ${v.filename}...`);
    execSync(cmd, { stdio: 'inherit' });
    if (fs.existsSync(tempPropsPath)) fs.unlinkSync(tempPropsPath);
  }

  // Sincroniza thumbnail_variant_c_official.png
  const offSrc = path.join(targetDir, 'thumbnail_variant_c_final_handoff.png');
  const offDst = path.join(targetDir, 'thumbnail_variant_c_official.png');
  fs.copyFileSync(offSrc, offDst);
}

runTestPipeline().catch((err) => {
  console.error('❌ ERRO NO PIPELINE:', err);
  process.exit(1);
});
