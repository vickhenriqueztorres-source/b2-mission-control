import fs from 'fs';
import path from 'path';
import { parseEpisodeContract, EpisodeContract } from '../contracts/episodeContract';
import { PipelineContractGate } from '../pipeline/pipelineContractGate';

console.log('══════════════════════════════════════════════════════════════════════════════════════');
console.log('🧪 EXECUTANDO SUÍTE DE TESTES DETERMINÍSTICOS DO EPISODE CONTRACT (ZOD)');
console.log('══════════════════════════════════════════════════════════════════════════════════════');

let allPassed = true;

// ─────────────────────────────────────────────────────────────────────────────
// TESTE 1: Contrato válido (gasolina-adulterada.episode.json) deve passar com sucesso
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 1/6] Validando parse de contrato canônico válido...');
try {
  const jsonPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.episode.json');
  const contract = parseEpisodeContract(jsonPath);

  if (
    contract.episodeId === 'gasolina-adulterada' &&
    contract.targetDurationSeconds === 360 &&
    contract.minScenes === 30 &&
    contract.minDurationRatio === 0.9 &&
    contract.domainTags.length >= 3 &&
    contract.requiredStages.includes('sfx') &&
    contract.requiredStages.includes('music') &&
    contract.outputDir.endsWith(path.join('runs', 'gasolina-adulterada'))
  ) {
    console.log(`✅ TESTE 1 PASSOU: Contrato válido carregado com sucesso (${contract.title}).`);
  } else {
    console.error('❌ FALHA NO TESTE 1: Propriedades do contrato não conferem com o esperado:', contract);
    allPassed = false;
  }
} catch (err: any) {
  console.error('❌ ERRO NO TESTE 1:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTE 2: Contrato sem "sfx" em requiredStages DEVE falhar no parse Zod
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 2/6] Validando rejeição de contrato sem "sfx" em requiredStages...');
try {
  const invalidContractData = {
    episodeId: 'teste-sem-sfx',
    title: 'Teste Sem SFX',
    theme: 'Tema de teste',
    domainTags: ['tag1', 'tag2', 'tag3'],
    targetDurationSeconds: 360,
    minDurationRatio: 0.9,
    minScenes: 30,
    requiredStages: ['narration', 'visuals', 'music', 'mix', 'thumbnail', 'render'], // Faltando 'sfx'
    voiceProfile: 'Chris',
    musicMood: 'dark',
    sfxDensity: 'high'
  };

  let threw = false;
  try {
    parseEpisodeContract(invalidContractData);
  } catch (err: any) {
    threw = true;
    if (err.message.includes('requiredStages') || err.message.includes('sfx')) {
      console.log(`✅ TESTE 2 PASSOU: Rejeitado com sucesso pelo Zod: "${err.message.split('\n')[1] || err.message}"`);
    } else {
      console.error('❌ FALHA NO TESTE 2: Erro lançado mas sem menção a requiredStages:', err.message);
      allPassed = false;
    }
  }

  if (!threw) {
    console.error('❌ FALHA NO TESTE 2: Contrato sem "sfx" NÃO lançou erro!');
    allPassed = false;
  }
} catch (err: any) {
  console.error('❌ ERRO NO TESTE 2:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTE 3: Contrato sem targetDurationSeconds ou minScenes DEVE falhar (sem defaults silenciosos)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 3/6] Validando rejeição de contrato sem targetDurationSeconds / minScenes...');
try {
  const missingFieldsData = {
    episodeId: 'teste-sem-duracao',
    title: 'Teste Sem Duração',
    theme: 'Tema de teste',
    domainTags: ['tag1', 'tag2', 'tag3'],
    // targetDurationSeconds ausente!
    // minScenes ausente!
    requiredStages: ['narration', 'visuals', 'sfx', 'music', 'mix', 'thumbnail', 'render'],
    voiceProfile: 'Chris',
    musicMood: 'dark',
    sfxDensity: 'high'
  };

  let threw = false;
  try {
    parseEpisodeContract(missingFieldsData);
  } catch (err: any) {
    threw = true;
    if (err.message.includes('targetDurationSeconds') && err.message.includes('minScenes')) {
      console.log(`✅ TESTE 3 PASSOU: Rejeitado com sucesso por ausência de campos obrigatórios.`);
    } else {
      console.error('❌ FALHA NO TESTE 3: Mensagem de erro incompleta:', err.message);
      allPassed = false;
    }
  }

  if (!threw) {
    console.error('❌ FALHA NO TESTE 3: Contrato sem campos obrigatórios NÃO lançou erro!');
    allPassed = false;
  }
} catch (err: any) {
  console.error('❌ ERRO NO TESTE 3:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTE 4: Contrato com outputDir customizado proibido DEVE falhar
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 4/6] Validando proibição de outputDir customizado...');
try {
  const customOutputDirData = {
    episodeId: 'teste-slug',
    title: 'Teste Output Dir',
    theme: 'Tema de teste',
    domainTags: ['tag1', 'tag2', 'tag3'],
    targetDurationSeconds: 360,
    minDurationRatio: 0.9,
    minScenes: 30,
    requiredStages: ['narration', 'visuals', 'sfx', 'music', 'mix', 'thumbnail', 'render'],
    voiceProfile: 'Chris',
    musicMood: 'dark',
    sfxDensity: 'high',
    outputDir: '/custom/unauthorized/path'
  };

  let threw = false;
  try {
    parseEpisodeContract(customOutputDirData);
  } catch (err: any) {
    threw = true;
    if (err.message.includes('EPISODE_CONTRACT_FORBIDDEN_OUTPUT_DIR')) {
      console.log(`✅ TESTE 4 PASSOU: outputDir customizado barrado com sucesso.`);
    } else {
      console.error('❌ FALHA NO TESTE 4: Erro incorreto:', err.message);
      allPassed = false;
    }
  }

  if (!threw) {
    console.error('❌ FALHA NO TESTE 4: outputDir customizado NÃO foi rejeitado!');
    allPassed = false;
  }
} catch (err: any) {
  console.error('❌ ERRO NO TESTE 4:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTE 5: Run da gasolina (84s, 10 cenas, sem sfx/música) DEVE ser REPROVADA pelo gate
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 5/6] Validando reprovação no gate da run atual da gasolina contra contrato de 360s...');
try {
  const gasolinaContract = parseEpisodeContract(
    path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.episode.json')
  );

  const report = PipelineContractGate.auditRun({
    runId: 'OOL-EP06-GASOLINA',
    contract: gasolinaContract,
    stageScope: 'FULL_PACKAGE'
  });

  const hasEpisodeTooShort = report.failures.some(
    (f) => f.reason.includes('EPISODE_TOO_SHORT') && f.reason.includes('84s') && f.reason.includes('324s')
  );
  const hasTooFewScenes = report.failures.some((f) => f.reason.includes('TOO_FEW_SCENES'));
  const hasMissingSfx = report.failures.some((f) => f.reason.includes('MISSING_STAGE: sfx'));
  const hasMissingMusic = report.failures.some((f) => f.reason.includes('MISSING_STAGE: music'));

  if (!report.passed && hasEpisodeTooShort && hasTooFewScenes && hasMissingSfx && hasMissingMusic) {
    console.log(`✅ TESTE 5 PASSOU: Run da gasolina reprovada corretamente pelo Gatekeeper com:`);
    console.log(`   - EPISODE_TOO_SHORT: 84s < 324s (meta 360s)`);
    console.log(`   - TOO_FEW_SCENES: 10 cenas < 30 cenas`);
    console.log(`   - MISSING_STAGE: sfx`);
    console.log(`   - MISSING_STAGE: music`);
  } else {
    console.error('❌ FALHA NO TESTE 5: Gatekeeper não reprovou com as falhas esperadas:', {
      passed: report.passed,
      hasEpisodeTooShort,
      hasTooFewScenes,
      hasMissingSfx,
      hasMissingMusic,
      failures: report.failures.map((f) => f.reason)
    });
    allPassed = false;
  }
} catch (err: any) {
  console.error('❌ ERRO NO TESTE 5:', err.message);
  allPassed = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTE 6: Gate reporta "Resultado do Gate: REPROVADO" e exit code != 0
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 6/6] Validando relatório do Gatekeeper e status de reprovação...');
try {
  const gasolinaContract = parseEpisodeContract(
    path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.episode.json')
  );

  const report = PipelineContractGate.auditRun({
    runId: 'OOL-EP06-GASOLINA',
    contract: gasolinaContract,
    stageScope: 'FULL_PACKAGE'
  });

  if (report.passed === false && report.failures.length >= 4) {
    console.log(`✅ TESTE 6 PASSOU: Gatekeeper retornou passed = false com ${report.failures.length} violações registradas.`);
  } else {
    console.error('❌ FALHA NO TESTE 6: Relatório do gate inconsistente:', report);
    allPassed = false;
  }
} catch (err: any) {
  console.error('❌ ERRO NO TESTE 6:', err.message);
  allPassed = false;
}

console.log('\n══════════════════════════════════════════════════════════════════════════════════════');
if (allPassed) {
  console.log('🎉 TODOS OS TESTES DO EPISODE CONTRACT PASSARAM COM SUCESSO DETERMINÍSTICO!');
  console.log('══════════════════════════════════════════════════════════════════════════════════════');
  process.exit(0);
} else {
  console.error('❌ HOUVE FALHAS NA SUÍTE DE TESTES DO EPISODE CONTRACT!');
  console.log('══════════════════════════════════════════════════════════════════════════════════════');
  process.exit(1);
}
