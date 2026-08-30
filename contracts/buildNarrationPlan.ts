import fs from 'fs';
import path from 'path';
import { EpisodeContract } from './episodeContract';
import { SceneVisualContract } from './sceneVisualContract';

export interface NarrationPlanItem {
  sceneId: string;
  order: number;
  text: string;
  wordCount: number;
  targetSeconds: number;
  voiceProfile: {
    provider: 'ElevenLabs';
    voiceName: string;
    voiceId: string;
    model: string;
  };
  outPath: string;
}

export interface NarrationPlanReport {
  timestamp: string;
  episodeId: string;
  runId: string;
  totalScenes: number;
  totalWords: number;
  totalTargetSeconds: number;
  minDurationSeconds: number;
  passedMinDuration: boolean;
  voiceProfile: {
    provider: 'ElevenLabs';
    voiceName: string;
    voiceId: string;
    model: string;
  };
  items: NarrationPlanItem[];
}

/**
 * Constrói e valida o plano de narração do episódio a partir dos contratos de cena.
 */
export function buildNarrationPlan(
  contract: EpisodeContract,
  sceneContracts: SceneVisualContract[],
  runId: string = 'latest'
): NarrationPlanReport {
  const timestamp = new Date().toISOString();
  const voiceProfile = {
    provider: 'ElevenLabs' as const,
    voiceName: 'Chris',
    voiceId: 'iP95p4xoKVk53GoZ742B',
    model: 'eleven_multilingual_v2'
  };

  const items: NarrationPlanItem[] = [];
  let totalWords = 0;
  let totalTargetSeconds = 0;

  for (let i = 0; i < sceneContracts.length; i++) {
    const sc = sceneContracts[i];
    const text = sc.voiceover ? sc.voiceover.trim() : '';

    // Contagem de palavras simples por espaços
    const words = text.length > 0 ? text.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;

    // Regra 1: Se alguma voiceover tiver < 8 palavras -> VOICEOVER_TOO_SHORT
    if (wordCount < 8) {
      throw new Error(`VOICEOVER_TOO_SHORT:${sc.sceneId} (Texto contém apenas ${wordCount} palavras, mínimo exigido é 8).`);
    }

    const targetSeconds = sc.targetSeconds || 12.0;
    totalWords += wordCount;
    totalTargetSeconds += targetSeconds;

    const outPath = `runs/${contract.episodeId}/${runId}/audio/narration/${sc.sceneId}.mp3`;

    items.push({
      sceneId: sc.sceneId,
      order: i + 1,
      text,
      wordCount,
      targetSeconds,
      voiceProfile,
      outPath
    });
  }

  // Regra 2: Soma targetSeconds >= 324s (90% de 360s)
  const minRequiredDuration = contract.targetDurationSeconds * 0.9;
  if (totalTargetSeconds < minRequiredDuration) {
    throw new Error(
      `NARRATION_PLAN_SHORT: A soma da duração das cenas (${totalTargetSeconds}s) é menor que a tolerância mínima de 90% do contrato (${minRequiredDuration}s).`
    );
  }

  const report: NarrationPlanReport = {
    timestamp,
    episodeId: contract.episodeId,
    runId,
    totalScenes: sceneContracts.length,
    totalWords,
    totalTargetSeconds,
    minDurationSeconds: minRequiredDuration,
    passedMinDuration: totalTargetSeconds >= minRequiredDuration,
    voiceProfile,
    items
  };

  // Escreve artefatos em runs/gasolina-adulterada/narration/<runId>/ e latest/
  const episodeNarrationBase = path.join(process.cwd(), 'runs', contract.episodeId, 'narration');
  const runNarrationDir = path.join(episodeNarrationBase, runId);
  const latestNarrationDir = path.join(episodeNarrationBase, 'latest');

  fs.mkdirSync(runNarrationDir, { recursive: true });
  fs.mkdirSync(latestNarrationDir, { recursive: true });

  // 1. JSON
  fs.writeFileSync(path.join(runNarrationDir, 'narration-plan.json'), JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(path.join(latestNarrationDir, 'narration-plan.json'), JSON.stringify(report, null, 2), 'utf8');

  // 2. Markdown
  const mdLines: string[] = [
    `# 🎙️ PLANO DE NARRAÇÃO // ${contract.title.toUpperCase()}`,
    '',
    `> **Episódio:** \`${contract.episodeId}\`  `,
    `> **Voz Oficial:** \`${voiceProfile.voiceName}\` (\`${voiceProfile.voiceId}\`) — Modelo: \`${voiceProfile.model}\`  `,
    `> **Total de Cenas:** \`${report.totalScenes}\` | **Total de Palavras:** \`${report.totalWords}\` | **Duração Alvo:** \`${report.totalTargetSeconds.toFixed(1)}s\` (Mínimo: \`${minRequiredDuration.toFixed(1)}s\`)`,
    '',
    '| # | Cena | Duração | Palavras | Texto da Locução (Voiceover Oficial) |',
    '|---|---|---|---|---|'
  ];

  for (const item of items) {
    mdLines.push(
      `| ${item.order} | **\`${item.sceneId}\`** | ${item.targetSeconds.toFixed(1)}s | ${item.wordCount} | "${item.text}" |`
    );
  }

  mdLines.push('');
  mdLines.push('---');
  mdLines.push('Plano de locução pronto para síntese determinística sem arquivos dummy.');

  const mdContent = mdLines.join('\n');
  fs.writeFileSync(path.join(runNarrationDir, 'narration-plan.md'), mdContent, 'utf8');
  fs.writeFileSync(path.join(latestNarrationDir, 'narration-plan.md'), mdContent, 'utf8');

  return report;
}
