import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { spawnSync, execSync } from 'child_process';
import { RADAR_ASFALTO_CHAPTERS, EPISODE_05_SEED } from '../hsl/editorial/config/video5RadarEpisodeSeed';
import { ElevenLabsAdapter } from '../adapters/elevenLabsAdapter';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';
import { PrdComplianceChecker } from '../pipeline/prdComplianceChecker';
import { ArtifactRegistry } from '../pipeline/artifactRegistry';
import { buildFireflyPrompt } from '../contracts/buildFireflyPrompt';

const episodeId = 'OOL-EP05-RADAR-ASFALTO';
const runDir = path.join(process.cwd(), 'runs', episodeId);
const executionDir = path.join(runDir, 'editorial', 'execution', 'scenes');
const postprodDir = path.join(runDir, 'postproduction');
const thumbDir = path.join(postprodDir, 'thumbnails');
const audioScenesDir = path.join(runDir, 'audio_scenes');
const publicDir = path.join(process.cwd(), 'public');
const publicEp05Dir = path.join(publicDir, 'postproduction_ep05');
const publicExecutionDir = path.join(publicDir, 'editorial', 'execution');

fs.mkdirSync(executionDir, { recursive: true });
fs.mkdirSync(postprodDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });
fs.mkdirSync(audioScenesDir, { recursive: true });
fs.mkdirSync(publicEp05Dir, { recursive: true });
fs.mkdirSync(publicExecutionDir, { recursive: true });

async function main() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('📸 PRODUÇÃO MASTER END-TO-END — O OUTRO LADO DO RADAR DE VELOCIDADE (EP05)');
  console.log('══════════════════════════════════════════════════════════════════\n');

  // 1. Coletar todas as 50 cenas
  const allScenes = RADAR_ASFALTO_CHAPTERS.flatMap((ch) =>
    ch.scenes.map((sc) => ({ ...sc, chapter_id: ch.chapter_id, chapter_title: ch.title }))
  );
  console.log(`📌 Total de cenas no episódio: ${allScenes.length}`);

  // 2. Síntese de Narração com ElevenLabs (Voz Chris Oficial)
  console.log('\n🎙️ [ETAPA 1/6] Síntese de Narração Oficial (ElevenLabs — Chris)...');
  const elevenLabs = new ElevenLabsAdapter();
  await elevenLabs.initialize();

  const sceneTimings: Array<{
    sceneId: string;
    chapterId: string;
    chapterTitle: string;
    name: string;
    voiceover: string;
    durationSeconds: number;
    durationFrames: number;
    startFrame: number;
    endFrame: number;
    audioFile: string;
    takeType: 'KEYFRAME_DOSSIER' | 'CINEMATIC_TAKE';
    integratedText?: string;
  }> = [];

  let currentFrame = 0;
  const audioFilesToConcat: string[] = [];

  for (let i = 0; i < allScenes.length; i++) {
    const sc = allScenes[i];
    const outAudioPath = path.join(audioScenesDir, `${sc.scene_id}.mp3`);

    console.log(`  [${i + 1}/${allScenes.length}] Sintetizando ${sc.scene_id} (${sc.name})...`);
    try {
      await elevenLabs.synthesizeText(sc.voiceover_text, outAudioPath);
    } catch (err: any) {
      console.warn(`    ⚠️ ElevenLabs API (${err.message}). Usando síntese neural de contingência.`);
      execSync(`python -m edge_tts --voice pt-BR-AntonioNeural --text "${sc.voiceover_text.replace(/"/g, '')}" --write-media "${outAudioPath}"`);
    }

    // Mede a duração física com ffprobe
    const probe = spawnSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      outAudioPath
    ], { encoding: 'utf8' });

    let dur = parseFloat(probe.stdout.trim()) || 4.5;
    dur = Math.max(2.5, Math.round((dur + 0.35) * 100) / 100);
    const frames = Math.round(dur * 30);

    const takeType = sc.take_type || 'CINEMATIC_TAKE';

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
      takeType,
      integratedText: sc.integrated_text
    });

    currentFrame += frames;
    audioFilesToConcat.push(outAudioPath);
  }

  const totalDurationSeconds = sceneTimings.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalFrames = currentFrame;
  console.log(`\n✅ Narração concluída! Duração: ${totalDurationSeconds.toFixed(2)}s (${(totalDurationSeconds / 60).toFixed(2)} min / ${totalFrames} frames)`);

  // Concatenação e Nivelamento Master (-16 LUFS EBU R128)
  const concatListPath = path.join(runDir, 'concat_list.txt');
  fs.writeFileSync(concatListPath, audioFilesToConcat.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'), 'utf8');

  const rawNarrationPath = path.join(postprodDir, 'raw_narration.mp3');
  execSync(`ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i "${concatListPath}" -c copy "${rawNarrationPath}"`);

  const masterNarrationPath = path.join(postprodDir, 'narration.mp3');
  execSync(`ffmpeg -y -hide_banner -loglevel error -i "${rawNarrationPath}" -af "loudnorm=I=-16:TP=-1.5:LRA=7" -ar 48000 -b:a 256k "${masterNarrationPath}"`);
  
  // Copia para o public da Remotion
  fs.copyFileSync(masterNarrationPath, path.join(publicEp05Dir, 'narration.mp3'));
  fs.unlinkSync(concatListPath);
  fs.unlinkSync(rawNarrationPath);
  console.log(`  🎵 Narração Master gerada em: ${masterNarrationPath}`);

  // Salva scene_timings.json
  const timingsPath = path.join(postprodDir, 'scene_timings.json');
  fs.writeFileSync(timingsPath, JSON.stringify(sceneTimings, null, 2), 'utf8');

  // Atualiza remotion/episode05TimelineData.ts
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
}

