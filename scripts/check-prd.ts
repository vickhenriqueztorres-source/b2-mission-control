import { PrdComplianceChecker } from '../pipeline/prdComplianceChecker';

function parseArgs(): { runId: string } {
  const args = process.argv.slice(2);
  let runId = 'OOL-EP02-CABOS';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--runId' && args[i + 1]) {
      runId = args[i + 1];
      i++;
    }
  }

  return { runId };
}

function main(): void {
  const { runId } = parseArgs();
  PrdComplianceChecker.assertCompliance(runId);
}

main();
