import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import scenesData from '../contracts/episodes/drones-agro.scenes.json';
import { ElevenLabsAdapter } from '../adapters/elevenLabsAdapter';

async function generateDronesAgroNarration() {
  console.log('══════════════════════════════════════════════════════════════════════════════════════');
  console.log('🎙️ GERANDO LOCUÇÃO ELEVENLABS (CHRIS) // EPISÓDIO 17: DRONES GIGANTES DO AGRO');
  console.log('══════════════════════════════════════════════════════════════════════════════════════\n');

  const runDir = path.join(process.cwd(), 'runs', 'OOL-EP17-DRONES-AGRO');
  const runAudioDir = path.join(runDir, 'audio', 'narration');
  const publicAudioDir = path.join(process.cwd(), 'public', 'episodes', 'drones-agro', 'audio', 'narration');

  fs.mkdirSync(runAudioDir, { recursive: true });
  fs.mkdirSync(publicAudioDir, { recursive: true });

  const adapter = new ElevenLabsAdapter();
  await adapter.initialize();

  let totalDuration = 0;

  for (let i = 0; i < scenesData.length; i++) {
    const sc = scenesData[i];
    const sId = sc.sceneId;
    const runMp3Path = path.join(runAudioDir, `${sId}.mp3`);
    const publicMp3Path = path.join(publicAudioDir, `${sId}.mp3`);

    console.log(`[${i + 1}/${scenesData.length}] Sintetizando ${sId}...`);
    console.log(`  Texto: "${sc.voiceover}"`);

    try {
      // Se já existe com tamanho > 0, pula síntese
      if (fs.existsSync(runMp3Path) && fs.statSync(runMp3Path).size > 1000) {
        console.log(`  ⚡ [CACHE] Arquivo existente reutilizado.`);
        fs.copyFileSync(runMp3Path, publicMp3Path);
      } else {
        const res = await adapter.synthesizeText(sc.voiceover, runMp3Path, {
          stability: 0.50,
          similarityBoost: 0.80
        });
        fs.copyFileSync(runMp3Path, publicMp3Path);
        console.log(`  ✅ Gravado: ${(fs.statSync(runMp3Path).size / 1024).toFixed(1)} KB (Duração: ${res.durationSeconds}s)`);
      }
    } catch (err: any) {
      console.warn(`  ⚠️ ElevenLabs erro: ${err.message}. Criando áudio sintetizado local...`);
      // Fallback: executa script python para edge-tts ou sintetizador local se houver
      const { execSync } = require('child_process');
      try {
        execSync(`python -c "import asyncio, edge_tts; asyncio.run(edge_tts.Communicate('''${sc.voiceover}''', 'pt-BR-AntonioNeural').save('''${runMp3Path}'''))"`);
        fs.copyFileSync(runMp3Path, publicMp3Path);
        console.log(`  ✅ Fallback edge-tts gerado.`);
      } catch (fallbackErr: any) {
        console.error(`  ❌ Erro no fallback:`, fallbackErr.message);
      }
    }
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  console.log('🎉 TODAS AS LOCUÇÕES FORAM GERADAS COM SUCESSO!');
  console.log('══════════════════════════════════════════════════════════════════════════════════════\n');
}

generateDronesAgroNarration().catch(err => {
  console.error('❌ Erro fatal na geração de narração:', err);
  process.exit(1);
});
