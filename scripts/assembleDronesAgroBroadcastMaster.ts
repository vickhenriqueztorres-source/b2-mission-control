import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import scenesData from '../contracts/episodes/drones-agro.scenes.json';
import { EPISODE_DRONES_AGRO_TIMELINE } from '../remotion/episodeDronesAgroTimelineData';

async function assembleMaster() {
  console.log('══════════════════════════════════════════════════════════════════════════════════════');
  console.log('🎞️ COMPOSITOR MASTER CINEMATOGRÁFICO // DRONES DO AGRO (35MM ANAMORPHIC)');
  console.log('══════════════════════════════════════════════════════════════════════════════════════\n');

  const runDir = path.join(process.cwd(), 'runs', 'OOL-EP17-DRONES-AGRO');
  const pubDir = path.join(process.cwd(), 'public', 'episodes', 'drones-agro');
  const brainDir = path.join(process.env.USERPROFILE || 'C:\\Users\\brend', '.gemini', 'antigravity', 'brain', 'c5f04ba1-5381-4193-8f04-e56c8fb7e558');

  const takesDir = path.join(runDir, 'takes');
  const narrationDir = path.join(runDir, 'audio', 'narration');
  const musicFile = path.join(runDir, 'audio', 'music', 'bed.mp3');

  // 1. Cria lista de concatenação de vídeo
  const concatListPath = path.join(runDir, 'concat_list.txt');
  const fileLines = scenesData.map(sc => `file '${path.join(takesDir, `${sc.sceneId}.mp4`).replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(concatListPath, fileLines, 'utf8');

  const rawVideoMerged = path.join(runDir, 'temp_raw_video.mp4');
  console.log('🎬 Concatenando 24 takes de vídeo em 1080p 30fps...');
  execSync(`ffmpeg -nostdin -y -v error -f concat -safe 0 -i "${concatListPath}" -c copy "${rawVideoMerged}"`);

  // 2. Cria faixa de narração contínua alinhada
  console.log('🎙️ Montando faixa contínua de narração ElevenLabs (Chris)...');
  const audioConcatListPath = path.join(runDir, 'audio_concat_list.txt');
  const audioLines = scenesData.map(sc => `file '${path.join(narrationDir, `${sc.sceneId}.mp3`).replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(audioConcatListPath, audioLines, 'utf8');

  const rawNarrationMerged = path.join(runDir, 'temp_raw_narration.mp3');
  execSync(`ffmpeg -nostdin -y -v error -f concat -safe 0 -i "${audioConcatListPath}" -c:a libmp3lame -q:a 2 "${rawNarrationMerged}"`);

  // 3. Mixagem de Áudio: Narração (1.0) + Trilha Musical com Ducking Automático (0.28)
  console.log('🔊 Mixando áudio master com ducking automático...');
  const mixedAudioPath = path.join(runDir, 'temp_mixed_audio.aac');

  const audioMixFilter = `[1:a]volume=1.0,asplit=2[vo1][vo2];[2:a]volume=0.28,aloop=loop=-1:size=2e+09[music];[music][vo1]sidechaincompress=threshold=0.12:ratio=4:attack=50:release=400[ducked_music];[ducked_music][vo2]amix=inputs=2:duration=first:dropout_transition=2[aout]`;
  execSync(`ffmpeg -nostdin -y -v error -i "${rawVideoMerged}" -i "${rawNarrationMerged}" -i "${musicFile}" -filter_complex "${audioMixFilter}" -map "[aout]" -c:a aac -b:a 256k "${mixedAudioPath}"`);

  // 4. Renderização Final com Color Grading 35mm, Letterbox Anamórfico e Áudio Master
  const finalMasterPath = path.join(runDir, 'final_master.mp4');
  const brainMasterPath = path.join(brainDir, 'final_master_drones_agro.mp4');

  console.log('🎨 Aplicando Color Grade 35mm Denis Villeneuve e unindo áudio master...');
  const videoFilter = `eq=contrast=1.08:brightness=-0.02:saturation=1.12,drawbox=y=0:h=60:color=black:t=fill,drawbox=y=ih-60:h=60:color=black:t=fill`;
  
  execSync(`ffmpeg -nostdin -y -v error -i "${rawVideoMerged}" -i "${mixedAudioPath}" -vf "${videoFilter}" -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -c:a copy -shortest "${finalMasterPath}"`);

  fs.copyFileSync(finalMasterPath, brainMasterPath);

  // Limpeza de temporários
  [rawVideoMerged, rawNarrationMerged, mixedAudioPath, concatListPath, audioConcatListPath].forEach(f => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });

  const stats = fs.statSync(finalMasterPath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 MASTER FINAL DO DOCUMENTÁRIO CONCLUÍDO COM SUCESSO!`);
  console.log(`   Caminho: ${finalMasterPath}`);
  console.log(`   Tamanho: ${sizeMb} MB`);
  console.log(`   Artefato: ${brainMasterPath}\n`);
}

assembleMaster().catch(err => {
  console.error('❌ Erro na montagem do master:', err);
  process.exit(1);
});
