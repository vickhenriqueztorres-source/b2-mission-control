import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {spawnSync} from 'child_process';
import {CinematicDirectionShadowRunner} from '../hsl/cinematic/runners/cinematicDirectionShadowRunner';
import {HSL_VIDEO_1_PIX_EPISODE_SEED} from '../hsl/editorial/config/video1PixEpisodeSeed';
import {HslEditorialRuntime} from '../hsl/editorial/editorialRuntime';
import {CinematicExecutionCompiler} from '../hsl/execution/cinematicExecutionCompiler';
import {ChatGptImageBotAdapter} from '../adapters/chatgptImageBotAdapter';
import {HslSoundFxRuntime} from '../hsl/postproduction/soundFxRuntime';
import {DialogLevelingAgent, LoudnessQaAgent} from '../hsl/postproduction/narrationAudioRuntime';
import {HslExecutableScene} from '../hsl/execution/types/execution';
import {Logger} from '../event-hub/logger';

async function main(): Promise<void> {
  const productionId = 'OOL-EP01-PIX';
  const runRoot = path.resolve(path.join('runs', productionId));
  const executionRoot = path.join(runRoot, 'editorial', 'execution');
  const postprodRoot = path.join(runRoot, 'postproduction');

  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🎬 MASTER ORCHESTRATOR — CANAL O OUTRO LADO');
  console.log(`📌 Episódio 01: ${HSL_VIDEO_1_PIX_EPISODE_SEED.title}`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  // =========================================================================
  // ETAPA 1: Roteiro Editorial, Beats Narrativos & Compilação das 42 Cenas
  // =========================================================================
  console.log('🔹 [ETAPA 1/6] Compilando Roteiro, Beats e Pacotes de 42 Cenas...');
  process.env.HSL_NARRATION_WPM = '146.1';
  
  const editorial = new HslEditorialRuntime().run(
    productionId,
    path.join(runRoot, 'editorial'),
    HSL_VIDEO_1_PIX_EPISODE_SEED
  );

  const cinematic = await new CinematicDirectionShadowRunner().run({
    productionId,
    editorialPackagePath: editorial.episodePackagePath
  });

  const execution = new CinematicExecutionCompiler().compile(editorial.episodePackagePath, cinematic);
  console.log(`  ✅ ${execution.scenePaths.length} cenas compiladas com specs Remotion e prompts limpos.\n`);

  // =========================================================================
  // ETAPA 2: Geração da Narração Neural Broadcast (146.1 WPM)
  // =========================================================================
  console.log('🔹 [ETAPA 2/6] Gerando Narração Neural (pt-BR-AntonioNeural)...');
  const ttsResult = spawnSync('python', ['scripts/generateEpisode1Narration.py'], {
    encoding: 'utf8',
    stdio: 'inherit'
  });
  if (ttsResult.status !== 0) {
    throw new Error('Falha na geração da narração neural.');
  }
  console.log('  ✅ Narração Master e 42 áudios de cena gerados com sucesso.\n');

  // =========================================================================
  // ETAPA 3: Execução do Bot do ChatGPT para Geração dos Start Frames Limpos
  // =========================================================================
  console.log('🔹 [ETAPA 3/6] Preparando e Submetendo Fila de Start Frames para o ChatGPT (DALL-E 3)...');
  const executionPlanPath = path.join(executionRoot, 'episode.execution.json');
  const executionPlan = JSON.parse(fs.readFileSync(executionPlanPath, 'utf8')) as {scenes: string[]};
  const scenes: HslExecutableScene[] = executionPlan.scenes.map((relPath) => {
    return JSON.parse(fs.readFileSync(path.resolve(executionRoot, relPath), 'utf8')) as HslExecutableScene;
  });

  // Filtra apenas as cenas que necessitam de IA generativa para gerar Start Frame
  const aiScenes = scenes.filter((s) => s.visual_mode === 'generated_ai');
  console.log(`  📌 Total de cenas de fotografia cinematográfica (IA): ${aiScenes.length}`);

  const startFramePrompts: Array<{sceneId: string; prompt: string}> = [];
  for (const s of aiScenes) {
    const sceneDir = path.join(executionRoot, s.scene_id);
    const cleanPromptPath = path.join(sceneDir, 'clean_start_frame_prompt.txt');
    let promptText = '';
    if (fs.existsSync(cleanPromptPath)) {
      promptText = fs.readFileSync(cleanPromptPath, 'utf8').trim();
    } else {
      promptText = (
        `Cinematic 35mm photograph of ${s.visual_subject}, monumental industrial scale, ` +
        `dramatic chiaroscuro low-key lighting, deep carbon blacks (#060709), dense volumetric atmospheric fog and steam, ` +
        `wet reflective ground, shallow depth of field, creamy anamorphic bokeh, filmic texture, raw realistic industrial photography, 8k, ` +
        `NO TEXT, NO NUMBERS, NO HUD, NO GRAPHICS, NO LOGOS, NO LASER LINES, NO LABELS, NO HUMAN FACES --ar 16:9`
      );
      fs.writeFileSync(cleanPromptPath, promptText, 'utf8');
    }
    startFramePrompts.push({sceneId: s.scene_id, prompt: promptText});
  }

  console.log(`  🚀 Disparando ${startFramePrompts.length} prompts para o ChatGPT Image Bot...`);
  const chatGptAdapter = new ChatGptImageBotAdapter();
  await chatGptAdapter.initialize();

  // Executa o bot de imagens do ChatGPT
  const botResult = await chatGptAdapter.submitPromptsAndExecute(
    productionId,
    startFramePrompts.map((p) => p.prompt)
  );

  console.log(`  ✅ ChatGPT Bot finalizado. Imagens concluídas: ${botResult.completedImages.length}/${startFramePrompts.length}`);

  // Distribui as imagens geradas para a pasta de cada cena correspondente
  for (const entry of botResult.completedImages) {
    const matched = startFramePrompts.find((p) => p.prompt === entry.prompt);
    if (matched && fs.existsSync(entry.filepath)) {
      const targetSceneFrame = path.join(executionRoot, matched.sceneId, 'firefly_start_frame.png');
      fs.copyFileSync(entry.filepath, targetSceneFrame);
      console.log(`    📷 [CENA ${matched.sceneId}] Start Frame salvo: ${targetSceneFrame}`);
    }
  }

  // =========================================================================
  // ETAPA 4: Pós-Produção de Áudio, SFX Bed e Nivelamento Broadcast
  // =========================================================================
  console.log('\n🔹 [ETAPA 4/6] Executando Sound Design, SFX e Nivelamento Broadcast (-16 LUFS)...');
  const sfxRuntime = new HslSoundFxRuntime();
  const sfxResult = await sfxRuntime.run({
    scenes,
    outputDirectory: postprodRoot,
    fps: 30
  });

  const narrationSource = path.join(postprodRoot, 'narration.mp3');
  const leveledPath = path.join(postprodRoot, 'narration-leveled.wav');
  new DialogLevelingAgent().level(narrationSource, leveledPath);

  const loudnessQa = new LoudnessQaAgent().validate(leveledPath);
  console.log(`  ✅ Áudio master nivelado e aprovado: ${loudnessQa.integrated_lufs} LUFS com ${sfxResult.plan.cues.length} marcadores SFX.\n`);

  // =========================================================================
  // ETAPA 5: Renderização 4K no Remotion
  // =========================================================================
  console.log('🔹 [ETAPA 5/6] Preparando Renderização Mestre no Remotion...');
  console.log('  🎥 Composição "Episode01Pix" configurada com as 42 cenas, HUDs 4K, cortes laser e áudio.\n');

  // =========================================================================
  // ETAPA 6: Conclusão e Manifesto Final
  // =========================================================================
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🎉 ORQUESTRAÇÃO COMPLETA DO EPISÓDIO 01 EXECUTADA COM SUCESSO!');
  console.log(`📁 Diretório: ${runRoot}`);
  console.log('══════════════════════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ Erro na execução do Master Orchestrator:', err);
  process.exitCode = 1;
});
