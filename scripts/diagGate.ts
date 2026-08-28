import { PipelineContractGate } from '../pipeline/pipelineContractGate';

const episodeId = 'OOL-EP04-GPS-TEMPO';
const gateReport = PipelineContractGate.auditRun({ runId: episodeId, stageScope: 'FULL_PACKAGE' });

console.log('Passed:', gateReport.passed);
console.log('Valid Start Frames:', gateReport.validStartFrames);
console.log('Valid Video Takes:', gateReport.validVideoTakes);
console.log('Failures count:', gateReport.failures.length);
for (const f of gateReport.failures) {
  console.log(`  - [${f.sceneId}] ${f.assetType}: ${f.reason}`);
}
