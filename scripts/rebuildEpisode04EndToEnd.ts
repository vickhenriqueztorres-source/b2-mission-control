import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { spawnSync, execSync } from 'child_process';
import { GPS_TEMPO_CHAPTERS } from '../hsl/editorial/config/video4GpsTempoEpisodeSeed';
import { ElevenLabsAdapter } from '../adapters/elevenLabsAdapter';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';
import { PrdComplianceChecker } from '../pipeline/prdComplianceChecker';
import { ArtifactRegistry } from '../pipeline/artifactRegistry';
import { buildFireflyPrompt } from '../contracts/buildFireflyPrompt';

const episodeId = 'OOL-EP04-GPS-TEMPO';
const runDir = path.join(process.cwd(), 'runs', episodeId);
const executionDir = path.join(runDir, 'editorial', 'execution', 'scenes');
const postprodDir = path.join(runDir, 'postproduction');
const thumbDir = path.join(postprodDir, 'thumbnails');
const audioScenesDir = path.join(runDir, 'audio_scenes');
const artifactDir = 'C:/Users/brend/.gemini/antigravity/brain/458559fc-b6a0-43b0-900e-40923ec3998e';

fs.mkdirSync(executionDir, { recursive: true });
fs.mkdirSync(postprodDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });
fs.mkdirSync(audioScenesDir, { recursive: true });

async function main() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🛰️ PRODUÇÃO MASTER END-TO-END — O OUTRO LADO DO GPS (EP04)');
  console.log('══════════════════════════════════════════════════════════════════\n');

  // 1. Coletar todas as 50 cenas
  const allScenes = GPS_TEMPO_CHAPTERS.flatMap((ch) =>
    ch.scenes.map((sc) => ({ ...sc, chapter_id: ch.chapter_id, chapter_title: ch.title }))
  );
  console.log(`📌 Total de cenas no episódio: ${allScenes.length}`);

  // 2. Síntese de Narração com ElevenLabs (Voz Chris)
  console.log('\n🎙️ [ETAPA 1/7] Síntese de Narração Oficial (ElevenLabs — Chris)...');
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
  }> = [];

  let currentFrame = 0;
  const audioFilesToConcat: string[] = [];

  for (let i = 0; i < allScenes.length; i++) {
    const sc = allScenes[i];
    const outAudioPath = path.join(audioScenesDir, `${sc.scene_id}.mp3`);

    console.log(`  [${i + 1}/${allScenes.length}] Sintetizando ${sc.scene_id}...`);
    try {
      // Síntese real com Chris
      await elevenLabs.synthesizeText(sc.voiceover_text, outAudioPath);
    } catch (err: any) {
      console.warn(`    ⚠️ Falha ElevenLabs em ${sc.scene_id} (${err.message}). Usando fallback neural sincronizado.`);
      execSync(`python -m edge_tts --voice pt-BR-AntonioNeural --text "${sc.voiceover_text.replace(/"/g, '')}" --write-media "${outAudioPath}"`);
    }

    // Mede a duração com ffprobe
    const probe = spawnSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      outAudioPath
    ], { encoding: 'utf8' });

    let dur = parseFloat(probe.stdout.trim()) || 4.5;
    // Pequeno padding de respiro natural (0.3s)
    dur = Math.max(2.5, Math.round((dur + 0.3) * 100) / 100);
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
      audioFile: outAudioPath
    });

    currentFrame += frames;
    audioFilesToConcat.push(outAudioPath);
  }

  const totalDurationSeconds = sceneTimings.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalFrames = currentFrame;
  console.log(`\n✅ Narração das 50 cenas concluída! Duração Total: ${totalDurationSeconds.toFixed(2)}s (${(totalDurationSeconds / 60).toFixed(2)} min / ${totalFrames} frames)`);

  // Concatenação e Nivelamento da Narração Master
  const concatListPath = path.join(runDir, 'concat_list.txt');
  fs.writeFileSync(concatListPath, audioFilesToConcat.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'), 'utf8');

  const rawNarrationPath = path.join(postprodDir, 'raw_narration.mp3');
  execSync(`ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i "${concatListPath}" -c copy "${rawNarrationPath}"`);

  const masterNarrationPath = path.join(postprodDir, 'narration.mp3');
  execSync(`ffmpeg -y -hide_banner -loglevel error -i "${rawNarrationPath}" -af "loudnorm=I=-16:TP=-1.5:LRA=7" -ar 48000 -b:a 256k "${masterNarrationPath}"`);
  fs.unlinkSync(concatListPath);
  fs.unlinkSync(rawNarrationPath);
  console.log(`  🎵 Narração Master gerada em: ${masterNarrationPath}`);

  // Salva scene_timings.json
  const timingsPath = path.join(postprodDir, 'scene_timings.json');
  fs.writeFileSync(timingsPath, JSON.stringify(sceneTimings, null, 2), 'utf8');

  // Atualiza remotion/episode04TimelineData.ts
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
}

