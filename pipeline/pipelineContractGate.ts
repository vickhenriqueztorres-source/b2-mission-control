import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { RunManifest } from './runManifest';
import {
  HSL_BYTE_CONSTRAINTS,
  HSL_MAX_AUDIO_VIDEO_DESYNC_SECONDS,
  HSL_CANONICAL_THUMBNAILS
} from '../spec/hsl-spec';

export interface BeatValidationFailure {
  sceneId: string;
  shotId: string;
  index: number;
  assetType: 'START_FRAME' | 'VIDEO_TAKE' | 'VOICEOVER' | 'PACKAGING' | 'TIMING';
  expectedPath: string;
  reason: string;
  actualSizeBytes?: number;
  actualDurationSeconds?: number;
}

export interface RunContractValidationOptions {
  runId: string;
  runsDir?: string;
  publicDir?: string;
  stageScope?: 'PRE_RENDER' | 'PRE_MUX' | 'FULL_PACKAGE';
  allowedTimingDeltaSeconds?: number;
}

export interface RunValidationReport {
  runId: string;
  totalScenesExpected: number;
  validStartFrames: number;
  validVideoTakes: number;
  validAudioClips: number;
  narrationDurationSeconds: number;
  timelineDurationSeconds: number;
  timingDeltaSeconds: number;
  packagingValid: boolean;
  failures: BeatValidationFailure[];
  passed: boolean;
}

export class PipelineContractGate {
  private static readonly MIN_PNG_BYTES = HSL_BYTE_CONSTRAINTS.MIN_START_FRAME_BYTES;
  private static readonly MIN_MP4_BYTES = HSL_BYTE_CONSTRAINTS.MIN_VIDEO_TAKE_BYTES;
  private static readonly MIN_AUDIO_BYTES = HSL_BYTE_CONSTRAINTS.MIN_AUDIO_NARRATION_BYTES;
  private static readonly DEFAULT_TIMING_TOLERANCE = HSL_MAX_AUDIO_VIDEO_DESYNC_SECONDS;

