import fs from 'fs';
import path from 'path';
import {DescriptionAndSeoPlanner} from './planner/description-seo-planner';
import {ThumbnailPlanner} from './planner/thumbnail-planner';
import {TitlePlanner} from './planner/title-planner';
import {ThumbnailRenderer} from './renderer/thumbnail-renderer';
import {PublicationPackageOutput, ThumbnailVariantId} from './types/publication.types';

export class PublicationPackagingSquad {
  private readonly thumbnailPlanner = new ThumbnailPlanner();
  private readonly titlePlanner = new TitlePlanner();
  private readonly descriptionSeoPlanner = new DescriptionAndSeoPlanner();
  private readonly renderer = new ThumbnailRenderer();

  run(input: {
    productionId: string;
    episodeId: string;
    episodeTitle: string;
    objectOrFlow: string;
    systemBeingAnalyzed: string;
    heroVisual: string;
    mainConstraint: string;
    primaryConsequence: string;
    centralQuestion: string;
    baseImages: Record<ThumbnailVariantId, string>;
    outputDirectory: string;
    recommendedVariant?: ThumbnailVariantId;
  }): PublicationPackageOutput {
    const outDir = path.resolve(input.outputDirectory);
    fs.mkdirSync(outDir, {recursive: true});

    // 1. Planejamento de Thumbnails (3 Variantes A/B/C com regras de neurociência)
    const thumbnailConcepts = this.thumbnailPlanner.plan({
      episodeTitle: input.episodeTitle,
      objectOrFlow: input.objectOrFlow,
      systemBeingAnalyzed: input.systemBeingAnalyzed,
      heroVisual: input.heroVisual,
      mainConstraint: input.mainConstraint,
      primaryConsequence: input.primaryConsequence
    });

    // 2. Planejamento de Títulos (Regra 1 + 1 = 3, sem repetição com a thumbnail)
    const titles = this.titlePlanner.plan({
      objectOrFlow: input.objectOrFlow,
      systemBeingAnalyzed: input.systemBeingAnalyzed,
      centralQuestion: input.centralQuestion,
      primaryConsequence: input.primaryConsequence,
      thumbnailConcepts
    });

    // 3. Planejamento de Descrição em Camadas, Capítulos e SEO de Entidades
    const recommendedVariant = input.recommendedVariant || 'C';
    const metadata = this.descriptionSeoPlanner.plan({
      episodeId: input.episodeId,
      episodeTitle: input.episodeTitle,
      objectOrFlow: input.objectOrFlow,
      systemBeingAnalyzed: input.systemBeingAnalyzed,
      centralQuestion: input.centralQuestion,
      primaryConsequence: input.primaryConsequence,
      titles,
      recommendedTitleVariant: recommendedVariant
    });

    // 4. Renderização das 3 Thumbnails 4K + Previews Mobile
    const renderedThumbnails: Array<{
      variant_id: ThumbnailVariantId;
      role: any;
      headline: string;
      full_4k_path: string;
      mobile_preview_320x180_path: string;
    }> = [];

    const thumbsOutDir = path.join(outDir, 'thumbnails');
    fs.mkdirSync(thumbsOutDir, {recursive: true});

    for (const concept of thumbnailConcepts) {
      const baseImg = input.baseImages[concept.variant_id];
      const renderRes = this.renderer.render({
        productionId: input.productionId,
        concept,
        baseImagePath: baseImg,
        outputDirectory: thumbsOutDir
      });

      renderedThumbnails.push({
        variant_id: concept.variant_id,
        role: concept.role,
        headline: concept.headline_text,
        full_4k_path: renderRes.thumbnail4kPath,
        mobile_preview_320x180_path: renderRes.mobilePreviewPath
      });
    }

    // 5. Contact Sheet Horizontal para Visão Geral A/B/C
    const contactSheetPath = path.join(outDir, 'thumbnail-contact-sheet-960x180.png');
    this.renderer.generateContactSheet({
      mobilePreviewPaths: renderedThumbnails.map((t) => t.mobile_preview_320x180_path),
      outputContactSheetPath: contactSheetPath
    });

    // 6. Exportação dos Arquivos JSON e Documentação
    const metadataPath = path.join(outDir, 'youtube-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

    const titleOptionsPath = path.join(outDir, 'title-options.json');
    fs.writeFileSync(titleOptionsPath, JSON.stringify({titles}, null, 2), 'utf8');

    const descriptionTxtPath = path.join(outDir, 'description.txt');
    fs.writeFileSync(descriptionTxtPath, metadata.description_full, 'utf8');

    const chaptersTxtPath = path.join(outDir, 'chapters.txt');
    fs.writeFileSync(
      chaptersTxtPath,
      metadata.chapters.map((c) => `${c.timestamp} ${c.title}`).join('\n'),
      'utf8'
    );

    const summaryMdPath = path.join(outDir, 'publication-summary.md');
    const summaryContent = [
      '# 📦 PACOTE OFICIAL DE PUBLICAÇÃO & SEO — O OUTRO LADO',
      '',
      `**Episódio:** ${input.episodeId} — ${input.episodeTitle}`,
      `**Data de Geração:** ${new Date().toISOString()}`,
      '',
      '---',
      '',
      '## 🏆 RECOMENDAÇÃO PRINCIPAL PARA PUBLICAÇÃO',
      `**Título Principal:** ${metadata.recommended_title}`,
      `**Thumbnail Recomendada:** Variante ${metadata.recommended_thumbnail_variant}`,
      '',
      '---',
      '',
      '## 🧪 MATRIZ DE TESTE A/B/C (YOUTUBE STUDIO)',
      '| Variante | Perfil Estratégico | Título Candidato | Headline da Capa |',
      '|---|---|---|---|',
      ...titles.map((t) => {
        const thumb = renderedThumbnails.find((r) => r.variant_id === t.variant_id);
        return `| **${t.variant_id}** | *${t.type}* | ${t.title} | \`${thumb?.headline}\` |`;
      }),
      '',
      '---',
      '',
      '## 🏷️ TAGS ESTRATÉGICAS DE SEO (ENTIDADES & BUSCA)',
      '```text',
      metadata.tags.all_flat_tags.join(', '),
      '```',
      '',
      '---',
      '',
      '## 📱 PONTE DE RETENÇÃO (SHORTS ➔ LONG FORM)',
      `**Gancho do Short:** "${metadata.shorts_bridge.short_hook}"`,
      `**Comentário Fixado:** "${metadata.shorts_bridge.pinned_comment}"`
    ].join('\n');

    fs.writeFileSync(summaryMdPath, summaryContent, 'utf8');

    // 7. Define a thumbnail recomendada oficial como thumbnail.png
    const officialThumb = path.resolve('runs/OOL-EP01-PIX/postproduction/thumbnail.png');
    const recommendedRender = renderedThumbnails.find((t) => t.variant_id === recommendedVariant);
    if (recommendedRender && fs.existsSync(recommendedRender.full_4k_path)) {
      fs.copyFileSync(recommendedRender.full_4k_path, officialThumb);
    }

    const output: PublicationPackageOutput = {
      production_id: input.productionId,
      episode_id: input.episodeId,
      generated_at: new Date().toISOString(),
      thumbnails: renderedThumbnails,
      contact_sheet_960x180_path: contactSheetPath,
      metadata,
      summary_md_path: summaryMdPath
    };

    const packageJsonPath = path.join(outDir, 'publication-package.json');
    fs.writeFileSync(packageJsonPath, JSON.stringify(output, null, 2), 'utf8');

    return output;
  }
}
