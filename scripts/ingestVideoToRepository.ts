import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { VideoRepositoryMatcher } from '../hsl/media/videoRepositoryMatcher';
import { VideoCatalogEntry } from '../hsl/media/types';

function parseArgs(): {
  filePath?: string;
  category: string;
  id?: string;
  tags: string[];
  description: string;
  motion?: any;
} {
  const args = process.argv.slice(2);
  let filePath: string | undefined;
  let category = 'infrastructure';
  let id: string | undefined;
  let tags: string[] = [];
  let description = '';
  let motion = 'slow_push_in';

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--file' || args[i] === '-f') && args[i + 1]) {
      filePath = args[i + 1];
      i++;
    } else if ((args[i] === '--category' || args[i] === '-c') && args[i + 1]) {
      category = args[i + 1];
      i++;
    } else if (args[i] === '--id' && args[i + 1]) {
      id = args[i + 1];
      i++;
    } else if ((args[i] === '--tags' || args[i] === '-t') && args[i + 1]) {
      tags = args[i + 1].split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      i++;
    } else if ((args[i] === '--desc' || args[i] === '-d') && args[i + 1]) {
      description = args[i + 1];
      i++;
    } else if (args[i] === '--motion' && args[i + 1]) {
      motion = args[i + 1];
      i++;
    }
  }

  return { filePath, category, id, tags, description, motion };
}

function probeVideo(filePath: string): { duration: number; fps: number; resolution: string; valid: boolean } {
  try {
    const probe = spawnSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration:stream=width,height,r_frame_rate,codec_name',
      '-of', 'json',
      filePath
    ], { encoding: 'utf8' });

    if (probe.status !== 0) {
      return { duration: 10.0, fps: 30, resolution: '1920x1080', valid: false };
    }

    const parsed = JSON.parse(probe.stdout);
    const duration = parseFloat(parsed.format?.duration || '10.0');
    const firstStream = parsed.streams?.find((s: any) => s.width && s.height) || parsed.streams?.[0];
    const width = firstStream?.width || 1920;
    const height = firstStream?.height || 1080;
    let fps = 30;
    if (firstStream?.r_frame_rate) {
      const parts = firstStream.r_frame_rate.split('/');
      if (parts.length === 2 && parseInt(parts[1], 10) > 0) {
        fps = Math.round(parseInt(parts[0], 10) / parseInt(parts[1], 10));
      }
    }

    return {
      duration,
      fps,
      resolution: `${width}x${height}`,
      valid: duration > 0
    };
  } catch {
    return { duration: 10.0, fps: 30, resolution: '1920x1080', valid: false };
  }
}

async function main(): Promise<void> {
  const { filePath, category, id, tags, description, motion } = parseArgs();

  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`\n[ERRO] Arquivo de vídeo não especificado ou não encontrado: ${filePath}`);
    console.log(`\nUso:\n  ts-node scripts/ingestVideoToRepository.ts --file <caminho.mp4> --category <categoria> --tags "tag1,tag2" --desc "Descricao do video"\n`);
    process.exit(1);
  }

  const probe = probeVideo(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  const repoDir = path.join(process.cwd(), 'assets', 'video_repository', category);
  if (!fs.existsSync(repoDir)) {
    fs.mkdirSync(repoDir, { recursive: true });
  }

  const baseName = path.basename(filePath);
  const destRelativeFilename = `${category}/${baseName}`;
  const destAbsolutePath = path.join(process.cwd(), 'assets', 'video_repository', destRelativeFilename);

  if (path.resolve(filePath) !== path.resolve(destAbsolutePath)) {
    fs.copyFileSync(filePath, destAbsolutePath);
  }

  const videoId = id || `${category.toUpperCase()}_${baseName.replace(/\.[^/.]+$/, '').toUpperCase()}`;

  const entry: VideoCatalogEntry = {
    id: videoId,
    category,
    filename: destRelativeFilename.replace(/\\/g, '/'),
    tags: tags.length > 0 ? tags : [category, '35mm', 'chiaroscuro'],
    description: description || `Take cinematográfico de ${category} em 35mm chiaroscuro.`,
    durationSeconds: probe.duration,
    fps: probe.fps,
    resolution: probe.resolution,
    colorTone: 'Chiaroscuro / Denis Villeneuve (#060709, #FF5500, #00F0FF)',
    recommendedMotion: motion,
    sha256,
    provenance: 'curated_broll',
    createdAt: new Date().toISOString()
  };

  VideoRepositoryMatcher.registerVideo(entry);

  console.log(`\n[SUCESSO] Vídeo ingerido e catalogado no Repositório Central!`);
  console.log(`- ID: ${entry.id}`);
  console.log(`- Categoria: ${entry.category}`);
  console.log(`- Arquivo: ${entry.filename}`);
  console.log(`- Duração: ${entry.durationSeconds.toFixed(1)}s | Resolução: ${entry.resolution} | FPS: ${entry.fps}`);
  console.log(`- SHA-256: ${entry.sha256?.slice(0, 16)}...`);
  console.log(`- Tags: ${entry.tags.join(', ')}\n`);
}

main().catch((err) => {
  console.error('[FATAL_ERROR]', err.message);
  process.exit(1);
});