export const EPISODE_05_TOTAL_FRAMES = ${totalFrames};
export const EPISODE_05_TOTAL_SECONDS = ${totalDurationSeconds.toFixed(2)};

export const EPISODE_05_TIMELINE: SceneTimelineItem[] = ${JSON.stringify(sceneTimings, null, 2)};
`;
  fs.writeFileSync(path.join(process.cwd(), 'remotion', 'episode05TimelineData.ts'), timelineTs, 'utf8');

  // 3. Preparacao dos prompts pela identidade global v4.
  console.log('\n🖼️ [ETAPA 2/6] Compilacao dos Prompts de Documentario de Campo Investigativo...');
  const txtPrompts: string[] = [];
  const jsonlPrompts: string[] = [];
  const fireflyItems: any[] = [];
  const availableMedia: Record<string, any> = {};

  for (const sc of allScenes) {
    const sceneDir = path.join(executionDir, sc.scene_id);
    const pubSceneDir = path.join(publicExecutionDir, sc.scene_id);
    fs.mkdirSync(sceneDir, { recursive: true });
    fs.mkdirSync(pubSceneDir, { recursive: true });

    const isDossier = sc.take_type === 'KEYFRAME_DOSSIER';
    const promptMaster = buildFireflyPrompt({
      sceneId: sc.scene_id,
      visualSubject: sc.visual_subject,
      visual_must_include: [sc.visual_subject],
      visual_must_not: ['embedded readable text', 'floating interface'],
      required_category: isDossier ? 'documentary_evidence' : 'documentary_field_matter'
    }).prompt;

    fs.writeFileSync(path.join(sceneDir, 'clean_start_frame_prompt.txt'), promptMaster, 'utf8');

    const scenePlanData = {
      sceneId: sc.scene_id,
      name: sc.name,
      takeType: isDossier ? 'KEYFRAME_DOSSIER' : 'CINEMATIC_TAKE',
      integratedText: sc.integrated_text,
      prompt: promptMaster
    };
    fs.writeFileSync(path.join(sceneDir, 'scene_plan.json'), JSON.stringify(scenePlanData, null, 2), 'utf8');

    txtPrompts.push(`[${sc.scene_id}] ${promptMaster}`);
    jsonlPrompts.push(JSON.stringify({ id: sc.scene_id, prompt: promptMaster, filename: `${sc.scene_id}.png`, takeType: scenePlanData.takeType }, null, 0));

    const scIndex = parseInt(sc.scene_id.replace('OOL_', ''), 10);
    fireflyItems.push({
      name: `SC_${scIndex.toString().padStart(3, '0')}`,
      sceneId: sc.scene_id,
      takeType: scenePlanData.takeType,
      prompt: promptMaster,
      duration_seconds: 5
    });

    availableMedia[sc.scene_id] = {
      hasVideo: !isDossier,
      hasImage: true,
      isDossier
    };
  }

  // Grava as filas para o ChatGPT Bot
  osMkdirSafe('chatgpt-image-bot/prompts');
  fs.writeFileSync('chatgpt-image-bot/prompts/queue.txt', txtPrompts.join('\n') + '\n', 'utf8');
  fs.writeFileSync('chatgpt-image-bot/queue.jsonl', jsonlPrompts.join('\n') + '\n', 'utf8');
  console.log(`  📄 50 Prompts gravados em: chatgpt-image-bot/prompts/queue.txt (7 Keyframe Dossiers configurados)`);

  // Grava guia de produção do Firefly
  fs.writeFileSync(path.join(runDir, 'firefly-production-guide.json'), JSON.stringify({ items: fireflyItems }, null, 2), 'utf8');

  // Atualiza availableMedia.json
  fs.writeFileSync('remotion/availableMedia.json', JSON.stringify(availableMedia, null, 2), 'utf8');

  // 4. Criação do Componente Remotion Oficial do Episódio 05
  console.log('\n🎞️ [ETAPA 3/6] Geração do Componente Remotion do Episódio 05...');
  generateEpisode05RemotionComponent();

  // 5. Empacotamento de Marketing & SEO (YouTube Packaging RAG)
  console.log('\n📦 [ETAPA 4/6] Geração do Pacote de Publicação & SEO...');
  const packaging = {
    episode_id: episodeId,
    video_title_candidates: [
      "A Armadilha Escondida no Asfalto que Você Cruza Todo Dia",
      "Como o Radar Sabe Sua Velocidade no Escuro Absoluto",
      "O Segredo Subterrâneo Debaixo das Lombadas Eletrônicas",
      "A Física Invisível que Calcula 120 km/h em Microssegundos"
    ],
    selected_title: "A Armadilha Escondida no Asfalto que Você Cruza Todo Dia",
    seo_tags: [
      "radar de velocidade", "como funciona radar", "lombada eletronica", "inmetro radar", 
      "laco indutivo", "multa de velocidade", "engenharia rodoviaria", "o outro lado", 
      "curiosidades tecnologia", "ciencia e fisica", "velocidade no asfalto"
    ],
    description_blocks: {
      hook: "Você pisa no freio quando vê o poste na rodovia, mas a verdade é que a câmera não calcula nada. O verdadeiro sensor está enterrado sob as suas rodas.",
      investigation_summary: "Neste episódio de O Outro Lado, investigamos o corte de diamante no pavimento, a física dos laços de indução magnética, o disparo de obturador global em 1/10.000s e a tolerância de 7 km/h do INMETRO.",
      timestamps: [
        "0:00 - O Mito do Olho no Poste",
        "0:45 - O Corte de Diamante no Asfalto",
        "2:10 - O Cálculo em Microssegundos (ΔS / ΔT)",
        "4:15 - A Câmera Estroboscópica e a Película 3M",
        "6:00 - O Ponto de Falha: Calor de 60°C e INMETRO",
        "7:15 - O Relógio de Asfalto"
      ],
      brand_signature: "INVESTIGAR. REVELAR. COMPREENDER.\nO Outro Lado // O que acontece depois que você clica, compra, liga ou aperta."
    }
  };
  fs.writeFileSync(path.join(postprodDir, 'youtube-metadata.json'), JSON.stringify(packaging, null, 2), 'utf8');

  // 6. Geração das 3 Thumbnails 4K Industrial X-Ray
  console.log('\n🎨 [ETAPA 5/6] Renderização das 3 Thumbnails 4K (3840x2160)...');
  generateEpisode05Thumbnails(thumbDir);

  // 7. Registro Canônico no Artifact Registry
  console.log('\n🏷️ [ETAPA 6/6] Registro Canônico no Artifact Registry...');
  const registry = new ArtifactRegistry();
  const regSummary = registry.registerRun(runDir, episodeId);
  console.log(`  🏷️ Handle Canônico Atribuído: ${regSummary.handle}`);

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('🎉 SETUP & COMPILAÇÃO DO EPISÓDIO 05 CONCLUÍDOS COM SUCESSO!');
  console.log('📌 Próximo Passo: Rodar o chatgpt-image-bot para baixar os 50 frames.');
  console.log('══════════════════════════════════════════════════════════════════');
}

function osMkdirSafe(p: string) {
  fs.mkdirSync(path.resolve(p), { recursive: true });
}

function generateEpisode05RemotionComponent() {
  const componentCode = `import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  AnamorphicCinematicOverlay,
  AtomicStopwatch,
  CinematicKeyframeDossier,
  DynamicDocumentaryMedia,
  DynamicSpotlightFocus,
  Episode02SoundTrack,
  IndustrialXRayHUD,
  KineticEditorialCallout,
  KineticNumberCounter
} from './documentary';
import { EPISODE_05_TIMELINE, EPISODE_05_TOTAL_FRAMES } from './episode05TimelineData';

