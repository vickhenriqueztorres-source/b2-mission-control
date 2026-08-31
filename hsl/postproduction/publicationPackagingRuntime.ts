import crypto from 'crypto';
import {spawnSync} from 'child_process';
import fs from 'fs';
import path from 'path';

export type HslThumbnailVariantId = 'A' | 'B' | 'C';
export type HslThumbnailConceptRole = 'MECHANISM' | 'CONSEQUENCE' | 'FINAL_HANDOFF';

interface EpisodeBrief {
  readonly episode_id: string;
  readonly title: string;
  readonly language: string;
  readonly central_question: string;
  readonly object_or_flow: string;
  readonly system_being_analyzed: string;
  readonly main_constraint: string;
  readonly primary_consequence: string;
  readonly hero_visual: string;
  readonly original_interpretation: string;
  readonly counterargument_or_limitation: string;
}

interface AudienceStrategy {
  readonly promise: string;
  readonly mechanism: string;
  readonly human_conflict: string;
  readonly next_video_question: string;
  readonly title_strategy: {
    readonly selected_approved_title: string;
    readonly candidates: readonly {readonly title: string; readonly role: string}[];
  };
  readonly thumbnail_strategy: {readonly subject: string; readonly tension: string; readonly text: string};
  readonly hook_contract: {readonly first_scene_id: string; readonly early_evidence_scene_id: string};
}

interface ExecutionPlan {
  readonly episode_id: string;
  readonly scenes: readonly string[];
  readonly status: string;
}

interface ExecutionScene {
  readonly scene_id: string;
  readonly chapter_id: string;
  readonly narrative_function: string;
  readonly planned_duration_seconds: number;
  readonly voiceover: string;
}

export interface HslTitleOption {
  readonly variant_id: HslThumbnailVariantId;
  readonly role: HslThumbnailConceptRole;
  readonly title: string;
  readonly search_intent: 'BROWSE' | 'BROWSE_AND_SEARCH' | 'SUGGESTED';
}

export interface HslThumbnailConcept {
  readonly schema: 'hsl.youtube.thumbnail-concept.v1';
  readonly variant_id: HslThumbnailVariantId;
  readonly role: HslThumbnailConceptRole;
  readonly title: string;
  readonly headline: string;
  readonly headline_lines: readonly string[];
  readonly focal_subject: string;
  readonly visual_conflict: string;
  readonly composition: 'TEXT_LEFT_SUBJECT_RIGHT' | 'SUBJECT_LEFT_TEXT_RIGHT' | 'FULL_SCREEN_MAP';
  readonly text_side: 'LEFT' | 'RIGHT';
  readonly image_prompt: string;
  readonly negative_prompt: string;
  readonly promise_evidence: readonly string[];
  readonly base_image_path: string;
}

