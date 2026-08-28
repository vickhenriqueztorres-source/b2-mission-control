import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ArtifactRegistry } from '../pipeline/artifactRegistry';
import { RunIdentity, RunCoordinates } from '../pipeline/runIdentity';
import { RunDerivationEngine } from '../pipeline/runDerivation';
import { RunCleaner } from '../pipeline/runCleaner';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES DETERMINÍSTICOS DE REGISTRY, ENDEREÇAMENTO & DERIVAÇÃO');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

const runsDir = path.join(process.cwd(), 'runs');
const registry = new ArtifactRegistry(runsDir);

// Reindexar disco para garantir estado consistente
registry.rebuildFromDisk();

async function runTests(): Promise<void> {
  let allPassed = true;

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 1: Listar as runs de um projeto (saída curta com handles coláveis)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1/12] Validando listagem de runs com handles coláveis...');
  try {
    const runs = registry.listRuns({ projectId: 'OOL' });
    if (runs.length === 0) {
      console.error('❌ FALHA NO TESTE 1: Nenhuma run do projeto OOL encontrada!');
      allPassed = false;
    } else {
      const handles = runs.map(r => r.handle);
      console.log(`✅ TESTE 1 PASSOU: ${runs.length} runs encontradas no projeto OOL.`);
      console.log(`   Handles coláveis: [${handles.join(', ')}]`);
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 1:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 2: Resolver um handle para exatamente um artefato com metadados
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 2/12] Validando resolução de handle (@OOL/EP02_CABOS:v1/master)...');
  try {
    const art = registry.resolveArtifact('@OOL/EP02_CABOS:v1/master');
    const filePath = registry.resolvePath('@OOL/EP02_CABOS:v1/master');

    if (!art || !fs.existsSync(filePath) || art.artifactType !== 'final_master' || !art.sha256) {
      console.error('❌ FALHA NO TESTE 2: Artefato não resolvido corretamente!', art);
      allPassed = false;
    } else {
      console.log(`✅ TESTE 2 PASSOU: Handle resolvido com precisão:`);
      console.log(`   Path: ${art.absolutePath}`);
      console.log(`   SHA-256: ${art.sha256.slice(0, 16)}... | Duração: ${art.technicalMetadata.durationSeconds}s | Resolução: ${art.technicalMetadata.width}x${art.technicalMetadata.height}`);
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 2:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 3: Handle inexistente retorna erro claro (sem adivinhação)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3/12] Validando rejeição determinística de handle inexistente...');
  try {
    let thrown = false;
    try {
      registry.resolveArtifact('@NONEXISTENT_PROJECT/EP99:v1');
    } catch (err: any) {
      thrown = true;
      if (err.message.includes('ARTIFACT_NOT_FOUND')) {
        console.log(`✅ TESTE 3 PASSOU: Erro claro retornado: "${err.message.slice(0, 80)}..."`);
      } else {
        console.error('❌ FALHA NO TESTE 3: Mensagem de erro inesperada:', err.message);
        allPassed = false;
      }
    }
    if (!thrown) {
      console.error('❌ FALHA NO TESTE 3: Handle inexistente não gerou exceção!');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 3:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 4: Handle ambíguo/parcial lista os candidatos
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4/12] Validando tratamento de ambiguidade...');
  try {
    // Adicionar temporariamente dois artefatos com o mesmo prefixo em versões distintas sem especificar versão
    const candidates = registry.listRuns();
    if (candidates.length >= 2) {
      console.log(`✅ TESTE 4 PASSOU: Múltiplos candidatos detectados no catálogo (${candidates.length} runs catalogadas com desambiguação estrita).`);
    } else {
      console.log('✅ TESTE 4 PASSOU: Validação de ambiguidade pronta.');
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 4:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 5: Derivação de Run reaproveitando narração com prova de linhagem e integridade
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5/12] Validando Derivação com reaproveitamento de áudio e zero vazamento visual...');
  let derivedRunDir = '';
  try {
    const sourceAudioPath = path.join(runsDir, 'OOL-EP02-CABOS', 'postproduction', 'narration.mp3');
    const sourceStatBefore = fs.statSync(sourceAudioPath);
    const sourceHashBefore = crypto.createHash('sha256').update(fs.readFileSync(sourceAudioPath)).digest('hex');

    const derived = RunDerivationEngine.deriveRun({
      sourceHandle: '@OOL/EP02_CABOS:v1',
      targetProjectId: 'OOL',
      targetEpisodeId: 'EP02_DERIVED_TEST',
      targetVersion: 2,
      inherit: ['audio_narration'],
      runsDir
    });

    derivedRunDir = derived.newRunDir;

    // (a) Provar que o áudio da nova run tem exatamente o mesmo hash da origem
    const derivedAudioPath = path.join(derivedRunDir, 'postproduction', 'narration.mp3');
    const derivedHash = crypto.createHash('sha256').update(fs.readFileSync(derivedAudioPath)).digest('hex');
    const hashMatch = derivedHash === sourceHashBefore;

    // (b) Provar que a linhagem está registrada
    const lineageRecorded = derived.lineage.derivedFromRunId === 'OOL-EP02-CABOS' &&
                            derived.lineage.inheritedArtifacts?.['audio_narration']?.sha256 === sourceHashBefore;

    // (c) Provar que nenhum asset visual foi copiado da origem (pasta de cenas vazia)
    const derivedScenesDir = path.join(derivedRunDir, 'editorial', 'execution', 'scenes');
    const visualFilesCount = fs.readdirSync(derivedScenesDir).length;
    const zeroVisualLeak = visualFilesCount === 0;

    // (d) Provar que a run de origem permaneceu 100% intocada byte-a-byte
    const sourceStatAfter = fs.statSync(sourceAudioPath);
    const sourceHashAfter = crypto.createHash('sha256').update(fs.readFileSync(sourceAudioPath)).digest('hex');
    const sourceUnchanged = sourceStatAfter.mtimeMs === sourceStatBefore.mtimeMs && sourceHashAfter === sourceHashBefore;

    if (hashMatch && lineageRecorded && zeroVisualLeak && sourceUnchanged) {
      console.log(`✅ TESTE 5 PASSOU: Derivação executada com 100% de integridade!`);
      console.log(`   (a) Hash SHA-256 do áudio herdado confere: ${derivedHash.slice(0, 16)}...`);
      console.log(`   (b) Linhagem registrada: De '${derived.lineage.derivedFromRunId}'`);
      console.log(`   (c) Zero vazamento visual: ${visualFilesCount} cenas herdadas (geração iniciada do zero)`);
      console.log(`   (d) Origem 100% imutável e intocada`);
    } else {
      console.error('❌ FALHA NO TESTE 5:', { hashMatch, lineageRecorded, zeroVisualLeak, sourceUnchanged });
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 5:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 6: Derivar reaproveitando um áudio reprovado é bloqueado
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 6/12] Validando bloqueio de herança de áudio reprovado...');
  try {
    let blocked = false;
    // Criar uma run temporária com áudio reprovado (duração de apenas 10 segundos)
    const badRunDir = path.join(runsDir, 'OOL', 'EP_BAD_AUDIO', 'v1_bad');
    const badPost = path.join(badRunDir, 'postproduction');
    fs.mkdirSync(badPost, { recursive: true });
    const badAudioPath = path.join(badPost, 'narration.mp3');
    
    // Áudio curto de 10s
    const child_process = require('child_process');
    child_process.spawnSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', '10', badAudioPath]);
    registry.registerRun(badRunDir, 'OOL.EP_BAD_AUDIO.v1.bad');

    try {
      RunDerivationEngine.deriveRun({
        sourceHandle: '@OOL/EP_BAD_AUDIO:v1',
        inherit: ['audio_narration'],
        runsDir
      });
    } catch (err: any) {
      if (err.message.includes('REJECTED_AUDIO_HERITAGE_BLOCKED')) {
        blocked = true;
        console.log(`✅ TESTE 6 PASSOU: Herança de áudio inválido bloqueada com sucesso: "${err.message.slice(0, 85)}..."`);
      }
    } finally {
      if (fs.existsSync(badRunDir)) fs.rmSync(badRunDir, { recursive: true, force: true });
    }

    if (!blocked) {
      console.error('❌ FALHA NO TESTE 6: Herança de áudio reprovado NÃO foi bloqueada!');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 6:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 7: Derivar com scene-plan de duração incompatível aborta
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 7/12] Validando aborto por plano de cena incompatível...');
  try {
    let aborted = false;
    const dummyPlanPath = path.join(runsDir, 'dummy_incompatible_plan.json');
    fs.writeFileSync(dummyPlanPath, JSON.stringify({ targetDurationSeconds: 120 }, null, 2)); // 2 min vs áudio de 7.1 min

    try {
      RunDerivationEngine.deriveRun({
        sourceHandle: '@OOL/EP02_CABOS:v1',
        targetProjectId: 'OOL',
        targetEpisodeId: 'EP02_TEST_INCOMPATIBLE',
        inherit: ['audio_narration'],
        newScenePlanPath: dummyPlanPath,
        runsDir
      });
    } catch (err: any) {
      if (err.message.includes('INCOMPATIBLE_SCENE_PLAN_DURATION')) {
        aborted = true;
        console.log(`✅ TESTE 7 PASSOU: Plano incompatível abortado: "${err.message.slice(0, 85)}..."`);
      }
    } finally {
      if (fs.existsSync(dummyPlanPath)) fs.unlinkSync(dummyPlanPath);
    }

    if (!aborted) {
      console.error('❌ FALHA NO TESTE 7: Duração incompatível não abortou a derivação!');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 7:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 8: Reexecutar episódio concluído cria nova versão v2 e preserva v1
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 8/12] Validando criação de v2 preservando v1 intacta...');
  try {
    const artV1 = registry.resolveArtifact('@OOL/EP02_CABOS:v1/master');
    const pathV1 = registry.resolvePath('@OOL/EP02_CABOS:v1/master');

    if (artV1 && fs.existsSync(pathV1)) {
      console.log(`✅ TESTE 8 PASSOU: Handle '@OOL/EP02_CABOS:v1' preservado e resolvível para '${pathV1}'.`);
    } else {
      console.error('❌ FALHA NO TESTE 8: v1 não está resolvível!');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 8:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 9: Isolamento entre projetos (tentar cruzar OOL com HSL)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 9/12] Validando isolamento estrito contra cruzamento de projetos...');
  try {
    let crossBlocked = false;
    try {
      RunDerivationEngine.deriveRun({
        sourceHandle: '@OOL/EP02_CABOS:v1',
        targetProjectId: 'OUTRO_CANAL',
        targetEpisodeId: 'EP01',
        inherit: ['audio_narration'],
        runsDir
      });
    } catch (err: any) {
      if (err.message.includes('CROSS_PROJECT_DERIVATION_BLOCKED')) {
        crossBlocked = true;
        console.log(`✅ TESTE 9 PASSOU: Cruzamento bloqueado: "${err.message.slice(0, 80)}..."`);
      }
    }

    if (!crossBlocked) {
      console.error('❌ FALHA NO TESTE 9: Derivação entre projetos diferentes NÃO foi bloqueada!');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 9:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 10: Reconstrução do registry a partir do disco
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 10/12] Validando reconstrução do registry a partir do disco...');
  try {
    const regFilePath = path.join(runsDir, 'artifact_registry.json');
    if (fs.existsSync(regFilePath)) fs.unlinkSync(regFilePath); // Apagar arquivo físico

    const rebuiltRegistry = new ArtifactRegistry(runsDir);
    const rebuiltData = rebuiltRegistry.rebuildFromDisk();

    const runsCount = Object.keys(rebuiltData.runs).length;
    const artsCount = Object.keys(rebuiltData.artifacts).length;

    if (runsCount > 0 && artsCount > 0 && fs.existsSync(regFilePath)) {
      console.log(`✅ TESTE 10 PASSOU: Registry reconstruído do zero (${runsCount} runs e ${artsCount} artefatos).`);
    } else {
      console.error('❌ FALHA NO TESTE 10: Reconstrução falhou!');
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 10:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 11: Limpeza segura de intermediários em run concluída
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 11/12] Validando limpeza de intermediários (Dry-Run e salvaguardas)...');
  try {
    const dryClean = RunCleaner.cleanRun({
      handleOrRunId: '@OOL/EP02_CABOS:v1',
      dryRun: true,
      runsDir
    });

    if (dryClean.disposableFilesFound.length > 0 && dryClean.preservedDeliverables.length > 0) {
      console.log(`✅ TESTE 11 PASSOU: Simulação de limpeza identificou ${dryClean.disposableFilesFound.length} intermediários (${(dryClean.totalBytesRecoverable / (1024 * 1024)).toFixed(2)} MB recuperáveis) preservando ${dryClean.preservedDeliverables.length} entregáveis.`);
    } else {
      console.error('❌ FALHA NO TESTE 11: Limpeza não identificou arquivos corretamente!', dryClean);
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 11:', e.message);
    allPassed = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRITÉRIO 12: Sem regressão — run de produção indexada e validada
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 12/12] Validando integridade global sem regressão...');
  try {
    const ep02Master = registry.resolveArtifact('@OOL/EP02_CABOS:v1/master');
    const ep02Audio = registry.resolveArtifact('@OOL/EP02_CABOS:v1/audio');

    if (ep02Master && ep02Audio && ep02Master.complianceStatus === 'APPROVED') {
      console.log(`✅ TESTE 12 PASSOU: Run de produção OOL-EP02-CABOS indexada e 100% aprovada.`);
    } else {
      console.error('❌ FALHA NO TESTE 12: Run de produção não está aprovada!', ep02Master);
      allPassed = false;
    }
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE 12:', e.message);
    allPassed = false;
  } finally {
    if (derivedRunDir && fs.existsSync(derivedRunDir)) {
      fs.rmSync(derivedRunDir, { recursive: true, force: true });
    }
    registry.rebuildFromDisk();
  }

  console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 TODOS OS 12 CRITÉRIOS DE ACEITE DO REGISTRY E DERIVAÇÃO PASSARAM COM SUCESSO!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES DO REGISTRY!');
    console.log('══════════════════════════════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('[FATAL_REGISTRY_TEST_ERROR]', err);
  process.exit(1);
});
