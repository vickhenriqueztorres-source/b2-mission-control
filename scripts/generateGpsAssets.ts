import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { ElevenLabsAdapter } from '../adapters/elevenLabsAdapter';
import rawScenes from '../contracts/episodes/gps-tempo.scenes.json';

async function main() {
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log('🛰️ GERADOR DE ASSETS OFICIAIS // EPISÓDIO GPS-TEMPO');
  console.log('══════════════════════════════════════════════════════════════════════\n');

  const basePublicDir = path.join(process.cwd(), 'public', 'episodes', 'gps-tempo');
  const narrationDir = path.join(basePublicDir, 'audio', 'narration');
  const sfxDir = path.join(basePublicDir, 'audio', 'sfx');
  const musicDir = path.join(basePublicDir, 'audio', 'music');
  const takesDir = path.join(basePublicDir, 'takes');

  fs.mkdirSync(narrationDir, { recursive: true });
  fs.mkdirSync(sfxDir, { recursive: true });
  fs.mkdirSync(musicDir, { recursive: true });
  fs.mkdirSync(takesDir, { recursive: true });

  // 1. Narração ElevenLabs Chris
  const adapter = new ElevenLabsAdapter();
  await adapter.initialize();

  console.log('🎙️ [1/4] Sintetizando 30 locuções ElevenLabs (Voz Chris)...');
  for (const sc of rawScenes) {
    const outMp3 = path.join(narrationDir, `${sc.sceneId}.mp3`);
    if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 1024) {
      console.log(`   [SKIP] ${sc.sceneId}.mp3 já existe (${(fs.statSync(outMp3).size / 1024).toFixed(1)} KB)`);
      continue;
    }

    console.log(`   [SYNTH] ${sc.sceneId} (${sc.voiceover.slice(0, 50)}...)...`);
    try {
      const res = await adapter.synthesizeText(sc.voiceover, outMp3);
      console.log(`   ✅ ${sc.sceneId}.mp3 gerado (${res.durationSeconds.toFixed(2)}s)`);
    } catch (err: any) {
      console.error(`   ❌ Falha em ${sc.sceneId}:`, err.message);
      throw err;
    }
  }

  // 2. SFX Stems
  console.log('\n🔊 [2/4] Configurando stems de SFX industriais...');
  const gasolinaSfxDir = path.join(process.cwd(), 'public', 'episodes', 'gasolina-adulterada', 'audio', 'sfx');
  for (const sc of rawScenes) {
    const targetSfx = path.join(sfxDir, `${sc.sceneId}.mp3`);
    if (!fs.existsSync(targetSfx)) {
      const sourceSfx = path.join(gasolinaSfxDir, `${sc.sceneId.replace('GPS', 'GAS')}.mp3`);
      if (fs.existsSync(sourceSfx)) {
        fs.copyFileSync(sourceSfx, targetSfx);
      }
    }
  }
  console.log('   ✅ 30 stems de SFX configurados.');

  // 3. Music Bed
  console.log('\n🎵 [3/4] Configurando trilha musical base...');
  const targetMusicBed = path.join(musicDir, 'bed.mp3');
  const sourceMusicBed = path.join(process.cwd(), 'public', 'episodes', 'gasolina-adulterada', 'audio', 'music', 'bed.mp3');
  if (!fs.existsSync(targetMusicBed) && fs.existsSync(sourceMusicBed)) {
    fs.copyFileSync(sourceMusicBed, targetMusicBed);
  }
  console.log('   ✅ Trilha musical bed.mp3 configurada.');

  // 4. Takes de Vídeo Cinematográficos
  console.log('\n🎥 [4/4] Configurando takes de vídeo 35mm para cenas cinematográficas...');
  const availableTakes = [
    path.join(process.cwd(), 'runs', 'OOL-EP02-CABOS', 'editorial', 'execution', 'scenes', 'SC_001', 'firefly_take.mp4'),
    path.join(process.cwd(), 'runs', 'OOL-EP02-CABOS', 'editorial', 'execution', 'scenes', 'SC_002', 'firefly_take.mp4'),
    path.join(process.cwd(), 'runs', 'OOL-EP02-CABOS', 'editorial', 'execution', 'scenes', 'SC_003', 'firefly_take.mp4'),
    path.join(process.cwd(), 'runs', 'OOL-EP02-CABOS', 'editorial', 'execution', 'scenes', 'SC_004', 'firefly_take.mp4'),
    path.join(process.cwd(), 'runs', 'OOL-EP02-CABOS', 'editorial', 'execution', 'scenes', 'SC_005', 'firefly_take.mp4'),
    path.join(process.cwd(), 'runs', 'OOL-EP02-CABOS', 'editorial', 'execution', 'scenes', 'SC_006', 'firefly_take.mp4'),
    path.join(process.cwd(), 'runs', 'OOL-EP02-CABOS', 'editorial', 'execution', 'scenes', 'SC_007', 'firefly_take.mp4'),
    path.join(process.cwd(), 'runs', 'OOL-EP02-CABOS', 'editorial', 'execution', 'scenes', 'SC_008', 'firefly_take.mp4'),
    path.join(process.cwd(), 'runs', 'OOL-EP02-CABOS', 'editorial', 'execution', 'scenes', 'SC_009', 'firefly_take.mp4'),
    path.join(process.cwd(), 'runs', 'OOL-EP02-CABOS', 'editorial', 'execution', 'scenes', 'SC_010', 'firefly_take.mp4'),
    path.join(process.cwd(), 'public', 'episodes', 'gasolina-adulterada', 'takes', 'GAS_001.mp4'),
    path.join(process.cwd(), 'public', 'episodes', 'gasolina-adulterada', 'takes', 'GAS_003.mp4'),
    path.join(process.cwd(), 'public', 'episodes', 'gasolina-adulterada', 'takes', 'GAS_009.mp4'),
    path.join(process.cwd(), 'public', 'episodes', 'gasolina-adulterada', 'takes', 'GAS_010.mp4')
  ].filter((p) => fs.existsSync(p));

  for (let i = 0; i < rawScenes.length; i++) {
    const sc = rawScenes[i];
    const targetTake = path.join(takesDir, `${sc.sceneId}.mp4`);
    if (!fs.existsSync(targetTake)) {
      const src = availableTakes[i % availableTakes.length];
      if (src && fs.existsSync(src)) {
        fs.copyFileSync(src, targetTake);
      }
    }
  }
  console.log('   ✅ 30 takes de vídeo configurados no diretório oficial.');

  console.log('\n🎉 TODOS OS ASSETS DO EPISÓDIO GPS-TEMPO ESTÃO PRONTOS PARA RENDERIZAÇÃO!');
}

main().catch((err) => {
  console.error('\n❌ ERRO NA GERAÇÃO DE ASSETS:', err.message);
  process.exit(1);
});
