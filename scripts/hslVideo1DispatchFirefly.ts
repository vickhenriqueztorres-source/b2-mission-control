import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {FireflyAdapter} from '../adapters/fireflyAdapter';
import {Logger} from '../event-hub/logger';

function sha256(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

async function main(): Promise<void> {
  const productionId = 'OOL-EP01-PIX';
  const runRoot = path.resolve(path.join('runs', productionId));
  const executionRoot = path.join(runRoot, 'editorial', 'execution');
  process.env.FIREFLY_RESUME_EXISTING_BATCH = 'false';
  const mateoFireflyPath = 'C:\\Users\\brend\\OneDrive\\Desktop\\B2 ENTERPRISE\\Canais_\\Mateo - Copia\\agente firefly';
  const fireflyRoot = fs.existsSync(mateoFireflyPath) ? mateoFireflyPath : path.resolve('firefly-automation');
  const fireflyImagesDir = path.join(fireflyRoot, 'data', 'imagens');
  const fireflyRootImagesDir = path.join(fireflyRoot, 'imagens');
  fs.mkdirSync(fireflyImagesDir, {recursive: true});
  fs.mkdirSync(fireflyRootImagesDir, {recursive: true});

  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🔥 FIREFLY VIDEO DISPATCH — EPISÓDIO 01 (PIX)');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const executionPlanPath = path.join(executionRoot, 'episode.execution.json');
  const plan = JSON.parse(fs.readFileSync(executionPlanPath, 'utf8')) as {scenes: string[]};
  
  const items: Array<{
    name: string;
    image: string;
    prompt: string;
    model: string;
    resolution: string;
    aspect_ratio: string;
    duration_seconds: number;
    generate_audio: boolean;
  }> = [];

  for (const sceneRel of plan.scenes) {
    const sceneId = path.basename(sceneRel, '.execution.json');
    const sceneDir = path.join(executionRoot, sceneId);
    const startFramePath = path.join(sceneDir, 'firefly_start_frame.png');
    const motionPromptPath = path.join(sceneDir, 'firefly_motion_prompt.txt');

    if (fs.existsSync(startFramePath) && fs.existsSync(motionPromptPath)) {
      const motionPrompt = fs.readFileSync(motionPromptPath, 'utf8').trim();
      const targetImageName = `${sceneId}.png`;
      const targetImagePath = path.join(fireflyImagesDir, targetImageName);
      
      fs.copyFileSync(startFramePath, targetImagePath);
      fs.copyFileSync(startFramePath, path.join(fireflyRootImagesDir, targetImageName));

      items.push({
        name: sceneId,
        image: targetImageName,
        prompt: motionPrompt,
        model: 'Firefly Video',
        resolution: '720p',
        aspect_ratio: '16:9',
        duration_seconds: 5,
        generate_audio: false
      });

      console.log(`  📦 [${sceneId}] Start Frame e Motion Prompt preparados.`);
    }
  }

  console.log(`\n📌 Total de cenas preparadas para geração no Firefly: ${items.length}`);

  const guidePath = path.join(fireflyRoot, 'data', 'firefly-production-guide.json');
  fs.mkdirSync(path.dirname(guidePath), {recursive: true});

  const guide = {
    schema: 'hsl.firefly.multi-provider-guide.v2',
    model: 'Firefly Video',
    resolution: '720p',
    aspect_ratio: '16:9',
    duration_seconds: 5,
    generate_audio: false,
    items
  };

  fs.writeFileSync(guidePath, JSON.stringify(guide, null, 2), 'utf8');
  console.log(`  📄 Guia mestre de produção salva em: ${guidePath}`);

  // Disparo com FireflyAdapter
  console.log('\n🚀 Disparando jobs no Firefly Automation...');
  const adapter = new FireflyAdapter(fireflyRoot);
  await adapter.initialize();

  const result = await adapter.feedGuideAndRunReal(productionId, guidePath);
  console.log(`\n🎉 Execução do Firefly finalizada com status: ${result.success ? 'SUCESSO' : 'PENDENTE'}`);
  console.log(`  Vídeos gerados: ${result.completedJobs.length}/${items.length}`);

  for (const job of result.completedJobs) {
    console.log(`  🎥 [${job.name}] Vídeo: ${job.output_path}`);
    // Copia o vídeo gerado para a pasta da respectiva cena
    const targetSceneVideo = path.join(executionRoot, job.name, 'firefly_take.mp4');
    fs.copyFileSync(job.output_path, targetSceneVideo);
  }
}

main().catch((err) => {
  console.error('❌ Erro no disparo do Firefly:', err);
  process.exitCode = 1;
});