export interface HslPublicationPackagingResult {
  readonly success: true;
  readonly recommendedTitle: string;
  readonly recommendedThumbnailVariant: HslThumbnailVariantId;
  readonly recommendationPath: string;
  readonly packagePath: string;
  readonly qaPath: string;
  readonly approvalManifestPath: string;
  readonly thumbnailPaths: readonly string[];
  readonly mobilePreviewPaths: readonly string[];
  readonly contactSheetPath: string;
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(filePath: string, value: string): void {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

function sha256(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function normalizeWords(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function artifactPath(reference: string | {readonly artifact_path: string}, field: string): string {
  const value = typeof reference === 'string' ? reference : reference?.artifact_path;
  if (!value) throw new Error(`HSL_PUBLICATION_ARTIFACT_REQUIRED:${field}`);
  return value;
}

function titleForRole(strategy: AudienceStrategy, role: string): string {
  return strategy.title_strategy.candidates.find((candidate) => candidate.role === role)?.title ||
    strategy.title_strategy.selected_approved_title;
}

function splitHeadline(value: string): string[] {
  const words = value.trim().toUpperCase().split(/\s+/).filter(Boolean).slice(0, 5);
  if (words.length <= 2) return words;
  if (words.length === 3) return [words.slice(0, 1).join(' '), words.slice(1).join(' ')];
  const splitAt = Math.ceil(words.length / 2);
  return [words.slice(0, splitAt).join(' '), words.slice(splitAt).join(' ')];
}

function timestamp(seconds: number): string {
  const rounded = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function titleCase(value: string): string {
  return value.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function chapterTitle(scene: ExecutionScene): string {
  const byFunction: Readonly<Record<string, string>> = {
    introduce_system: 'The Hidden System',
    establish_origin: 'Where the Journey Begins',
    establish_facility: 'The Facility Nobody Sees',
    make_process_visible: 'Inside the Process',
    introduce_final_route: 'The Final Route',
    reveal_constraint: 'The Real Bottleneck',
    begin_propagation: 'How Delay Spreads',
    reverse_map: 'Run the System Forward',
    conclusion: 'The Hidden Product'
  };
  if (byFunction[scene.narrative_function]) return byFunction[scene.narrative_function];
  if (!/^CH\d+$/i.test(scene.chapter_id)) return titleCase(scene.chapter_id.replace(/[_-]+/g, ' ').trim());
  return titleCase(scene.narrative_function.replace(/[_-]+/g, ' ').trim());
}

function sentence(value: string): string {
  const trimmed = value.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function imageDimensions(filePath: string): {width: number; height: number} {
  const result = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', filePath
  ], {encoding: 'utf8'});
  if (result.status !== 0) throw new Error(`HSL_THUMBNAIL_FFPROBE_FAILED:${filePath}:${result.stderr || result.stdout || ''}`);
  const parsed = JSON.parse(result.stdout) as {streams?: Array<{width?: number; height?: number}>};
  return {width: Number(parsed.streams?.[0]?.width || 0), height: Number(parsed.streams?.[0]?.height || 0)};
}

export class TitlePackagingAgent {
  run(strategy: Readonly<AudienceStrategy>): readonly HslTitleOption[] {
    return [
      {variant_id: 'A', role: 'MECHANISM', title: strategy.title_strategy.selected_approved_title, search_intent: 'BROWSE'},
      {variant_id: 'B', role: 'CONSEQUENCE', title: titleForRole(strategy, 'CONSEQUENCE_VARIANT'), search_intent: 'SUGGESTED'},
      {variant_id: 'C', role: 'FINAL_HANDOFF', title: titleForRole(strategy, 'MECHANISM_VARIANT'), search_intent: 'BROWSE_AND_SEARCH'}
    ];
  }
}

export class ThumbnailArtDirectorAgent {
  run(input: Readonly<{
    brief: EpisodeBrief;
    strategy: AudienceStrategy;
    titles: readonly HslTitleOption[];
    baseImages: Readonly<Record<HslThumbnailVariantId, string>>;
    headlineOverrides?: Partial<Record<HslThumbnailVariantId, string>>;
  }>): readonly HslThumbnailConcept[] {
    const headlines: Record<HslThumbnailVariantId, string> = {
      A: input.headlineOverrides?.A || input.strategy.thumbnail_strategy.text,
      B: input.headlineOverrides?.B || 'ONE WEAK LINK',
      C: input.headlineOverrides?.C || 'HIDDEN IN PLAIN SIGHT'
    };
    const definitions: Array<{
      id: HslThumbnailVariantId; role: HslThumbnailConceptRole; composition: HslThumbnailConcept['composition'];
      textSide: HslThumbnailConcept['text_side']; focal: string; conflict: string;
    }> = [
      {id: 'A', role: 'MECHANISM', composition: 'FULL_SCREEN_MAP', textSide: 'LEFT', focal: input.brief.hero_visual, conflict: input.strategy.human_conflict},
      {id: 'B', role: 'CONSEQUENCE', composition: 'TEXT_LEFT_SUBJECT_RIGHT', textSide: 'LEFT', focal: input.brief.main_constraint, conflict: input.brief.primary_consequence},
      {id: 'C', role: 'FINAL_HANDOFF', composition: 'SUBJECT_LEFT_TEXT_RIGHT', textSide: 'RIGHT', focal: input.brief.object_or_flow, conflict: input.strategy.thumbnail_strategy.tension}
    ];
    return definitions.map((definition) => {
      const title = input.titles.find((item) => item.variant_id === definition.id)!.title;
      const headline = headlines[definition.id].trim().toUpperCase();
      return {
        schema: 'hsl.youtube.thumbnail-concept.v1' as const,
        variant_id: definition.id,
        role: definition.role,
        title,
        headline,
        headline_lines: splitHeadline(headline),
        focal_subject: definition.focal,
        visual_conflict: definition.conflict,
        composition: definition.composition,
        text_side: definition.textSide,
        image_prompt: [
          'Present-day on-location investigative documentary thumbnail base, 16:9, photorealistic, one dominant physical subject.',
          `Subject: ${definition.focal}.`,
          `Visual tension: ${definition.conflict}.`,
          'Natural Rec.709 color, moderate contrast, readable shadows and practical available lighting; orange only from a real warm source or one evidence accent, cyan only for verified telemetry.',
          `Composition: ${definition.composition}. Preserve clean negative space on the ${definition.textSide.toLowerCase()} for exact typography added later.`,
          'Clear contrast at mobile size, credible present-day physical detail, one readable visual idea, no embedded words, no futuristic interface.'
        ].join(' '),
        negative_prompt: 'No embedded text, logos, watermarks, illegible labels, fake documents, invented equipment, holograms, floating HUD, decorative lasers, dominant neon, staged fog, crowded collage, clickbait faces, or events absent from the documentary.',
        promise_evidence: [input.strategy.promise, input.strategy.hook_contract.first_scene_id, input.strategy.hook_contract.early_evidence_scene_id],
        base_image_path: path.resolve(input.baseImages[definition.id])
      };
    });
  }
}

export class YouTubeMetadataAgent {
  run(input: Readonly<{brief: EpisodeBrief; strategy: AudienceStrategy; scenes: readonly ExecutionScene[]}>) {
    const chapters: Array<{time_seconds: number; timestamp: string; title: string; scene_id: string}> = [];
    let cursor = 0;
    let previousChapter = '';
    for (const scene of input.scenes) {
      if (scene.chapter_id && scene.chapter_id !== previousChapter) {
        chapters.push({time_seconds: cursor, timestamp: timestamp(cursor), title: chapterTitle(scene), scene_id: scene.scene_id});
        previousChapter = scene.chapter_id;
      }
      cursor += scene.planned_duration_seconds;
    }
    const chapterText = chapters.map((chapter) => `${chapter.timestamp} ${chapter.title}`).join('\n');
    const description = [
      sentence(`This documentary follows ${input.brief.object_or_flow.toLowerCase()}`),
      sentence(input.brief.original_interpretation),
      sentence(`We trace ${input.brief.system_being_analyzed.toLowerCase()} to show how ${input.brief.main_constraint.toLowerCase()}`),
      '',
      `Central question: ${input.brief.central_question}`,
      sentence(`What is at stake: ${input.brief.primary_consequence}`),
      '',
      'CHAPTERS',
      chapterText,
      '',
      sentence(`Scope note: ${input.brief.counterargument_or_limitation}`),
      '',
      `Next investigation: ${input.strategy.next_video_question}`,
      '',
      '#Documentary #Infrastructure #HiddenSystems'
    ].join('\n');
    return {
      schema: 'hsl.youtube.metadata.v1' as const,
      language: input.brief.language,
      primary_keyword: input.brief.object_or_flow,
      secondary_keywords: [input.brief.system_being_analyzed, input.brief.main_constraint, input.brief.central_question],
      tags: ['documentary', 'hidden systems', 'infrastructure', input.brief.object_or_flow, input.brief.episode_id],
      hashtags: ['#Documentary', '#Infrastructure', '#HiddenSystems'],
      description,
      chapters,
      next_video_bridge: input.strategy.next_video_question,
      end_screen_intent: 'NEXT_RELATED_DOCUMENTARY'
    };
  }
}

export class ThumbnailBaseFrameAgent {
  extract(finalVideoPath: string, outputDirectory: string): Readonly<Record<HslThumbnailVariantId, string>> {
    if (!fs.existsSync(finalVideoPath)) throw new Error(`HSL_FINAL_VIDEO_REQUIRED:${finalVideoPath}`);
    fs.mkdirSync(outputDirectory, {recursive: true});
    const positions: Record<HslThumbnailVariantId, string> = {A: '5%', B: '45%', C: '82%'};
    const durationProbe = spawnSync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', finalVideoPath
    ], {encoding: 'utf8'});
    const duration = Number(durationProbe.stdout.trim());
    if (durationProbe.status !== 0 || !Number.isFinite(duration) || duration <= 0) throw new Error('HSL_FINAL_VIDEO_DURATION_REQUIRED');
    const output = {} as Record<HslThumbnailVariantId, string>;
    for (const id of ['A', 'B', 'C'] as const) {
      const percentage = Number(positions[id].replace('%', '')) / 100;
      const outputPath = path.join(outputDirectory, `fallback-base-${id}.png`);
      const result = spawnSync('ffmpeg', [
        '-y', '-hide_banner', '-loglevel', 'error', '-ss', String(duration * percentage), '-i', finalVideoPath,
        '-frames:v', '1', '-vf', 'scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160', outputPath
      ], {encoding: 'utf8', maxBuffer: 1024 * 1024 * 20});
      if (result.status !== 0) throw new Error(`HSL_THUMBNAIL_BASE_EXTRACTION_FAILED:${id}:${result.stderr || result.stdout || ''}`);
      output[id] = outputPath;
    }
    return output;
  }
}

export class ThumbnailRenderAgent {
  render(input: Readonly<{productionId: string; concept: HslThumbnailConcept; outputDirectory: string}>): {thumbnailPath: string; mobilePreviewPath: string; propsPath: string} {
    if (!fs.existsSync(input.concept.base_image_path)) throw new Error(`HSL_THUMBNAIL_BASE_REQUIRED:${input.concept.variant_id}`);
    const remotionCli = path.resolve(process.cwd(), 'node_modules/@remotion/cli/remotion-cli.js');
    if (!fs.existsSync(remotionCli)) throw new Error(`HSL_REMOTION_CLI_REQUIRED:${remotionCli}`);
    const publicRoot = path.resolve(process.cwd(), 'public/hsl-publication', input.productionId);
    fs.mkdirSync(publicRoot, {recursive: true});
    const baseName = `thumbnail-${input.concept.variant_id}-base${path.extname(input.concept.base_image_path) || '.png'}`;
    fs.copyFileSync(input.concept.base_image_path, path.join(publicRoot, baseName));
    const props = {
      baseImageSrc: `hsl-publication/${input.productionId}/${baseName}`,
      headlineLines: input.concept.headline_lines,
      textSide: input.concept.text_side,
      role: input.concept.role
    };
    fs.mkdirSync(input.outputDirectory, {recursive: true});
    const propsPath = path.join(input.outputDirectory, `thumbnail-${input.concept.variant_id}-props.json`);
    writeJson(propsPath, props);
    const thumbnailPath = path.join(input.outputDirectory, `thumbnail-${input.concept.variant_id}.png`);
    const render = spawnSync(process.execPath, [
      remotionCli, 'still', 'remotion/index.ts', 'HslThumbnail', thumbnailPath, `--props=${propsPath}`
    ], {cwd: process.cwd(), encoding: 'utf8', maxBuffer: 1024 * 1024 * 20});
    if (render.status !== 0) throw new Error(`HSL_THUMBNAIL_RENDER_FAILED:${input.concept.variant_id}:${render.stdout || ''}\n${render.stderr || ''}`);
    const mobilePreviewPath = path.join(input.outputDirectory, `thumbnail-${input.concept.variant_id}-mobile-320x180.png`);
    const preview = spawnSync('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error', '-i', thumbnailPath, '-vf', 'scale=320:180', '-frames:v', '1', mobilePreviewPath
    ], {encoding: 'utf8'});
    if (preview.status !== 0) throw new Error(`HSL_THUMBNAIL_MOBILE_PREVIEW_FAILED:${input.concept.variant_id}:${preview.stderr || preview.stdout || ''}`);
    return {thumbnailPath, mobilePreviewPath, propsPath};
  }
}

export class PublicationPackagingQaAgent {
  validate(input: Readonly<{
    concepts: readonly HslThumbnailConcept[];
    titles: readonly HslTitleOption[];
    renders: readonly {thumbnailPath: string; mobilePreviewPath: string}[];
    description: string;
    chapters: readonly {time_seconds: number}[];
  }>) {
    const errors = [
      ...new PromiseAlignmentGate().validate(input.concepts, input.titles),
      ...new ThumbnailTechnicalQaGate().validate(input.renders, input.concepts)
    ];
    if (input.concepts.length !== 3 || new Set(input.concepts.map((item) => item.role)).size !== 3) errors.push('THREE_DISTINCT_CONCEPTS_REQUIRED');
    if (new Set(input.concepts.map((item) => normalizeWords(item.headline))).size !== 3) errors.push('DISTINCT_HEADLINES_REQUIRED');
    if (new Set(input.titles.map((item) => normalizeWords(item.title))).size !== 3) errors.push('DISTINCT_TITLES_REQUIRED');
    for (const concept of input.concepts) {
      const words = concept.headline.trim().split(/\s+/).filter(Boolean);
      if (words.length < 1 || words.length > 5) errors.push(`HEADLINE_WORD_COUNT:${concept.variant_id}`);
      if (normalizeWords(concept.title) === normalizeWords(concept.headline)) errors.push(`TITLE_REPEATS_HEADLINE:${concept.variant_id}`);
      if (!concept.promise_evidence.length) errors.push(`PROMISE_EVIDENCE_REQUIRED:${concept.variant_id}`);
    }
    input.titles.forEach((item) => {
      if (!item.title.trim() || item.title.length > 100) errors.push(`TITLE_LENGTH:${item.variant_id}`);
    });
    if (!input.description.trim() || input.description.length > 5000) errors.push('DESCRIPTION_LENGTH');
    if (input.chapters.length < 3 || input.chapters[0]?.time_seconds !== 0) errors.push('CHAPTERS_INVALID');
    if (errors.length) throw new Error(`HSL_PUBLICATION_PACKAGING_QA_FAILED:${errors.join(',')}`);
    return {
      schema: 'hsl.youtube.publication-packaging-qa.v1',
      status: 'PUBLICATION_PACKAGING_QA_PASS' as const,
      checks: {
        distinct_concepts: true, promise_alignment: true, title_headline_complementarity: true,
        desktop_4k_16_9: true, mobile_preview_320_180: true, chapters_valid: true,
        publication_requires_human_selection: true
      }
    };
  }
}

export class PromiseAlignmentGate {
  validate(concepts: readonly HslThumbnailConcept[], titles: readonly HslTitleOption[]): string[] {
    const errors: string[] = [];
    for (const concept of concepts) {
      const title = titles.find((item) => item.variant_id === concept.variant_id);
      if (!title || title.title !== concept.title) errors.push(`TITLE_CONCEPT_MISMATCH:${concept.variant_id}`);
      if (concept.promise_evidence.length < 3) errors.push(`PROMISE_LINEAGE_INCOMPLETE:${concept.variant_id}`);
      if (!concept.visual_conflict.trim() || !concept.focal_subject.trim()) errors.push(`VISUAL_PROMISE_INCOMPLETE:${concept.variant_id}`);
    }
    return errors;
  }
}

export class ThumbnailTechnicalQaGate {
  validate(
    renders: readonly {thumbnailPath: string; mobilePreviewPath: string}[],
    concepts: readonly HslThumbnailConcept[]
  ): string[] {
    const errors: string[] = [];
    const files = renders.map((render, index) => ({...render, variantId: concepts[index]?.variant_id || '?'}));
    for (const file of files) {
      const main = imageDimensions(file.thumbnailPath);
      const mobile = imageDimensions(file.mobilePreviewPath);
      if (main.width !== 3840 || main.height !== 2160) errors.push(`THUMBNAIL_DIMENSIONS:${file.variantId}`);
      if (mobile.width !== 320 || mobile.height !== 180) errors.push(`MOBILE_PREVIEW_DIMENSIONS:${file.variantId}`);
      if (fs.statSync(file.thumbnailPath).size > 50 * 1024 * 1024) errors.push(`THUMBNAIL_DESKTOP_SIZE:${file.variantId}`);
    }
    return errors;
  }
}

export class HumanSelectionGate {
  createManifest(productionId: string) {
    return {
      schema: 'hsl.youtube.publication-approval.v1',
      production_id: productionId,
      status: 'HUMAN_SELECTION_REQUIRED' as const,
      selected_variant_id: null,
      reviewer: null,
      reviewed_at: null,
      publication_authorized: false
    };
  }

  validate(manifest: Readonly<{status: string; selected_variant_id: string | null; reviewer: string | null; reviewed_at: string | null; publication_authorized: boolean}>): 'APPROVED' {
    if (manifest.status !== 'APPROVED' || !manifest.selected_variant_id || !manifest.reviewer || !manifest.reviewed_at || !manifest.publication_authorized) {
      throw new Error('HSL_PUBLICATION_HUMAN_SELECTION_REQUIRED');
    }
    return 'APPROVED';
  }
}

export class HslPublicationPackagingRuntime {
  run(input: Readonly<{
    productionId: string;
    episodePackagePath: string;
    executionPlanPath: string;
    finalVideoPath: string;
    finalRenderManifestPath: string;
    outputDirectory: string;
    baseImages?: Partial<Record<HslThumbnailVariantId, string>>;
    headlineOverrides?: Partial<Record<HslThumbnailVariantId, string>>;
    titleOverrides?: Partial<Record<HslThumbnailVariantId, string>>;
    recommendedThumbnailVariant?: HslThumbnailVariantId;
    recommendedTitle?: string;
  }>): HslPublicationPackagingResult {
    const packagePath = path.resolve(input.episodePackagePath);
    const episodePackage = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as {
      episode_id: string;
      episode_brief: string | {artifact_path: string};
      audience_strategy: string | {artifact_path: string};
    };
    const editorialRoot = path.dirname(packagePath);
    const brief = JSON.parse(fs.readFileSync(path.resolve(editorialRoot, artifactPath(episodePackage.episode_brief, 'episode_brief')), 'utf8')) as EpisodeBrief;
    const strategy = JSON.parse(fs.readFileSync(path.resolve(editorialRoot, artifactPath(episodePackage.audience_strategy, 'audience_strategy')), 'utf8')) as AudienceStrategy;
    const executionPath = path.resolve(input.executionPlanPath);
    const execution = JSON.parse(fs.readFileSync(executionPath, 'utf8')) as ExecutionPlan;
    if (execution.status !== 'EXECUTION_PLAN_APPROVED') throw new Error('HSL_EXECUTION_PLAN_APPROVAL_REQUIRED');
    const finalRenderManifestPath = path.resolve(input.finalRenderManifestPath);
    const finalRenderManifest = JSON.parse(fs.readFileSync(finalRenderManifestPath, 'utf8')) as {status?: string};
    if (finalRenderManifest.status !== 'FINAL_RENDER_QA_PASS') throw new Error('HSL_FINAL_RENDER_QA_REQUIRED');
    if (brief.episode_id !== execution.episode_id || episodePackage.episode_id !== brief.episode_id) throw new Error('HSL_PUBLICATION_EPISODE_ID_MISMATCH');
    const executionRoot = path.dirname(executionPath);
    const scenes = execution.scenes.map((relative) => JSON.parse(fs.readFileSync(path.resolve(executionRoot, relative), 'utf8')) as ExecutionScene);
    const outputRoot = path.resolve(input.outputDirectory);
    const fallback = Object.keys(input.baseImages || {}).length === 3 ? undefined : new ThumbnailBaseFrameAgent().extract(input.finalVideoPath, path.join(outputRoot, 'base-frames'));
    const baseImages = Object.fromEntries((['A', 'B', 'C'] as const).map((id) => [
      id, path.resolve(input.baseImages?.[id] || fallback![id])
    ])) as Record<HslThumbnailVariantId, string>;
    const titles = new TitlePackagingAgent().run(strategy).map((item) => ({
      ...item,
      title: input.titleOverrides?.[item.variant_id] || item.title
    }));
    const concepts = new ThumbnailArtDirectorAgent().run({brief, strategy, titles, baseImages, headlineOverrides: input.headlineOverrides});
    const recommendedThumbnailVariant = input.recommendedThumbnailVariant || 'C';
    const recommendedConcept = concepts.find((concept) => concept.variant_id === recommendedThumbnailVariant)!;
    const recommendedTitle = input.recommendedTitle || strategy.title_strategy.selected_approved_title;
    const metadata = new YouTubeMetadataAgent().run({brief, strategy, scenes});
    concepts.forEach((concept) => writeJson(path.join(outputRoot, 'concepts', `thumbnail-${concept.variant_id}-concept.json`), concept));
    const renderer = new ThumbnailRenderAgent();
    const renders = concepts.map((concept) => renderer.render({productionId: input.productionId, concept, outputDirectory: path.join(outputRoot, 'thumbnails')}));
    const contactSheetPath = path.join(outputRoot, 'thumbnail-contact-sheet-960x180.png');
    const contactSheet = spawnSync('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-i', renders[0].mobilePreviewPath, '-i', renders[1].mobilePreviewPath, '-i', renders[2].mobilePreviewPath,
      '-filter_complex', 'hstack=inputs=3', '-frames:v', '1', contactSheetPath
    ], {encoding: 'utf8'});
    if (contactSheet.status !== 0) throw new Error(`HSL_THUMBNAIL_CONTACT_SHEET_FAILED:${contactSheet.stderr || contactSheet.stdout || ''}`);
    const qa = new PublicationPackagingQaAgent().validate({concepts, titles, renders, description: metadata.description, chapters: metadata.chapters});
    const qaPath = path.join(outputRoot, 'publication-packaging-qa.json');
    writeJson(qaPath, qa);
    writeJson(path.join(outputRoot, 'title-options.json'), {schema: 'hsl.youtube.title-options.v1', titles});
    writeJson(path.join(outputRoot, 'youtube-metadata.json'), metadata);
    writeText(path.join(outputRoot, 'description.txt'), metadata.description);
    writeText(path.join(outputRoot, 'chapters.txt'), metadata.chapters.map((chapter) => `${chapter.timestamp} ${chapter.title}`).join('\n'));
    const recommendationPath = path.join(outputRoot, 'publication-recommendation.json');
    const recommendation = {
      schema: 'hsl.youtube.publication-recommendation.v1', schema_version: '1.0.0',
      title: recommendedTitle,
      thumbnail_variant_id: recommendedThumbnailVariant,
      thumbnail_headline: recommendedConcept.headline,
      status: 'RECOMMENDED_FOR_HUMAN_SELECTION',
      publication_authorized: false
    };
    writeJson(recommendationPath, recommendation);
    writeText(path.join(outputRoot, 'publication-summary.md'), [
      '# HSL YouTube Publication Recommendation',
      '',
      `**Recommended title:** ${recommendedTitle}`,
      `**Recommended thumbnail:** ${recommendedThumbnailVariant} - ${recommendedConcept.headline}`,
      '',
      'Human approval is required before publication.'
    ].join('\n'));
    const approvalManifestPath = path.join(outputRoot, 'publication-approval-manifest.json');
    writeJson(approvalManifestPath, new HumanSelectionGate().createManifest(input.productionId));
    const finalPackagePath = path.join(outputRoot, 'publication-package.json');
    writeJson(finalPackagePath, {
      schema: 'hsl.youtube.publication-package.v1', schema_version: '1.0.0',
      production_id: input.productionId, episode_id: brief.episode_id,
      status: 'READY_FOR_HUMAN_SELECTION', generated_at: new Date().toISOString(),
      recommended_selection: recommendation,
      source: {
        episode_package_path: packagePath, execution_plan_path: executionPath,
        final_video_path: path.resolve(input.finalVideoPath), final_render_manifest_path: finalRenderManifestPath
      },
      titles,
      thumbnails: concepts.map((concept, index) => ({
        variant_id: concept.variant_id, role: concept.role, headline: concept.headline,
        title: concept.title, concept_path: path.join(outputRoot, 'concepts', `thumbnail-${concept.variant_id}-concept.json`),
        image_path: renders[index].thumbnailPath, image_sha256: sha256(renders[index].thumbnailPath),
        mobile_preview_path: renders[index].mobilePreviewPath, mobile_preview_sha256: sha256(renders[index].mobilePreviewPath),
        base_image_path: concept.base_image_path, base_image_sha256: sha256(concept.base_image_path)
      })),
      metadata_path: path.join(outputRoot, 'youtube-metadata.json'),
      qa_path: qaPath,
      approval_manifest_path: approvalManifestPath,
      contact_sheet_path: contactSheetPath,
      ab_test: {mode: 'TITLE_AND_THUMBNAIL', variants: 3, winner_metric: 'WATCH_TIME_SHARE', platform: 'YOUTUBE_STUDIO'},
      publication_authorized: false
    });
    return {
      success: true, recommendedTitle, recommendedThumbnailVariant, recommendationPath,
      packagePath: finalPackagePath, qaPath, approvalManifestPath,
      thumbnailPaths: renders.map((render) => render.thumbnailPath),
      mobilePreviewPaths: renders.map((render) => render.mobilePreviewPath),
      contactSheetPath
    };
  }
}
