import {execSync, spawnSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {ThumbnailConcept} from '../types/publication.types';

export class ThumbnailRenderer {
  render(input: {
    productionId: string;
    concept: ThumbnailConcept;
    baseImagePath: string;
    outputDirectory: string;
  }): {thumbnail4kPath: string; mobilePreviewPath: string} {
    fs.mkdirSync(input.outputDirectory, {recursive: true});

    const thumbnail4kPath = path.join(input.outputDirectory, `thumbnail_variant_${input.concept.variant_id.toLowerCase()}_${input.concept.role.toLowerCase()}.png`);
    const mobilePreviewPath = path.join(input.outputDirectory, `thumbnail_variant_${input.concept.variant_id.toLowerCase()}_mobile_320x180.png`);

    const props = {
      baseImageSrc: input.baseImagePath,
      headlineLines: input.concept.headline_lines,
      categoryBadge: input.concept.category_badge,
      subheadline: input.concept.subheadline_text,
      textSide: input.concept.composition_side,
      accentColor: input.concept.color_palette.accent,
      telemetryColor: input.concept.color_palette.telemetry
    };

    const propsJson = JSON.stringify(props).replace(/"/g, '\\"');
    const cmd = `npx remotion still remotion/index.ts HslThumbnail "${thumbnail4kPath}" --props="${propsJson}"`;

    try {
      execSync(cmd, {stdio: 'pipe'});
    } catch (e: any) {
      throw new Error(`THUMBNAIL_RENDER_FAILED:${input.concept.variant_id}:${e.message}`);
    }

    // Geração do preview mobile (320x180) para simular tela de celular
    try {
      execSync(`ffmpeg -y -hide_banner -loglevel error -i "${thumbnail4kPath}" -vf scale=320:180 -frames:v 1 "${mobilePreviewPath}"`, {stdio: 'pipe'});
    } catch (e: any) {
      console.warn(`Mobile preview ffmpeg warning: ${e.message}`);
    }

    return {thumbnail4kPath, mobilePreviewPath};
  }

  generateContactSheet(input: {
    mobilePreviewPaths: readonly string[];
    outputContactSheetPath: string;
  }): void {
    if (input.mobilePreviewPaths.length < 3) return;

    try {
      const cmd = `ffmpeg -y -hide_banner -loglevel error -i "${input.mobilePreviewPaths[0]}" -i "${input.mobilePreviewPaths[1]}" -i "${input.mobilePreviewPaths[2]}" -filter_complex hstack=inputs=3 -frames:v 1 "${input.outputContactSheetPath}"`;
      execSync(cmd, {stdio: 'pipe'});
    } catch (e: any) {
      console.warn(`Contact sheet ffmpeg warning: ${e.message}`);
    }
  }
}
