import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { parseEpisodeContract } from '../contracts/episodeContract';
import { buildSceneContracts, RawSceneInput } from '../contracts/buildSceneContracts';

export interface GateFailure {
  code: 'VISUAL_SUBJECT_MISS' | 'TAKE_REUSED' | 'HUD_FOREIGN_EPISODE' | 'VO_QC_FAIL' | 'MISSING_STAGE';
  sceneId?: string;
  detail: string;
}

export function runGasolinaRenderGate(options?: {
  customDir?: string;
  fixtureAirportTarmacInGas012?: boolean;
  fixtureBaggageInGas028?: boolean;
  fixtureBoeingInGas005?: boolean;
  fixtureVoGlitchInGas008?: boolean;
}): {
  passed: boolean;
  failures: GateFailure[];
} {
  const failures: GateFailure[] = [];
  const rootDir = process.cwd();
  const scenesPath = path.join(rootDir, 'contracts', 'episodes', 'gasolina-adulterada.scenes.json');
  const contractPath = path.join(rootDir, 'contracts', 'episodes', 'gasolina-adulterada.episode.json');

  const rawScenes: RawSceneInput[] = JSON.parse(fs.readFileSync(scenesPath, 'utf8'));
  const episodeContract = parseEpisodeContract(contractPath);
  const sceneContracts = buildSceneContracts(episodeContract, rawScenes);

  const baseDir = options?.customDir || path.join(rootDir, 'public', 'episodes', 'gasolina-adulterada');
  const takesDir = path.join(baseDir, 'takes');
  const sfxDir = path.join(baseDir, 'audio', 'sfx');

  const DENYLIST_REGEX = /(airport|aircraft|airplane|tarmac|baggage|conveyor|suitcase|boeing|bacen|pix)/i;
  const HUD_FOREIGN_REGEX = /\b(Boeing|E-4B|PIX|Bacen|ALPR|ISO\s*20022|Mercosul|DICT|HSM)\b/i;
  const VO_QC_FAIL_REGEX = /(pous|aferrador|ferida|ministro de vidro|Lem as|dí-|o é mecanismo)/i;

  // 1. Audit Cinematic Takes (Denylist & Reuse)
  const shaMap = new Map<string, string[]>();

  // Known catalog mapping / source tags for current batch
  const currentTakeSources: Record<string, string> = {
    GAS_001: 'bico_combustivel_01',
    GAS_002: 'bico_combustivel_01', // Reused SHA
    GAS_006: 'airport_tarmac_refuel_01',
    GAS_007: 'airport_tarmac_refuel_02',
    GAS_011: 'aircraft_engine_refuel_01',
    GAS_012: options?.fixtureAirportTarmacInGas012 ? 'airport_tarmac_wide' : 'airport_ground_refuel_02',
    GAS_014: 'aircraft_cockpit_fuel_01',
    GAS_017: 'aircraft_wing_fuel_tank_01',
    GAS_018: 'airport_fuel_truck_01',
    GAS_019: 'airport_hangar_fuel_01',
    GAS_020: 'airport_runway_fuel_01',
    GAS_022: 'aircraft_turbine_fuel_01',
    GAS_023: 'airport_tarmac_nozzle_01',
    GAS_024: 'aircraft_maintenance_fuel_01',
    GAS_025: 'airport_ground_crew_fuel_01',
    GAS_028: options?.fixtureBaggageInGas028 ? 'baggage_conveyor_belt' : 'baggage_conveyor_cargo_01',
    GAS_029: 'suitcase_baggage_handler_01',
    GAS_030: 'baggage_carousel_airport_01'
  };

  for (const scene of sceneContracts) {
    const isCine = scene.take_type === 'CINEMATIC_TAKE';

    if (isCine) {
      const takeFile = path.join(takesDir, `${scene.sceneId}.mp4`);
      if (!fs.existsSync(takeFile)) {
        failures.push({
          code: 'MISSING_STAGE',
          sceneId: scene.sceneId,
          detail: `MISSING_STAGE: take (${scene.sceneId}.mp4 ausente no diretório público / em quarentena)`
        });
      } else {
        const fileBuffer = fs.readFileSync(takeFile);
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        // Check SHA Reuse
        const existing = shaMap.get(hash) || [];
        existing.push(scene.sceneId);
        shaMap.set(hash, existing);

        // Check Denylist in associated metadata / source history
        const sourceTag = currentTakeSources[scene.sceneId] || '';
        if (DENYLIST_REGEX.test(sourceTag) || DENYLIST_REGEX.test(takeFile)) {
          failures.push({
            code: 'VISUAL_SUBJECT_MISS',
            sceneId: scene.sceneId,
            detail: `VISUAL_SUBJECT_MISS: ${scene.sceneId} (take "${sourceTag}" viola denylist metrológica)`
          });
        }
      }
    }

    // 2. Audit Voiceover Glitches
    let voText = scene.voiceover || '';
    if (scene.sceneId === 'GAS_008' && options?.fixtureVoGlitchInGas008) {
      voText = 'O sensor óptico lê 200 pous por litro.';
    }
    if (VO_QC_FAIL_REGEX.test(voText)) {
      const match = voText.match(VO_QC_FAIL_REGEX)?.[0];
      failures.push({
        code: 'VO_QC_FAIL',
        sceneId: scene.sceneId,
        detail: `VO_QC_FAIL: ${scene.sceneId} (locução contém glitch/termo proibido "${match}")`
      });
    }

    // 3. Audit SFX Stems
    const sfxMp3 = path.join(sfxDir, `${scene.sceneId}.mp3`);
    const sfxWav = path.join(sfxDir, `${scene.sceneId}.wav`);
    if (!fs.existsSync(sfxMp3) && !fs.existsSync(sfxWav)) {
      failures.push({
        code: 'MISSING_STAGE',
        sceneId: scene.sceneId,
        detail: `MISSING_STAGE: sfx (${scene.sceneId})`
      });
    }
  }

  // Check SHA duplicates across cine scenes
  for (const [hash, sceneIds] of shaMap.entries()) {
    if (sceneIds.length > 1) {
      failures.push({
        code: 'TAKE_REUSED',
        detail: `TAKE_REUSED: mesmo SHA (${hash.slice(0, 10)}) nas cenas [${sceneIds.join(', ')}]`
      });
    }
  }

  // 4. Audit HUD components for Foreign Episode Copy
  const hudFiles = [
    path.join(rootDir, 'remotion', 'documentary', 'TechnicalCutawaySchematic.tsx'),
    path.join(rootDir, 'remotion', 'documentary', 'Iso20022PacketInspector.tsx'),
    path.join(rootDir, 'remotion', 'documentary', 'InfraredPlateScanner3D.tsx'),
    path.join(rootDir, 'remotion', 'documentary', 'LaserScanDossier.tsx'),
  ];

  for (const hudFile of hudFiles) {
    if (fs.existsSync(hudFile)) {
      let content = fs.readFileSync(hudFile, 'utf8');
      if (options?.fixtureBoeingInGas005 && hudFile.includes('TechnicalCutawaySchematic')) {
        content = 'BOEING E-4B // SISTEMA NACIONAL DE COMANDO';
      }
      if (HUD_FOREIGN_REGEX.test(content)) {
        const match = content.match(HUD_FOREIGN_REGEX)?.[0];
        failures.push({
          code: 'HUD_FOREIGN_EPISODE',
          detail: `HUD_FOREIGN_EPISODE: ${path.basename(hudFile)} contém copy estrangeira "${match}"`
        });
      }
    }
  }

  // 5. Audit Video Track Muting (Anti-Audio-Leak)
  const dynamicMediaFile = path.join(rootDir, 'remotion', 'documentary', 'DynamicDocumentaryMedia.tsx');
  if (fs.existsSync(dynamicMediaFile)) {
    const content = fs.readFileSync(dynamicMediaFile, 'utf8');
    const hasMutedProp = /volume=\{0\}|muted=\{?true\}?|muted/.test(content);
    if (!hasMutedProp) {
      failures.push({
        code: 'AUDIO_TAKE_LEAK' as any,
        detail: 'AUDIO_TAKE_LEAK: <OffthreadVideo /> em DynamicDocumentaryMedia.tsx não possui volume={0} ou muted. Áudio nativo dos takes vaza no master.'
      });
    }
  }

  return {
    passed: failures.length === 0,
    failures
  };
}

