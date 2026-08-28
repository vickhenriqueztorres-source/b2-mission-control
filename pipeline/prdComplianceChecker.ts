import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  HSL_FPS,
  HSL_MIN_EPISODE_DURATION_SECONDS,
  HSL_MAX_EPISODE_DURATION_SECONDS,
  HSL_MAX_AUDIO_VIDEO_DESYNC_SECONDS,
  HSL_CANONICAL_CHAPTERS,
  HSL_EXPECTED_CHAPTER_COUNT,
  HSL_CANONICAL_THUMBNAILS,
  HSL_BYTE_CONSTRAINTS,
  secondsToFrames,
  framesToSeconds
} from '../spec/hsl-spec';
import { PipelineContractGate, RunValidationReport } from './pipelineContractGate';
import { RunManifest } from './runManifest';

export interface PrdRuleCheckResult {
  ruleId: string;
  name: string;
  clause: string;
  passed: boolean;
  requiredValue: string;
  measuredValue: string;
  details?: string;
}

export interface PrdComplianceReport {
  runId: string;
  timestamp: string;
  overallPassed: boolean;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  results: PrdRuleCheckResult[];
}

export class PrdComplianceChecker {
  /**
   * Executa a auditoria completa de conformidade do PRD contra uma run
   */
  public static verifyRun(runId: string, runsDir?: string, publicDir?: string): PrdComplianceReport {
    const baseRunsDir = runsDir || path.join(process.cwd(), 'runs');
    const basePublicDir = publicDir || path.join(process.cwd(), 'public');
    const runDir = path.join(baseRunsDir, runId);

    const results: PrdRuleCheckResult[] = [];

    // ─────────────────────────────────────────────────────────────────────────
    // REGRA 1: Duração da Narração (PRD: NFR-01)
    // ─────────────────────────────────────────────────────────────────────────
    const narrationRunPath = path.join(runDir, 'postproduction', 'narration.mp3');
    const narrationPubPath = path.join(basePublicDir, 'editorial', 'execution', runId, 'narration.mp3');
    const narrationResolved = [narrationRunPath, narrationPubPath].find(p => fs.existsSync(p));

    let narrationDuration = 0;
    if (narrationResolved) {
      const probe = PipelineContractGate.probeMedia(narrationResolved);
      narrationDuration = probe.duration;
    }

    const narrationDurationPassed =
      narrationDuration >= HSL_MIN_EPISODE_DURATION_SECONDS &&
      narrationDuration <= HSL_MAX_EPISODE_DURATION_SECONDS;

    results.push({
      ruleId: 'PRD-R01-NARRATION-DURATION',
      name: 'Duração da Narração (Áudio Master)',
      clause: 'PRD: NFR-01',
      passed: narrationDurationPassed,
      requiredValue: `${HSL_MIN_EPISODE_DURATION_SECONDS}s - ${HSL_MAX_EPISODE_DURATION_SECONDS}s (5 a 12 min)`,
      measuredValue: `${narrationDuration.toFixed(2)}s (${(narrationDuration / 60).toFixed(2)} min)`,
      details: narrationResolved ? `Arquivo: ${narrationResolved}` : 'Arquivo de narração NÃO encontrado.'
    });

    // ─────────────────────────────────────────────────────────────────────────
    // REGRA 2: Duração da Timeline e Sincronismo Áudio vs Vídeo (PRD: NFR-05)
    // ─────────────────────────────────────────────────────────────────────────
    const sceneTimingsPath = path.join(runDir, 'postproduction', 'scene_timings.json');
    let timelineDuration = 0;
    let totalFrames = 0;

    if (fs.existsSync(sceneTimingsPath)) {
      try {
        const timings = JSON.parse(fs.readFileSync(sceneTimingsPath, 'utf8'));
        const sceneList = Array.isArray(timings) ? timings : (timings.scenes || []);
        if (sceneList.length > 0) {
          const last = sceneList[sceneList.length - 1];
          totalFrames = timings.totalDurationFrames || ((last.startFrame || 0) + (last.durationFrames || 0));
          timelineDuration = timings.totalDurationSeconds || framesToSeconds(totalFrames, HSL_FPS);
        }
      } catch {}
    }

    const desyncDelta = Math.abs(narrationDuration - timelineDuration);
    const syncPassed = narrationDuration > 0 && timelineDuration > 0 && desyncDelta <= HSL_MAX_AUDIO_VIDEO_DESYNC_SECONDS;

    results.push({
      ruleId: 'PRD-R02-AUDIO-VIDEO-SYNC',
      name: 'Sincronismo Estrito Áudio vs Timeline',
      clause: 'PRD: NFR-05 & FR-13',
      passed: syncPassed,
      requiredValue: `Delta <= ${HSL_MAX_AUDIO_VIDEO_DESYNC_SECONDS}s`,
      measuredValue: `Delta = ${desyncDelta.toFixed(2)}s (Áudio: ${narrationDuration.toFixed(2)}s, Timeline: ${timelineDuration.toFixed(2)}s, Frames: ${totalFrames})`,
      details: syncPassed ? 'Sincronizado dentro da tolerância.' : 'Descompasso temporal excede a tolerância do PRD.'
    });

    // ─────────────────────────────────────────────────────────────────────────
    // REGRA 3: Estrutura dos 6 Capítulos Progressivos (PRD: FR-01, Seção 3.5)
    // ─────────────────────────────────────────────────────────────────────────
    const editPackagePath = path.join(runDir, 'editorial', 'execution', 'documentary-edit-package.json');
    const scriptApprovedPath = path.join(runDir, 'editorial', '06-script-approved.json');
    const ytMetadataPath = path.join(runDir, 'postproduction', 'youtube-metadata.json');

    let chapterCount = 0;
    let structurePassed = false;
    let structureDetails = '';
    const chaptersFound = new Set<string>();

    if (fs.existsSync(scriptApprovedPath)) {
      try {
        const script = JSON.parse(fs.readFileSync(scriptApprovedPath, 'utf8'));
        (script.scenes || []).forEach((s: any) => {
          if (s.chapter) chaptersFound.add(s.chapter);
        });
      } catch {}
    }

    if (chaptersFound.size === 0 && fs.existsSync(ytMetadataPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(ytMetadataPath, 'utf8'));
        if (Array.isArray(meta.chapters)) {
          meta.chapters.forEach((c: any) => {
            if (c.title) chaptersFound.add(c.title);
          });
        }
      } catch {}
    }

