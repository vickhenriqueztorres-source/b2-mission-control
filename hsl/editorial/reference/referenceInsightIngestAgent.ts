import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const HSL_REFERENCE_SHINGLE_WORDS = 10;

export interface HslReferenceLesson {
  readonly lesson_id: string;
  readonly source_file: string;
  readonly source_sha256: string;
  readonly language: string;
  readonly segment_count: number;
  readonly accepted_segment_count: number;
  readonly rejected_segment_count: number;
  readonly rejection_counts: Readonly<{
    no_speech: number;
    compression: number;
    low_confidence: number;
  }>;
  readonly principles: readonly string[];
}

export interface HslReferenceInsightSnapshot {
  readonly schema: 'hsl.editorial.reference-insights.v1';
  readonly schema_version: '1.0.0';
  readonly reference_only: true;
  readonly generated_at: string;
  readonly source_directory_label: 'DOCS ABRAHAM/transcriptions';
  readonly asr_quality_policy: Readonly<{
    max_no_speech_probability_exclusive: 0.5;
    max_compression_ratio_inclusive: 2.4;
    min_average_log_probability_inclusive: -1;
  }>;
  readonly fingerprint_policy: Readonly<{
    algorithm: 'sha256-normalized-word-shingle';
    shingle_words: 10;
    stores_source_prose: false;
  }>;
  readonly lessons: readonly HslReferenceLesson[];
  readonly phrase_fingerprints: readonly string[];
}

interface TranscriptSegment {
  readonly text?: string;
  readonly no_speech_prob?: number;
  readonly compression_ratio?: number;
  readonly avg_logprob?: number;
}

interface TranscriptFile {
  readonly language?: string;
  readonly segments?: readonly TranscriptSegment[];
}

const LESSONS = [
  {
    lessonId: 'AUDIO_HIERARCHY',
    fileName: 'aula_01_trabalhando_com_audio.json',
    principles: ['NARRATION_IS_PRIMARY_STEM', 'SEPARATE_AUDIO_STEMS', 'DUCK_SUPPORTING_AUDIO', 'VALIDATE_LOUDNESS_AND_PEAKS']
  },
  {
    lessonId: 'COUNTERINTUITIVE_ANGLE',
    fileName: 'aula_02_va_na_contramao.json',
    principles: ['TEST_THE_OBVIOUS_ANGLE', 'PREFER_EVIDENCE_BACKED_COUNTERINTUITION', 'REVEAL_HIDDEN_CAUSAL_DEPTH']
  },
  {
    lessonId: 'ATTENTION_ARCHITECTURE',
    fileName: 'aula_03_psicologia_da_atencao.json',
    principles: ['OPEN_WITH_CONCRETE_CONTRAST', 'CREATE_A_VIEWER_QUESTION', 'TRACK_OPEN_LOOPS', 'DELIVER_EXPLICIT_PAYOFFS']
  },
  {
    lessonId: 'TOPIC_SELECTION',
    fileName: 'aula_04_sobre_o_que_falar.json',
    principles: ['CONNECT_TECHNICAL_SYSTEM_TO_VISIBLE_LIFE', 'DEFINE_AUDIENCE_RELEVANCE', 'EXPAND_TOPIC_THROUGH_CONSEQUENCE']
  },
  {
    lessonId: 'IDEA_INCUBATION',
    fileName: 'aula_05_criatividade_vs_produtividade.json',
    principles: ['CAPTURE_IDEAS_BEFORE_DRAFTING', 'ORGANIZE_IDEAS_BY_FUNCTION', 'ALLOW_EDITORIAL_INCUBATION']
  }
] as const;

