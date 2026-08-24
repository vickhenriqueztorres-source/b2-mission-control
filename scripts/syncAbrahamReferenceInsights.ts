import path from 'path';
import {syncReferenceInsightSnapshot} from '../hsl/editorial/reference/referenceInsightIngestAgent';

const defaultSourceRoot = 'C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\DOCS ABRAHAM\\transcriptions';
const sourceRoot = path.resolve(process.argv[2] || process.env.HSL_ABRAHAM_TRANSCRIPT_ROOT || defaultSourceRoot);
const outputPath = path.resolve(process.argv[3] || 'assets/editorial-references/abraham/reference-insights.json');
const snapshot = syncReferenceInsightSnapshot(sourceRoot, outputPath);

process.stdout.write(`${JSON.stringify({
  status: 'HSL_REFERENCE_INSIGHTS_SYNCED',
  output_path: outputPath,
  lessons: snapshot.lessons.length,
  accepted_segments: snapshot.lessons.reduce((sum, lesson) => sum + lesson.accepted_segment_count, 0),
  rejected_segments: snapshot.lessons.reduce((sum, lesson) => sum + lesson.rejected_segment_count, 0),
  phrase_fingerprints: snapshot.phrase_fingerprints.length,
  stores_source_prose: snapshot.fingerprint_policy.stores_source_prose
}, null, 2)}\n`);