export interface Episode05RadarAsfaltoProps {
  accentColor?: string;
  telemetryColor?: string;
}

const EDITORIAL_CALLOUTS: Record<
  string,
  {
    mainText: string;
    subText: string;
    categoryText: string;
    position?: 'center' | 'bottom_left' | 'bottom_right' | 'top_left';
  }
> = {
  OOL_004: {
    categoryText: 'REGISTRO DE CAMPO // TEMPO DE OBTURAÇÃO',
    mainText: '1/10.000s',
    subText: 'DISPARO ULTRA-RÁPIDO SEM DISTORÇÃO',
    position: 'bottom_left'
  },
  OOL_009: {
    categoryText: 'CALIBRAÇÃO MÉTRICA // DISTÂNCIA PADRÃO',
    mainText: '3,00 METROS',
    subText: 'INTERVALO FIXO ENTRE LAÇOS INDUTIVOS',
    position: 'bottom_left'
  },
  OOL_015: {
    categoryText: 'TELEMETRIA DE CAMPO // VARIAÇÃO DE INDUTÂNCIA',
    mainText: '60.000 µs',
    subText: 'DELTA DE TEMPO REGISTRADO NA PASSAGEM',
    position: 'bottom_left'
  },
  OOL_022: {
    categoryText: 'FÓRMULA FÍSICA // CINEMÁTICA PURA',
    mainText: 'V = ΔS / ΔT',
    subText: 'CÁLCULO EXECUTADO EM MENOS DE 1 MS',
    position: 'center'
  },
  OOL_030: {
    categoryText: 'VISÃO COMPUTACIONAL // REDE NEURAL OCR',
    mainText: 'RECONHECIMENTO 99.4%',
    subText: 'LEITURA MONOCROMÁTICA DA PLACA MERCOSUL',
    position: 'bottom_left'
  },
  OOL_038: {
    categoryText: 'LEGISLAÇÃO METROLÓGICA // CONTRAN & INMETRO',
    mainText: '±7 KM/H',
    subText: 'MARGEM LEGAL PARA DILATAÇÃO DO ASFALTO',
    position: 'bottom_left'
  },
  OOL_050: {
    categoryText: 'ASSINATURA OFICIAL // CANAL O OUTRO LADO',
    mainText: 'INVESTIGAR. REVELAR. COMPREENDER.',
    subText: 'O QUE ACONTECE DEPOIS QUE VOCÊ CLICA, COMPRA OU ACELERA',
    position: 'center'
  }
};

