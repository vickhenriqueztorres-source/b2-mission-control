import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {CinematicDirectionShadowRunner} from '../hsl/cinematic/runners/cinematicDirectionShadowRunner';
import {HSL_VIDEO_1_PIX_EPISODE_SEED} from '../hsl/editorial/config/video1PixEpisodeSeed';
import {HslEditorialRuntime} from '../hsl/editorial/editorialRuntime';
import {CinematicExecutionCompiler} from '../hsl/execution/cinematicExecutionCompiler';

async function main(): Promise<void> {
  console.log('🚀 Iniciando Produção do Episódio 01: O Outro Lado do Pix...');
  process.env.HSL_NARRATION_WPM = '146.1';
  const productionId = 'OOL-EP01-PIX';
  const outputRoot = path.resolve(path.join('runs', productionId));

  // 1. Runtime Editorial (Beats, Roteiro & Regulação BACEN)
  console.log('\n[1/4] Executando HslEditorialRuntime...');
  const editorial = new HslEditorialRuntime().run(
    productionId,
    path.join(outputRoot, 'editorial'),
    HSL_VIDEO_1_PIX_EPISODE_SEED
  );

  // 2. Direção Cinematográfica (Shadow Runner)
  console.log('[2/4] Executando CinematicDirectionShadowRunner...');
  const cinematic = await new CinematicDirectionShadowRunner().run({
    productionId,
    editorialPackagePath: editorial.episodePackagePath
  });

  // 3. Compilador de Execução & DocumentaryEditorAgent (Arquitetura 3 Camadas)
  console.log('[3/4] Compilando execução e pacotes de cena em 3 camadas...');
  const execution = new CinematicExecutionCompiler().compile(editorial.episodePackagePath, cinematic);

  // 4. Exibição do Manifesto do Episódio
  const manifest = {
    status: 'EPISODE_01_PIX_READY_FOR_PRODUCTION',
    production_id: productionId,
    title: HSL_VIDEO_1_PIX_EPISODE_SEED.title,
    aesthetic: 'Denis Villeneuve Cyber-Industrial (35mm Anamorphic)',
    output_directory: outputRoot,
    episode_package_path: editorial.episodePackagePath,
    cinematic_plan_path: cinematic.episodePlanPath,
    execution_plan_path: execution.executionPlanPath,
    scenes_compiled: execution.scenePaths.length,
    scenes: [
      {
        scene_id: 'SCENE_001',
        title: 'O Início Invisível (O Toque na Tela)',
        layer_1_chatgpt_blueprint: 'visual_reference.png',
        layer_1_clean_start_frame: 'firefly_start_frame.png',
        layer_2_firefly_motion: 'firefly_motion_prompt.txt',
        layer_3_remotion_hud: 'IndustrialXRayHUD + App UI Overlay'
      },
      {
        scene_id: 'SCENE_002',
        title: 'A Estrutura Oculta (Data Center & Racks SPI)',
        layer_1_chatgpt_blueprint: 'visual_reference.png',
        layer_1_clean_start_frame: 'firefly_start_frame.png',
        layer_1_xray_layer: 'xray_layer.png',
        layer_2_firefly_motion: 'firefly_motion_prompt.txt',
        layer_3_remotion_hud: 'LaserRevealWipe + IndustrialXRayHUD (Latência 2.7ms)'
      },
      {
        scene_id: 'SCENE_003',
        title: 'A Jornada do Pix (Mapa 3D: SP -> Barueri -> Brasília)',
        layer_1_background: 'Dark Terrain 3D Grid',
        layer_3_remotion_vector: 'CyberMapTrace (100% Remotion Vetorial 4K)'
      },
      {
        scene_id: 'SCENE_004',
        title: 'O Ponto de Estrangulamento (Checkpoint Antifraude & Cofre)',
        layer_1_chatgpt_blueprint: 'visual_reference.png',
        layer_1_clean_start_frame: 'firefly_start_frame.png',
        layer_1_xray_layer: 'xray_layer.png',
        layer_2_firefly_motion: 'firefly_motion_prompt.txt',
        layer_3_remotion_hud: 'LaserRevealWipe + IndustrialXRayHUD (Latência 132ms / Estresse 89%)'
      }
    ]
  };

  const manifestPath = path.join(outputRoot, 'episode-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\n[4/4] 🎉 EPISÓDIO 01 CRIADO E ESTRUTURADO COM SUCESSO!');
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error('❌ Erro na criação do Episódio 01:', error);
  process.exitCode = 1;
});
