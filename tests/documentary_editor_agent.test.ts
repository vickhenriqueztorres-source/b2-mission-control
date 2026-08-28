import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {DocumentaryEditorAgent} from '../hsl/editorial/documentaryEditorAgent';

async function runTests(): Promise<void> {
  console.log('🧪 Iniciando testes de unidade: DocumentaryEditorAgent & RAG de Edição...');
  const agent = new DocumentaryEditorAgent();

  // 1. Teste de carregamento da Base de Conhecimento RAG
  const kb = agent.getKnowledgeBase();
  assert.strictEqual(kb.schema, 'hsl.editorial.editor-rag-index.v1', 'Schema do RAG inválido');
  assert.strictEqual(Array.isArray(kb.modules), true, 'Modules deve ser um array');
  assert.strictEqual((kb.modules as unknown[]).length, 6, 'Devem existir 6 módulos no RAG');
  console.log('✅ [1/5] Base de Conhecimento RAG de Edição carregada e validada (6 módulos).');

  // 2. Teste do Prompt Mestre Villeneuve Cyber-Industrial
  const prompt = agent.generateMasterStartFramePrompt('subestação de Itaipu à noite');
  assert.ok(prompt.includes('Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film'), 'Prompt sem assinatura Villeneuve');
  assert.ok(prompt.includes('subestação de Itaipu à noite'), 'Prompt sem o sujeito da cena');
  assert.ok(prompt.includes('deep carbon blacks (#060709)'), 'Prompt sem carbon black');
  assert.ok(prompt.includes('sodium-vapor amber reflections (#FF5500)'), 'Prompt sem sodium amber');
  assert.ok(prompt.includes('cyan laser telemetry lights (#00F0FF)'), 'Prompt sem cyan telemetry');
  assert.ok(prompt.includes('--ar 16:9'), 'Prompt sem aspect ratio 16:9');
  console.log('✅ [2/5] Fórmula de Start Frame Villeneuve Cyber-Industrial validada.');

  // 3. Teste de Classificação de Rotas/Cabos (CyberMapTrace)
  const mapPlan = agent.planScene({
    sceneId: 'SCENE_01',
    shotId: 'SHOT_01',
    narrativeFunction: 'EXPLAIN_INFRASTRUCTURE_ROUTE',
    visualSubject: 'Mapa 3D com duto de fibra óptica subterrânea conectando São Paulo a Barueri'
  });
  assert.strictEqual(mapPlan.recommendedTechnique, 'CYBER_MAP_TRACE_3D');
  assert.strictEqual(mapPlan.overlayConfig.letterbox, true);
  console.log('✅ [3/5] Classificação de cena de infraestrutura para CYBER_MAP_TRACE_3D validada.');

  // 4. Teste de Classificação de Documentos/Dossiê (LaserScanDossier)
  const docPlan = agent.planScene({
    sceneId: 'SCENE_02',
    shotId: 'SHOT_02',
    narrativeFunction: 'REVEAL_REGULATORY_FAILURE',
    visualSubject: 'Relatório confidencial do Banco Central e auditoria da ANP sobre fluxo financeiro'
  });
  assert.strictEqual(docPlan.recommendedTechnique, 'LASER_SCAN_DOSSIER');
  console.log('✅ [4/7] Classificação de cena investigativa para LASER_SCAN_DOSSIER validada.');

  // 5. Teste de Classificação do Formato Neo (TechnicalCutawaySchematic)
  const cutawayPlan = agent.planScene({
    sceneId: 'SCENE_03',
    shotId: 'SHOT_03',
    narrativeFunction: 'EXPLAIN_SYSTEM_MECHANICS',
    visualSubject: 'Corte transversal 3D da fuselagem com raio-x do compartimento de batalha'
  });
  assert.strictEqual(cutawayPlan.recommendedTechnique, 'TECHNICAL_CUTAWAY_SCHEMATIC');
  console.log('✅ [5/7] Classificação de corte técnico 3D (estilo neo) para TECHNICAL_CUTAWAY_SCHEMATIC validada.');

  // 6. Teste de Classificação de Enlace VLF Submarino (VlfSubmarineAntennaTrace)
  const vlfPlan = agent.planScene({
    sceneId: 'SCENE_04',
    shotId: 'SHOT_04',
    narrativeFunction: 'EXPLAIN_SUBMARINE_LINK',
    visualSubject: 'Antena VLF trailing wire de 5 milhas penetrando no oceano até o submarino'
  });
  assert.strictEqual(vlfPlan.recommendedTechnique, 'VLF_SUBMARINE_ANTENNA_TRACE');
  console.log('✅ [6/7] Classificação de enlace de transmissão VLF para VLF_SUBMARINE_ANTENNA_TRACE validada.');

  // 5. Teste de Compilação do Pacote de Edição Documental
  const tempDir = path.join(process.cwd(), 'runs', 'TEST-DOC-EDITOR');
  const scenes = [
    {
      sceneId: 'SCENE_01',
      shotId: 'SHOT_01',
      narrativeFunction: 'HOOK_TENSION',
      visualSubject: 'Celular em rua escura com chuva reflexiva em SP'
    },
    {
      sceneId: 'SCENE_02',
      shotId: 'SHOT_02',
      narrativeFunction: 'DATA_ROUTE',
      visualSubject: 'Trajeto de fibra óptica saindo da B3 até o Data Center em Barueri'
    },
    {
      sceneId: 'SCENE_03',
      shotId: 'SHOT_03',
      narrativeFunction: 'DOCUMENT_PROOF',
      visualSubject: 'Relatório confidencial do Bacen sobre vulnerabilidade no CIP'
    }
  ];

  const result = agent.compileDocumentaryPackage('TEST-DOC-EDITOR', scenes, tempDir);
  assert.strictEqual(result.schema, 'hsl.documentary.edit-package.v1');
  assert.strictEqual(result.scenes.length, 3);
  assert.ok(fs.existsSync(path.join(tempDir, 'documentary-edit-package.json')), 'Arquivo de pacote não gerado');
  fs.rmSync(tempDir, {recursive: true, force: true});
  console.log('✅ [5/5] Compilação do pacote documentary-edit-package.json validada com sucesso.');

  console.log('\n🎉 TODOS OS 5 TESTES DO DOCUMENTARY EDITOR AGENT PASSARAM COM 100% DE SUCESSO!\n');
}

runTests().catch((err) => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
