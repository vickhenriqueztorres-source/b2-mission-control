import fs from 'fs';
import path from 'path';
import { parseEpisodeContract } from '../contracts/episodeContract';
import { buildSceneContracts, RawSceneInput } from '../contracts/buildSceneContracts';
import { buildAudioBedPlan, AudioBedPlanReport } from '../contracts/audioBedContract';
import { validateNarrationBatch } from './dispatchNarrationBatch';

export interface AudioValidationResult {
  runId: string;
  passed: boolean;
  musicValid: boolean;
  sfxValid: boolean;
  mixValid: boolean;
  totalScenes: number;
  sfxStemsPresent: number;
  failures: string[];
}

/**
 * Valida os stems de áudio (SFX, Música e Mix) no disco
 */
export function validateAudioBed(runId: string, customBaseDir?: string): AudioValidationResult {
  const baseDir = customBaseDir || path.join(process.cwd(), 'runs', 'gasolina-adulterada', runId);
  const audioDir = path.join(baseDir, 'audio');
  const sfxDir = path.join(audioDir, 'sfx');
  const musicPath = path.join(audioDir, 'music', 'bed.wav');
  const mixPath = path.join(audioDir, 'mix', 'mix.wav');

  const contractPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.episode.json');
  const scenesPath = path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.scenes.json');

  const episodeContract = parseEpisodeContract(contractPath);
  const rawScenes: RawSceneInput[] = JSON.parse(fs.readFileSync(scenesPath, 'utf8'));

  const failures: string[] = [];

  // 1. Validação de Trilha Musical
  let musicValid = false;
  if (!fs.existsSync(musicPath)) {
    failures.push('MISSING_MUSIC_BED: audio/music/bed.wav ausente.');
  } else {
    const st = fs.statSync(musicPath);
    if (st.size === 0) {
      failures.push('EMPTY_MUSIC_BED: audio/music/bed.wav com 0 bytes.');
    } else {
      musicValid = true;
    }
  }

  // 2. Validação de Stems SFX por Cena (Exclusividade e Unicidade Obrigatórias)
  let sfxStemsPresent = 0;
  const shaMap = new Map<string, string[]>();

  for (const scene of rawScenes) {
    const stemPathWav = path.join(sfxDir, `${scene.sceneId}.wav`);
    const stemPathMp3 = path.join(sfxDir, `${scene.sceneId}.mp3`);
    const stemPath = fs.existsSync(stemPathMp3) ? stemPathMp3 : stemPathWav;

    if (!fs.existsSync(stemPath)) {
      failures.push(`MISSING_STAGE: sfx (${scene.sceneId} ausente).`);
    } else {
      const st = fs.statSync(stemPath);
      if (st.size === 0) {
        failures.push(`EMPTY_SFX_STEM: ${scene.sceneId} com 0 bytes.`);
      } else {
        sfxStemsPresent++;
        const fileBuffer = fs.readFileSync(stemPath);
        const hash = require('crypto').createHash('sha256').update(fileBuffer).digest('hex');
        const existing = shaMap.get(hash) || [];
        existing.push(scene.sceneId);
        shaMap.set(hash, existing);
      }
    }
  }

  // Verifica duplicação de SHA nos SFX (Proibido mesmo stem para cenas diferentes)
  for (const [hash, sceneIds] of shaMap.entries()) {
    if (sceneIds.length > 1) {
      failures.push(`SFX_REUSED: Mesmo stem sonoro (SHA: ${hash.slice(0, 10)}) repetido nas cenas [${sceneIds.join(', ')}]`);
    }
  }

  const sfxValid = (sfxStemsPresent === rawScenes.length) && (failures.filter(f => f.startsWith('SFX_REUSED')).length === 0);
  if (!sfxValid && !failures.some(f => f.includes('MISSING_STAGE'))) {
    failures.unshift(`SFX_STEMS_INVALID: ${sfxStemsPresent}/${rawScenes.length} validados.`);
  }

  // 3. Validação de Mix
  let mixValid = false;
  if (!fs.existsSync(mixPath)) {
    failures.push('MISSING_MIX_FILE: audio/mix/mix.wav ausente.');
  } else {
    const st = fs.statSync(mixPath);
    if (st.size === 0) {
      failures.push('EMPTY_MIX_FILE: audio/mix/mix.wav com 0 bytes.');
    } else {
      mixValid = true;
    }
  }

  return {
    runId,
    passed: failures.length === 0,
    musicValid,
    sfxValid,
    mixValid,
    totalScenes: rawScenes.length,
    sfxStemsPresent,
    failures
  };
}