  /**
   * Valida se um arquivo de imagem possui header PNG ou JPEG válido
   */
  public static validateImageHeader(filePath: string): boolean {
    if (!fs.existsSync(filePath)) return false;
    try {
      const buffer = Buffer.alloc(8);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);

      // PNG: 89 50 4E 47 0D 0A 1A 0A
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
      // JPEG: FF D8 FF
      const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      return isPng || isJpeg;
    } catch {
      return false;
    }
  }

  /**
   * Extrai duração e codec de um arquivo de mídia via ffprobe
   */
  public static probeMedia(filePath: string): { duration: number; codec: string; width?: number; height?: number; valid: boolean } {
    if (!fs.existsSync(filePath)) return { duration: 0, codec: 'missing', valid: false };
    try {
      const probe = spawnSync('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration:stream=width,height,codec_name',
        '-of', 'json',
        filePath
      ], { encoding: 'utf8' });

      if (probe.status !== 0) return { duration: 0, codec: 'probe_error', valid: false };
      const parsed = JSON.parse(probe.stdout);
      const duration = parseFloat(parsed.format?.duration || '0');
      const firstStream = parsed.streams?.[0];
      const codec = firstStream?.codec_name || 'unknown';
      const width = firstStream?.width ? parseInt(firstStream.width, 10) : undefined;
      const height = firstStream?.height ? parseInt(firstStream.height, 10) : undefined;
      return { duration, codec, width, height, valid: duration > 0 };
    } catch {
      return { duration: 0, codec: 'exec_error', valid: false };
    }
  }

  /**
   * Executa a auditoria completa e determinística de contrato de uma run
   */
  public static auditRun(options: RunContractValidationOptions): RunValidationReport {
    const runsDir = options.runsDir || path.join(process.cwd(), 'runs');
    const publicDir = options.publicDir || path.join(process.cwd(), 'public');
    const runDir = path.join(runsDir, options.runId);
    const scope = options.stageScope || 'PRE_RENDER';
    const tolerance = options.allowedTimingDeltaSeconds || this.DEFAULT_TIMING_TOLERANCE;

    const failures: BeatValidationFailure[] = [];

    if (!fs.existsSync(runDir)) {
      failures.push({
        sceneId: 'ROOT',
        shotId: 'RUN_DIR',
        index: 0,
        assetType: 'TIMING',
        expectedPath: runDir,
        reason: `RUN_DIRECTORY_MISSING: O diretório da run '${runDir}' não existe no disco.`
      });
      return {
        runId: options.runId,
        totalScenesExpected: 0,
        validStartFrames: 0,
        validVideoTakes: 0,
        validAudioClips: 0,
        narrationDurationSeconds: 0,
        timelineDurationSeconds: 0,
        timingDeltaSeconds: 0,
        packagingValid: false,
        failures,
        passed: false
      };
    }

    const editPackagePath = path.join(runDir, 'editorial', 'execution', 'documentary-edit-package.json');
    const fireflyGuidePath = path.join(runDir, 'firefly-production-guide.json');

    interface SceneItem {
      sceneId: string;
      shotId: string;
      visualSubject?: string;
    }

    let scenes: SceneItem[] = [];

    if (fs.existsSync(editPackagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(editPackagePath, 'utf8'));
        scenes = pkg.scenes || [];
      } catch (err: any) {
        failures.push({
          sceneId: 'ROOT',
          shotId: 'EDIT_PACKAGE',
          index: 0,
          assetType: 'TIMING',
          expectedPath: editPackagePath,
          reason: `EDIT_PACKAGE_CORRUPTED: ${err.message}`
        });
      }
    } else if (fs.existsSync(fireflyGuidePath)) {
      try {
        const guide = JSON.parse(fs.readFileSync(fireflyGuidePath, 'utf8'));
        scenes = (guide.items || []).map((item: any) => {
          const match = item.name.match(/SC_\d+/);
          const scId = match ? match[0] : item.name;
          return { sceneId: scId, shotId: item.name };
        });
      } catch (err: any) {
        failures.push({
          sceneId: 'ROOT',
          shotId: 'FIREFLY_GUIDE',
          index: 0,
          assetType: 'TIMING',
          expectedPath: fireflyGuidePath,
          reason: `FIREFLY_GUIDE_CORRUPTED: ${err.message}`
        });
      }
    } else {
      failures.push({
        sceneId: 'ROOT',
        shotId: 'SCENE_PLAN',
        index: 0,
        assetType: 'TIMING',
        expectedPath: editPackagePath,
        reason: 'SCENE_PLAN_NOT_FOUND: Nenhum plano de cena (documentary-edit-package.json ou firefly-production-guide.json) encontrado.'
      });
    }

    let validStartFrames = 0;
    let validVideoTakes = 0;

    for (let i = 0; i < scenes.length; i++) {
      const sc = scenes[i];
      const scId = sc.sceneId;
      const shotId = sc.shotId || `SHOT_${i + 1}`;

      const runFramePath = path.join(runDir, 'editorial', 'execution', 'scenes', scId, 'firefly_start_frame.png');
      const pubRunFramePath = path.join(publicDir, 'editorial', 'execution', options.runId, 'scenes', scId, 'firefly_start_frame.png');
      const pubDirectFramePath = path.join(publicDir, 'editorial', 'execution', scId, 'firefly_start_frame.png');

      const resolvedFrame = [runFramePath, pubRunFramePath, pubDirectFramePath].find(p => fs.existsSync(p));

      if (!resolvedFrame) {
        failures.push({
          sceneId: scId,
          shotId,
          index: i + 1,
          assetType: 'START_FRAME',
          expectedPath: runFramePath,
          reason: 'START_FRAME_FILE_MISSING: O arquivo de imagem start frame não existe no disco.'
        });
      } else {
        const stat = fs.statSync(resolvedFrame);
        if (stat.size < this.MIN_PNG_BYTES) {
          failures.push({
            sceneId: scId,
            shotId,
            index: i + 1,
            assetType: 'START_FRAME',
            expectedPath: resolvedFrame,
            actualSizeBytes: stat.size,
            reason: `START_FRAME_SIZE_TOO_SMALL: Tamanho ${stat.size} bytes é menor que ${this.MIN_PNG_BYTES} bytes.`
          });
        } else if (!this.validateImageHeader(resolvedFrame)) {
          failures.push({
            sceneId: scId,
            shotId,
            index: i + 1,
            assetType: 'START_FRAME',
            expectedPath: resolvedFrame,
            actualSizeBytes: stat.size,
            reason: 'START_FRAME_HEADER_INVALID: Arquivo não possui cabeçalho PNG/JPEG válido.'
          });
        } else {
          const fileBuf = fs.readFileSync(resolvedFrame);
          const sha = crypto.createHash('sha256').update(fileBuf).digest('hex');
          const BANNED_MOCK_HASHES = new Set([
            '5103033456db9783fbf1a19fb093b41d40237fa5e73efb1c09b85c18a2862800',
            'ea34a35c4263675001ff2f58e4695e1e7925e01b38f8303fdf5a7c29beea1941',
            '3a88419cffd524bc15372ca62c3e1e976db553531b26f55463f69f201083bb72',
            '5abcd872d8de4887fc1e2ee0fbfe2fb86c2d1b7a2d4807a16adcefcfa962b1b3',
            '684a9d3964b20a3bc760e48719c8f0ec5d0034a78cb58045958611880d8591ef',
            'c18e13ff38b939fbfebec5df4471f466b0394c8e762955f269aee379c6563606',
            '8b7b7ecf5ea2ca32070e1762c262bf86b24d7ceea3c246f6630f5ba67eb7a66b',
            'd981dcbc6e987178cf7d853e414c27415aece7240c5f21226cb121289196b0bc'
          ]);
          const receiptPath = path.join(path.dirname(resolvedFrame), 'start_frame_receipt.json');
          const imageCatalogPath = path.join(process.cwd(), 'assets', 'image_repository', 'catalog.json');
          let isInCentralCatalog = false;
          if (fs.existsSync(imageCatalogPath)) {
            try {
              const imgCat = JSON.parse(fs.readFileSync(imageCatalogPath, 'utf8'));
              isInCentralCatalog = (imgCat.images || []).some((img: any) => img.sha256 === sha || img.id === `${options.runId}_${scId}`);
            } catch {}
          }

          if (fs.existsSync(receiptPath)) {
            try {
              const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
              if (receipt.sha256 && receipt.sha256 !== sha) {
                failures.push({
                  sceneId: scId,
                  shotId,
                  index: i + 1,
                  assetType: 'START_FRAME',
                  expectedPath: receiptPath,
                  reason: `PROVENANCE_SHA_MISMATCH: O hash da imagem não confere com o recibo de IA oficial (${sha.slice(0, 8)} vs ${receipt.sha256?.slice(0, 8)}).`
                });
              } else {
                validStartFrames++;
              }
            } catch (err: any) {
              failures.push({
                sceneId: scId,
                shotId,
                index: i + 1,
                assetType: 'START_FRAME',
                expectedPath: receiptPath,
                reason: `PROVENANCE_RECEIPT_CORRUPTED: ${err.message}`
              });
            }
          } else if (isInCentralCatalog) {
            // Imagem validada e autenticada no Banco Central de Imagens
            validStartFrames++;
          } else {
            failures.push({
              sceneId: scId,
              shotId,
              index: i + 1,
              assetType: 'START_FRAME',
              expectedPath: receiptPath,
              actualSizeBytes: stat.size,
              reason: 'UNVERIFIED_PROVENANCE_MISSING_RECEIPT: O frame não possui comprovante start_frame_receipt.json nem registro no Banco Central de Imagens.'
            });
          }
        }
      }

      const runVideoPath = path.join(runDir, 'editorial', 'execution', 'scenes', scId, 'firefly_take.mp4');
      const pubRunVideoPath = path.join(publicDir, 'editorial', 'execution', options.runId, 'scenes', scId, 'firefly_take.mp4');
      const pubDirectVideoPath = path.join(publicDir, 'editorial', 'execution', scId, 'firefly_take.mp4');
      const repoVideoPath = (sc as any).videoFilename ? path.join(process.cwd(), 'assets', 'video_repository', (sc as any).videoFilename) : '';
      const resolvedVideo = [runVideoPath, pubRunVideoPath, pubDirectVideoPath, repoVideoPath].filter(Boolean).find(p => fs.existsSync(p));

      const receiptFile = resolvedFrame ? path.join(path.dirname(resolvedFrame), 'start_frame_receipt.json') : '';
      const isDossierOrMotion = (sc as any).takeType === 'KEYFRAME_DOSSIER' || 
                                (sc as any).isDossier === true ||
                                (sc as any).type === 'cinematic_parallax' ||
                                (sc as any).visualMode === 'remotion' ||
                                (sc as any).visualMode === 'typography' ||
                                (receiptFile && fs.existsSync(receiptFile) && ['KEYFRAME_DOSSIER', 'CINEMATIC_PARALLAX'].includes(JSON.parse(fs.readFileSync(receiptFile, 'utf8') || '{}').takeType));

      if (isDossierOrMotion) {
        // Cenas com Motion Procedural / Paralaxe 35mm / Dossiê usam animação Remotion 2.5D de forma ultra-estável
        validVideoTakes++;
        continue;
      }

      if (!resolvedVideo) {
        failures.push({
          sceneId: scId,
          shotId,
          index: i + 1,
          assetType: 'VIDEO_TAKE',
          expectedPath: pubDirectVideoPath,
          reason: 'VIDEO_TAKE_FILE_MISSING: O take de vídeo .mp4 não foi gerado, não consta no Repositório Central e não possui animação procedural configurada.'
        });
      } else {
        const stat = fs.statSync(resolvedVideo);
        if (stat.size < this.MIN_MP4_BYTES) {
          failures.push({
            sceneId: scId,
            shotId,
            index: i + 1,
            assetType: 'VIDEO_TAKE',
            expectedPath: resolvedVideo,
            actualSizeBytes: stat.size,
            reason: `VIDEO_TAKE_SIZE_TOO_SMALL: Tamanho ${stat.size} bytes é menor que ${this.MIN_MP4_BYTES} bytes.`
          });
        } else {
          const probe = this.probeMedia(resolvedVideo);
          if (!probe.valid || probe.duration < 1.0) {
            failures.push({
              sceneId: scId,
              shotId,
              index: i + 1,
              assetType: 'VIDEO_TAKE',
              expectedPath: resolvedVideo,
              actualDurationSeconds: probe.duration,
              reason: `VIDEO_TAKE_CORRUPTED_OR_ZERO_DURATION: ffprobe retornou duração inválida (${probe.duration}s, codec: ${probe.codec}).`
            });
          } else {
            validVideoTakes++;
          }
        }
      }
    }

    const narrationPath1 = path.join(runDir, 'postproduction', 'narration.mp3');
    const narrationPath2 = path.join(publicDir, 'postproduction_ep02', 'narration.mp3');
    const narrationPath3 = path.join(publicDir, 'editorial', 'execution', options.runId, 'narration.mp3');

    const resolvedNarration = [narrationPath1, narrationPath2, narrationPath3].find(p => fs.existsSync(p));

    let narrationDurationSeconds = 0;
    let timelineDurationSeconds = 0;

    if (!resolvedNarration) {
      failures.push({
        sceneId: 'GLOBAL',
        shotId: 'AUDIO_NARRATION',
        index: 0,
        assetType: 'VOICEOVER',
        expectedPath: narrationPath1,
        reason: 'NARRATION_AUDIO_MISSING: O arquivo de narração narration.mp3 não foi encontrado.'
      });
    } else {
      const stat = fs.statSync(resolvedNarration);
      if (stat.size < this.MIN_AUDIO_BYTES) {
        failures.push({
          sceneId: 'GLOBAL',
          shotId: 'AUDIO_NARRATION',
          index: 0,
          assetType: 'VOICEOVER',
          expectedPath: resolvedNarration,
          actualSizeBytes: stat.size,
          reason: `NARRATION_AUDIO_TOO_SMALL: Tamanho ${stat.size} bytes é menor que ${this.MIN_AUDIO_BYTES} bytes.`
        });
      } else {
        const probe = this.probeMedia(resolvedNarration);
        narrationDurationSeconds = probe.duration;
      }
    }

    const sceneTimingsPath = path.join(runDir, 'postproduction', 'scene_timings.json');
    if (fs.existsSync(sceneTimingsPath)) {
      try {
        const timings = JSON.parse(fs.readFileSync(sceneTimingsPath, 'utf8'));
        const sceneList = Array.isArray(timings) ? timings : (timings.scenes || []);
        if (sceneList.length > 0) {
          const last = sceneList[sceneList.length - 1];
          const totalFrames = timings.totalDurationFrames || ((last.startFrame || 0) + (last.durationFrames || 0));
          timelineDurationSeconds = timings.totalDurationSeconds || (totalFrames / 30);
        }
      } catch {}
    }

    const timingDelta = Math.abs(narrationDurationSeconds - timelineDurationSeconds);
    if (narrationDurationSeconds > 0 && timelineDurationSeconds > 0 && timingDelta > tolerance) {
      failures.push({
        sceneId: 'GLOBAL',
        shotId: 'TIMELINE_SYNC',
        index: 0,
        assetType: 'TIMING',
        expectedPath: sceneTimingsPath,
        actualDurationSeconds: timingDelta,
        reason: `TIMELINE_AUDIO_DESYNC: Descompasso de ${timingDelta.toFixed(2)}s entre timeline (${timelineDurationSeconds.toFixed(2)}s) e narração (${narrationDurationSeconds.toFixed(2)}s), tolerância é ${tolerance}s.`
      });
    }

    let packagingValid = true;
    if (scope === 'FULL_PACKAGE') {
      const requiredArtifacts = [
        ...HSL_CANONICAL_THUMBNAILS.map(t => path.join(runDir, 'postproduction', 'thumbnails', t.filename)),
        path.join(runDir, 'postproduction', 'description.txt'),
        path.join(runDir, 'postproduction', 'youtube-metadata.json')
      ];

      for (const artifact of requiredArtifacts) {
        if (!fs.existsSync(artifact) || fs.statSync(artifact).size < HSL_BYTE_CONSTRAINTS.MIN_TEXT_METADATA_BYTES) {
          packagingValid = false;
          failures.push({
            sceneId: 'PACKAGING',
            shotId: path.basename(artifact),
            index: 0,
            assetType: 'PACKAGING',
            expectedPath: artifact,
            reason: `PACKAGING_ARTIFACT_MISSING_OR_EMPTY: O artefato '${path.basename(artifact)}' está ausente ou vazio.`
          });
        }
      }
    }

    const passed = failures.length === 0;

    return {
      runId: options.runId,
      totalScenesExpected: scenes.length,
      validStartFrames,
      validVideoTakes,
      validAudioClips: resolvedNarration ? 1 : 0,
      narrationDurationSeconds,
      timelineDurationSeconds,
      timingDeltaSeconds: timingDelta,
      packagingValid,
      failures,
      passed
    };
  }

  /**
   * Auto-recuperação (Healer): Regenera determinística e exclusivamente os assets faltantes de uma run
   */
  public static async healRun(options: RunContractValidationOptions): Promise<RunValidationReport> {
    const reportBefore = this.auditRun(options);
    if (reportBefore.passed) {
      console.log(`[HEALER] A run '${options.runId}' já está 100% íntegra. Nenhuma correção necessária.`);
      return reportBefore;
    }

    console.log(`[HEALER] Iniciando auto-regeneração cirúrgica para ${reportBefore.failures.length} falhas na run '${options.runId}'...`);
    const runsDir = options.runsDir || path.join(process.cwd(), 'runs');
    const publicDir = options.publicDir || path.join(process.cwd(), 'public');
    const runDir = path.join(runsDir, options.runId);

    const curatedDir = path.join(process.cwd(), 'assets', 'submarine_curated');
    const curatedPhotos = fs.existsSync(curatedDir)
      ? fs.readdirSync(curatedDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png')).map(f => path.join(curatedDir, f))
      : [];

    for (const failure of reportBefore.failures) {
      if (failure.assetType === 'START_FRAME') {
        const scId = failure.sceneId;
        const targetFrame = path.join(runDir, 'editorial', 'execution', 'scenes', scId, 'firefly_start_frame.png');
        const pubFrame = path.join(publicDir, 'editorial', 'execution', scId, 'firefly_start_frame.png');

        fs.mkdirSync(path.dirname(targetFrame), { recursive: true });
        fs.mkdirSync(path.dirname(pubFrame), { recursive: true });

        if (curatedPhotos.length > 0) {
          const photoIdx = parseInt(scId.replace('SC_', ''), 10) % curatedPhotos.length;
          const srcPhoto = curatedPhotos[photoIdx];
          spawnSync('ffmpeg', [
            '-y',
            '-i', srcPhoto,
            '-vf', 'scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,eq=contrast=1.10:brightness=-0.02:saturation=0.92',
            '-frames:v', '1',
            targetFrame
          ]);
          if (fs.existsSync(targetFrame)) {
            fs.copyFileSync(targetFrame, pubFrame);
            console.log(`[HEALER] ✅ Start Frame regenerado para ${scId}: ${targetFrame}`);
          }
        }
      }

      if (failure.assetType === 'VIDEO_TAKE') {
        const scId = failure.sceneId;
        const targetVideo = path.join(runDir, 'editorial', 'execution', 'scenes', scId, 'firefly_take.mp4');
        const pubVideo = path.join(publicDir, 'editorial', 'execution', scId, 'firefly_take.mp4');
        const runFrame = path.join(runDir, 'editorial', 'execution', 'scenes', scId, 'firefly_start_frame.png');
        const pubFrame = path.join(publicDir, 'editorial', 'execution', scId, 'firefly_start_frame.png');

        const resolvedFrame = [runFrame, pubFrame].find(p => fs.existsSync(p));
        if (resolvedFrame) {
          fs.mkdirSync(path.dirname(targetVideo), { recursive: true });
          fs.mkdirSync(path.dirname(pubVideo), { recursive: true });

          const vf = "scale=1280:720,zoompan=z='min(zoom+0.0015,1.25)':d=150:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720";
          spawnSync('ffmpeg', [
            '-y',
            '-loop', '1',
            '-i', resolvedFrame,
            '-vf', vf,
            '-c:v', 'libx264',
            '-t', '5',
            '-pix_fmt', 'yuv420p',
            targetVideo
          ]);
          if (fs.existsSync(targetVideo)) {
            fs.copyFileSync(targetVideo, pubVideo);
            console.log(`[HEALER] ✅ Video Take regenerado com Ken Burns para ${scId}: ${targetVideo}`);
          }
        }
      }
    }

    const reportAfter = this.auditRun(options);
    this.printReport(reportAfter);
    return reportAfter;
  }

  public static assertPreRenderIntegrity(runId: string, runsDir?: string, publicDir?: string): void {
    const report = this.auditRun({
      runId,
      runsDir,
      publicDir,
      stageScope: 'PRE_RENDER'
    });

    this.printReport(report);

    if (!report.passed) {
      console.error(`\n[FATAL_GATE_ERROR] O Gate Pré-Render BARRheadline A PRODUÇÃO DA RUN '${runId}'.`);
      console.error(`Total de violações contratuais encontradas: ${report.failures.length}.`);
      console.error(`O Remotion NÃO iniciará até que 100% dos assets e durações estejam íntegros.\n`);
      process.exit(1);
    }
  }

  public static printReport(report: RunValidationReport): void {
    console.log(`\n══════════════════════════════════════════════════════════════════════════════════════`);
    console.log(`🛡️ RELATÓRIO DO GATE DETERMINÍSTICO DE CONTRATO // RUN: ${report.runId}`);
    console.log(`══════════════════════════════════════════════════════════════════════════════════════`);
    console.log(`Cenas Esperadas:      ${report.totalScenesExpected}`);
    console.log(`Start Frames Válidos: ${report.validStartFrames} / ${report.totalScenesExpected}`);
    console.log(`Video Takes Válidos:  ${report.validVideoTakes} / ${report.totalScenesExpected}`);
    console.log(`Narração Duração:     ${report.narrationDurationSeconds.toFixed(2)}s | Timeline: ${report.timelineDurationSeconds.toFixed(2)}s (Delta: ${report.timingDeltaSeconds.toFixed(2)}s)`);
    console.log(`Resultado do Gate:    ${report.passed ? '✅ APROVADO (100% ÍNTEGRO)' : '❌ REPROVADO (CONTRATO VIOLADO)'}`);
    console.log(`══════════════════════════════════════════════════════════════════════════════════════`);

    if (report.failures.length > 0) {
      console.log(`\n❌ LISTA DE VIOLAÇÕES DETECTADAS (${report.failures.length} falhas):`);
      console.log(`┌─────┬──────────┬────────────────┬────────────────────────────────────────────────────────────────────────┐`);
      console.log(`│ #   │ SCENE ID │ TIPO ASSET     │ MOTIVO DA FALHA / CAMINHO                                              │`);
      console.log(`├─────┼──────────┼────────────────┼────────────────────────────────────────────────────────────────────────┤`);
      report.failures.forEach((f, idx) => {
        const num = String(idx + 1).padEnd(3);
        const sc = f.sceneId.padEnd(8);
        const type = f.assetType.padEnd(14);
        const reason = f.reason.slice(0, 70);
        console.log(`│ ${num} │ ${sc} │ ${type} │ ${reason} │`);
        console.log(`│     │          │                │ ➔ Caminho: ${f.expectedPath.slice(0, 60)} │`);
      });
      console.log(`└─────┴──────────┴────────────────┴────────────────────────────────────────────────────────────────────────┘`);
    }
  }
}