const SCENE_MOTION_MODES: Record<
  string,
  'crash_push_in' | 'slow_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift'
> = {
  OOL_004: 'crash_push_in',
  OOL_009: 'slow_push_in',
  OOL_015: 'crash_push_in',
  OOL_022: 'slow_push_in',
  OOL_030: 'pan_right',
  OOL_038: 'dramatic_pull_out',
  OOL_050: 'slow_push_in'
};

export const Episode05RadarAsfalto: React.FC<Episode05RadarAsfaltoProps> = ({
  accentColor = '#FF5500',
  telemetryColor = '#00F0FF'
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', color: '#FFFFFF' }}>
      {/* 1. Trilha Sonora Master & Efeitos Ambientes */}
      <Episode02SoundTrack />

      {/* 2. Áudio da Narração Master Sincronizado */}
      <Audio src={staticFile('postproduction_ep05/narration.mp3')} volume={1.0} />

      {/* 3. Cronômetro Atômico de Telemetria no Topo */}
      <AtomicStopwatch totalFrames={EPISODE_05_TOTAL_FRAMES} />

      {/* 4. Sequência das 50 Cenas */}
      {EPISODE_05_TIMELINE.map((scene, index) => {
        const callout = EDITORIAL_CALLOUTS[scene.sceneId];
        const motionMode = SCENE_MOTION_MODES[scene.sceneId] || 'slow_push_in';

        return (
          <Sequence
            key={scene.sceneId}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
            name={\`\${scene.sceneId}_\${scene.name}\`}
          >
            <AbsoluteFill style={{ backgroundColor: '#060709' }}>
              {/* CENA CINEMATOGRÁFICA 35MM (Firefly Take ou Keyframe Dossier 2.5D) */}
              <DynamicDocumentaryMedia
                sceneId={scene.sceneId}
                kenBurns={motionMode}
                zoomIntensity={1.22}
                durationInFrames={scene.durationFrames}
                isDossierTake={scene.takeType === 'KEYFRAME_DOSSIER'}
                dossierTag={\`TELEMETRIA ASFÁLTICA // \${scene.sceneId}\`}
              />

              {/* Spotlight Chiaroscuro */}
              <DynamicSpotlightFocus
                durationInFrames={scene.durationFrames}
                intensity={0.38}
              />

              {/* HUD Industrial de Telemetria */}
              <IndustrialXRayHUD
                sceneId={scene.sceneId}
                title={scene.name}
                category="AUDITORIA DE VELOCIDADE NO ASFALTO"
                accentColor={accentColor}
                telemetryColor={telemetryColor}
              />

              {/* Contador Numérico Especial para Delta de Tempo */}
              {scene.sceneId === 'OOL_015' && (
                <KineticNumberCounter
                  endValue={60000}
                  suffix=" µs"
                  label="INTERVALO DE PASSAGEM ENTRE OS LAÇOS"
                  sublabel="DELTA DE TEMPO MEDIDO PELO PROCESSADOR"
                  accentColor={accentColor}
                />
              )}

              {/* Tipografia Editorial Dinâmica */}
              {callout && (
                <KineticEditorialCallout
                  mainText={callout.mainText}
                  subText={callout.subText}
                  categoryText={callout.categoryText}
                  startFrame={12}
                  durationFrames={Math.max(60, scene.durationFrames - 20)}
                  position={callout.position || 'center'}
                  accentColor={accentColor}
                />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* 5. Overlay Cinematográfico 35mm Master (Letterbox 2.39:1 + Grão + Retículas) */}
      <AnamorphicCinematicOverlay />
    </AbsoluteFill>
  );
};
`;

  fs.writeFileSync(path.join(process.cwd(), 'remotion', 'Episode05RadarAsfalto.tsx'), componentCode, 'utf8');
}

function generateEpisode05Thumbnails(targetDir: string) {
  const thumbScript = `
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

const outDir = '${targetDir.replace(/\\/g, '/')}';
const WIDTH = 3840;
const HEIGHT = 2160;

const VARIANTS = [
  {
    name: 'thumbnail_a_mecanismo.png',
    headline: 'O SEGREDO NO ASFALTO',
    highlightWord: 'ASFALTO',
    subheadline: 'A FÍSICA INVISÍVEL QUE CALCULA SUA VELOCIDADE NO ESCURO',
    statLabel: 'TEMPO DE LEITURA',
    statValue: '60.000 µs'
  },
  {
    name: 'thumbnail_b_consequencia.png',
    headline: 'NÃO É A CÂMERA',
    highlightWord: 'CÂMERA',
    subheadline: 'O QUE ESTÁ ESCONDIDO DEBAIXO DAS SUAS RODAS',
    statLabel: 'TOLERÂNCIA LEGAL',
    statValue: '±7 KM/H'
  },
  {
    name: 'thumbnail_c_gargalo.png',
    headline: 'ARMADILHA MAGNÉTICA',
    highlightWord: 'ARMADILHA',
    subheadline: 'COMO O LAÇO INDUTIVO MEDE O CARRO EM FRAÇÃO DE SEGUNDO',
    statLabel: 'DISTÂNCIA PADRÃO',
    statValue: '3,00 METROS'
  }
];

async function drawThumbs() {
  for (const v of VARIANTS) {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // Fundo Escuro Chiaroscuro
    ctx.fillStyle = '#060709';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Gradiente Radial de Vapor de Sódio (#FF5500)
    const radGrad = ctx.createRadialGradient(WIDTH * 0.65, HEIGHT * 0.45, 100, WIDTH * 0.65, HEIGHT * 0.45, WIDTH * 0.75);
    radGrad.addColorStop(0, 'rgba(255, 85, 0, 0.22)');
    radGrad.addColorStop(0.5, 'rgba(13, 14, 21, 0.85)');
    radGrad.addColorStop(1, '#060709');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Linha de Corte a Laser Laranja (#FF5500)
    ctx.strokeStyle = '#FF5500';
    ctx.lineWidth = 12;
    ctx.shadowColor = '#FF5500';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.moveTo(WIDTH * 0.52, 0);
    ctx.lineTo(WIDTH * 0.48, HEIGHT);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Símbolo Split Core
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.40)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(WIDTH * 0.50, HEIGHT * 0.50, 480, 0, Math.PI * 2);
    ctx.stroke();

    // Selo de Auditoria Técnica
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(WIDTH - 380, 380, 180, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ANÁLISE TÉCNICA', WIDTH - 380, 360);
    ctx.fillStyle = '#F4F4F0';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('VERIFICADA', WIDTH - 380, 410);

    // Headline Bebas Neue / Heavy Sans
    ctx.textAlign = 'left';
    ctx.fillStyle = '#F4F4F0';
    ctx.font = '900 180px sans-serif';
    
    // Divide a headline para pintar a palavra de tensão em Laranja
    const words = v.headline.split(' ');
    let cursorX = 160;
    const cursorY = HEIGHT - 420;

    for (const w of words) {
      if (w === v.highlightWord) {
        ctx.fillStyle = '#FF5500';
        ctx.shadowColor = '#FF5500';
        ctx.shadowBlur = 30;
      } else {
        ctx.fillStyle = '#F4F4F0';
        ctx.shadowBlur = 0;
      }
      ctx.fillText(w + ' ', cursorX, cursorY);
      cursorX += ctx.measureText(w + ' ').width;
    }
    ctx.shadowBlur = 0;

    // Subheadline Técnica em Ciano Laser
    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 54px monospace';
    ctx.fillText('// ' + v.subheadline, 160, HEIGHT - 300);

    // Card de Estatística em Vidro Fosco
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.30)';
    ctx.lineWidth = 3;
    ctx.fillRect(160, 200, 520, 220);
    ctx.strokeRect(160, 200, 520, 220);

    ctx.fillStyle = '#8A8D9F';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(v.statLabel, 200, 270);

    ctx.fillStyle = '#FF5500';
    ctx.font = '900 72px sans-serif';
    ctx.fillText(v.statValue, 200, 370);

    // Marca Oficial
    ctx.fillStyle = '#8A8D9F';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('O OUTRO LADO // EPISÓDIO 05', 160, 120);

    const outPath = path.join(outDir, v.name);
    fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
    console.log('  🖼️ Thumbnail gerada:', outPath);
  }
}
drawThumbs();
`;
  const tempScriptPath = path.join(process.cwd(), 'scripts', 'temp_render_ep05_thumbs.js');
  fs.writeFileSync(tempScriptPath, thumbScript, 'utf8');
  try {
    execSync(`node "${tempScriptPath}"`, { stdio: 'inherit' });
  } catch (e: any) {
    console.warn('  ⚠️ Renderizador canvas falhou:', e.message);
  } finally {
    if (fs.existsSync(tempScriptPath)) fs.unlinkSync(tempScriptPath);
  }
}

main().catch((err) => {
  console.error('❌ Erro na reconstrução do episódio 05:', err);
  process.exitCode = 1;
});