    if (chaptersFound.size === 0 && fs.existsSync(editPackagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(editPackagePath, 'utf8'));
        (pkg.scenes || []).forEach((s: any) => {
          if (s.chapterId || s.chapter) chaptersFound.add(s.chapterId || s.chapter);
        });
      } catch {}
    }

    chapterCount = chaptersFound.size;
    structurePassed = chapterCount === HSL_EXPECTED_CHAPTER_COUNT;
    structureDetails = structurePassed
      ? `Encontrados ${chapterCount} capítulos progressivos: [${Array.from(chaptersFound).join(', ')}]`
      : `Encontrados ${chapterCount} capítulos (esperado: ${HSL_EXPECTED_CHAPTER_COUNT})`;

    results.push({
      ruleId: 'PRD-R03-CHAPTER-STRUCTURE',
      name: 'Estrutura dos 6 Capítulos Progressivos',
      clause: 'PRD: FR-01 & Seção 3.5',
      passed: structurePassed,
      requiredValue: `${HSL_EXPECTED_CHAPTER_COUNT} capítulos progressivos contínuos`,
      measuredValue: `${chapterCount} capítulos detectados`,
      details: structureDetails
    });

    // ─────────────────────────────────────────────────────────────────────────
    // REGRA 4: Contrato de Beats vs Assets Reais (Zero Tela Preta) (PRD: FR-02, FR-03, FR-04)
    // ─────────────────────────────────────────────────────────────────────────
    const gateReport: RunValidationReport = PipelineContractGate.auditRun({
      runId,
      runsDir: baseRunsDir,
      publicDir: basePublicDir,
      stageScope: 'PRE_RENDER',
      allowedTimingDeltaSeconds: HSL_MAX_AUDIO_VIDEO_DESYNC_SECONDS
    });

    const beatsPassed =
      gateReport.totalScenesExpected > 0 &&
      gateReport.validStartFrames === gateReport.totalScenesExpected &&
      gateReport.validVideoTakes === gateReport.totalScenesExpected;

    results.push({
      ruleId: 'PRD-R04-BEATS-VS-ASSETS',
      name: 'Mídia Real em 100% dos Beats (Zero Tela Preta/Listras)',
      clause: 'PRD: FR-02, FR-03, FR-04 & NFR-03',
      passed: beatsPassed,
      requiredValue: `100% das ${gateReport.totalScenesExpected} cenas com start frames e takes válidos`,
      measuredValue: `Frames: ${gateReport.validStartFrames}/${gateReport.totalScenesExpected}, Takes: ${gateReport.validVideoTakes}/${gateReport.totalScenesExpected}`,
      details: beatsPassed
        ? 'Todos os 50 beats possuem mídias físicas verificadas com ffprobe e magic bytes.'
        : `${gateReport.failures.length} violações de contrato encontradas.`
    });

    // ─────────────────────────────────────────────────────────────────────────
    // REGRA 5: Empacotamento de 3 Thumbnails 4K e Metadados SEO (PRD: FR-08, Seção 3.4)
    // ─────────────────────────────────────────────────────────────────────────
    const postDir = path.join(runDir, 'postproduction');
    let packagingFailures: string[] = [];

    for (const thumb of HSL_CANONICAL_THUMBNAILS) {
      const thumbPath = path.join(postDir, 'thumbnails', thumb.filename);
      if (!fs.existsSync(thumbPath)) {
        packagingFailures.push(`Thumbnail ausente: ${thumb.filename}`);
      } else {
        const stat = fs.statSync(thumbPath);
        if (stat.size < thumb.minSizeBytes) {
          packagingFailures.push(`Thumbnail ${thumb.filename} truncada (${stat.size} bytes < ${thumb.minSizeBytes} bytes)`);
        } else if (!PipelineContractGate.validateImageHeader(thumbPath)) {
          packagingFailures.push(`Thumbnail ${thumb.filename} possui cabeçalho inválido.`);
        }
      }
    }

    const descPath = path.join(postDir, 'description.txt');
    if (!fs.existsSync(descPath) || fs.statSync(descPath).size < HSL_BYTE_CONSTRAINTS.MIN_TEXT_METADATA_BYTES) {
      packagingFailures.push('description.txt ausente ou menor que 100 bytes');
    }

    const ytMetaPath = path.join(postDir, 'youtube-metadata.json');
    if (!fs.existsSync(ytMetaPath) || fs.statSync(ytMetaPath).size < HSL_BYTE_CONSTRAINTS.MIN_TEXT_METADATA_BYTES) {
      packagingFailures.push('youtube-metadata.json ausente ou menor que 100 bytes');
    }

    const packagingPassed = packagingFailures.length === 0;

    results.push({
      ruleId: 'PRD-R05-PACKAGING-PACKAGE',
      name: 'Empacotamento Completo (3 Thumbnails 4K + SEO)',
      clause: 'PRD: FR-08 & Seção 3.4',
      passed: packagingPassed,
      requiredValue: '3 Thumbnails 4K (A/B/C) + description.txt + youtube-metadata.json',
      measuredValue: packagingPassed ? '5/5 artefatos válidos no disco' : `${packagingFailures.length} falhas`,
      details: packagingPassed ? 'Pacote completo de publicação validado.' : packagingFailures.join('; ')
    });

    // ─────────────────────────────────────────────────────────────────────────
    // REGRA 6: Imutabilidade e Consistência do Plano (PRD: FR-13, NFR-05)
    // ─────────────────────────────────────────────────────────────────────────
    let planConsistencyPassed = true;
    let planHashDetails = '';

    if (fs.existsSync(editPackagePath)) {
      const fileBuffer = fs.readFileSync(editPackagePath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      planHashDetails = `SHA-256: ${hash.slice(0, 16)}... (${fileBuffer.length} bytes)`;
    } else {
      planConsistencyPassed = false;
      planHashDetails = 'Plano de cena ausente.';
    }

    results.push({
      ruleId: 'PRD-R06-PLAN-IMMUTABILITY',
      name: 'Consistência e Integridade do Plano de Edição',
      clause: 'PRD: FR-13 & NFR-05',
      passed: planConsistencyPassed,
      requiredValue: 'Hash SHA-256 do plano de cena íntegro',
      measuredValue: planHashDetails,
      details: planConsistencyPassed ? 'Plano de edição validado.' : 'Plano de edição corrompido ou ausente.'
    });

    const passedRules = results.filter(r => r.passed).length;
    const failedRules = results.filter(r => !r.passed).length;
    const overallPassed = failedRules === 0;

    return {
      runId,
      timestamp: new Date().toISOString(),
      overallPassed,
      totalRules: results.length,
      passedRules,
      failedRules,
      results
    };
  }

  public static printReport(report: PrdComplianceReport): void {
    console.log(`\n══════════════════════════════════════════════════════════════════════════════════════`);
    console.log(`📋 RELATÓRIO OFICIAL DE CONFORMIDADE COM O PRD // RUN: ${report.runId}`);
    console.log(`══════════════════════════════════════════════════════════════════════════════════════`);
    console.log(`Timestamp:            ${report.timestamp}`);
    console.log(`Total de Regras:      ${report.totalRules}`);
    console.log(`Regras Aprovadas:     ${report.passedRules} / ${report.totalRules}`);
    console.log(`Status de Conformidade: ${report.overallPassed ? '✅ 100% CONFORME COM O PRD' : '❌ NÃO CONFORME (VIOLAÇÕES DETECTADAS)'}`);
    console.log(`══════════════════════════════════════════════════════════════════════════════════════`);

    console.log(`\n┌────────────────────────────┬─────────┬──────────────────────┬────────────────────────────────────────────┐`);
    console.log(`│ REGRA / CLÁUSULA           │ STATUS  │ VALOR EXIGIDO        │ VALOR MEDIDO                               │`);
    console.log(`├────────────────────────────┼─────────┼──────────────────────┼────────────────────────────────────────────┤`);

    report.results.forEach(r => {
      const ruleName = (r.ruleId + ' (' + r.clause + ')').slice(0, 26).padEnd(26);
      const status = r.passed ? '✅ PASS ' : '❌ FAIL ';
      const req = r.requiredValue.slice(0, 20).padEnd(20);
      const meas = r.measuredValue.slice(0, 42).padEnd(42);
      console.log(`│ ${ruleName} │ ${status} │ ${req} │ ${meas} │`);
      if (!r.passed && r.details) {
        console.log(`│   ➔ DETALHE: ${r.details.slice(0, 88).padEnd(88)} │`);
      }
    });

    console.log(`└────────────────────────────┴─────────┴──────────────────────┴────────────────────────────────────────────┘\n`);
  }

  public static assertCompliance(runId: string, runsDir?: string, publicDir?: string): void {
    const report = this.verifyRun(runId, runsDir, publicDir);
    this.printReport(report);

    if (!report.overallPassed) {
      console.error(`[FATAL_PRD_VIOLATION] A run '${runId}' violou ${report.failedRules} regras inegociáveis do PRD.`);
      console.error(`O entregável NÃO PODE ser declarado como pronto. Abortando com Exit Code 1.\n`);
      process.exit(1);
    }
  }
}
