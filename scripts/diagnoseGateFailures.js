const { PipelineContractGate } = require('../pipeline/pipelineContractGate');

const report = PipelineContractGate.auditRun({ runId: 'OOL-EP04-GPS-TEMPO', stageScope: 'FULL_PACKAGE' });
console.log('Passed:', report.passed);
console.log('Valid Start Frames:', report.validStartFrames);
console.log('Valid Video Takes:', report.validVideoTakes);
console.log('Packaging Valid:', report.packagingValid);
console.log('Failures count:', report.failures.length);
for (const f of report.failures) {
  console.log(`- [${f.assetType}] ${f.sceneId}: ${f.reason} (${f.expectedPath})`);
}
