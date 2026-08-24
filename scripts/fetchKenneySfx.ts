import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {spawnSync} from 'child_process';
import {
  KENNEY_CC0_LICENSE_URL, KENNEY_SFX_PACKS, KENNEY_SFX_SELECTIONS, kenneySoundFxRoot
} from '../config/kenneySoundFxCatalog';

function sha256(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function allAssetsValid(root: string): boolean {
  return KENNEY_SFX_SELECTIONS.every((selection) => {
    const filePath = path.join(root, selection.packId, ...selection.pathInPack.split('/'));
    return fs.existsSync(filePath) && sha256(filePath) === selection.sourceSha256;
  });
}

async function download(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HSL_KENNEY_DOWNLOAD_FAILED:${response.status}:${url}`);
  fs.writeFileSync(outputPath, Buffer.from(await response.arrayBuffer()));
}

async function main(): Promise<void> {
  const destinationRoot = kenneySoundFxRoot();
  const force = process.argv.includes('--force');
  if (!force && allAssetsValid(destinationRoot)) {
    console.log(`HSL Kenney SFX cache already verified: ${destinationRoot}`);
    return;
  }
  fs.mkdirSync(destinationRoot, {recursive: true});
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'hsl-kenney-sfx-'));
  const manifestPacks: unknown[] = [];
  try {
    for (const pack of KENNEY_SFX_PACKS) {
      const zipPath = path.join(temporaryRoot, `${pack.id}.zip`);
      const extractRoot = path.join(temporaryRoot, pack.id);
      fs.mkdirSync(extractRoot, {recursive: true});
      await download(pack.downloadUrl, zipPath);
      const zipHash = sha256(zipPath);
      if (zipHash !== pack.zipSha256) throw new Error(`HSL_KENNEY_PACK_HASH_MISMATCH:${pack.id}:${zipHash}`);
      const extract = spawnSync('tar', ['-xf', zipPath, '-C', extractRoot], {encoding: 'utf8'});
      if (extract.status !== 0) throw new Error(`HSL_KENNEY_PACK_EXTRACT_FAILED:${pack.id}:${extract.stderr || ''}`);
      const selected = KENNEY_SFX_SELECTIONS.filter((item) => item.packId === pack.id);
      for (const item of selected) {
        const source = path.join(extractRoot, ...item.pathInPack.split('/'));
        if (!fs.existsSync(source) || sha256(source) !== item.sourceSha256) throw new Error(`HSL_KENNEY_SOURCE_INVALID:${item.pathInPack}`);
        const destination = path.join(destinationRoot, pack.id, ...item.pathInPack.split('/'));
        fs.mkdirSync(path.dirname(destination), {recursive: true});
        fs.copyFileSync(source, destination);
      }
      manifestPacks.push({
        id: pack.id, page_url: pack.pageUrl, download_url: pack.downloadUrl,
        zip_sha256: pack.zipSha256, license: 'CC0-1.0', license_url: KENNEY_CC0_LICENSE_URL
      });
    }
    const manifest = {
      schema: 'hsl.soundfx.kenney-source.v1', provider: 'Kenney', license: 'CC0-1.0',
      license_url: KENNEY_CC0_LICENSE_URL, packs: manifestPacks,
      assets: KENNEY_SFX_SELECTIONS.map((item) => ({
        cue_type: item.cueType, pack_id: item.packId, path_in_pack: item.pathInPack,
        local_path: path.posix.join(item.packId, item.pathInPack),
        source_sha256: item.sourceSha256
      }))
    };
    fs.writeFileSync(path.join(destinationRoot, 'source-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`HSL Kenney SFX synchronized and verified: ${destinationRoot}`);
  } finally {
    fs.rmSync(temporaryRoot, {recursive: true, force: true});
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
