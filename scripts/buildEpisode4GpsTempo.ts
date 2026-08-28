import fs from 'fs';
import path from 'path';
import { VIDEO4_GPS_TEMPO_SEED, GPS_TEMPO_CHAPTERS } from '../hsl/editorial/config/video4GpsTempoEpisodeSeed';
import { DocumentaryEditorAgent } from '../hsl/editorial/documentaryEditorAgent';
import { RunManifest } from '../pipeline/runManifest';
import { ArtifactRegistry } from '../pipeline/artifactRegistry';

async function main(): Promise<void> {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🎬 COMPILANDO PRODUÇÃO MASTER: OOL-EP04-GPS-TEMPO');
  console.log(`"${VIDEO4_GPS_TEMPO_SEED.title}"`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  const episodeId = VIDEO4_GPS_TEMPO_SEED.episode_id;
  const prodDir = path.join(process.cwd(), 'runs', episodeId);
  const editorialDir = path.join(prodDir, 'editorial');
  const executionDir = path.join(editorialDir, 'execution');
  const postDir = path.join(prodDir, 'postproduction');

  fs.mkdirSync(executionDir, { recursive: true });
  fs.mkdirSync(postDir, { recursive: true });

  // 1. Salvar 06-script-approved.json
  const scriptApprovedPath = path.join(editorialDir, '06-script-approved.json');
  const flatScenesForScript = GPS_TEMPO_CHAPTERS.flatMap(ch =>
    ch.scenes.map(sc => ({
      scene_id: sc.scene_id,
      chapter: ch.chapter_id,
      name: sc.name,
      type: 'firefly_take',
      text: sc.voiceover_text
    }))
  );

  const approvedScriptData = {
    episode_id: episodeId,
    title: VIDEO4_GPS_TEMPO_SEED.title,
    theme: VIDEO4_GPS_TEMPO_SEED.thesis,
    total_scenes: flatScenesForScript.length,
    scenes: flatScenesForScript
  };

  fs.writeFileSync(scriptApprovedPath, JSON.stringify(approvedScriptData, null, 2), 'utf8');
  console.log(`✅ [1/4] Roteiro aprovado salvo em: ${scriptApprovedPath}`);

  // 2. Compilar documentary-edit-package.json
  const editorAgent = new DocumentaryEditorAgent();
  const flatScenesForEditor = GPS_TEMPO_CHAPTERS.flatMap(ch =>
    ch.scenes.map(sc => ({
      sceneId: sc.scene_id,
      shotId: `SHOT_${sc.scene_id.replace(/[^0-9]/g, '')}`,
      narrativeFunction: sc.narrative_function,
      visualSubject: sc.visual_subject
    }))
  );

  const editPackage = editorAgent.compileDocumentaryPackage(episodeId, flatScenesForEditor, executionDir);
  const editPackagePath = path.join(executionDir, 'documentary-edit-package.json');
  fs.writeFileSync(editPackagePath, JSON.stringify(editPackage, null, 2), 'utf8');
  console.log(`✅ [2/4] Pacote editorial compilado em: ${editPackagePath}`);

  // 3. Inicializar RunManifest
  const manifest = new RunManifest(prodDir, episodeId);
  manifest.startStage('PREPRODUCTION', flatScenesForScript.length);
  manifest.completeStage('PREPRODUCTION', flatScenesForScript.length, {
    totalChapters: GPS_TEMPO_CHAPTERS.length,
    totalScenes: flatScenesForScript.length,
    targetDurationMinutes: VIDEO4_GPS_TEMPO_SEED.target_duration_minutes
  });
  manifest.recordAsset('editorial/06-script-approved.json', scriptApprovedPath);
  manifest.recordAsset('editorial/execution/documentary-edit-package.json', editPackagePath);
  console.log(`✅ [3/4] Manifesto da Run inicializado com sucesso.`);

  // 4. Registrar no Artifact Registry
  const registry = new ArtifactRegistry();
  const summary = registry.registerRun(prodDir, episodeId);
  console.log(`✅ [4/4] Run registrada no Artifact Registry Central:`);
  console.log(`   Handle Canônico: ${summary.handle}`);
  console.log(`   Run ID:          ${summary.runId}`);
  console.log(`   Total de Cenas:  ${flatScenesForScript.length} cenas em 6 capítulos progressivos.\n`);

  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🎉 ESTRUTURA EDITORIAL E DE EXECUÇÃO CRIADA COM 100% DE PRECISÃO!');
  console.log('══════════════════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('❌ Erro na compilação do Episódio 4:', err);
  process.exit(1);
});