export async function runAudioBedDispatch(options?: {
  runId?: string;
  forceDispatch?: boolean;
  stage?: 'sfx' | 'music' | 'mix' | 'all';
  contractPath?: string;
  scenesPath?: string;
}): Promise<{ plan: AudioBedPlanReport; wordStatus: 'AUDIO_DRY_ONLY' | 'AUDIO_DISPATCHED' | 'NO_AUDIO_PACK' }> {
  const contractPath = options?.contractPath || path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.episode.json');
  const scenesPath = options?.scenesPath || path.join(process.cwd(), 'contracts', 'episodes', 'gasolina-adulterada.scenes.json');

  const episodeContract = parseEpisodeContract(contractPath);
  const rawScenes: RawSceneInput[] = JSON.parse(fs.readFileSync(scenesPath, 'utf8'));
  const sceneContracts = buildSceneContracts(episodeContract, rawScenes);

  const isRealDispatch = options?.forceDispatch || process.env.AUDIO_DISPATCH === '1';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runId = options?.runId || `RUN_AUDIO_${timestamp}`;

  // 1. Gera e Valida o Plano de SFX / Trilha / Mix
  const plan = buildAudioBedPlan(episodeContract, sceneContracts, runId);

  const runsEpisodeBase = path.join(process.cwd(), 'runs', episodeContract.episodeId);
  const runDir = path.join(runsEpisodeBase, runId);
  const audioDir = path.join(runDir, 'audio');
  const sfxDir = path.join(audioDir, 'sfx');
  const musicDir = path.join(audioDir, 'music');
  const mixDir = path.join(audioDir, 'mix');
  const checkpointsDir = path.join(runDir, 'checkpoints');
  const dispatchBase = path.join(runsEpisodeBase, 'dispatch');

  fs.mkdirSync(sfxDir, { recursive: true });
  fs.mkdirSync(musicDir, { recursive: true });
  fs.mkdirSync(mixDir, { recursive: true });
  fs.mkdirSync(checkpointsDir, { recursive: true });
  fs.mkdirSync(path.join(dispatchBase, 'latest'), { recursive: true });

  // 2. Modo Sem AUDIO_DISPATCH=1 -> NÃO copiar stems genéricos, apenas reportar plano
  if (!isRealDispatch) {
    console.log(`\n══════════════════════════════════════════════════════════════════════════════════════`);
    console.log(`🎧 PLANO DE SFX, MÚSICA & MIX (DRY-RUN / AUDIO_DISPATCH=0)`);
    console.log(`══════════════════════════════════════════════════════════════════════════════════════`);
    console.log(`- RunId: ${runId}`);
    console.log(`- Total de Cenas com SFX: ${plan.totalScenes}`);
    console.log(`- Total de Cues Substantivas: ${plan.totalSfxCues}`);
    console.log(`- Trilha Musical: ${plan.musicMood} (${plan.musicTargetSeconds.toFixed(1)}s)`);
    console.log(`- Status: MISSING_STAGE: sfx (Nenhum stem copiado sem AUDIO_DISPATCH=1 explícito)`);
    console.log(`══════════════════════════════════════════════════════════════════════════════════════\n`);
    return { plan, wordStatus: 'AUDIO_DRY_ONLY' };
  }

  // 3. Disparo Real de Áudio (AUDIO_DISPATCH=1)
  console.log(`\n🔥 DISPARO REAL DE SFX INDUSTRIAL DEDICADO (AUDIO_DISPATCH=1)...`);

  const audioLibDir = path.join(process.cwd(), 'assets', 'audio_library');
  const hasAudioLib = fs.existsSync(audioLibDir);

  if (!hasAudioLib && process.env.AUDIO_PACK_AVAILABLE !== '1') {
    const sessionReport = {
      status: 'STAGE_UNAVAILABLE',
      hasPack: false,
      wordStatus: 'NO_AUDIO_PACK',
      runId,
      reason: 'Nenhum sound pack de SFX industrial específico de posto configurado no ambiente.',
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(path.join(dispatchBase, 'latest', 'audio-session.json'), JSON.stringify(sessionReport, null, 2), 'utf8');
    throw new Error('STAGE_UNAVAILABLE: sfx / music - Sound pack de posto indisponível.');
  }

  // Gera a trilha musical oficial (bed.wav)
  const musicBedSource = path.join(audioLibDir, 'audio', 'music', 'cinematic', 'ambient', 'ambient_drone_01.wav');
  const targetMusicBed = path.join(musicDir, 'bed.wav');
  if (fs.existsSync(musicBedSource)) {
    fs.copyFileSync(musicBedSource, targetMusicBed);
    console.log(`🎵 [MÚSICA] Trilha ambiente industrial vinculada: ${targetMusicBed}`);
  }

  // Recusa cópia em loop genérico (% 20)
  console.log(`🚫 [SFX] Proibido loop genérico (i % 20). Cada cena exige design sonoro único.`);
  throw new Error('SFX_GENERIC_DENIED: Stems de SFX devem ser gerados unicamente por cena (sem duplicar SHAs).');
}

if (require.main === module) {
  runAudioBedDispatch().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('\n❌ STATUS NO DISPATCH DE ÁUDIO:', err.message);
    process.exit(1);
  });
}
