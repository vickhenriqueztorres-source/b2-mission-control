import path from 'path';
import {syncEugeneRagSnapshot} from '../hsl/editorial/eugene/eugeneRagRuntime';

const defaultRoot = 'C:\\Users\\brend\\OneDrive\\Desktop\\B2 ENTERPRISE\\WOLF AI STUDIO\\RAG EUGENE';
const ragRoot = path.resolve(process.argv[2] || process.env.HSL_EUGENE_RAG_ROOT || defaultRoot);
const outputPath = path.resolve(process.argv[3] || 'assets/editorial-references/eugene/eugene-rag-index.json');
const snapshot = syncEugeneRagSnapshot(ragRoot, outputPath);

process.stdout.write(`${JSON.stringify({
  status: 'HSL_EUGENE_RAG_SYNCED', output_path: outputPath,
  collection: snapshot.collection.name, dimension: snapshot.collection.dimension,
  chunks: snapshot.collection.chunk_count, concepts: snapshot.concepts.length,
  phrase_fingerprints: snapshot.phrase_fingerprints.length,
  stores_source_prose: snapshot.storage_policy.stores_source_prose
}, null, 2)}\n`);