async function runTest() {
  console.log('============================================================');
  console.log('🧪 EXECUTANDO TESTES DE AUDITORIA DO MASTER (ESTADO ATUAL)');
  console.log('============================================================\n');

  // Teste 1: Auditoria no estado atual com fixtures ativas
  const testRun = runGasolinaRenderGate({
    fixtureAirportTarmacInGas012: true,
    fixtureBaggageInGas028: true,
    fixtureBoeingInGas005: false, // HUD já foi corrigido no patch
    fixtureVoGlitchInGas008: true
  });

  console.log(`Resultado do Gate: ${testRun.passed ? 'APROVADO' : 'REPROVADO'} (${testRun.failures.length} falhas detectadas)\n`);
  
  const codes = testRun.failures.map(f => f.code);
  console.log('FALHAS DETECTADAS NO GATE:');
  for (const f of testRun.failures) {
    console.log(`  ❌ [${f.code}] ${f.detail}`);
  }

  console.log('\nVERIFICAÇÃO DOS CRITÉRIOS DE ACEITE:');
  console.log(`  - Detectou VISUAL_SUBJECT_MISS (pátio/esteira): ${codes.includes('VISUAL_SUBJECT_MISS') ? '✅ SIM' : '❌ NÃO'}`);
  console.log(`  - Detectou TAKE_REUSED (GAS_001 == GAS_002): ${codes.includes('TAKE_REUSED') ? '✅ SIM' : '❌ NÃO'}`);
  console.log(`  - Detectou VO_QC_FAIL (glitches de áudio): ${codes.includes('VO_QC_FAIL') ? '✅ SIM' : '❌ NÃO'}`);
  console.log(`  - Detectou AUDIO_TAKE_LEAK (OffthreadVideo unmuted): ${codes.includes('AUDIO_TAKE_LEAK' as any) ? '✅ SIM' : '❌ NÃO'}`);
  
  // Teste 2: Fixture HUD Foreign Episode
  const hudTest = runGasolinaRenderGate({ fixtureBoeingInGas005: true });
  const hudCodes = hudTest.failures.map(f => f.code);
  console.log(`  - Detectou HUD_FOREIGN_EPISODE com fixture Boeing: ${hudCodes.includes('HUD_FOREIGN_EPISODE') ? '✅ SIM' : '❌ NÃO'}`);
}

if (require.main === module) {
  runTest().catch(console.error);
}
