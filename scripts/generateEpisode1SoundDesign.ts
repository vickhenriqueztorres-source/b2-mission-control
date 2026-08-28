import fs from 'fs';
import path from 'path';
import {SoundDesignAgent} from '../sound-agent';
import {VideoAnalysisInput, SceneAnalysis} from '../sound-agent/types/scene-analysis.types';

async function main() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🎧 SOUND DESIGN AGENT — EPISÓDIO 01 (O OUTRO LADO DO PIX)');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const timelinePath = path.resolve('runs/OOL-EP01-PIX/postproduction/scene_timeline_sync.json');
  const scriptPath = path.resolve('runs/OOL-EP01-PIX/editorial/06-script-approved.json');

  if (!fs.existsSync(timelinePath) || !fs.existsSync(scriptPath)) {
    console.error('❌ Arquivos de timeline ou script não encontrados!');
    process.exit(1);
  }

  const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
  const script = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));

  const totalFrames = timeline.total_frames || 11528;
  const fps = timeline.fps || 30;

  // Mapa de intenções e cues específicos de Sound Design por cena documental
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
      env: 'digital_banking',
      cues: [
        {frameOffset: 0, type: 'environment', desc: 'subtle digital room tone', soundNeeded: 'loop_atmosphere_01'},
        {frameOffset: 30, type: 'action', desc: 'typing pix key on smartphone', soundNeeded: 'ui_click_01'},
        {frameOffset: 60, type: 'action', desc: 'finger tap confirm transfer', soundNeeded: 'ui_click_02'},
        {frameOffset: 120, type: 'climax', desc: 'pix receipt popup confirmation', soundNeeded: 'ui_click_05'}
      ],
      layers: ['ambience', 'ui', 'foley']
    },
    OOL_002: {
      mood: 'suspense',
      env: 'datacenter_night',
      cues: [
        {frameOffset: 0, type: 'transition', desc: 'whoosh into server infrastructure', soundNeeded: 'whoosh_swoosh_01'},
        {frameOffset: 10, type: 'environment', desc: 'deep humming datacenter fan', soundNeeded: 'loop_atmosphere_02'}
      ],
      layers: ['ambience', 'transition']
    },
    OOL_003: {
      mood: 'epic',
      env: 'spi_core',
      cues: [
        {frameOffset: 15, type: 'action', desc: 'kinetic number counter roll start', soundNeeded: 'ui_click_03'},
        {frameOffset: 60, type: 'climax', desc: '140M transactions lock impact', soundNeeded: 'impact_strike_01'}
      ],
      layers: ['impact', 'ui', 'ambience']
    },
    OOL_004: {
      mood: 'epic',
      env: 'spi_core',
      cues: [
        {frameOffset: 15, type: 'action', desc: '8432 tx/s speed rush', soundNeeded: 'tension_riser_01'},
        {frameOffset: 70, type: 'climax', desc: 'peak throughput lock hit', soundNeeded: 'impact_strike_02'}
      ],
      layers: ['tension_riser', 'impact']
    },
    OOL_005: {
      mood: 'suspense',
      env: 'atomic_clock',
      cues: [
        {frameOffset: 10, type: 'action', desc: 'atomic stopwatch start beep', soundNeeded: 'ui_click_04'},
        {frameOffset: 50, type: 'climax', desc: '1.40s settlement bell chime', soundNeeded: 'impact_strike_03'}
      ],
      layers: ['ui', 'impact', 'ambience']
    },
    OOL_008: {
      mood: 'action',
      env: 'fiber_optic_route',
      cues: [
        {frameOffset: 15, type: 'transition', desc: 'cyber map 3D fiber trace laser sweep', soundNeeded: 'scifi_laser_01'},
        {frameOffset: 45, type: 'action', desc: 'data pulse traveling underground SP to BSB', soundNeeded: 'whoosh_swoosh_02'}
      ],
      layers: ['sci-fi', 'whoosh', 'ambience']
    },
    OOL_009: {
      mood: 'suspense',
      env: 'protocol_inspector',
      cues: [
        {frameOffset: 20, type: 'action', desc: 'ISO 20022 packet header scanline', soundNeeded: 'scifi_laser_02'},
        {frameOffset: 50, type: 'action', desc: 'cryptographic checksum verified', soundNeeded: 'ui_click_06'}
      ],
      layers: ['sci-fi', 'ui']
    },
    OOL_010: {
      mood: 'suspense',
      env: 'hsm_vault',
      cues: [
        {frameOffset: 15, type: 'action', desc: 'laser cutaway slicing server chassis', soundNeeded: 'scifi_laser_03'},
        {frameOffset: 55, type: 'climax', desc: 'HSM cryptographic module lock', soundNeeded: 'impact_strike_04'}
      ],
      layers: ['sci-fi', 'impact']
    },
    OOL_011: {
      mood: 'action',
      env: 'fiber_route',
      cues: [
        {frameOffset: 20, type: 'transition', desc: '12ms latency pulse to Barueri', soundNeeded: 'whoosh_swoosh_03'}
      ],
      layers: ['whoosh', 'ambience']
    },
    OOL_015: {
      mood: 'epic',
      env: 'dict_directory',
      cues: [
        {frameOffset: 25, type: 'climax', desc: '800 million keys directory impact', soundNeeded: 'impact_strike_05'}
      ],
      layers: ['impact', 'ambience']
    },
    OOL_018: {
      mood: 'epic',
      env: 'settlement_core',
      cues: [
        {frameOffset: 30, type: 'climax', desc: 'gross atomic settlement heavy braam hit', soundNeeded: 'braam_hit_01'}
      ],
      layers: ['braam', 'impact', 'ambience']
    },
    OOL_022: {
      mood: 'suspense',
      env: 'security_shield',
      cues: [
        {frameOffset: 20, type: 'action', desc: 'laser scan dossier MED highlight', soundNeeded: 'scifi_laser_01'}
      ],
      layers: ['sci-fi', 'ambience']
    },
    OOL_023: {
      mood: 'suspense',
      env: 'ai_engine',
      cues: [
        {frameOffset: 25, type: 'action', desc: 'behavioral AI score computation pulse', soundNeeded: 'ui_click_07'}
      ],
      layers: ['ui', 'ambience']
    },
    OOL_025: {
      mood: 'suspense',
      env: 'med_protocol',
      cues: [
        {frameOffset: 20, type: 'climax', desc: 'MED precautionary freeze heavy vault lock', soundNeeded: 'foley_door_01'}
      ],
      layers: ['foley', 'impact']
    },
    OOL_031: {
      mood: 'action',
      env: 'fiber_cut_emergency',
      cues: [
        {frameOffset: 20, type: 'climax', desc: 'simulated fiber cable snap boom', soundNeeded: 'boom_explosion_01'}
      ],
      layers: ['boom', 'tension_riser']
    },
    OOL_032: {
      mood: 'action',
      env: 'auto_reroute',
      cues: [
        {frameOffset: 15, type: 'action', desc: '15ms emergency network reroute sweep', soundNeeded: 'whoosh_swoosh_04'}
      ],
      layers: ['whoosh', 'ambience']
    },
    OOL_033: {
      mood: 'suspense',
      env: 'power_station',
      cues: [
        {frameOffset: 20, type: 'action', desc: 'diesel generator heavy engine start', soundNeeded: 'foley_vehicle_01'}
      ],
      layers: ['foley', 'ambience']
    },
    OOL_034: {
      mood: 'epic',
      env: 'black_friday_stress',
      cues: [
        {frameOffset: 25, type: 'action', desc: 'massive 15000 tx/s riser build', soundNeeded: 'tension_riser_02'},
        {frameOffset: 80, type: 'climax', desc: 'full capacity hold impact', soundNeeded: 'impact_strike_06'}
      ],
      layers: ['tension_riser', 'impact']
    },
    OOL_041: {
      mood: 'epic',
      env: 'national_sovereignty',
      cues: [
        {frameOffset: 30, type: 'climax', desc: 'continuous machine orchestral peak', soundNeeded: 'braam_hit_02'}
      ],
      layers: ['braam', 'ambience']
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
      mood: 'suspense',
      env: 'cinematic_documentary',
      cues: [
        {frameOffset: 0, type: 'transition', desc: 'scene cut dynamic whoosh', soundNeeded: 'whoosh_swoosh_01'},
        {frameOffset: 10, type: 'environment', desc: 'subtle documentary room tone', soundNeeded: 'loop_atmosphere_01'}
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
    videoId: 'OOL-EP01-PIX',
    totalFrames,
    fps,
    globalMood: 'suspense',
    scenes: sceneAnalyses
  };

  const agent = new SoundDesignAgent(process.cwd());
  const planOutputPath = path.resolve('runs/OOL-EP01-PIX/postproduction/audio-plan.json');
  const tsxOutputPath = path.resolve('remotion/documentary/Episode01SoundTrack.tsx');

  console.log(`🎬 Processando Sound Design para ${sceneAnalyses.length} cenas...`);
  const result = agent.runFullPipeline(analysisInput, tsxOutputPath, planOutputPath);

  console.log(`\n🎉 SOUND DESIGN GERADO COM SUCESSO!`);
  console.log(`  📄 AudioPlan JSON: ${planOutputPath}`);
  console.log(`  ⚛️ Remotion Audio TSX: ${tsxOutputPath}`);
  console.log(`  🔊 Total de Camadas de Áudio Planejadas: ${result.plan.scenes.reduce((acc, s) => acc + s.layers.length, 0)}`);
  console.log(`  🎼 Trilhas de Trilha Sonora Orquestral Sincronizadas: ${result.plan.scenes.length} blocos com Ducking a -24dB\n`);
}

main().catch((err) => {
  console.error('❌ Erro no Sound Design Agent:', err);
  process.exit(1);
});
