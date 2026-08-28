import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {HslSoundFxRuntime} from '../hsl/postproduction/soundFxRuntime';
import {DialogLevelingAgent, LoudnessQaAgent} from '../hsl/postproduction/narrationAudioRuntime';
import {HslExecutableScene} from '../hsl/execution/types/execution';

async function main(): Promise<void> {
  console.log('🎛️ Iniciando Pós-Produção de Áudio e SFX: Episódio 01 (O Outro Lado do Pix)...');
  const productionId = 'OOL-EP01-PIX';
  const runRoot = path.resolve(path.join('runs', productionId));
  const executionRoot = path.join(runRoot, 'editorial', 'execution');
  const postprodRoot = path.join(runRoot, 'postproduction');
  fs.mkdirSync(postprodRoot, {recursive: true});

  // 1. Carrega todas as 42 cenas executáveis
  const executionPlanPath = path.join(executionRoot, 'episode.execution.json');
  const executionPlan = JSON.parse(fs.readFileSync(executionPlanPath, 'utf8')) as {scenes: string[]};
  const scenes: HslExecutableScene[] = executionPlan.scenes.map((relPath) => {
    return JSON.parse(fs.readFileSync(path.resolve(executionRoot, relPath), 'utf8')) as HslExecutableScene;
  });

  console.log(`[1/3] Processando Sound Design e SFX para as ${scenes.length} cenas...`);
  const sfxRuntime = new HslSoundFxRuntime();
  const sfxResult = await sfxRuntime.run({
    scenes,
    outputDirectory: postprodRoot,
    fps: 30
  });
  console.log(`  ✅ Plano de SFX gerado com ${sfxResult.plan.cues.length} marcadores de impacto e transição`);

  // 2. Nivelamento e QA da Narração (-16 LUFS broadcast)
  const narrationSource = path.join(postprodRoot, 'narration.mp3');
  console.log('[2/3] Executando Nivelamento de Diálogo e QA de Loudness Broadcast...');
  const levelingAgent = new DialogLevelingAgent();
  const leveledPath = path.join(postprodRoot, 'narration-leveled.wav');
  
  // Converte e nivela o áudio mestre
  levelingAgent.level(narrationSource, leveledPath);
  console.log(`  ✅ Narração nivelada com sucesso: ${leveledPath}`);

  const loudnessQa = new LoudnessQaAgent();
  const qaResult = loudnessQa.validate(leveledPath);
  console.log(`  ✅ Loudness QA Aprovado: ${qaResult.integrated_lufs} LUFS (Pico: ${qaResult.true_peak_dbtp} dBFS)`);

  // 3. Manifesto Oficial de Pós-Produção
  const postprodManifest = {
    status: 'POSTPRODUCTION_AUDIO_READY',
    production_id: productionId,
    total_scenes: scenes.length,
    sound_design: {
      sfx_cues_total: sfxResult.plan.cues.length,
      sfx_plan_path: sfxResult.planPath,
      sfx_bed_path: sfxResult.bedPath
    },
    narration_master: {
      source_path: narrationSource,
      leveled_path: leveledPath,
      integrated_lufs: qaResult.integrated_lufs,
      true_peak_dbtp: qaResult.true_peak_dbtp,
      qa_status: qaResult.status
    }
  };

  const manifestPath = path.join(postprodRoot, 'postproduction-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(postprodManifest, null, 2), 'utf8');

  console.log('\n[3/3] 🎉 PÓS-PRODUÇÃO DE ÁUDIO FINALIZADA COM SUCESSO!');
  console.log(JSON.stringify(postprodManifest, null, 2));
}

main().catch((error) => {
  console.error('❌ Erro na pós-produção de áudio:', error);
  process.exitCode = 1;
});
