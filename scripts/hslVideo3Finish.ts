export async function main(): Promise<void> {
  throw new Error('LEGACY_FINISH_DISABLED: Finalização legada desativada. Utilize o pipeline unificado episodeProductionRunner.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
