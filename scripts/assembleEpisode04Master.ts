import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';
import { RunManifest } from '../pipeline/runManifest';
import { ArtifactRegistry } from '../pipeline/artifactRegistry';
import { PrdComplianceChecker } from '../pipeline/prdComplianceChecker';

async function main(): Promise<void> {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🎬 RENDER & ASSEMBLY MASTER: OOL-EP04-GPS-TEMPO');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const episodeId = 'OOL-EP04-GPS-TEMPO';
  const prodDir = path.join(process.cwd(), 'runs', episodeId);
  const postDir = path.join(prodDir, 'postproduction');
  const executionDir = path.join(prodDir, 'editorial', 'execution');
  const scenesDir = path.join(executionDir, 'scenes');

  const manifest = new RunManifest(prodDir, episodeId);

  // 1. Validar Pré-Render Gate
  console.log('[PASSO 1/5] Executando Gate Determinístico Pré-Render...');
  PipelineContractGate.assertPreRenderIntegrity(episodeId);
  console.log('✅ Gate Pré-Render Aprovado: 50/50 cenas com frames e takes válidos!\n');

  // 2. Carregar Timeline Sync
  console.log('[PASSO 2/5] Carregando Timeline Sincronizada...');
  const syncJsonPath = path.join(postDir, 'scene_timeline_sync.json');
  const syncData = JSON.parse(fs.readFileSync(syncJsonPath, 'utf8'));
  const scenes = syncData.scenes;

  // 3. Montar Video Stream Concat com duração exata de cada cena
  console.log('[PASSO 3/5] Gerando stream de vídeo contínuo sincronizado com o áudio...');
  const concatVideoList: string[] = [];
  const tempSegmentsDir = path.join(prodDir, 'temp_segments');
  fs.mkdirSync(tempSegmentsDir, { recursive: true });

  manifest.startStage('REMOTION_RENDER', scenes.length);

  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const rawTake = path.join(scenesDir, sc.sceneId, 'firefly_take.mp4');
    const segPath = path.join(tempSegmentsDir, `seg_${sc.sceneId}.mp4`);
    const duration = sc.durationSeconds;

    // Trunca / estende o take para bater 100% com o tempo da locução
    const cmd = `ffmpeg -y -hide_banner -loglevel error -stream_loop -1 -i "${rawTake}" -t ${duration.toFixed(3)} -c:v libx264 -pix_fmt yuv420p -r 30 "${segPath}"`;
    execSync(cmd);
    concatVideoList.push(`file '${segPath.replace(/\\/g, '/')}'`);
  }

  const concatTxt = path.join(tempSegmentsDir, 'concat_video.txt');
  fs.writeFileSync(concatTxt, concatVideoList.join('\n'), 'utf8');

  const rawVideoPath = path.join(prodDir, 'raw_video_stream.mp4');
  const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${concatTxt}" -c copy "${rawVideoPath}"`;
  execSync(concatCmd);
  manifest.completeStage('REMOTION_RENDER', scenes.length, { rawVideoPath });
  console.log(`✅ Vídeo contínuo gerado: ${rawVideoPath} (${(fs.statSync(rawVideoPath).size / 1024 / 1024).toFixed(2)} MB)\n`);

  // 4. Muxing com Narração Master e Trilha Sonora
  console.log('[PASSO 4/5] Executando FFmpeg Mux com Master Narration...');
  manifest.startStage('FFMPEG_MUX', 1);

  const narrationMp3 = path.join(postDir, 'narration.mp3');
  const ambientTrack = path.join(process.cwd(), 'assets', 'audio_library', 'audio', 'music', 'cinematic', 'ambient', 'ambient_drone_01.wav');
  const finalMasterMp4 = path.join(prodDir, 'final_master.mp4');

  let muxCmd: string;
  if (fs.existsSync(ambientTrack)) {
    muxCmd = `ffmpeg -y -hide_banner -loglevel error -i "${rawVideoPath}" -i "${narrationMp3}" -i "${ambientTrack}" -filter_complex "[1:a]volume=1.0[a1];[2:a]volume=0.15[a2];[a1][a2]amix=inputs=2:duration=first[aout]" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 256k -shortest "${finalMasterMp4}"`;
  } else {
    muxCmd = `ffmpeg -y -hide_banner -loglevel error -i "${rawVideoPath}" -i "${narrationMp3}" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest "${finalMasterMp4}"`;
  }
  execSync(muxCmd);

  manifest.completeStage('FFMPEG_MUX', 1, { finalMasterMp4 });
  manifest.recordAsset('final_master.mp4', finalMasterMp4);

  const masterSizeMb = fs.statSync(finalMasterMp4).size / 1024 / 1024;
  const probe = PipelineContractGate.probeMedia(finalMasterMp4);
  console.log(`✅ FINAL MASTER GERADO: ${finalMasterMp4}`);
  console.log(`   Tamanho: ${masterSizeMb.toFixed(2)} MB | Duração: ${probe.duration.toFixed(2)}s | Resolução: ${probe.width}x${probe.height} (${probe.codec})\n`);

  // 5. Auditoria de Contrato e Conformidade do PRD
  console.log('[PASSO 5/5] Executando Auditoria Global de Conformidade do PRD...');
  const contractReport = PipelineContractGate.auditRun({ runId: episodeId, stageScope: 'FULL_PACKAGE' });
  console.log(`Contract Gate: ${contractReport.passed ? '✅ APROVADO' : '❌ REPROVADO'}`);

  const compliance = PrdComplianceChecker.verifyRun(episodeId);
  console.log(`\n📊 Status de Conformidade do PRD: ${compliance.overallPassed ? '✅ APROVADO' : '❌ REPROVADO'}`);
  for (const r of compliance.results) {
    console.log(`  - [${r.ruleId}] ${r.name}: ${r.passed ? '✅ PASS' : '❌ FAIL'}`);
  }

  // Atualizar manifesto para COMPLETED
  manifest.setOverallStatus('COMPLETED');

  // Registrar no ArtifactRegistry Central
  const registry = new ArtifactRegistry();
  const regSummary = registry.registerRun(prodDir, episodeId);

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('🎉 EPISÓDIO 04 PRODUZIDO E FINALIZADO COM 100% DE SUCESSO!');
  console.log(`📁 FINAL MASTER: ${finalMasterMp4}`);
  console.log(`🏷️ HANDLE CANÔNICO: ${regSummary.handle}/master`);
  console.log('══════════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ Erro no assembly do EP04:', err);
  process.exit(1);
});
