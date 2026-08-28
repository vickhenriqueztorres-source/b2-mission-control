import fs from 'fs';
import path from 'path';

const timelineSyncPath = path.resolve('runs/OOL-EP01-PIX/postproduction/scene_timeline_sync.json');
const scriptPath = path.resolve('runs/OOL-EP01-PIX/editorial/06-script-approved.json');
const executionDir = path.resolve('runs/OOL-EP01-PIX/editorial/execution');

const timelineSync = JSON.parse(fs.readFileSync(timelineSyncPath, 'utf8'));
const scriptData = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));

// Mapa de cenas visuais específicas
const visualMappings: Record<string, { type: string; config?: any }> = {
  OOL_001: { type: 'smartphone_mockup', config: { amount: 'R$ 1,00', stage: 'confirming' } },
  OOL_002: { type: 'firefly_take', config: { media: 'editorial/execution/OOL_001/firefly_take.mp4', kenBurns: 'push_in' } },
  OOL_003: { type: 'kinetic_counter', config: { startValue: 0, endValue: 140000000, suffix: ' tx/dia', label: 'VOLUME DIÁRIO SPI / BACEN', sublabel: 'Transações processadas sem interrupção.' } },
  OOL_004: { type: 'kinetic_counter', config: { startValue: 0, endValue: 8432, suffix: ' tx/seg', label: 'PICO DE PROCESSAMENTO', sublabel: 'Liquidação em tempo real sem filas.' } },
  OOL_005: { type: 'stopwatch', config: { startMs: 0, endMs: 1400, label: 'JANELA DE LIQUIDAÇÃO ATÔMICA', sublabel: 'Do toque ao crédito na conta destino.' } },
  OOL_006: { type: 'firefly_take', config: { media: 'editorial/execution/OOL_006/firefly_take.mp4', kenBurns: 'push_in' } },
  OOL_007: { type: 'firefly_take', config: { media: 'editorial/execution/OOL_007/firefly_take.mp4', kenBurns: 'pan_right' } },
  OOL_008: { type: 'cyber_map', config: { origin: 'SÃO PAULO / SP', intermediate: 'BARUERI / SP', dest: 'BRASÍLIA / DF', latency: 12 } },
  OOL_009: { type: 'iso20022_packet', config: { amount: 'R$ 1,00', latencyMs: 1.4 } },
  OOL_010: { type: 'laser_wipe_schematic', config: { media: 'editorial/execution/OOL_010/firefly_take.mp4', title: 'SPI DATA CORE - CLUSTER SP-01', compartment: 'MÓDULO DE HARDWARE HSM (AES-256)' } },
  OOL_012: { type: 'firefly_take', config: { media: 'editorial/execution/OOL_012/firefly_take.mp4', kenBurns: 'push_in' } },
  OOL_014: { type: 'firefly_take', config: { media: 'editorial/execution/OOL_014/firefly_take.mp4', kenBurns: 'pan_left' } },
  OOL_019: { type: 'firefly_take', config: { media: 'editorial/execution/OOL_019/firefly_take.mp4', kenBurns: 'push_in' } },
  OOL_022: { type: 'laser_wipe_dossier', config: { media: 'editorial/execution/OOL_022/firefly_take.mp4', title: 'BACEN — PROTOCOLO DE RETENÇÃO CAUTELAR (MED)' } },
  OOL_027: { type: 'firefly_take', config: { media: 'editorial/execution/OOL_027/firefly_take.mp4', kenBurns: 'push_in' } },
  OOL_031: { type: 'firefly_take', config: { media: 'editorial/execution/OOL_031/firefly_take.mp4', kenBurns: 'pan_right' } },
  OOL_033: { type: 'firefly_take', config: { media: 'editorial/execution/OOL_033/firefly_take.mp4', kenBurns: 'push_in' } },
  OOL_037: { type: 'firefly_take', config: { media: 'editorial/execution/OOL_037/firefly_take.mp4', kenBurns: 'pan_left' } },
  OOL_039: { type: 'firefly_take', config: { media: 'editorial/execution/OOL_039/firefly_take.mp4', kenBurns: 'push_in' } },
  OOL_041: { type: 'firefly_take', config: { media: 'editorial/execution/OOL_041/firefly_take.mp4', kenBurns: 'pull_out' } }
};

const compiledScenes = timelineSync.scenes.map((scene: any, index: number) => {
  const scriptItem = scriptData.scenes.find((s: any) => s.scene_id === scene.scene_id) || {};
  
  // Encontra mapeamento visual ou aplica rotação dinâmica inteligente
  let visual = visualMappings[scene.scene_id];
  if (!visual) {
    // Rotação dinâmica de documentário (B-roll -> Gráfico -> Terminal -> Start Frame com Ken Burns)
    const cycle = index % 5;
    if (cycle === 0) {
      visual = { type: 'firefly_take', config: { media: 'editorial/execution/OOL_003/firefly_take.mp4', kenBurns: 'push_in' } };
    } else if (cycle === 1) {
      visual = { type: 'research_lapse', config: { query: 'BACEN // SPI PROTOCOL // DICT_DIRECTORY', source: 'REGISTRO DE LIQUIDAÇÃO' } };
    } else if (cycle === 2) {
      visual = { type: 'cyber_map', config: { origin: 'SÃO PAULO', intermediate: 'BARUERI', dest: 'BRASÍLIA', latency: 24 } };
    } else if (cycle === 3) {
      visual = { type: 'iso20022_packet', config: { amount: 'R$ 1,00', latencyMs: 2.8 } };
    } else {
      visual = { type: 'firefly_take', config: { media: 'editorial/execution/OOL_014/firefly_take.mp4', kenBurns: 'pan_right' } };
    }
  }

  return {
    id: scene.scene_id,
    from: scene.start_frame,
    durationInFrames: scene.duration_frames,
    voiceover: scriptItem.voiceover || '',
    chapterId: scriptItem.chapter_id || 'CH01',
    visual,
    hud: {
      sceneNumber: `CENA ${index + 1 < 10 ? '0' + (index + 1) : index + 1}`,
      title: scriptItem.attention_role || 'INVESTIGAÇÃO',
      subtitle: (scriptItem.voiceover || '').slice(0, 75).toUpperCase() + '...',
      latencyMs: 12 + (index * 3) % 120,
      systemStressPercent: 20 + (index * 7) % 75,
      sourceText: 'FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM'
    }
  };
});

const fileContent = `// Gerado automaticamente pelo compilador de Timeline Dinâmica
export interface CompiledSceneItem {
  id: string;
  from: number;
  durationInFrames: number;
  voiceover: string;
  chapterId: string;
  visual: {
    type: string;
    config?: any;
  };
  hud: {
    sceneNumber: string;
    title: string;
    subtitle: string;
    latencyMs: number;
    systemStressPercent: number;
    sourceText: string;
  };
}

export const EPISODE_01_TIMELINE_TOTAL_FRAMES = ${timelineSync.total_frames};

export const EPISODE_01_SCENES: CompiledSceneItem[] = ${JSON.stringify(compiledScenes, null, 2)};
`;

fs.writeFileSync(path.resolve('remotion/episode01TimelineData.ts'), fileContent, 'utf8');
console.log('✅ remotion/episode01TimelineData.ts compilado com 42 cenas dinâmicas!');
