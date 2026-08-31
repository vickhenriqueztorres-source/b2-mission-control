import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { EPISODE_DRONES_AGRO_CALCULATED_TIMELINE } from '../remotion/episodeDronesAgroTimelineData';

async function renderDronesAgroMaster() {
  console.log('══════════════════════════════════════════════════════════════════════════════════════');
  console.log('🚀 RENDERIZANDO MASTER FINAL DO DOCUMENTÁRIO // EPISÓDIO 17: DRONES GIGANTES DO AGRO');
  console.log('══════════════════════════════════════════════════════════════════════════════════════\n');

  const runDir = path.join(process.cwd(), 'runs', 'OOL-EP17-DRONES-AGRO');
  const pubDir = path.join(process.cwd(), 'public', 'episodes', 'drones-agro');
  const brainDir = path.join(process.env.USERPROFILE || 'C:\\Users\\brend', '.gemini', 'antigravity', 'brain', 'c5f04ba1-5381-4193-8f04-e56c8fb7e558');

  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(pubDir, { recursive: true });

  const finalMasterPath = path.join(runDir, 'final_master.mp4');
  const brainMasterPath = path.join(brainDir, 'final_master_drones_agro.mp4');

  // 1. Gera o render_manifest.json
  const renderManifestPath = path.join(runDir, 'render_manifest.json');
  fs.writeFileSync(renderManifestPath, JSON.stringify({
    episodeId: 'drones-agro',
    runId: 'OOL-EP17-DRONES-AGRO',
    fps: 30,
    totalFrames: EPISODE_DRONES_AGRO_CALCULATED_TIMELINE.totalDurationFrames,
    totalSeconds: EPISODE_DRONES_AGRO_CALCULATED_TIMELINE.totalDurationSeconds,
    renderedAt: new Date().toISOString()
  }, null, 2), 'utf8');

  console.log(`⏱️ Duração total: ${EPISODE_DRONES_AGRO_CALCULATED_TIMELINE.totalDurationSeconds}s (${EPISODE_DRONES_AGRO_CALCULATED_TIMELINE.totalDurationFrames} frames @ 30fps)`);
  console.log(`🎯 Iniciando renderização Remotion [Composition: EpisodeDronesAgro]...`);

  const remotionCmd = `npx remotion render remotion/index.ts EpisodeDronesAgro "${finalMasterPath}" --concurrency=2 --gl=angle`;
  execSync(remotionCmd, { stdio: 'inherit' });

  if (fs.existsSync(finalMasterPath)) {
    const sizeMb = (fs.statSync(finalMasterPath).size / (1024 * 1024)).toFixed(2);
    console.log(`\n✅ Renderização concluída com sucesso! Arquivo: ${finalMasterPath} (${sizeMb} MB)`);
    fs.copyFileSync(finalMasterPath, brainMasterPath);
    console.log(`✅ Master copiado para os artefatos: ${brainMasterPath}`);
  } else {
    throw new Error('Falha no render Remotion: final_master.mp4 não foi criado.');
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  console.log('🎉 PRODUÇÃO DO DOCUMENTÁRIO DRONES DO AGRO 100% FINALIZADA!');
  console.log('══════════════════════════════════════════════════════════════════════════════════════\n');
}

renderDronesAgroMaster().catch(err => {
  console.error('❌ Erro no render master:', err);
  process.exit(1);
});
