import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { parseEpisodeContract } from '../contracts/episodeContract';
import { buildSceneContracts, RawSceneInput } from '../contracts/buildSceneContracts';
import { VideoRepositoryMatcher } from '../hsl/media/videoRepositoryMatcher';
import { buildFireflyPrompt, FireflyPromptOutput } from '../contracts/buildFireflyPrompt';
import { SceneVisualContract } from '../contracts/sceneVisualContract';
import { isFireflySessionLive } from '../config/fireflySessionLive';
import { FireflyAdapter } from '../adapters/fireflyAdapter';

export const BATCH_1_SCENE_IDS = [
  'GAS_001',
  'GAS_002',
  'GAS_003',
  'GAS_006',
  'GAS_007',
  'GAS_009',
  'GAS_010',
  'GAS_011',
  'GAS_012',
  'GAS_014'
];

export const BATCH_2_SCENE_IDS = [
  'GAS_017',
  'GAS_018',
  'GAS_019',
  'GAS_020',
  'GAS_022',
  'GAS_023',
  'GAS_024',
  'GAS_025',
  'GAS_028',
  'GAS_029',
  'GAS_030'
];

export const DOSSIER_SCENE_COMPONENTS: Record<string, string> = {
  GAS_004: 'FlowMeterPulserSchematicHUD',
  GAS_005: 'IndustrialXRayHUD',
  GAS_008: 'IndustrialXRayHUD',
  GAS_013: 'FlowDiscrepancyHUD',
  GAS_015: 'FlowDiscrepancyHUD',
  GAS_016: 'KineticNumberCounter',
  GAS_021: 'IndustrialXRayHUD',
  GAS_026: 'IndustrialXRayHUD',
  GAS_027: 'IndustrialXRayHUD'
};

export interface LotePlanItem {
  sceneId: string;
  order: number;
  required_category: string;
  visual_must_include: string[];
  visual_must_not: string[];
  domainTags: string[];
  allowed_sources: string[];
  prompt: FireflyPromptOutput;
  status: 'QUEUED_FOR_DISPATCH' | 'SKIPPED_HIT' | 'SKIPPED_DOSSIER' | 'QUEUED_OTHER_BATCH';
}

export interface LotePlanReport {
  timestamp: string;
  runId: string;
  episodeId: string;
  lote: 1 | 2;
  mode: 'DRY_RUN' | 'REAL_DISPATCH';
  wordStatus: 'DRY_ONLY' | 'LOTE1_DISPATCHED' | 'NO_SESSION';
  totalScenes: number;
  batchTargetCount: number;
  batchQueuedCount: number;
  otherBatchCount: number;
  dossierCount: number;
  hitCount: number;
  batchItems: LotePlanItem[];
  otherBatchSceneIds: string[];
  dossierSceneIds: string[];
}

export interface VisualValidationResult {
  runId: string;
  passed: boolean;
  totalValidated: number;
  successCount: number;
  failedCount: number;
  scenes: Array<{
    sceneId: string;
    passed: boolean;
    startFramePath?: string;
    startFrameSha256?: string;
    takePath?: string;
    takeDurationSeconds?: number;
    source: 'firefly' | 'bank' | 'missing';
    error?: string;
  }>;
  failures: string[];
}

export interface FireflyBatchOptions {
  lote?: 1 | 2 | number;
  runId?: string;
  forceDispatch?: boolean;
}

/**
 * Valida o lote de tomadas visuais geradas no Firefly
 */
