import { RemotionCompiler } from '../remotion/remotionCompiler';
import fs from 'fs';
import path from 'path';

console.log('🧪 Testando RemotionCompiler...');

const testResult = RemotionCompiler.compileEpisode({
  episodeId: 'TEST-EP99-REMOTION-CHECK',
  compositionId: 'TestEp99Check',
  title: 'TESTE DE AUTOMAÇÃO REMOTION',
  categoryTitle: 'AUDITORIA DE MOTION GRAPHICS',
  scenes: [
    {
      sceneId: 'TEST_001',
      name: 'Entrada da Fibra Óptica',
      durationSeconds: 5.0,
      takeType: 'CINEMATIC_TAKE',
      motionMode: 'crash_push_in',
      callout: {
        categoryText: 'TESTE // TELEMETRIA',
        mainText: '100 GBPS',
        subText: 'LARGURA DE BANDA SUBMARINA'
      }
    },
    {
      sceneId: 'TEST_002',
      name: 'Dossiê Técnico do Repetidor',
      durationSeconds: 6.0,
      takeType: 'KEYFRAME_DOSSIER',
      integratedText: 'REPETIDOR ÓPTICO 10KV',
      motionMode: 'slow_push_in'
    }
  ]
});

console.log('✅ Compilado com sucesso:');
console.log(`   - Timeline: ${testResult.timelineDataFile}`);
console.log(`   - Componente: ${testResult.episodeComponentFile}`);
console.log(`   - Frames: ${testResult.totalDurationFrames} (${testResult.totalDurationSeconds}s)`);

// Verificar se foi registrado em remotion/Root.tsx
const rootContent = fs.readFileSync(path.join(process.cwd(), 'remotion', 'Root.tsx'), 'utf8');
const isImported = rootContent.includes('TestEp99Check');
const isComposed = rootContent.includes('id="TestEp99Check"');

if (isImported && isComposed) {
  console.log('✅ SUCESSO: Composição automaticamente registrada em remotion/Root.tsx!');
} else {
  console.error('❌ FALHA: Composição não foi encontrada em remotion/Root.tsx');
  process.exitCode = 1;
}

// Limpar arquivos temporários do teste
fs.unlinkSync(testResult.timelineDataFile);
fs.unlinkSync(testResult.episodeComponentFile);
// Restaurar Root.tsx removendo o teste
const cleanedRoot = rootContent
  .replace("import {TestEp99Check} from './TestEp99Check';\n", '')
  .replace("import {TESTEP99CHECK_TOTAL_FRAMES} from './testEp99CheckTimelineData';\n", '')
  .replace(/<Composition\s+id="TestEp99Check"[\s\S]*?\/>\n/, '');
fs.writeFileSync(path.join(process.cwd(), 'remotion', 'Root.tsx'), cleanedRoot, 'utf8');

console.log('🧹 Limpeza do teste concluída com perfeição!');
