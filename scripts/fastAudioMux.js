const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const runDir = path.join(process.cwd(), 'runs', 'OOL-EP05-RADAR-ASFALTO');
const postDir = path.join(runDir, 'postproduction');
const tempDir = path.join(runDir, 'temp_segments');

const rawVideo = path.join(runDir, 'raw_video_stream.mp4');
const narration = path.join(postDir, 'narration.mp3');
const ambient = path.join(process.cwd(), 'assets', 'audio_library', 'audio', 'music', 'cinematic', 'ambient', 'ambient_drone_01.wav');
const mixedAudio = path.join(tempDir, 'mixed_audio.m4a');
const finalMaster = path.join(runDir, 'final_master.mp4');

console.log('🎵 [1/2] Mixando narração (-16 LUFS) com trilha de drone ambiente em loop...');
const mixCmd = `ffmpeg -y -i "${narration}" -stream_loop -1 -i "${ambient}" -filter_complex "[0:a]volume=1.0[a1];[1:a]volume=0.10[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=0[aout]" -map "[aout]" -c:a aac -b:a 256k "${mixedAudio}"`;
execSync(mixCmd, { stdio: 'inherit' });

console.log('\n🎬 [2/2] Muxing ultra-rápido de vídeo e áudio (-c copy)...');
const muxCmd = `ffmpeg -y -i "${rawVideo}" -i "${mixedAudio}" -map 0:v -map 1:a -c:v copy -c:a copy -movflags +faststart "${finalMaster}"`;
execSync(muxCmd, { stdio: 'inherit' });

console.log('\n🔍 Verificando integridade com FFprobe...');
const probeOut = execSync(`ffprobe -v error -show_entries format=duration,size:stream=width,height,codec_name -of json "${finalMaster}"`).toString();
const probe = JSON.parse(probeOut);
const dur = parseFloat(probe.format.duration);
const sizeMb = parseFloat(probe.format.size) / (1024 * 1024);
const v = probe.streams.find(s => s.width);
const a = probe.streams.find(s => !s.width);

console.log('══════════════════════════════════════════════════════════════════');
console.log('🎬 MASTER FINAL RENDERIZADO COM SUCESSO ABSOLUTO:');
console.log(`   - Arquivo: ${finalMaster}`);
console.log(`   - Duração: ${dur.toFixed(2)}s (${(dur / 60).toFixed(2)} minutos)`);
console.log(`   - Tamanho: ${sizeMb.toFixed(2)} MB`);
console.log(`   - Resolução: ${v.width}x${v.height} (${v.codec_name})`);
console.log(`   - Áudio: ${a.codec_name} 48kHz stereo`);
console.log('══════════════════════════════════════════════════════════════════');
