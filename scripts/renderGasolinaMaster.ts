import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia } from '@remotion/renderer';
import { parseEpisodeContract } from '../contracts/episodeContract';
import { buildSceneContracts, RawSceneInput } from '../contracts/buildSceneContracts';
import { validateVisualBatch, BATCH_1_SCENE_IDS } from './dispatchFireflyBatch';
import { validateNarrationBatch } from './dispatchNarrationBatch';
import { validateAudioBed } from './dispatchAudioBed';
import { runGasolinaRenderGate } from '../tests/gasolina_render_gate.test';

export interface RenderOptions {
  runId?: string;
  preview?: boolean;
  dryRun?: boolean;
  allowPartialAudio?: boolean;
}

export function validateRenderPreconditions(options?: RenderOptions): {
  passed: boolean;
  runId: string;
  isPreview: boolean;
  targetOutputPath: string;
  reason?: string;
} {
  const isPreview = options?.preview || process.env.PREVIEW === '1' || process.argv.includes('--preview');
  const allowPartialAudio = options?.allowPartialAudio || process.env.ALLOW_PARTIAL_AUDIO === '1' || process.argv.includes('--allow-partial-audio');
  const runId = options?.runId || 'latest';
  const runsEpisodeBase = path.join(process.cwd(), 'runs', 'gasolina-adulterada');
  const runDir = path.join(runsEpisodeBase, runId);

  const contractPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.episode.json');
  const scenesPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.scenes.json');

  if (!fs.existsSync(contractPath) || !fs.existsSync(scenesPath)) {
    return {
      passed: false,
      runId,
      isPreview,
      targetOutputPath: '',
      reason: 'RENDER_BLOCKED: Arquivos de contrato ou cenas não encontrados.'
    };
  }

  const episodeContract = parseEpisodeContract(contractPath);
  const rawScenes: RawSceneInput[] = JSON.parse(fs.readFileSync(scenesPath, 'utf8'));
  const sceneContracts = buildSceneContracts(episodeContract, rawScenes);

  const targetOutputPath = isPreview
    ? path.join(runDir, 'preview_lote1.mp4')
    : path.join(runDir, 'final_master.mp4');

  // 0. GATE DE INTEGRIDADE METROLÓGICA (Denylist, SHA Reuse, Foreign HUD, VO QC)
  const gateCheck = runGasolinaRenderGate();
  if (!gateCheck.passed) {
    const errorSummaries = gateCheck.failures.map(f => `[${f.code}] ${f.detail}`).join('\n  - ');
    return {
      passed: false,
      runId,
      isPreview,
      targetOutputPath,
      reason: `RENDER_BLOCKED: Falhas críticas de integridade detectadas no gate:\n  - ${errorSummaries}`
    };
  }

  // 1. Validação de Visuals (SEMPRE OBRIGATÓRIA: 21 CINEMATOGRÁFICAS + 9 DOSSIÊS)
  if (isPreview) {
    const visualCheck = validateVisualBatch(runId, BATCH_1_SCENE_IDS, runDir);
    if (!visualCheck.passed) {
      return {
        passed: false,
        runId,
        isPreview,
        targetOutputPath,
        reason: `RENDER_BLOCKED: visuals_incomplete_preview (${visualCheck.successCount}/10 takes do Lote 1 encontrados).`
      };
    }
  } else {
    const cinematicSceneIds = sceneContracts
      .filter(s => s.take_type === 'CINEMATIC_TAKE')
      .map(s => s.sceneId);

    const visualCheck = validateVisualBatch(runId, cinematicSceneIds, runDir);
    if (!visualCheck.passed) {
      return {
        passed: false,
        runId,
        isPreview,
        targetOutputPath,
        reason: `RENDER_BLOCKED: visuals_incomplete_master (${visualCheck.successCount}/${cinematicSceneIds.length} takes cinematográficos encontrados).`
      };
    }
  }

  // 2. Validação de Narração (Relaxada se allowPartialAudio for true)
  if (!allowPartialAudio) {
    const narrationCheck = validateNarrationBatch(runId, runDir);
    if (isPreview) {
      const missingBatch1Vo = BATCH_1_SCENE_IDS.filter(id => {
        const p = path.join(runDir, 'audio', 'narration', `${id}.mp3`);
        return !fs.existsSync(p) || fs.statSync(p).size === 0;
      });
      if (missingBatch1Vo.length > 0) {
        return {
          passed: false,
          runId,
          isPreview,
          targetOutputPath,
          reason: `RENDER_BLOCKED: narration_incomplete_preview (Faltam ${missingBatch1Vo.length}/10 locuções do Lote 1).`
        };
      }
    } else {
      if (!narrationCheck.passed) {
        return {
          passed: false,
          runId,
          isPreview,
          targetOutputPath,
          reason: `RENDER_BLOCKED: narration_incomplete_master (${narrationCheck.existingCount}/30 locuções encontradas).`
        };
      }
    }

    // 3. Validação de Áudio Bed (Música e SFX)
    const audioCheck = validateAudioBed(runId, runDir);
    if (!audioCheck.musicValid) {
      return {
        passed: false,
        runId,
        isPreview,
        targetOutputPath,
        reason: 'RENDER_BLOCKED: music_missing (audio/music/bed.wav ausente ou vazio).'
      };
    }

    if (isPreview) {
      const missingBatch1Sfx = BATCH_1_SCENE_IDS.filter(id => {
        const p = path.join(runDir, 'audio', 'sfx', `${id}.wav`);
        return !fs.existsSync(p) || fs.statSync(p).size === 0;
      });
      if (missingBatch1Sfx.length > 0) {
        return {
          passed: false,
          runId,
          isPreview,
          targetOutputPath,
          reason: `RENDER_BLOCKED: sfx_incomplete_preview (Faltam ${missingBatch1Sfx.length}/10 stems de SFX do Lote 1).`
        };
      }
    } else {
      if (!audioCheck.sfxValid) {
        return {
          passed: false,
          runId,
          isPreview,
          targetOutputPath,
          reason: `RENDER_BLOCKED: sfx_incomplete_master (${audioCheck.sfxStemsPresent}/30 stems de SFX encontrados).`
        };
      }
    }
  }

  return {
    passed: true,
    runId,
    isPreview,
    targetOutputPath
  };
}

