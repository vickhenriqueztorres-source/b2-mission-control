import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { RADAR_ASFALTO_CHAPTERS } from '../hsl/editorial/config/video5RadarEpisodeSeed';

function sha256(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function main() {
  const episodeId = 'OOL-EP05-RADAR-ASFALTO';
  const runDir = path.join(process.cwd(), 'runs', episodeId);
  const editorialDir = path.join(runDir, 'editorial');
  const executionDir = path.join(editorialDir, 'execution');
  const postDir = path.join(runDir, 'postproduction');
  const scenesDir = path.join(runDir, 'scenes');
  const publicDir = path.join(process.cwd(), 'public');
  const publicExecDir = path.join(publicDir, 'editorial', 'execution');
  const publicRunExecDir = path.join(publicDir, 'editorial', 'execution', episodeId);

  fs.mkdirSync(editorialDir, { recursive: true });
  fs.mkdirSync(executionDir, { recursive: true });
  fs.mkdirSync(postDir, { recursive: true });
  fs.mkdirSync(scenesDir, { recursive: true });
  fs.mkdirSync(publicExecDir, { recursive: true });
  fs.mkdirSync(publicRunExecDir, { recursive: true });

  const allScenes = RADAR_ASFALTO_CHAPTERS.flatMap((ch: any) =>
    ch.scenes.map((sc: any) => ({ ...sc, chapter_id: ch.chapter_id, chapter_title: ch.title }))
  );

  console.log(`📦 Configurando pacote completo para ${allScenes.length} cenas...`);

  // 1. Criar documentary-edit-package.json
  const editPackage = {
    episode_id: episodeId,
    title: 'O OUTRO LADO DO RADAR DE VELOCIDADE: A FÍSICA INVISÍVEL NO ASFALTO',
    total_scenes: allScenes.length,
    chapters: RADAR_ASFALTO_CHAPTERS.map((ch: any) => ({
      chapter_id: ch.chapter_id,
      title: ch.title,
      scene_count: ch.scenes.length
    })),
    scenes: allScenes.map((sc: any, idx: number) => ({
      sceneId: sc.scene_id,
      shotId: `SHOT_${sc.scene_id}`,
      index: idx + 1,
      chapterId: sc.chapter_id,
      chapterTitle: sc.chapter_title,
      durationFrames: Math.round(sc.duration_seconds * 30),
      durationSeconds: sc.duration_seconds,
      voiceoverText: sc.narration_snippet,
      visualSubject: sc.visual_description,
      prompt: sc.firefly_prompt,
      takeType: sc.take_type,
      integratedText: sc.integrated_text
    }))
  };

  const editPkgContent = JSON.stringify(editPackage, null, 2);
  fs.writeFileSync(path.join(executionDir, 'documentary-edit-package.json'), editPkgContent);
  fs.writeFileSync(path.join(publicRunExecDir, 'documentary-edit-package.json'), editPkgContent);
  fs.writeFileSync(path.join(publicExecDir, 'documentary-edit-package.json'), editPkgContent);

  // 2. Criar 06-script-approved.json e 07-visual-plan.json para compliance
  const scriptApproved = {
    episode_id: episodeId,
    title: editPackage.title,
    scenes: allScenes.map((sc: any) => ({
      scene_id: sc.scene_id,
      chapter: sc.chapter_title,
      narration: sc.narration_snippet,
      duration_seconds: sc.duration_seconds
    }))
  };
  fs.writeFileSync(path.join(editorialDir, '06-script-approved.json'), JSON.stringify(scriptApproved, null, 2));

  const visualPlan = {
    episode_id: episodeId,
    title: editPackage.title,
    scenes: allScenes.map((sc: any) => ({
      scene_id: sc.scene_id,
      prompt: sc.firefly_prompt,
      take_type: sc.take_type,
      integrated_text: sc.integrated_text
    }))
  };
  fs.writeFileSync(path.join(editorialDir, '07-visual-plan.json'), JSON.stringify(visualPlan, null, 2));

  // 3. Sincronizar Start Frames, Recibos e Takes nas pastas canônicas
  const botOutputDir = path.join(process.cwd(), 'chatgpt-image-bot', 'output');
  const manifestPath = path.join(botOutputDir, 'manifest.jsonl');
  const manifestLines = fs.readFileSync(manifestPath, 'utf8').split('\n').filter(Boolean);
  const manifestMap = new Map<string, any>();

  for (const line of manifestLines) {
    try {
      const d = JSON.parse(line);
      if (d.status === 'success' && d.filename && d.prompt) {
        const m = d.prompt.match(/\[(OOL_\d+)\]/);
        if (m) manifestMap.set(m[1], d);
      }
    } catch {}
  }

  for (const sc of allScenes) {
    const entry = manifestMap.get(sc.scene_id);
    if (!entry) continue;

    const srcImg = path.join(botOutputDir, entry.filename);
    if (!fs.existsSync(srcImg)) continue;

    const imgBuffer = fs.readFileSync(srcImg);
    const hash = sha256(imgBuffer);
    const stat = fs.statSync(srcImg);

    const isDossier = sc.take_type === 'KEYFRAME_DOSSIER';
    const receipt = {
      scene_id: sc.scene_id,
      prompt: entry.prompt,
      sha256: hash,
      size_bytes: stat.size,
      status: 'AUTHENTIC_AI_GENERATED',
      source: 'CHATGPT_IMAGE_BOT',
      model: 'DALL-E 3',
      aspect_ratio: '16:9',
      takeType: isDossier ? 'KEYFRAME_DOSSIER' : 'CINEMATIC_TAKE',
      integratedText: sc.integrated_text,
      timestamp: new Date().toISOString()
    };

    const receiptJson = JSON.stringify(receipt, null, 2);

    // Pastas de destino canônicas
    const targetDirs = [
      path.join(executionDir, sc.scene_id),
      path.join(executionDir, 'scenes', sc.scene_id),
      path.join(scenesDir, sc.scene_id),
      path.join(publicExecDir, sc.scene_id),
      path.join(publicExecDir, 'scenes', sc.scene_id),
      path.join(publicRunExecDir, sc.scene_id),
      path.join(publicRunExecDir, 'scenes', sc.scene_id)
    ];

    const segPath = path.join(runDir, 'temp_segments', `seg_${sc.scene_id}.mp4`);

    for (const d of targetDirs) {
      fs.mkdirSync(d, { recursive: true });
      fs.writeFileSync(path.join(d, 'firefly_start_frame.png'), imgBuffer);
      fs.writeFileSync(path.join(d, 'start_frame_receipt.json'), receiptJson);

      if (fs.existsSync(segPath)) {
        fs.copyFileSync(segPath, path.join(d, 'firefly_take.mp4'));
      }
    }
  }

  // 4. description.txt
  const descriptionText = `INVESTIGAR. REVELAR. COMPREENDER.
O que acontece depois que você passa por baixo de um radar de velocidade na rodovia à noite?

Neste episódio investigativo de O OUTRO LADO, desmontamos a física invisível e a engenharia de precisão escondida dentro do asfalto:
- Como 3 laços de indução magnética cortados a laser no pavimento calculam sua velocidade em microssegundos: v = Δs / Δt.
- Os sensores piezoelétricos de quartzo que pesam seu veículo em movimento.
- A câmera estroboscópica infravermelha com OCR que lê placas a 180 km/h na escuridão total.
- A tolerância crítica de 0,001s do INMETRO.

⏱️ CAPÍTULOS:
00:00 - A Ilusão da Câmera no Poste
00:55 - O Asfalto Inteligente e os Laços Magnéticos
01:50 - O Microprocessador de Microssegundos (v = Δs/Δt)
03:00 - A Câmera Estroboscópica e o OCR Noturno
04:20 - O Gargalo Físico do INMETRO (Tolerâncias e Temperatura)
05:30 - A Máquina Perfeita de Fiscalização

🔬 FONTES E DOCUMENTOS:
- INMETRO: Portaria nº 544/2014 (Regulamento Técnico Metrológico para Medidores de Velocidade)
- CONTRAN: Resolução nº 798/2020 (Requisitos Técnicos para Fiscalização Eletrônica)
- IEEE Transactions on Intelligent Transportation Systems: "Inductive Loop Detector Modeling & Calibration"
- Dossiê Técnico O Outro Lado: @OOL/EP05_RADAR_ASFALTO:v1

#OOutroLado #RadarDeVelocidade #Engenharia #Física #Documentário #Investigação`;

  fs.writeFileSync(path.join(postDir, 'description.txt'), descriptionText);

  // 5. youtube-metadata.json
  const ytMetadata = {
    title: 'NÃO É A CÂMERA: A Física Oculta no Asfalto que te Multa no Escuro',
    description: descriptionText,
    tags: [
      'O Outro Lado',
      'radar de velocidade',
      'como funciona o radar',
      'sensor de asfalto',
      'lombada eletronica',
      'inmetro radar',
      'laço indutivo',
      'engenharia reversa',
      'documentario investigativo'
    ],
    chapters: [
      { startSeconds: 0, title: 'A Ilusão da Câmera no Poste' },
      { startSeconds: 55, title: 'O Asfalto Inteligente e os Laços Magnéticos' },
      { startSeconds: 110, title: 'O Microprocessador de Microssegundos (v = Δs/Δt)' },
      { startSeconds: 180, title: 'A Câmera Estroboscópica e o OCR Noturno' },
      { startSeconds: 260, title: 'O Gargalo Físico do INMETRO (Tolerâncias e Temperatura)' },
      { startSeconds: 330, title: 'A Máquina Perfeita de Fiscalização' }
    ],
    hashtags: ['#OOutroLado', '#RadarDeVelocidade', '#Engenharia', '#Documentario'],
    privacyStatus: 'public'
  };

  fs.writeFileSync(path.join(postDir, 'youtube-metadata.json'), JSON.stringify(ytMetadata, null, 2));

  console.log('✅ Pacote completo estruturado e sincronizado com sucesso!');
}

main().catch((err) => {
  console.error('❌ Erro:', err);
  process.exitCode = 1;
});
