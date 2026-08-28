import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {DocumentaryEditorAgent} from '../hsl/editorial/documentaryEditorAgent';

async function runThreeLayerTests(): Promise<void> {
  console.log('🧪 Iniciando testes da Arquitetura em 3 Camadas Independentes (O Outro Lado)...');
  const agent = new DocumentaryEditorAgent();

  // 1. Validação do Prompt Limpo para o Firefly (Camada 1B / 2)
  const cleanPrompt = agent.generateCleanFireflyPrompt('corredor de data center escuro com operador caminhando');
  assert.ok(cleanPrompt.includes('NO TEXT'), 'Prompt do Firefly deve conter negação NO TEXT');
  assert.ok(cleanPrompt.includes('NO NUMBERS'), 'Prompt do Firefly deve conter negação NO NUMBERS');
  assert.ok(cleanPrompt.includes('NO HUD'), 'Prompt do Firefly deve conter negação NO HUD');
  assert.ok(cleanPrompt.includes('NO LOGOS'), 'Prompt do Firefly deve conter negação NO LOGOS');
  assert.ok(cleanPrompt.includes('NO LASER LINES'), 'Prompt do Firefly deve conter negação NO LASER LINES');
  assert.ok(cleanPrompt.includes('corredor de data center'), 'Prompt do Firefly deve descrever o mundo físico');
  console.log('✅ [1/6] Prompt 100% limpo para o Firefly Video validado (Zero texto/HUD/laser).');

  // 2. Validação do Blueprint Visual do ChatGPT (Camada 1A)
  const blueprintPrompt = agent.generateBlueprintPrompt(
    'corredor de data center',
    'O PONTO DE ESTRANGULAMENTO',
    'Milhões de transações. Um único gargalo.'
  );
  assert.ok(blueprintPrompt.includes('O PONTO DE ESTRANGULAMENTO'), 'Blueprint deve conter o título');
  assert.ok(blueprintPrompt.includes('#FF5500'), 'Blueprint deve conter referência à cor da linha laser');
  assert.ok(blueprintPrompt.includes('#00F0FF'), 'Blueprint deve conter referência à telemetria ciano');
  console.log('✅ [2/6] Prompt de Blueprint Visual para orientação do Remotion validado.');

  // 3. Validação do Prompt de Camada Interna Raio-X (Camada 1C)
  const xrayPrompt = agent.generateXRayPrompt('servidor central e banco de capacitores');
  assert.ok(xrayPrompt.includes('cross-section cutaway'), 'Prompt de Raio-X deve especificar corte transversal');
  assert.ok(xrayPrompt.includes('#FF5500'), 'Prompt de Raio-X deve conter iluminação em âmbar/laranja');
  console.log('✅ [3/6] Prompt de camada interna Raio-X validado.');

  // 4. Validação da Instrução de Movimento do Firefly
  const motionPrompt = agent.generateFireflyMotionPrompt('industrial_xray');
  assert.ok(motionPrompt.includes('Slow cinematic dolly forward'), 'Motion deve ter movimento de câmera');
  assert.ok(motionPrompt.includes('no text, no UI'), 'Motion deve reforçar ausência de texto/UI');
  console.log('✅ [4/6] Instrução de movimento físico para Firefly Video validada.');

  // 5. Validação da Especificação Remotion (overlay_spec.json)
  const spec = agent.createSceneOverlaySpec({
    sceneId: 'SCENE_004',
    title: 'O PONTO DE ESTRANGULAMENTO',
    subtitle: 'Milhões de transações. Um único gargalo.',
    latencyMs: 132,
    stressPercent: 89
  });
  assert.strictEqual(spec.schema, 'hsl.overlay.spec.v1', 'Schema do overlay spec incorreto');
  assert.strictEqual(spec.laser?.color, '#FF5500', 'Laser color deve ser #FF5500');
  assert.strictEqual(spec.branding.showLogo, true, 'Branding deve exibir logo');
  assert.strictEqual(spec.telemetry.length, 3, 'Devem existir 3 métricas de telemetria base');
  console.log('✅ [5/6] Especificação declarativa overlay_spec.json gerada e validada.');

  // 6. Validação do Empacotamento de Diretórios de Cena
  const tempDir = path.join(process.cwd(), 'runs', 'TEST-THREE-LAYER');
  const scenes = [
    {
      sceneId: 'SCENE_001',
      shotId: 'SHOT_001',
      narrativeFunction: 'HOOK_PIX',
      visualSubject: 'Mãos segurando celular escuro em apartamento'
    },
    {
      sceneId: 'SCENE_002',
      shotId: 'SHOT_002',
      narrativeFunction: 'DATA_CENTER_FLOW',
      visualSubject: 'Corredor de data center escuro com operador'
    }
  ];

  const editPkg = agent.compileDocumentaryPackage('TEST-THREE-LAYER', scenes, tempDir);
  assert.strictEqual(editPkg.scenes.length, 2);
  assert.ok(fs.existsSync(path.join(tempDir, 'SCENE_001', 'overlay_spec.json')), 'overlay_spec.json de SCENE_001 deve existir');
  assert.ok(fs.existsSync(path.join(tempDir, 'SCENE_001', 'firefly_motion_prompt.txt')), 'firefly_motion_prompt.txt de SCENE_001 deve existir');
  assert.ok(fs.existsSync(path.join(tempDir, 'SCENE_002', 'overlay_spec.json')), 'overlay_spec.json de SCENE_002 deve existir');

  // Limpeza
  fs.rmSync(tempDir, {recursive: true, force: true});
  console.log('✅ [6/6] Pacotes de diretórios de cena gerados com sucesso no formato padrão.');

  console.log('\n🎉 TODOS OS 6 TESTES DA ARQUITETURA EM 3 CAMADAS PASSARAM COM 100% DE SUCESSO!\n');
}

runThreeLayerTests().catch((err) => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
