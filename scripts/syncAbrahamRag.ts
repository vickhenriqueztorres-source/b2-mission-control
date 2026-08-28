import path from 'path';
import { syncAbrahamRagSnapshot } from '../hsl/editorial/abraham/abrahamRagRuntime';
import { syncReferenceInsightSnapshot } from '../hsl/editorial/reference/referenceInsightIngestAgent';

const defaultDocsRoot = 'C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\DOCS ABRAHAM';
const docsRoot = path.resolve(process.argv[2] || process.env.HSL_ABRAHAM_DOCS_ROOT || defaultDocsRoot);
const outputPath = path.resolve(
  process.argv[3] || 'assets/editorial-references/abraham/abraham-rag-index.json'
);

const transcriptionsDir = path.join(docsRoot, 'transcriptions');
const referenceInsightsPath = path.resolve('assets/editorial-references/abraham/reference-insights.json');

// Sincroniza o RAG completo
const ragSnapshot = syncAbrahamRagSnapshot(docsRoot, outputPath);

// Sincroniza o reference insights para o PhraseOriginalityGate
const refSnapshot = syncReferenceInsightSnapshot(transcriptionsDir, referenceInsightsPath);

process.stdout.write(
  `${JSON.stringify(
    {
      status: 'HSL_ABRAHAM_RAG_SYNCED',
      rag_index_path: outputPath,
      reference_insights_path: referenceInsightsPath,
      total_chunks: ragSnapshot.total_chunks,
      modules: ragSnapshot.modules.map((m) => ({
        id: m.module_id,
        title: m.title,
        chunks: m.chunk_count
      })),
      phrase_fingerprints_count: ragSnapshot.phrase_fingerprints.length,
      reference_accepted_segments: refSnapshot.lessons.reduce((sum, l) => sum + l.accepted_segment_count, 0)
    },
    null,
    2
  )}\n`
);
