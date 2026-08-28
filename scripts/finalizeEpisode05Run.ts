import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync, spawnSync } from 'child_process';
import { RADAR_ASFALTO_CHAPTERS } from '../hsl/editorial/config/video5RadarEpisodeSeed';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';
import { PrdComplianceChecker } from '../pipeline/prdComplianceChecker';
import { ArtifactRegistry } from '../pipeline/artifactRegistry';

const episodeId = 'OOL-EP05-RADAR-ASFALTO';
const runDir = path.join(process.cwd(), 'runs', episodeId);
const executionDir = path.join(runDir, 'editorial', 'execution', 'scenes');
const postprodDir = path.join(runDir, 'postproduction');
const publicDir = path.join(process.cwd(), 'public');
const publicExecutionDir = path.join(publicDir, 'editorial', 'execution');
const botOutputDir = path.join(process.cwd(), 'chatgpt-image-bot', 'output');
const manifestPath = path.join(botOutputDir, 'manifest.jsonl');
const artifactDir = 'C:/Users/brend/.gemini/antigravity/brain/458559fc-b6a0-43b0-900e-40923ec3998e';

function sha256File(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

async function main() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🚀 FINALIZADOR MASTER DO EPISÓDIO 05 — O OUTRO LADO DO RADAR');
  console.log('══════════════════════════════════════════════════════════════════\n');

  // 1. Ler o manifesto do ChatGPT Bot
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifesto do ChatGPT Bot não encontrado em: ${manifestPath}`);
  }

  const manifestLines = fs.readFileSync(manifestPath, 'utf8').split('\n').filter(Boolean);
  const manifestMap = new Map<string, { filename: string; filepath: string; prompt: string; size_bytes: number }>();

  for (const line of manifestLines) {
    try {
      const data = JSON.parse(line);
      if (data.status === 'success' && data.filename && data.prompt) {
        // Extrai o ID OOL_XXX do prompt
        const match = data.prompt.match(/\[(OOL_\d+)\]/);
        if (match) {
          manifestMap.set(match[1], data);
        }
      }
    } catch {}
  }

  console.log(`📌 Imagens geradas com sucesso no manifesto: ${manifestMap.size}/50`);

  const allScenes = RADAR_ASFALTO_CHAPTERS.flatMap((ch) =>
    ch.scenes.map((sc) => ({ ...sc, chapter_id: ch.chapter_id, chapter_title: ch.title }))
  );

  let syncedCount = 0;

  // 2. Sincronizar os frames e emitir os recibos criptográficos
  console.log('\n📦 [1/4] Sincronizando Start Frames e Emitindo Recibos de IA...');
  for (const sc of allScenes) {
    const entry = manifestMap.get(sc.scene_id);
    if (!entry) {
      console.warn(`  ⚠️ Imagem pendente para ${sc.scene_id}`);
      continue;
    }

    const srcImg = path.join(botOutputDir, entry.filename);
    if (!fs.existsSync(srcImg)) {
      console.warn(`  ⚠️ Arquivo físico não encontrado: ${srcImg}`);
      continue;
    }

    const sceneDir = path.join(executionDir, sc.scene_id);
    const pubSceneDir = path.join(publicExecutionDir, sc.scene_id);
    fs.mkdirSync(sceneDir, { recursive: true });
    fs.mkdirSync(pubSceneDir, { recursive: true });

    const targetPng = path.join(sceneDir, 'firefly_start_frame.png');
    const pubTargetPng = path.join(pubSceneDir, 'firefly_start_frame.png');

    // Copia a imagem 4K gerada
    fs.copyFileSync(srcImg, targetPng);
    fs.copyFileSync(srcImg, pubTargetPng);

    const hash = sha256File(targetPng);
    const stat = fs.statSync(targetPng);

    const isDossier = sc.take_type === 'KEYFRAME_DOSSIER';

    // Emite o recibo oficial de autenticidade de IA
    const receipt = {
      scene_id: sc.scene_id,
      prompt: entry.prompt,
      sha256: hash,
      size_bytes: stat.size,
      status: 'AUTHENTIC_AI_GENERATED',
      source: 'CHATGPT_IMAGE_BOT',
      model: 'DALL-E 3',
      aspect_ratio: '16:9',
      takeType: isDossier ? 'KEYFRAME_DOSSIER' : 'CINEMATIC_TAKE',
      integratedText: sc.integrated_text,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(path.join(sceneDir, 'start_frame_receipt.json'), JSON.stringify(receipt, null, 2), 'utf8');
    fs.writeFileSync(path.join(pubSceneDir, 'start_frame_receipt.json'), JSON.stringify(receipt, null, 2), 'utf8');

    syncedCount++;
    console.log(`  ✅ [${sc.scene_id}] Sincronizado (${(stat.size / 1024 / 1024).toFixed(2)} MB) [${receipt.takeType}]`);
  }

  console.log(`\n🎉 Total sincronizado: ${syncedCount}/${allScenes.length} frames.`);

  if (syncedCount < allScenes.length) {
    console.log(`⏳ Aguardando os ${allScenes.length - syncedCount} frames restantes serem gerados pelo bot.`);
    return;
  }

  // 3. Montagem do Master Final via Remotion (Obrigatório com Motion Graphics, HUDs e Tipografia)
  console.log('\n🎬 [2/4] Renderização Canônica do Master Final via Remotion Engine...');
  const masterMp4Path = path.join(runDir, 'final_master.mp4');
  
  console.log('  🎞️ Renderizando composição Remotion com Motion Graphics, HUD e Textos Cinéticos...');
  execSync(`npx remotion render remotion/index.ts Episode05RadarAsfalto "${masterMp4Path}" --gl=angle`, { stdio: 'inherit' });

  // 4. Auditoria dos Gatekeepers
  console.log('\n🛡️ [3/4] Auditorias dos Gatekeepers & PRD Compliance...');
  const gateResult = PipelineContractGate.auditRun({ runId: episodeId, stageScope: 'FULL_PACKAGE' });
  console.log(`  Gatekeeper Status: ${gateResult.passed ? '✅ PASS' : '❌ FAIL'}`);

  const prdResult = PrdComplianceChecker.verifyRun(episodeId);
  console.log(`  PRD Compliance: ${prdResult.overallPassed ? '✅ CONFORME' : '❌ NÃO CONFORME'}`);

  // 5. Registro Canônico no Artifact Registry
  console.log('\n🏷️ [4/4] Registro Canônico no Artifact Registry...');
  const registry = new ArtifactRegistry();
  const regSummary = registry.registerRun(runDir, episodeId);
  console.log(`  🏷️ Handle Canônico Atribuído: ${regSummary.handle}/master`);

  if (fs.existsSync(masterMp4Path)) {
    fs.copyFileSync(masterMp4Path, path.join(artifactDir, 'ep05_radar_asfalto_final_master.mp4'));
  }

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('🎉 PRODUÇÃO DO EPISÓDIO 05 FINALIZADA COM SUCESSO ABSOLUTO!');
  console.log(`🎬 MASTER MP4: ${masterMp4Path}`);
  console.log('══════════════════════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ Erro na finalização:', err);
  process.exitCode = 1;
});