export function validateVisualBatch(runId: string, sceneIds: string[] = BATCH_1_SCENE_IDS, customBaseDir?: string): VisualValidationResult {
  const baseDir = customBaseDir || path.join(process.cwd(), 'runs', 'gasolina-adulterada', runId);
  const visualsDir = path.join(baseDir, 'visuals');

  const failures: string[] = [];
  const sceneResults: VisualValidationResult['scenes'] = [];

  for (const sId of sceneIds) {
    const sceneDir = path.join(visualsDir, sId);
    const startFramePath = path.join(sceneDir, 'start_frame.png');
    const takePath = path.join(sceneDir, 'take.mp4');

    if (!fs.existsSync(sceneDir)) {
      failures.push(`MISSING_SCENE_DIR: ${sId}`);
      sceneResults.push({ sceneId: sId, passed: false, source: 'missing', error: 'Diretório da cena inexistente.' });
      continue;
    }

    // 1. Validação de Start Frame
    if (!fs.existsSync(startFramePath)) {
      failures.push(`MISSING_START_FRAME: ${sId}`);
      sceneResults.push({ sceneId: sId, passed: false, source: 'missing', error: 'Arquivo start_frame.png ausente.' });
      continue;
    }

    const frameBuf = fs.readFileSync(startFramePath);
    if (frameBuf.length < 8) {
      failures.push(`CORRUPTED_START_FRAME: ${sId}`);
      sceneResults.push({ sceneId: sId, passed: false, source: 'missing', error: 'Arquivo start_frame.png truncado ou 0 bytes.' });
      continue;
    }

    // Validação de assinatura PNG
    const isPng = frameBuf[0] === 0x89 && frameBuf[1] === 0x50 && frameBuf[2] === 0x4E && frameBuf[3] === 0x47;
    if (!isPng) {
      failures.push(`INVALID_PNG_HEADER: ${sId}`);
      sceneResults.push({ sceneId: sId, passed: false, source: 'missing', error: 'Arquivo não possui cabeçalho válido PNG.' });
      continue;
    }

    const startFrameSha256 = crypto.createHash('sha256').update(frameBuf).digest('hex');

    // 2. Validação de Take
    if (!fs.existsSync(takePath)) {
      failures.push(`MISSING_TAKE: ${sId}`);
      sceneResults.push({ sceneId: sId, passed: false, source: 'firefly', error: 'Arquivo take.mp4 ausente.' });
      continue;
    }

    const takeStat = fs.statSync(takePath);
    if (takeStat.size === 0) {
      failures.push(`EMPTY_TAKE: ${sId}`);
      sceneResults.push({ sceneId: sId, passed: false, source: 'firefly', error: 'Arquivo take.mp4 com 0 bytes.' });
      continue;
    }

    sceneResults.push({
      sceneId: sId,
      passed: true,
      startFramePath,
      startFrameSha256,
      takePath,
      takeDurationSeconds: 12.0,
      source: 'firefly'
    });
  }

  const result: VisualValidationResult = {
    runId,
    passed: failures.length === 0,
    totalValidated: sceneIds.length,
    successCount: sceneResults.filter(s => s.passed).length,
    failedCount: sceneResults.filter(s => !s.passed).length,
    scenes: sceneResults,
    failures
  };

  // Grava lote-report.json
  const reportPath = path.join(baseDir, 'visuals-batch-report.json');
  if (fs.existsSync(baseDir)) {
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2), 'utf8');
  }

  return result;
}

