import fs from 'fs';
import path from 'path';
import { z } from 'zod';

export const REQUIRED_EPISODE_STAGES = [
  'narration',
  'visuals',
  'sfx',
  'music',
  'mix',
  'thumbnail',
  'render'
] as const;

export const EpisodeStageSchema = z.enum(REQUIRED_EPISODE_STAGES);
export type EpisodeStage = z.infer<typeof EpisodeStageSchema>;

export const RawEpisodeContractInputSchema = z.object({
  episodeId: z
    .string()
    .min(1, "O campo 'episodeId' não pode ser vazio.")
    .regex(/^[a-zA-Z0-9_-]+$/, "O campo 'episodeId' deve ser um slug válido (apenas letras, números, '_' ou '-')."),
  
  title: z
    .string()
    .min(1, "O campo 'title' não pode ser vazio."),

  theme: z
    .string()
    .min(1, "O campo 'theme' não pode ser vazio."),

  domainTags: z
    .array(z.string().min(1, "Tag de domínio não pode ser vazia."))
    .min(3, "O campo 'domainTags' deve conter no mínimo 3 tags de domínio."),

  targetDurationSeconds: z
    .number()
    .positive("O campo 'targetDurationSeconds' deve ser um número positivo maior que zero."),

  minDurationRatio: z
    .number()
    .min(0, "O campo 'minDurationRatio' deve ser >= 0.")
    .max(1, "O campo 'minDurationRatio' deve ser <= 1.")
    .default(0.9),

  minScenes: z
    .number()
    .int("O campo 'minScenes' deve ser um número inteiro.")
    .positive("O campo 'minScenes' deve ser maior que zero."),

  requiredStages: z
    .array(EpisodeStageSchema)
    .refine(
      (stages) => {
        const stageSet = new Set(stages);
        return REQUIRED_EPISODE_STAGES.every((req) => stageSet.has(req));
      },
      {
        message: `O campo 'requiredStages' DEVE conter no mínimo todas as 7 etapas obrigatórias: [${REQUIRED_EPISODE_STAGES.join(', ')}].`
      }
    ),

  voiceProfile: z
    .string()
    .min(1, "O campo 'voiceProfile' não pode ser vazio."),

  musicMood: z
    .string()
    .min(1, "O campo 'musicMood' não pode ser vazio."),

  sfxDensity: z
    .string()
    .min(1, "O campo 'sfxDensity' não pode ser vazio."),

  outputDir: z.string().optional()
});

export type RawEpisodeContractInput = z.infer<typeof RawEpisodeContractInputSchema>;

export interface EpisodeContract {
  episodeId: string;
  title: string;
  theme: string;
  domainTags: string[];
  targetDurationSeconds: number;
  minDurationRatio: number;
  minScenes: number;
  requiredStages: EpisodeStage[];
  voiceProfile: string;
  musicMood: string;
  sfxDensity: string;
  outputDir: string;
}

export function parseEpisodeContract(jsonPathOrData: string | unknown): EpisodeContract {
  let rawData: unknown;
  let sourceLabel = 'input_object';

  if (typeof jsonPathOrData === 'string') {
    sourceLabel = jsonPathOrData;
    const resolvedPath = path.isAbsolute(jsonPathOrData)
      ? jsonPathOrData
      : path.resolve(process.cwd(), jsonPathOrData);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`EPISODE_CONTRACT_FILE_NOT_FOUND: O arquivo de contrato '${resolvedPath}' não existe no disco.`);
    }

    try {
      const fileContent = fs.readFileSync(resolvedPath, 'utf8');
      rawData = JSON.parse(fileContent);
    } catch (err: any) {
      throw new Error(`EPISODE_CONTRACT_JSON_CORRUPTED: Falha ao ler/parsear JSON de '${resolvedPath}': ${err.message}`);
    }
  } else {
    rawData = jsonPathOrData;
  }

  const parseResult = RawEpisodeContractInputSchema.safeParse(rawData);

  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues
      .map((issue) => `  - [${issue.path.join('.') || 'root'}]: ${issue.message}`)
      .join('\n');
    throw new Error(`EPISODE_CONTRACT_INVALID: O contrato de episódio em '${sourceLabel}' violou o schema Zod:\n${errorDetails}`);
  }

  const validData = parseResult.data;

  // Derivação obrigatória e estrita do outputDir a partir de runs/<episodeId>/
  const expectedOutputDir = path.join(process.cwd(), 'runs', validData.episodeId);
  const normalizedExpected = path.normalize(expectedOutputDir).toLowerCase();

  if (validData.outputDir) {
    const normalizedProvided = path.isAbsolute(validData.outputDir)
      ? path.normalize(validData.outputDir).toLowerCase()
      : path.normalize(path.resolve(process.cwd(), validData.outputDir)).toLowerCase();

    if (normalizedProvided !== normalizedExpected) {
      throw new Error(
        `EPISODE_CONTRACT_FORBIDDEN_OUTPUT_DIR: Caminho 'outputDir' customizado (${validData.outputDir}) é proibido. ` +
        `O outputDir DEVE ser derivado estritamente de 'runs/${validData.episodeId}'.`
      );
    }
  }

  return {
    episodeId: validData.episodeId,
    title: validData.title,
    theme: validData.theme,
    domainTags: validData.domainTags,
    targetDurationSeconds: validData.targetDurationSeconds,
    minDurationRatio: validData.minDurationRatio ?? 0.9,
    minScenes: validData.minScenes,
    requiredStages: validData.requiredStages,
    voiceProfile: validData.voiceProfile,
    musicMood: validData.musicMood,
    sfxDensity: validData.sfxDensity,
    outputDir: expectedOutputDir
  };
}
