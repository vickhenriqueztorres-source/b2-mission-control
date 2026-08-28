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
import { EPISODE_GASOLINA_TIMELINE } from '../remotion/episodeGasolinaTimelineData';

// ══════════════════════════════════════════════════════════════════════
// CONFIGURAÇÕES DA PRODUÇÃO // O OUTRO LADO DA BOMBA DE GASOLINA
// ══════════════════════════════════════════════════════════════════════
const EPISODE_ID = 'OOL-EP06-GASOLINA';
const RUN_DIR = path.join(process.cwd(), 'runs', EPISODE_ID);
const EXECUTION_DIR = path.join(RUN_DIR, 'editorial', 'execution', 'scenes');
const POSTPROD_DIR = path.join(RUN_DIR, 'postproduction');
const THUMB_DIR = path.join(POSTPROD_DIR, 'thumbnails');
const AUDIO_SCENES_DIR = path.join(RUN_DIR, 'audio_scenes');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PUBLIC_GASOLINA_DIR = path.join(PUBLIC_DIR, 'postproduction_gasolina');
const PUBLIC_EXECUTION_DIR = path.join(PUBLIC_DIR, 'editorial', 'execution');

// Assegura criação de todas as pastas necessárias
fs.mkdirSync(EXECUTION_DIR, { recursive: true });
fs.mkdirSync(POSTPROD_DIR, { recursive: true });
fs.mkdirSync(THUMB_DIR, { recursive: true });
fs.mkdirSync(AUDIO_SCENES_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_GASOLINA_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_EXECUTION_DIR, { recursive: true });

// Prompts Master de Imagem (Denis Villeneuve Chiaroscuro 35mm) para cada cena
const SCENE_PROMPTS: Record<string, { prompt: string; category: string }> = {
  GAS_001: {
    prompt:
      'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, fuel dispenser nozzle locked into car filler neck, dark wet asphalt ground, monumental gas station canopy overhead, deep carbon blacks (#060709), glowing sodium-vapor amber reflections (#FF5500) and sharp cyan laser telemetry lights (#00F0FF), volumetric fog and rain mist, shallow depth of field, creamy anamorphic bokeh, filmic texture, raw realistic industrial photography, 8k, no text, no human faces --ar 16:9',
    category: 'industrial'
  },
  GAS_002: {
    prompt:
      'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, car instrument cluster dashboard at night, glowing amber fuel gauge needle dropping, dark cockpit interior, deep carbon blacks (#060709), subtle cyan laser telemetry highlights (#00F0FF), atmospheric chiaroscuro lighting, filmic texture, 8k, no text, no human faces --ar 16:9',
    category: 'cyber_telemetry'
  },
  GAS_003: {
    prompt:
      'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, opened industrial fuel dispenser metal casing revealing heavy 4-piston positive displacement flow meter mechanism, machined cast aluminum, heavy dark brass pipes, deep carbon blacks (#060709), glowing amber light (#FF5500), volumetric smoke, shallow depth of field, 8k, no text, no human faces --ar 16:9',
    category: 'industrial'
  },
  GAS_004: {
    prompt:
      'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, magnetic pulse disc sensor inside fuel meter, optical and hall effect sensor assembly, sharp copper coil windings, chiaroscuro lighting, deep carbon blacks (#060709), glowing cyan telemetry lines (#00F0FF), 8k, no text, no human faces --ar 16:9',
    category: 'cyber_telemetry'
  },
  GAS_005: {
    prompt:
      'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, macro shot of complex electronic printed circuit board PCB, illicit rogue microchip soldered directly across data bus traces, dark industrial motherboard, laser cyan circuit traces (#00F0FF), sodium vapor amber alert glow (#FF5500), 8k, no text, no human faces --ar 16:9',
    category: 'cyber_telemetry'
  },
  GAS_006: {
    prompt:
      'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, extreme macro of tiny SMD wireless bluetooth microcontroller hidden under black epoxy resin droplet on circuit board, razor sharp focus, industrial chiaroscuro lighting, carbon black (#060709), 8k, no text, no human faces --ar 16:9',
    category: 'cyber_telemetry'
  },
  GAS_007: {
    prompt:
      'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, high precision volumetric proving calibration tank at gas station, clear calibrated glass sight tube showing fuel level discrepancy, forensic inspection lights, deep carbon blacks (#060709), amber glowing indicators (#FF5500), 8k, no text, no human faces --ar 16:9',
    category: 'macro_physics'
  },
  GAS_008: {
    prompt:
      'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, smartphone handheld glowing screen displaying illicit remote killswitch application in dark gas station forecourt, rain drops on glass, atmospheric volumetric fog, deep carbon blacks (#060709), amber background lights (#FF5500), 8k, no text, no human faces --ar 16:9',
    category: 'cyber_telemetry'
  },
  GAS_009: {
    prompt:
      'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, forensic metrology laboratory testing equipment, digital storage oscilloscope probes connected to pump motherboard cables, sharp cyan waveform traces (#00F0FF), dark moody lab environment, 8k, no text, no human faces --ar 16:9',
    category: 'cyber_telemetry'
  },
  GAS_010: {
    prompt:
      'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, monumental wide shot of futuristic highway gas station illuminated under heavy rain at midnight, wet reflective tarmac, deep carbon blacks (#060709), subtle sodium-vapor amber halos (#FF5500), cinematic lens flare, 8k, no text, no human faces --ar 16:9',
    category: 'infrastructure'
  }
};