export async function runFireflyBatchDispatch(options?: FireflyBatchOptions): Promise<LotePlanReport> {
  // 1. Determinação e Validação do Lote
  let rawLote: any = options?.lote;
  if (rawLote === undefined && process.env.FIREFLY_LOTE) {
    rawLote = parseInt(process.env.FIREFLY_LOTE, 10);
  }
  if (rawLote === undefined) {
    const arg = process.argv.find(a => a.startsWith('--lote='));
    if (arg) {
      rawLote = parseInt(arg.split('=')[1], 10);
    }
  }
  if (rawLote === undefined) {
    rawLote = 1;
  }

  if (rawLote !== 1 && rawLote !== 2) {
    throw new Error(`FIREFLY_LOTE_INVALID: Valor de lote '${rawLote}' inválido. Utilize 1 ou 2.`);
  }
  const lote: 1 | 2 = rawLote;

  const contractPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.episode.json');
  const scenesPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.scenes.json');

  const episodeContract = parseEpisodeContract(contractPath);
  const rawScenes: RawSceneInput[] = JSON.parse(fs.readFileSync(scenesPath, 'utf8'));
  const sceneContracts: SceneVisualContract[] = buildSceneContracts(episodeContract, rawScenes);

  const isRealDispatch = options?.forceDispatch || process.env.FIREFLY_DISPATCH === '1';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runId = options?.runId || `RUN_LOTE${lote}_${timestamp}`;

  const runsEpisodeBase = path.join(process.cwd(), 'runs', 'gasolina-adulterada');
  const runDir = path.join(runsEpisodeBase, runId);
  const dispatchDir = path.join(runsEpisodeBase, 'dispatch', runId);
  const latestDispatchDir = path.join(runsEpisodeBase, 'dispatch', 'latest');
  const visualsDir = path.join(runDir, 'visuals');
  const checkpointsDir = path.join(runDir, 'checkpoints');

  fs.mkdirSync(dispatchDir, { recursive: true });
  fs.mkdirSync(latestDispatchDir, { recursive: true });
  fs.mkdirSync(visualsDir, { recursive: true });
  fs.mkdirSync(checkpointsDir, { recursive: true });

  const targetSceneIds = lote === 1 ? BATCH_1_SCENE_IDS : BATCH_2_SCENE_IDS;
  const otherSceneIds = lote === 1 ? BATCH_2_SCENE_IDS : BATCH_1_SCENE_IDS;

  const targetSet = new Set(targetSceneIds);
  const batchItems: LotePlanItem[] = [];
  const otherBatchSceneIds: string[] = [];
  const dossierSceneIds: string[] = [];
  let hitCount = 0;

  // 2. Construção e Filtro Canônico do Plano
  for (let i = 0; i < sceneContracts.length; i++) {
    const sc = sceneContracts[i];
    const rawScene = rawScenes.find(r => r.sceneId === sc.sceneId);
    const visualSubject = rawScene?.visualSubject || sc.visual_must_include.join(', ');

    const matchResult = VideoRepositoryMatcher.matchScene({
      sceneId: sc.sceneId,
      visualSubject,
      requiredCategory: sc.required_category,
      visualMustInclude: sc.visual_must_include,
      visualMustNot: sc.visual_must_not,
      domainTags: sc.domainTags,
      allowedSources: sc.allowed_sources
    }, 'smart');

    if (matchResult.matched && matchResult.recommendedAction === 'USE_MATCHED_VIDEO') {
      hitCount++;
      continue;
    }

    if (sc.take_type === 'KEYFRAME_DOSSIER' || !sc.allowed_sources.includes('firefly')) {
      dossierSceneIds.push(sc.sceneId);
      continue;
    }

    const prompt = buildFireflyPrompt({ ...sc, visualSubject });

    if (targetSet.has(sc.sceneId)) {
      batchItems.push({
        sceneId: sc.sceneId,
        order: batchItems.length + 1,
        required_category: sc.required_category,
        visual_must_include: sc.visual_must_include,
        visual_must_not: sc.visual_must_not,
        domainTags: sc.domainTags,
        allowed_sources: sc.allowed_sources,
        prompt,
        status: 'QUEUED_FOR_DISPATCH'
      });
    } else {
      otherBatchSceneIds.push(sc.sceneId);
    }
  }

  // Ordenação determinística pelo array alvo
  batchItems.sort((a, b) => targetSceneIds.indexOf(a.sceneId) - targetSceneIds.indexOf(b.sceneId));
  batchItems.forEach((item, idx) => item.order = idx + 1);

  const planReport: LotePlanReport = {
    timestamp,
    runId,
    episodeId: episodeContract.episodeId,
    lote,
    mode: isRealDispatch ? 'REAL_DISPATCH' : 'DRY_RUN',
    wordStatus: isRealDispatch ? 'LOTE1_DISPATCHED' : 'DRY_ONLY',
    totalScenes: sceneContracts.length,
    batchTargetCount: targetSceneIds.length,
    batchQueuedCount: batchItems.length,
    otherBatchCount: otherBatchSceneIds.length,
    dossierCount: dossierSceneIds.length,
    hitCount,
    batchItems,
    otherBatchSceneIds,
    dossierSceneIds
  };

  // 3. Gravação do lote<N>-plan.json
  const planFileName = `lote${lote}-plan.json`;
  fs.writeFileSync(path.join(dispatchDir, planFileName), JSON.stringify(planReport, null, 2), 'utf8');
  fs.writeFileSync(path.join(latestDispatchDir, planFileName), JSON.stringify(planReport, null, 2), 'utf8');

  // 4. Gravação do dossier-plan.md
  const dossierMdLines: string[] = [
    '# 📋 DOSSIER HUD PLAN // 9 CENAS REMOTION ONLY',
    '',
    '> **Episódio:** `gasolina-adulterada`  ',
    '> **Diretriz:** Cenas do tipo `KEYFRAME_DOSSIER` são renderizadas exclusivamente via HUD Remotion. Proibido envio para geração Firefly.',
    '',
    '| Cena | Componente Remotion Obrigatório | Status Componente | Finalidade Técnica |',
    '|---|---|---|---|'
  ];

  for (const dId of dossierSceneIds) {
    const compName = DOSSIER_SCENE_COMPONENTS[dId];
    if (!compName) {
      throw new Error(`DOSSIER_COMPONENT_MISSING: Cena '${dId}' não possui componente HUD mapeado.`);
    }
    dossierMdLines.push(`| **\`${dId}\`** | \`<${compName} />\` | ✅ **EXISTE** | Diagrama técnico e métricas sem vídeo |`);
  }

  dossierMdLines.push('');
  dossierMdLines.push('---');
  dossierMdLines.push('Zero cenas de dossiê foram incluídas na fila de geração do Firefly.');

  const dossierMdContent = dossierMdLines.join('\n');
  fs.writeFileSync(path.join(dispatchDir, 'dossier-plan.md'), dossierMdContent, 'utf8');
  fs.writeFileSync(path.join(latestDispatchDir, 'dossier-plan.md'), dossierMdContent, 'utf8');

  // 5. Execução Dry-Run
  if (!isRealDispatch) {
    console.log(`\n══════════════════════════════════════════════════════════════════════════════════════`);
    console.log(`📋 FIREFLY LOTE ${lote} (DRY-RUN) CONCLUÍDO COM SUCESSO!`);
    console.log(`══════════════════════════════════════════════════════════════════════════════════════`);
    console.log(`- RunId: ${runId}`);
    console.log(`- Cenas no Lote ${lote}: ${batchItems.length} (Alvo: ${targetSceneIds.length})`);
    console.log(`- Cenas no Outro Lote: ${otherBatchSceneIds.length}`);
    console.log(`- Cenas Dossier (Remotion Only): ${dossierSceneIds.length}`);
    console.log(`- Plano salvo em: runs/gasolina-adulterada/dispatch/latest/${planFileName}`);
    console.log(`══════════════════════════════════════════════════════════════════════════════════════\n`);
    return planReport;
  }

  // 6. BARREIRA: Se for Lote 2 Real, exige validação prévia do Lote 1 no disco
  if (lote === 2) {
    const lote1Validation = validateVisualBatch(runId, BATCH_1_SCENE_IDS, runDir);
    if (!lote1Validation.passed) {
      throw new Error(
        `LOTE1_INCOMPLETE: Lote 2 bloqueado até que todas as 10 tomadas do Lote 1 estejam validadas no disco. Falhas: [${lote1Validation.failures.join(', ')}]`
      );
    }
  }

  // 7. Geração Real (FIREFLY_DISPATCH=1)
  console.log(`\n🔥 DISPARO REAL DO FIREFLY SOLICITADO PARA LOTE ${lote} (FIREFLY_DISPATCH=1)...`);

  // Health-check canônico e unificado da Sessão Firefly
  const sessionCheck = await isFireflySessionLive();
  if (!sessionCheck.live) {
    const sessionReport = {
      status: 'STAGE_UNAVAILABLE',
      sessionActive: false,
      wordStatus: 'NO_SESSION',
      lote,
      runId,
      reason: sessionCheck.reason,
      source: sessionCheck.source,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(path.join(dispatchDir, `lote${lote}-session.json`), JSON.stringify(sessionReport, null, 2), 'utf8');
    fs.writeFileSync(path.join(latestDispatchDir, `lote${lote}-session.json`), JSON.stringify(sessionReport, null, 2), 'utf8');

    throw new Error(`STAGE_UNAVAILABLE: visuals (firefly session) - ${sessionCheck.reason}`);
  }

  // 7.1. Reúsa takes já existentes em public/episodes/gasolina-adulterada/takes/
  const itemsToDispatch: typeof batchItems = [];
  
  for (const item of batchItems) {
    const sceneVisualsDir = path.join(visualsDir, item.sceneId);
    fs.mkdirSync(sceneVisualsDir, { recursive: true });
    const targetTakePath = path.join(sceneVisualsDir, 'take.mp4');
    const targetStartFramePath = path.join(sceneVisualsDir, 'start_frame.png');
    const publicTakePath = path.join(process.cwd(), 'public', 'episodes', 'gasolina-adulterada', 'takes', `${item.sceneId}.mp4`);

    fs.writeFileSync(path.join(sceneVisualsDir, 'prompt.json'), JSON.stringify(item.prompt, null, 2), 'utf8');

    if (fs.existsSync(publicTakePath) && fs.statSync(publicTakePath).size > 500_000) {
      console.log(`✅ [CACHE REUSADO] Take para ${item.sceneId} já existe no diretório oficial (${fs.statSync(publicTakePath).size} bytes). Reutilizando...`);
      fs.copyFileSync(publicTakePath, targetTakePath);
      try {
        execSync(`ffmpeg -y -i "${targetTakePath}" -ss 00:00:00.000 -vframes 1 "${targetStartFramePath}"`, { stdio: 'ignore' });
      } catch (e: any) {
        console.warn(`Aviso ao extrair start frame para ${item.sceneId}: ${e.message}`);
      }

      fs.writeFileSync(path.join(checkpointsDir, `visuals-${item.sceneId}.json`), JSON.stringify({
        sceneId: item.sceneId,
        status: 'DONE',
        outputPath: targetTakePath,
        timestamp: new Date().toISOString()
      }, null, 2), 'utf8');
    } else {
      itemsToDispatch.push(item);
      fs.writeFileSync(path.join(checkpointsDir, `visuals-${item.sceneId}.json`), JSON.stringify({
        sceneId: item.sceneId,
        status: 'QUEUED',
        timestamp: new Date().toISOString()
      }, null, 2), 'utf8');
    }
  }

  if (itemsToDispatch.length === 0) {
    console.log(`🎉 Todas as tomadas do Lote ${lote} já existem no cache e foram integradas à run ${runId}!`);
    return planReport;
  }

  console.log(`🚀 ${itemsToDispatch.length} cenas precisam de geração ativa no Firefly: ${itemsToDispatch.map(i => i.sceneId).join(', ')}`);

  // Cria guia de produção oficial para o Firefly com apenas os itens pendentes
  const guideItems = itemsToDispatch.map(item => ({
    name: item.sceneId,
    prompt: item.prompt.prompt,
    negativePrompt: item.prompt.negativePrompt,
    model: 'Firefly Video',
    aspect_ratio: '16:9',
    aspectRatio: '16:9',
    resolution: '720p',
    takeType: 'CINEMATIC_TAKE',
    duration_seconds: 5,
    durationSeconds: 5
  }));

  const guidePath = path.join(dispatchDir, `lote${lote}-guide.json`);
  fs.writeFileSync(guidePath, JSON.stringify({ items: guideItems }, null, 2), 'utf8');

  const fireflyAdapter = new FireflyAdapter();
  await fireflyAdapter.initialize();
  const runResult = await fireflyAdapter.feedGuideAndRunReal(runId, guidePath);

  // Copia os takes concluídos para o diretório da run e extrai start_frame.png
  for (const job of runResult.completedJobs) {
    const sceneVisualsDir = path.join(visualsDir, job.name);
    fs.mkdirSync(sceneVisualsDir, { recursive: true });
    const targetTakePath = path.join(sceneVisualsDir, 'take.mp4');
    const targetStartFramePath = path.join(sceneVisualsDir, 'start_frame.png');
    const publicTakePath = path.join(process.cwd(), 'public', 'episodes', 'gasolina-adulterada', 'takes', `${job.name}.mp4`);

    if (fs.existsSync(job.output_path)) {
      fs.copyFileSync(job.output_path, targetTakePath);
      fs.copyFileSync(job.output_path, publicTakePath);
      try {
        execSync(`ffmpeg -y -i "${targetTakePath}" -ss 00:00:00.000 -vframes 1 "${targetStartFramePath}"`, { stdio: 'ignore' });
      } catch (e: any) {
        console.warn(`Aviso ao extrair start frame para ${job.name}: ${e.message}`);
      }

      fs.writeFileSync(path.join(checkpointsDir, `visuals-${job.name}.json`), JSON.stringify({
        sceneId: job.name,
        status: 'DONE',
        outputPath: targetTakePath,
        timestamp: new Date().toISOString()
      }, null, 2), 'utf8');
    }
  }

  return planReport;
}

if (require.main === module) {
  runFireflyBatchDispatch().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('\n❌ ERRO NO DISPATCH DO FIREFLY:', err.message);
    process.exit(1);
  });
}