function sha256(value: string | Buffer): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function normalizeReferenceWords(text: string): string[] {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function phraseFingerprints(text: string, shingleWords = HSL_REFERENCE_SHINGLE_WORDS): string[] {
  const words = normalizeReferenceWords(text);
  const fingerprints = new Set<string>();
  for (let index = 0; index + shingleWords <= words.length; index += 1) {
    fingerprints.add(sha256(words.slice(index, index + shingleWords).join(' ')));
  }
  return [...fingerprints].sort();
}

function accepted(segment: TranscriptSegment): boolean {
  return Number(segment.no_speech_prob ?? 0) < 0.5 &&
    Number(segment.compression_ratio ?? 0) <= 2.4 &&
    Number(segment.avg_logprob ?? 0) >= -1;
}

export function buildReferenceInsightSnapshot(sourceRoot: string): HslReferenceInsightSnapshot {
  const fingerprints = new Set<string>();
  let latestModifiedAt = 0;
  const lessons = LESSONS.map((lesson): HslReferenceLesson => {
    const sourcePath = path.resolve(sourceRoot, lesson.fileName);
    if (!fs.existsSync(sourcePath)) throw new Error(`HSL_REFERENCE_TRANSCRIPT_REQUIRED:${sourcePath}`);
    const source = fs.readFileSync(sourcePath);
    const parsed = JSON.parse(source.toString('utf8')) as TranscriptFile;
    const segments = parsed.segments || [];
    const acceptedSegments = segments.filter(accepted);
    const rejectionCounts = {
      no_speech: segments.filter((segment) => Number(segment.no_speech_prob ?? 0) >= 0.5).length,
      compression: segments.filter((segment) => Number(segment.compression_ratio ?? 0) > 2.4).length,
      low_confidence: segments.filter((segment) => Number(segment.avg_logprob ?? 0) < -1).length
    };
    phraseFingerprints(acceptedSegments.map((segment) => segment.text || '').join(' ')).forEach((item) => fingerprints.add(item));
    latestModifiedAt = Math.max(latestModifiedAt, fs.statSync(sourcePath).mtimeMs);
    return {
      lesson_id: lesson.lessonId,
      source_file: lesson.fileName,
      source_sha256: sha256(source),
      language: parsed.language || 'unknown',
      segment_count: segments.length,
      accepted_segment_count: acceptedSegments.length,
      rejected_segment_count: segments.length - acceptedSegments.length,
      rejection_counts: rejectionCounts,
      principles: lesson.principles
    };
  });
  return {
    schema: 'hsl.editorial.reference-insights.v1',
    schema_version: '1.0.0',
    reference_only: true,
    generated_at: new Date(latestModifiedAt || Date.now()).toISOString(),
    source_directory_label: 'DOCS ABRAHAM/transcriptions',
    asr_quality_policy: {
      max_no_speech_probability_exclusive: 0.5,
      max_compression_ratio_inclusive: 2.4,
      min_average_log_probability_inclusive: -1
    },
    fingerprint_policy: {
      algorithm: 'sha256-normalized-word-shingle',
      shingle_words: HSL_REFERENCE_SHINGLE_WORDS,
      stores_source_prose: false
    },
    lessons,
    phrase_fingerprints: [...fingerprints].sort()
  };
}

export function syncReferenceInsightSnapshot(sourceRoot: string, outputPath: string): HslReferenceInsightSnapshot {
  const snapshot = buildReferenceInsightSnapshot(sourceRoot);
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  const temporary = `${outputPath}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, outputPath);
  return snapshot;
}

export class ReferenceInsightIngestAgent {
  constructor(private readonly snapshotPath = path.resolve(process.cwd(), 'assets/editorial-references/abraham/reference-insights.json')) {}

  run(): HslReferenceInsightSnapshot {
    if (!fs.existsSync(this.snapshotPath)) throw new Error(`HSL_REFERENCE_INSIGHTS_REQUIRED:${this.snapshotPath}`);
    const snapshot = JSON.parse(fs.readFileSync(this.snapshotPath, 'utf8')) as HslReferenceInsightSnapshot;
    if (snapshot.schema !== 'hsl.editorial.reference-insights.v1' || snapshot.reference_only !== true) throw new Error('HSL_REFERENCE_INSIGHTS_INVALID');
    if (snapshot.fingerprint_policy.stores_source_prose !== false || snapshot.fingerprint_policy.shingle_words !== HSL_REFERENCE_SHINGLE_WORDS) throw new Error('HSL_REFERENCE_FINGERPRINT_POLICY_INVALID');
    if (snapshot.lessons.length !== LESSONS.length || !snapshot.phrase_fingerprints.length) throw new Error('HSL_REFERENCE_INSIGHTS_INCOMPLETE');
    return snapshot;
  }
}
