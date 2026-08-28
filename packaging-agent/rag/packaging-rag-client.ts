import fs from 'fs';
import path from 'path';

export class PackagingRagClient {
  private readonly data: any;

  constructor() {
    const dataPath = path.resolve(__dirname, 'packaging-rag.json');
    if (fs.existsSync(dataPath)) {
      this.data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } else {
      this.data = {};
    }
  }

  getNeurosciencePrinciples(): readonly any[] {
    return this.data.neuroscience_principles || [];
  }

  getVariantStrategy(variantId: 'A' | 'B' | 'C') {
    const key = `variant_${variantId.toLowerCase()}`;
    return this.data.thumbnail_variants_matrix?.[key] || null;
  }

  getTitleFramework() {
    return this.data.title_generation_framework || {};
  }

  getDescriptionTemplate() {
    return this.data.layered_description_template || {};
  }

  getSeoTaxonomy() {
    return this.data.seo_tags_taxonomy || {};
  }
}