export async function runGasolinaRender(options?: RenderOptions): Promise<void> {
  const check = validateRenderPreconditions(options);

  if (!check.passed) {
    console.error(`\n❌ ${check.reason}`);
    console.error(`🚫 RENDERIZAÇÃO BLOQUEADA: Remotion não foi invocado para proteger a integridade do master.\n`);
    throw new Error(check.reason);
  }

  console.log(`\n🎬 TODOS OS ASSETS VALIDADOS COM SUCESSO!`);
  console.log(`Iniciando renderização Remotion: ${check.targetOutputPath}...`);

  if (!options?.dryRun) {
    const outDir = path.resolve(process.cwd(), '.remotion-bundle');
    console.log(`📦 Gerando bundle local persistente em: ${outDir}...`);
    
    const bundleLocation = await bundle({
      entryPoint: path.resolve(process.cwd(), 'remotion/index.ts'),
      outDir,
      publicDir: path.resolve(process.cwd(), 'public')
    });

    console.log(`🔍 Selecionando composição EpisodeGasolina...`);
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'EpisodeGasolina',
    });

    console.log(`🚀 Renderizando ${composition.durationInFrames} frames (${(composition.durationInFrames / composition.fps).toFixed(0)}s) @ ${composition.fps}fps...`);

    const targetDir = path.dirname(check.targetOutputPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: check.targetOutputPath,
      concurrency: 3,
      chromiumOptions: {
        gl: 'angle',
      },
      onProgress: ({ renderedFrames, progress }) => {
        if (renderedFrames % 100 === 0 || renderedFrames === composition.durationInFrames) {
          const percent = (progress * 100).toFixed(1);
          console.log(`[REMOTION MASTER] ${renderedFrames}/${composition.durationInFrames} frames (${percent}%) renderizados...`);
        }
      }
    });

    console.log(`\n✅ MASTER FINAL RENDERIZADO COM SUCESSO: ${check.targetOutputPath}`);
  }
}

if (require.main === module) {
  runGasolinaRender().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