export const GASOLINA_SCENES: HybridSceneInput[] = EPISODE_GASOLINA_TIMELINE.map((sc) => ({
  scene_id: sc.sceneId,
  chapter_id: sc.chapterId,
  chapter_title: sc.chapterTitle,
  name: sc.name,
  voiceover_text: sc.voiceover,
  visual_subject: SCENE_PROMPTS[sc.sceneId]?.prompt || sc.name,
  take_type: sc.takeType,
  callout_main: sc.calloutMain,
  callout_sub: sc.calloutSub,
  callout_category: sc.calloutCategory,
  motion_mode: sc.motionMode,
  integrated_text: sc.integratedText
}));

async function main() {
  console.log(`\n╔══════════════════════════════════════════════════════════════════════╗`);
  console.log(`║ ⛽ PRODUÇÃO DE DOCUMENTÁRIO // O OUTRO LADO DA BOMBA DE GASOLINA    ║`);
  console.log(`╚══════════════════════════════════════════════════════════════════════╝\n`);

  // ══════════════════════════════════════════════════════════════════════
  // SQUAD 1 & 2: Síntese de Narração Neural (ElevenLabs — Chris)
  // ══════════════════════════════════════════════════════════════════════
  console.log(`🎙️ [SQUAD 1 & 2] Síntese de Narração Oficial (ElevenLabs — Chris)...`);
  const elevenLabs = new ElevenLabsAdapter();
  await elevenLabs.initialize();

  const sceneTimings: any[] = [];
  let currentFrame = 0;
  const audioFilesToConcat: string[] = [];

  for (let i = 0; i < GASOLINA_SCENES.length; i++) {
    const sc = GASOLINA_SCENES[i];
    const outAudioPath = path.join(AUDIO_SCENES_DIR, `${sc.scene_id}.mp3`);

    console.log(`  [${i + 1}/${GASOLINA_SCENES.length}] Sintetizando áudio para ${sc.scene_id} (${sc.name})...`);
    await elevenLabs.synthesizeText(sc.voiceover_text, outAudioPath);

    // Mede a duração com ffprobe
    const probe = spawnSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      outAudioPath
    ], { encoding: 'utf8' });

    const durSec = parseFloat(probe.stdout.trim()) || 7.0;
    const frames = Math.round(durSec * 30);

    sceneTimings.push({
      sceneId: sc.scene_id,
      chapterId: sc.chapter_id,
      chapterTitle: sc.chapter_title,
      name: sc.name,
      voiceover: sc.voiceover_text,
      durationSeconds: Math.round(durSec * 100) / 100,
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

  // Mede a duração final do master narration.mp3
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
  fs.copyFileSync(masterNarrationPath, path.join(PUBLIC_GASOLINA_DIR, 'narration.mp3'));
  fs.unlinkSync(concatListPath);
  fs.unlinkSync(rawNarrationPath);

  console.log(`  ✅ Narração Master gerada! Duração: ${masterDurationSeconds.toFixed(2)}s (${totalFrames} frames a 30 FPS)`);

  // Salva scene_timings.json
  const timingsData = {
    totalDurationSeconds: masterDurationSeconds,
    totalDurationFrames: totalFrames,
    scenes: sceneTimings
  };
  fs.writeFileSync(path.join(POSTPROD_DIR, 'scene_timings.json'), JSON.stringify(timingsData, null, 2), 'utf8');

  // Atualiza remotion/episodeGasolinaTimelineData.ts com os timings reais
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

export const EPISODE_GASOLINA_TOTAL_FRAMES = ${totalFrames};
export const EPISODE_GASOLINA_TOTAL_SECONDS = ${masterDurationSeconds.toFixed(2)};

export const EPISODE_GASOLINA_TIMELINE: SceneTimelineItem[] = ${JSON.stringify(sceneTimings, null, 2)};
`;
  fs.writeFileSync(path.join(process.cwd(), 'remotion', 'episodeGasolinaTimelineData.ts'), timelineTs, 'utf8');

  // Grava documentary-edit-package.json e firefly-production-guide.json para conformidade com o Gatekeeper
  const editPackage = {
    episode_id: EPISODE_ID,
    scenes: GASOLINA_SCENES.map((sc) => ({
      sceneId: sc.scene_id,
      shotId: sc.scene_id,
      visualSubject: sc.visual_subject,
      takeType: sc.take_type
    }))
  };
  fs.writeFileSync(
    path.join(RUN_DIR, 'editorial', 'execution', 'documentary-edit-package.json'),
    JSON.stringify(editPackage, null, 2),
    'utf8'
  );

  const fireflyGuide = {
    items: GASOLINA_SCENES.map((sc) => ({
      name: sc.scene_id,
      sceneId: sc.scene_id,
      takeType: sc.take_type,
      prompt: sc.visual_subject,
      duration_seconds: 5
    }))
  };
  fs.writeFileSync(path.join(RUN_DIR, 'firefly-production-guide.json'), JSON.stringify(fireflyGuide, null, 2), 'utf8');

  // ══════════════════════════════════════════════════════════════════════
  // SQUAD 3: Motor Híbrido de Vídeo (HybridVideoEngine + VideoRepository)
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n🎬 [SQUAD 3] Video Engine Híbrido (Banco de Vídeos + Firefly On-Demand)...');
  const hybridEngine = new HybridVideoEngine();
  const videoResult = await hybridEngine.processEpisodeScenes({
    runId: EPISODE_ID,
    scenes: GASOLINA_SCENES,
    runDirectory: RUN_DIR,
    publicExecutionDirectory: PUBLIC_EXECUTION_DIR,
    mode: 'smart'
  });

  console.log(`  📊 Resumo do Engine Híbrido:`);
  console.log(`     • Cenas do Banco de Vídeos: ${videoResult.matchedFromBank}`);
  console.log(`     • Cenas Geradas no Firefly: ${videoResult.generatedByFirefly}`);
  console.log(`     • Cenas Dossiê 2.5D: ${videoResult.dossiers25D}`);

  // ══════════════════════════════════════════════════════════════════════
  // SQUAD 5: Pacote de Publicação & Renderização de 3x Thumbnails 4K
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📦 [SQUAD 5] Geração do Pacote de Publicação & Metadados SEO...');
  const packaging = {
    episode_id: EPISODE_ID,
    video_title_candidates: [
      'A FRAUDE DOS 0,05 LITROS: O CHIP NA BOMBA DE GASOLINA',
      'POR QUE O PONTEIRO DESCE TÃO RÁPIDO? O GOLPE DO COMBUSTÍVEL',
      'O CHIP DA GASOLINA: COMO ROUBAM 8% DO SEU TANQUE EM CÓDIGO'
    ],
    selected_title: 'A FRAUDE DOS 0,05 LITROS: O CHIP NA BOMBA DE GASOLINA',
    seo_tags: [
      'bomba de gasolina', 'fraude de combustivel', 'chip na bomba', 'inmetro combustivel',
      'como funciona bomba de gasolina', 'o outro lado', 'engenharia reversa', 'metrologia legal'
    ],
    description_blocks: {
      hook: 'Você encosta o carro no posto, pede para encher o tanque e confia cegamente no display digital.',
      investigation_summary: 'Investigamos a engenharia oculta por trás da fraude eletrônica das bombas de combustível: como chips milimétricos com Bluetooth adulteram os pulsos mecânicos do sensor de vazão e desviam 8% de cada abastecimento em código.',
      timestamps: [
        '0:00 - O Clique no Bocal do Tanque',
        '0:15 - O Bloco Medidor de 4 Pistões',
        '0:30 - A Placa-Mãe Adulterada & Chip Bluetooth',
        '0:45 - A Física da Fraude (+8% de Desvio)',
        '1:00 - O Botão de Pânico Remoto & Perícia INMETRO'
      ],
      brand_signature: 'INVESTIGAR. REVELAR. COMPREENDER.\nO Outro Lado // O que acontece depois que você clica, compra, liga ou aperta.'
    }
  };

  fs.writeFileSync(path.join(POSTPROD_DIR, 'youtube-metadata.json'), JSON.stringify(packaging, null, 2), 'utf8');

  const descriptionTxt = `${packaging.selected_title}

${packaging.description_blocks.hook}

${packaging.description_blocks.investigation_summary}

TIMESTAMPS:
${packaging.description_blocks.timestamps.join('\n')}

---
${packaging.description_blocks.brand_signature}
`;
  fs.writeFileSync(path.join(POSTPROD_DIR, 'description.txt'), descriptionTxt, 'utf8');

  console.log('\n🎨 [SQUAD 5] Renderização das 3 Thumbnails 4K (3840x2160)...');
  const targetDir = THUMB_DIR;
  const variants = [
    {
      name: 'variant_a_mechanism',
      filename: 'thumbnail_variant_a_mechanism.png',
      props: {
        baseImageSrc: 'editorial/execution/GAS_001/firefly_start_frame.png',
        headlineLines: ['O CHIP DA', 'GASOLINA.'],
        subheadline: 'FRAUDE DIGITAL // PULSOS ADULTERADOS',
        coordinates: '23.5505° S, 46.6333° W',
        textSide: 'LEFT',
        accentColor: '#FF5500',
        telemetryColor: '#00F0FF',
        revealPercentage: 98
      }
    },
    {
      name: 'variant_b_consequence',
      filename: 'thumbnail_variant_b_consequence.png',
      props: {
        baseImageSrc: 'editorial/execution/GAS_007/firefly_start_frame.png',
        headlineLines: ['O GOLPE', 'DOS 8%.'],
        subheadline: 'DESVIO EM CÓDIGO // DESLOCAMENTO FANTASMA',
        coordinates: '22.9068° S, 43.1729° W',
        textSide: 'LEFT',
        accentColor: '#FF5500',
        telemetryColor: '#00F0FF',
        revealPercentage: 92
      }
    },
    {
      name: 'variant_c_final_handoff',
      filename: 'thumbnail_variant_c_final_handoff.png',
      props: {
        baseImageSrc: 'editorial/execution/GAS_005/firefly_start_frame.png',
        headlineLines: ['A FRAUDE', 'EM CÓDIGO.'],
        subheadline: 'MICROCONTROLADOR OCULTO // DESATIVAÇÃO 40 µs',
        coordinates: '15.7975° S, 47.8919° W',
        textSide: 'LEFT',
        accentColor: '#FF5500',
        telemetryColor: '#00F0FF',
        revealPercentage: 100
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

  // ══════════════════════════════════════════════════════════════════════
  // SQUAD 6: Auditoria de Contratos (PipelineContractGate)
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n🛡️ [SQUAD 6] Auditoria de Contratos (PipelineContractGate)...');
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
  // SQUAD 6 & 4: Renderização do Vídeo Master via Remotion (1080p)
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n🎞️ [SQUAD 6 & 4] Renderização do Vídeo Master via Remotion (1080p)...');
  const masterVideoPath = path.join(RUN_DIR, 'final_master.mp4');

  const remotionCmd = `npx remotion render remotion/index.ts EpisodeGasolina "${masterVideoPath}" --concurrency=2 --gl=angle`;
  console.log(`  Executando: ${remotionCmd}`);
  execSync(remotionCmd, { stdio: 'inherit' });

  console.log(`\n══════════════════════════════════════════════════════════════════════`);
  console.log(`🎉 DOCUMENTÁRIO CONCLUÍDO COM 100% DE SUCESSO!`);
  console.log(`📹 Vídeo Master: ${masterVideoPath}`);
  console.log(`⏱️ Duração: ${masterDurationSeconds.toFixed(2)}s | Resolução: 1920x1080 | Codec: h264`);
  console.log(`🖼️ Thumbnails 4K salvas em: ${THUMB_DIR}`);
  console.log(`══════════════════════════════════════════════════════════════════════\n`);
}

main().catch((err) => {
  console.error('\n❌ ERRO FATAL NA PRODUÇÃO DO DOCUMENTÁRIO:', err);
  process.exit(1);
});
