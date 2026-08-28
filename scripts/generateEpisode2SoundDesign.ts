import fs from 'fs';
import path from 'path';
import {SoundDesignAgent} from '../sound-agent';
import {VideoAnalysisInput, SceneAnalysis} from '../sound-agent/types/scene-analysis.types';

async function main() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🎧 SOUND DESIGN AGENT — EPISÓDIO 02 (CABOS SUBMARINOS)');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const timelinePath = path.resolve('runs/OOL-EP02-CABOS/postproduction/scene_timeline_sync.json');
  const scriptPath = path.resolve('runs/OOL-EP02-CABOS/editorial/06-script-approved.json');

  if (!fs.existsSync(timelinePath) || !fs.existsSync(scriptPath)) {
    console.error('❌ Arquivos de timeline ou script do Episódio 02 não encontrados!');
    process.exit(1);
  }

  const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
  const totalFrames = timeline.total_frames || 8022;
  const fps = timeline.fps || 30;

  // Mapeamento temático de Sound Design (Oceano Profundo, Hidrofones, Lasers, Fibras e BGP)
  const soundCuesMap: Record<string, {
    mood: 'suspense' | 'action' | 'epic' | 'emotional' | 'ambient';
    env: string;
    cues: Array<{
      frameOffset: number;
      type: 'action' | 'transition' | 'climax' | 'environment';
      desc: string;
      soundNeeded: string;
    }>;
    layers: string[];
  }> = {
    OOL_001: {
      mood: 'suspense',
      env: 'space_myth',
      cues: [
        {frameOffset: 0, type: 'environment', desc: 'deep atmospheric void', soundNeeded: 'loop_atmosphere_01'},
        {frameOffset: 30, type: 'action', desc: 'satellite telemetry ping', soundNeeded: 'ui_click_01'}
      ],
      layers: ['ambience', 'ui']
    },
    OOL_004: {
      mood: 'epic',
      env: 'laser_speed',
      cues: [
        {frameOffset: 0, type: 'action', desc: 'laser photon sweep 200.000 km/s', soundNeeded: 'whoosh_swoosh_01'},
        {frameOffset: 45, type: 'climax', desc: 'optical pulse beam', soundNeeded: 'impact_boom_01'}
      ],
      layers: ['whoosh', 'impact']
    },
    OOL_008: {
      mood: 'suspense',
      env: 'cable_reveal',
      cues: [
        {frameOffset: 0, type: 'transition', desc: '3D cross section scanner wipe', soundNeeded: 'whoosh_swoosh_02'},
        {frameOffset: 40, type: 'action', desc: 'mechanical caliper measurement', soundNeeded: 'ui_click_02'}
      ],
      layers: ['whoosh', 'ui']
    },
    OOL_012: {
      mood: 'action',
      env: 'high_voltage',
      cues: [
        {frameOffset: 0, type: 'environment', desc: '10.000V electric power hum', soundNeeded: 'loop_atmosphere_02'},
        {frameOffset: 30, type: 'action', desc: 'substation copper energized', soundNeeded: 'impact_boom_02'}
      ],
      layers: ['ambience', 'impact']
    },
    OOL_015: {
      mood: 'suspense',
      env: 'deep_abyss',
      cues: [
        {frameOffset: 0, type: 'environment', desc: 'hydrophone deep ocean pressure 4000m', soundNeeded: 'loop_atmosphere_01'},
        {frameOffset: 50, type: 'action', desc: 'submarine sonar ping', soundNeeded: 'ui_click_03'}
      ],
      layers: ['ambience', 'ui']
    },
    OOL_018: {
      mood: 'epic',
      env: 'erbium_amplifier',
      cues: [
        {frameOffset: 0, type: 'transition', desc: 'optical pump laser ignition', soundNeeded: 'whoosh_swoosh_03'},
        {frameOffset: 35, type: 'climax', desc: 'quantum stimulated photon burst', soundNeeded: 'impact_boom_01'}
      ],
      layers: ['whoosh', 'impact']
    },
    OOL_022: {
      mood: 'epic',
      env: 'cls_landing',
      cues: [
        {frameOffset: 0, type: 'transition', desc: 'sweep into Fortaleza landing station', soundNeeded: 'whoosh_swoosh_04'},
        {frameOffset: 40, type: 'action', desc: 'telecom server rack fans', soundNeeded: 'loop_atmosphere_02'}
      ],
      layers: ['whoosh', 'ambience']
    },
    OOL_030: {
      mood: 'action',
      env: 'anchor_strike',
      cues: [
        {frameOffset: 0, type: 'transition', desc: '50-ton ship anchor dragging', soundNeeded: 'whoosh_swoosh_05'},
        {frameOffset: 30, type: 'climax', desc: 'massive underwater steel impact', soundNeeded: 'impact_boom_02'}
      ],
      layers: ['whoosh', 'impact']
    },
    OOL_032: {
      mood: 'suspense',
      env: 'bgp_failover',
      cues: [
        {frameOffset: 0, type: 'action', desc: 'BGP packet reroute telemetry alarm', soundNeeded: 'ui_click_04'},
        {frameOffset: 25, type: 'climax', desc: '14.2ms autonomous switch locked', soundNeeded: 'ui_click_05'}
      ],
      layers: ['ui', 'impact']
    },
    OOL_042: {
      mood: 'suspense',
      env: 'closing_curtain',
      cues: [
        {frameOffset: 20, type: 'transition', desc: 'final documentary fade to black', soundNeeded: 'whoosh_swoosh_05'}
      ],
      layers: ['whoosh', 'ambience']
    }
  };

  const sceneAnalyses: SceneAnalysis[] = [];

  for (const scene of timeline.scenes) {
    const sId = scene.scene_id;
    const startF = scene.start_frame;
    const endF = scene.start_frame + scene.duration_frames;
    const custom = soundCuesMap[sId] || {
      mood: 'suspense' as const,
      env: 'deep_ocean_documentary',
      cues: [
        {frameOffset: 0, type: 'transition' as const, desc: 'scene cut whoosh', soundNeeded: 'whoosh_swoosh_01'},
        {frameOffset: 10, type: 'environment' as const, desc: 'subtle ocean room tone', soundNeeded: 'loop_atmosphere_01'}
      ],
      layers: ['ambience', 'transition']
    };

    const visualCues = custom.cues.map((c) => ({
      frame: startF + c.frameOffset,
      type: c.type,
      description: c.desc,
      soundNeeded: c.soundNeeded
    }));

    sceneAnalyses.push({
      sceneId: sId,
      startFrame: startF,
      endFrame: endF,
      detectedMood: custom.mood,
      detectedEnvironment: custom.env,
      visualCues,
      audioCues: [
        {
          frame: startF,
          type: 'voice',
          hasVoice: true,
          voiceType: 'narration',
          targetDb: -16
        }
      ],
      recommendedLayers: custom.layers
    });
  }

  const analysisInput: VideoAnalysisInput = {
    videoId: 'OOL-EP02-CABOS',
    totalFrames,
    fps,
    globalMood: 'suspense',
    scenes: sceneAnalyses
  };

  const agent = new SoundDesignAgent(process.cwd());
  const planOutputPath = path.resolve('runs/OOL-EP02-CABOS/postproduction/audio-plan.json');
  const tsxOutputPath = path.resolve('remotion/documentary/Episode02SoundTrack.tsx');

  console.log(`🎬 Processando Sound Design RAG para ${sceneAnalyses.length} cenas...`);
  const result = agent.runFullPipeline(analysisInput, tsxOutputPath, planOutputPath);

  console.log(`\n🎉 SOUND DESIGN DO EPISÓDIO 02 GERADO COM SUCESSO!`);
  console.log(`  📄 AudioPlan JSON: ${planOutputPath}`);
  console.log(`  ⚛️ Remotion Audio TSX: ${tsxOutputPath}`);
  console.log(`  🔊 Total de Camadas Planejadas: ${result.plan.scenes.reduce((acc, s) => acc + s.layers.length, 0)}`);
  console.log(`  🎼 Trilhas Orquestrais com Ducking a -24dB: ${result.plan.scenes.length} blocos sincronizados\n`);
}

main().catch((err) => {
  console.error('❌ Erro no Sound Design Agent:', err);
  process.exit(1);
});