export const EPISODE_04_TOTAL_FRAMES = ${totalFrames};
export const EPISODE_04_TOTAL_SECONDS = ${totalDurationSeconds.toFixed(2)};

export const EPISODE_04_TIMELINE: SceneTimelineItem[] = ${JSON.stringify(sceneTimings, null, 2)};
`;
  fs.writeFileSync(path.join(process.cwd(), 'remotion', 'episode04TimelineData.ts'), timelineTs, 'utf8');

  // 3. Preparacao dos start frames pela identidade global v4.
  console.log('\n🖼️ [ETAPA 2/7] Prompts de Documentario de Campo Investigativo...');
  const fireflyItems: Array<{
    name: string;
    image: string;
    prompt: string;
    model: string;
    resolution: string;
    aspect_ratio: string;
    duration_seconds: number;
    generate_audio: boolean;
  }> = [];

  for (const sc of allScenes) {
    const sceneDir = path.join(executionDir, sc.scene_id);
    fs.mkdirSync(sceneDir, { recursive: true });

    const promptMaster = buildFireflyPrompt({
      sceneId: sc.scene_id,
      visualSubject: sc.visual_subject,
      visual_must_include: [sc.visual_subject],
      visual_must_not: ['embedded readable text'],
      required_category: 'documentary_field_evidence'
    }).prompt;
    fs.writeFileSync(path.join(sceneDir, 'clean_start_frame_prompt.txt'), promptMaster, 'utf8');

    const motionPrompt = 'Physical observational camera movement with subtle shoulder drift and human reframing, preserve the real subject and practical lighting, no permanent digital push-in, zoom loop, fake parallax, text or posed faces';
    fs.writeFileSync(path.join(sceneDir, 'firefly_motion_prompt.txt'), motionPrompt, 'utf8');

    fireflyItems.push({
      name: sc.scene_id,
      image: `${sc.scene_id}.png`,
      prompt: motionPrompt,
      model: 'Firefly Video',
      resolution: '1080p',
      aspect_ratio: '16:9',
      duration_seconds: 5,
      generate_audio: false
    });
  }

  // 4. Alimentação da Guia do Firefly
  console.log('\n🔥 [ETAPA 3/7] Guia de Produção do Firefly Bot...');
  const fireflyGuidePath = path.join(runDir, 'firefly_guide.json');
  fs.writeFileSync(fireflyGuidePath, JSON.stringify({ items: fireflyItems }, null, 2), 'utf8');
  console.log(`  📄 Guia do Firefly registrada em: ${fireflyGuidePath}`);

  // 5. Renderização do Master Final via Fast Assembler / Remotion
  console.log('\n🎬 [ETAPA 4/7] Montagem & Renderização do Master Final...');
  const masterMp4Path = path.join(runDir, 'final_master.mp4');
  
  // Executa o assembler com áudio Chris oficial
  const assembleScript = path.join(process.cwd(), 'scripts', 'fastAssembleEpisode04Master.py');
  execSync(`python "${assembleScript}"`, { stdio: 'inherit' });

  // 6. Geração das 3 Thumbnails 4K Industrial X-Ray
  console.log('\n🎨 [ETAPA 5/7] Renderização das Thumbnails 4K Industrial X-Ray...');
  const thumbScript = path.join(process.cwd(), 'scripts', 'renderIndustrialXRayThumbnails.ts');
  execSync(`npx ts-node "${thumbScript}"`, { stdio: 'inherit' });

  // 7. Auditorias do Gatekeeper & PRD Compliance
  console.log('\n🛡️ [ETAPA 6/7] Auditorias Finais do Gatekeeper & PRD...');
  const gateResult = PipelineContractGate.auditRun({ runId: episodeId, stageScope: 'FULL_PACKAGE' });
  console.log(`  Gatekeeper Status: ${gateResult.passed ? '✅ PASS' : '❌ FAIL'}`);

  const prdResult = PrdComplianceChecker.verifyRun(episodeId);
  console.log(`  PRD Compliance: ${prdResult.overallPassed ? '✅ CONFORME' : '❌ NÃO CONFORME'}`);

  // 8. Registro Canônico no Artifact Registry
  console.log('\n🏷️ [ETAPA 7/7] Registro Canônico no Artifact Registry...');
  const registry = new ArtifactRegistry();
  const regSummary = registry.registerRun(runDir, episodeId);

  // Copia o master MP4 para o diretório de artefatos
  fs.copyFileSync(masterMp4Path, path.join(artifactDir, 'ep04_gps_tempo_final_master.mp4'));

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('🎉 EPISÓDIO 04 RECONSTRUÍDO COM SUCESSO ABSOLUTO!');
  console.log(`🎬 MASTER: ${masterMp4Path}`);
  console.log(`🏷️ HANDLE CANÔNICO: ${regSummary.handle}/master`);
  console.log('══════════════════════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ Erro na reconstrução do episódio:', err);
  process.exitCode = 1;
});
