import { PipelineContractGate } from '../pipeline/pipelineContractGate';

function parseArgs(): { runId: string; scope: 'PRE_RENDER' | 'PRE_MUX' | 'FULL_PACKAGE'; heal: boolean; contractPath?: string } {
  const args = process.argv.slice(2);
  let runId = 'OOL-EP02-CABOS';
  let scope: 'PRE_RENDER' | 'PRE_MUX' | 'FULL_PACKAGE' = 'PRE_RENDER';
  let heal = false;
  let contractPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--runId' && args[i + 1]) {
      runId = args[i + 1];
      i++;
    } else if (args[i] === '--contract' && args[i + 1]) {
      contractPath = args[i + 1];
      i++;
    } else if (args[i] === '--pre-render') {
      scope = 'PRE_RENDER';
    } else if (args[i] === '--pre-mux') {
      scope = 'PRE_MUX';
    } else if (args[i] === '--full') {
      scope = 'FULL_PACKAGE';
    } else if (args[i] === '--heal') {
      heal = true;
    }
  }

  return { runId, scope, heal, contractPath };
}

async function main(): Promise<void> {
  const { runId, scope, heal, contractPath } = parseArgs();

  let report = PipelineContractGate.auditRun({
    runId,
    stageScope: scope,
    contractPath
  });

  if (!report.passed && heal) {
    console.log(`\n[GATEKEEPER] Executando auto-recuperação (--heal) para a run '${runId}'...`);
    report = await PipelineContractGate.healRun({
      runId,
      stageScope: scope
    });
  } else {
    PipelineContractGate.printReport(report);
  }

  if (!report.passed) {
    console.error(`\n[FATAL_GATE_ERROR] Verificação de contrato FALHOU para a run '${runId}'. (Exit code: 1)\n`);
    process.exit(1);
  } else {
    console.log(`\n[GATE_SUCCESS] Todos os contratos e assets da run '${runId}' foram validados com 100% de integridade. (Exit code: 0)\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('[FATAL_ERROR]', err.message);
  process.exit(1);
});
