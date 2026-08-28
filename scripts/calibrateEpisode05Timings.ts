import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { RemotionCompiler, SceneTimelineInput } from '../remotion/remotionCompiler';

const EPISODE_ID = 'OOL-EP05-RADAR-ASFALTO';
const runDir = path.join(process.cwd(), 'runs', EPISODE_ID);
const postDir = path.join(runDir, 'postproduction');
const audioDir = path.join(postDir, 'scenes_audio');
const publicDir = path.join(process.cwd(), 'public');

// 1. Carregar documentary-edit-package.json
const editPkgPath = path.join(runDir, 'editorial', 'execution', 'documentary-edit-package.json');
const editPkg = JSON.parse(fs.readFileSync(editPkgPath, 'utf8'));

// Mapa de Callouts Cinéticos Editoriais
const EDITORIAL_CALLOUTS: Record<string, { categoryText: string; mainText: string; subText: string; position?: 'center' | 'bottom_left' | 'bottom_right' | 'top_left' }> = {
  OOL_001: {
    categoryText: 'TELEMETRIA DE RODOVIA // VELOCIDADE INICIAL',
    mainText: '118 KM/H',
    subText: 'VELOCÍMETRO ILUMINADO EM CIANO SOB CHUVA',
    position: 'bottom_left'
  },
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

const MOTION_MODES: Record<string, 'crash_push_in' | 'slow_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift'> = {
  OOL_001: 'cinematic_drift',
  OOL_004: 'crash_push_in',
  OOL_009: 'slow_push_in',
  OOL_015: 'crash_push_in',
  OOL_022: 'slow_push_in',
  OOL_030: 'pan_right',
  OOL_038: 'dramatic_pull_out',
  OOL_050: 'slow_push_in'
};

console.log(`⏱️ Calibrando minutagem para as ${editPkg.scenes.length} cenas...`);

const compiledSceneInputs: SceneTimelineInput[] = [];

for (let i = 0; i < editPkg.scenes.length; i++) {
  const sc = editPkg.scenes[i];
  const scId = sc.sceneId;
  const audioPath = path.join(audioDir, `${scId}.mp3`);

  let audioDur = 5.0;
  if (fs.existsSync(audioPath)) {
    try {
      const probe = execSync(`ffprobe -v error -show_entries format=duration -of json "${audioPath}"`).toString();
      audioDur = parseFloat(JSON.parse(probe).format.duration);
    } catch {}
  }

  // Duração cinematográfica com respiro de montagem (entre 7.5s e 9.0s)
  const paddedDur = Math.max(audioDur + 2.0, 7.8);
  const durFrames = Math.round(paddedDur * 30);

  const callout = EDITORIAL_CALLOUTS[scId];
  const motionMode = MOTION_MODES[scId] || (i % 2 === 0 ? 'slow_push_in' : 'pan_right');

  compiledSceneInputs.push({
    sceneId: scId,
    name: sc.visualSubject ? sc.visualSubject.slice(0, 45) : `Cena ${i + 1}`,
    durationSeconds: durFrames / 30,
    durationFrames: durFrames,
    narrationSnippet: sc.voiceoverText,
    visualDescription: sc.visualSubject,
    takeType: sc.takeType || 'CINEMATIC_TAKE',
    integratedText: sc.integratedText,
    callout,
    motionMode
  });
}

// 2. Compilar via RemotionCompiler
console.log('📦 Compilando Remotion Component e Timeline...');
const compResult = RemotionCompiler.compileEpisode({
  episodeId: EPISODE_ID,
  compositionId: 'Episode05RadarAsfalto',
  title: 'O OUTRO LADO DO RADAR DE VELOCIDADE',
  categoryTitle: 'AUDITORIA DE FÍSICA E TELEMETRIA NO ASFALTO',
  fps: 30,
  scenes: compiledSceneInputs
});

console.log(`✅ Timeline compilada: ${compResult.totalDurationFrames} frames (${compResult.totalDurationSeconds.toFixed(2)}s / ${(compResult.totalDurationSeconds / 60).toFixed(2)} min)`);

// 3. Ajustar narração master para ter exatamente totalDurationSeconds
const narrationMasterMp3 = path.join(postDir, 'narration.mp3');
const paddedMasterMp3 = path.join(postDir, 'narration_calibrated.mp3');

console.log(`🎚️ Sincronizando cauda da narração para exatamente ${compResult.totalDurationSeconds.toFixed(3)}s...`);
execSync(`ffmpeg -y -i "${narrationMasterMp3}" -af "apad=whole_dur=${compResult.totalDurationSeconds.toFixed(3)}" -c:a mp3 -b:a 256k "${paddedMasterMp3}"`, { stdio: 'ignore' });
fs.copyFileSync(paddedMasterMp3, narrationMasterMp3);
fs.unlinkSync(paddedMasterMp3);

// Copiar para pastas públicas para acesso staticFile do Remotion
const pubDirs = [
  path.join(publicDir, 'postproduction'),
  path.join(publicDir, 'postproduction_ep05'),
  path.join(publicDir, 'postproduction_ool-ep05-radar-asfalto')
];

for (const d of pubDirs) {
  fs.mkdirSync(d, { recursive: true });
  fs.copyFileSync(narrationMasterMp3, path.join(d, 'narration.mp3'));
}

// 4. Salvar scene_timings.json
const timingsPath = path.join(postDir, 'scene_timings.json');
fs.writeFileSync(timingsPath, JSON.stringify({
  episodeId: EPISODE_ID,
  voice: 'Chris',
  voiceId: 'iP95p4xoKVk53GoZ742B',
  lufsTarget: -16.0,
  totalDurationSeconds: compResult.totalDurationSeconds,
  totalDurationFrames: compResult.totalDurationFrames,
  fps: 30,
  scenes: compiledSceneInputs
}, null, 2));

console.log('🎉 Calibração e Compilação Concluídas com Perfeição!');
