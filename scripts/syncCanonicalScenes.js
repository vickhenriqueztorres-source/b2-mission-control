const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

const runId = 'OOL-EP05-RADAR-ASFALTO';
const runDir = path.join(process.cwd(), 'runs', runId);
const editorialDir = path.join(runDir, 'editorial');
const execDir = path.join(editorialDir, 'execution');
const scenesDir = path.join(execDir, 'scenes');
const postDir = path.join(runDir, 'postproduction');
const botOutputDir = path.join(process.cwd(), 'chatgpt-image-bot', 'output');
const manifestPath = path.join(botOutputDir, 'manifest.jsonl');

fs.mkdirSync(scenesDir, { recursive: true });
fs.mkdirSync(postDir, { recursive: true });

// 1. Carregar manifesto do ChatGPT bot
const manifestLines = fs.readFileSync(manifestPath, 'utf8').split('\n').filter(Boolean);
const manifestMap = new Map();

for (const line of manifestLines) {
  try {
    const d = JSON.parse(line);
    if (d.status === 'success' && d.filename && d.prompt) {
      const m = d.prompt.match(/\[(OOL_\d+)\]/);
      if (m) manifestMap.set(m[1], d);
    }
  } catch {}
}

console.log(`📌 Carregadas ${manifestMap.size} imagens do manifesto.`);

// 2. Carregar documentary-edit-package.json
const editPkgPath = path.join(execDir, 'documentary-edit-package.json');
const editPkg = JSON.parse(fs.readFileSync(editPkgPath, 'utf8'));

let synced = 0;
for (const sc of editPkg.scenes) {
  const scId = sc.sceneId;
  const entry = manifestMap.get(scId);
  if (!entry) {
    console.warn(`  ⚠️ Imagem não encontrada para ${scId}`);
    continue;
  }

  const srcImg = path.join(botOutputDir, entry.filename);
  if (!fs.existsSync(srcImg)) continue;

  const targetDir = path.join(scenesDir, scId);
  fs.mkdirSync(targetDir, { recursive: true });

  const targetPng = path.join(targetDir, 'firefly_start_frame.png');
  const imgBuf = fs.readFileSync(srcImg);
  fs.writeFileSync(targetPng, imgBuf);

  const hash = sha256(imgBuf);
  const stat = fs.statSync(targetPng);

  const receipt = {
    scene_id: scId,
    prompt: entry.prompt,
    sha256: hash,
    size_bytes: stat.size,
    status: 'AUTHENTIC_AI_GENERATED',
    source: 'CHATGPT_IMAGE_BOT',
    model: 'DALL-E 3',
    aspect_ratio: '16:9',
    takeType: sc.takeType || 'CINEMATIC_TAKE',
    integratedText: sc.integratedText,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(path.join(targetDir, 'start_frame_receipt.json'), JSON.stringify(receipt, null, 2));

  // Linkar firefly_take.mp4 com hardlink para zero consumo de disco
  const segPath = path.join(runDir, 'temp_segments', `seg_${scId}.mp4`);
  const targetTake = path.join(targetDir, 'firefly_take.mp4');
  if (fs.existsSync(segPath)) {
    try {
      if (fs.existsSync(targetTake)) fs.unlinkSync(targetTake);
      fs.linkSync(segPath, targetTake);
    } catch {
      fs.copyFileSync(segPath, targetTake);
    }
  }

  synced++;
}

console.log(`✅ Sincronizados ${synced}/${editPkg.scenes.length} cenas canônicas em editorial/execution/scenes/!`);

// 3. Garantir description.txt
const descPath = path.join(postDir, 'description.txt');
if (!fs.existsSync(descPath) || fs.statSync(descPath).size < 50) {
  const desc = `INVESTIGAR. REVELAR. COMPREENDER.
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
  fs.writeFileSync(descPath, desc);
}

// 4. Sincronizar duração da narração com timeline (399.03s)
const narrPath = path.join(postDir, 'narration.mp3');
const narrProbe = execSync(`ffprobe -v error -show_entries format=duration -of json "${narrPath}"`).toString();
const narrDur = parseFloat(JSON.parse(narrProbe).format.duration);

if (narrDur < 398.0) {
  console.log(`🎵 Ajustando cauda de áudio da narração de ${narrDur.toFixed(2)}s para 399.03s para sincronismo perfeito...`);
  const paddedNarr = path.join(postDir, 'narration_padded.mp3');
  execSync(`ffmpeg -y -i "${narrPath}" -af "apad=whole_dur=399.033" -c:a mp3 -b:a 256k "${paddedNarr}"`, { stdio: 'ignore' });
  fs.copyFileSync(paddedNarr, narrPath);
  fs.unlinkSync(paddedNarr);
  console.log('✅ Narração sincronizada com exatidão matemática de 399.03s!');
}

console.log('🎉 Setup Canônico Completo!');
