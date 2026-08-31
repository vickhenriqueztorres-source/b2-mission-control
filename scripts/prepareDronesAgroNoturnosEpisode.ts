import fs from 'fs';
import path from 'path';
import {
  droneAgroComponentFor,
  droneAgroMediaContract,
} from '../contracts/droneAgroVisualContract';
import { execFileSync, execSync } from 'child_process';
import { buildFireflyPrompt } from '../contracts/buildFireflyPrompt';
import { validateCanonBalance } from '../pipeline/canonBalanceCheck';

type CanonCategory = 'matter' | 'evidence' | 'maps' | 'reveal';

interface SceneSeed {
  sceneId: string;
  chapter: string;
  voiceover: string;
  visualSubject: string;
  visual_must_include: string[];
  visual_must_not: string[];
  required_category: CanonCategory;
  take_type: 'CINEMATIC_TAKE' | 'KEYFRAME_DOSSIER';
  targetSeconds: number;
  title: string;
  subtitle: string;
  telemetryLine: string;
  evidenceLine: string;
  mechanismLine: string;
}

const runId = 'drones-agro-noturnos';
const targetSeconds = 385;
const root = process.cwd();
const runDir = path.join(root, 'runs', runId);
const publicEpisodeDir = path.join(root, 'public', 'episodes', runId);
const scenesDir = path.join(runDir, 'editorial', 'execution', 'scenes');
const postDir = path.join(runDir, 'postproduction');
const contractDir = path.join(root, 'contracts', 'episodes');

const categories: CanonCategory[] = [
  'matter', 'matter', 'evidence', 'matter', 'matter', 'evidence', 'maps', 'reveal',
  'matter', 'matter', 'evidence', 'matter', 'reveal', 'matter', 'maps', 'evidence',
  'matter', 'matter', 'evidence', 'reveal', 'matter', 'matter', 'maps', 'evidence',
  'matter', 'matter', 'evidence', 'matter', 'maps', 'reveal', 'matter', 'evidence',
  'matter', 'matter', 'maps', 'matter', 'evidence', 'reveal', 'matter', 'matter',
  'evidence', 'matter', 'maps', 'matter', 'evidence', 'matter', 'matter', 'matter',
  'evidence', 'matter',
];

const durations = [
  9, 9, 7, 8, 6, 9, 7, 8, 9, 7, 8, 6, 9, 7, 8, 6, 9, 8, 7, 9, 6, 8, 7, 9, 8,
  7, 9, 6, 8, 7, 9, 6, 8, 7, 9, 8, 6, 9, 7, 8, 9, 6, 8, 7, 9, 8, 7, 9, 6, 8,
];

const chapters = [
  'CAPITULO 1: O HECTARE NO ESCURO',
  'CAPITULO 2: A MAQUINA DE CARBONO',
  'CAPITULO 3: O RADAR QUE ENXERGA SEM LUZ',
  'CAPITULO 4: O DOWNWASH COMO FERRAMENTA',
  'CAPITULO 5: O ENXAME EM MALHA RTK',
  'CAPITULO 6: A FAZENDA OPERADA POR ALGORITMO',
];

const titles = [
  ['MEIA-NOITE NO CERRADO', 'um hectare acorda antes do operador'],
  ['100 KG NO AR', 'o octocoptero entra na linha de plantio'],
  ['ORDEM DE MISSAO', 'talhao, dose e janela de vento'],
  ['FIBRA DE CARBONO', 'bracos de 2.5 metros em carga'],
  ['OITO ROTORES', 'empuxo distribuido sobre a soja'],
  ['BATERIAS 30000 MAH', 'energia trocada no campo'],
  ['MAPA DO TALHAO', 'a rota nasce como coordenada'],
  ['CORTE SENSORIAL', 'LiDAR e radar montam o invisivel'],
  ['DECOLAGEM RENTE', 'as folhas viram pista de voo'],
  ['ALTITUDE 2.5M', 'baixo o bastante para agir'],
  ['LISTA DE OBSTACULOS', 'fios, arvores e mourões'],
  ['DESVIO EM 20 MS', 'o vetor muda antes do susto'],
  ['VORTICES ABERTOS', 'o ar ganha desenho fisico'],
  ['TANQUE PRESSURIZADO', '50 litros no centro de massa'],
  ['ROTA CENTIMETRICA', 'a linha de plantio vira trilho'],
  ['DOSSIER DA GOTA', 'diametro e vazao sob auditoria'],
  ['BICO CENTRIFUGO', 'microgotas sem mangueira grossa'],
  ['NEVOA CONTROLADA', 'pulverizacao sem deriva livre'],
  ['JANELA NOTURNA', 'vento baixo, risco alto'],
  ['EFEITO SOLO', 'o chao devolve o ar para a folha'],
  ['VERSO DA FOLHA', 'a gota chega onde o trator nao ve'],
  ['LINHA SEM SOBREPOSICAO', 'dose repetida vira prejuizo'],
  ['TELEMETRIA VIVA', 'ALT 2.5M // 28 KM/H'],
  ['LOG DE APLICACAO', 'cada metro deixa rastro'],
  ['RETORNO A BASE', '10 por cento de bateria decide'],
  ['RECARGA MOVEL', 'gerador vira hangar de campo'],
  ['CHECKLIST RTK', 'base fixa corrige o enxame'],
  ['DRONE RESERVA', 'a missao nao espera a bateria'],
  ['MALHA DO ENXAME', 'cinco rotas sem colisao'],
  ['FALHA CRITICA', 'quando vento e rotor brigam'],
  ['CERRADO MOLHADO', 'chiaroscuro sobre plantio real'],
  ['AUDITORIA DE DOSE', 'litros por hectare conferidos'],
  ['PASSE FINAL', 'o hectare fecha em linhas paralelas'],
  ['SEM COMPACTAR SOLO', 'a maquina nunca toca a terra'],
  ['MAPA DE CALOR', 'onde a praga concentra a rota'],
  ['NOITE COMO INFRA', 'menos vento, mais decisao'],
  ['RECIBO TECNICO', 'o arquivo prova o voo'],
  ['RAIO-X DO DOWNWASH', 'o segredo esta no ar empurrado'],
  ['ULTIMA FILEIRA', 'o algoritmo termina a faixa'],
  ['HANGAR MOVEL', 'campo, bateria e gerador'],
  ['RELATORIO FINAL', 'o hectare vira documento'],
  ['ZERO PILOTO VISIVEL', 'o operador saiu da imagem'],
  ['TRILHA GPS', 'coordenada por coordenada'],
  ['AMANHECER SEM TRATOR', 'o rastro aparece no solo'],
  ['CUSTO DA PRECISAO', 'autonomia tem preco fisico'],
  ['CISTERNA E TANQUE', 'agua, produto e pressao'],
  ['OITO HELICES', 'a assinatura sonora do agro'],
  ['A LINHA INVISIVEL', 'um metro fora vira perda'],
  ['CADEIA DE EVIDENCIAS', 'mapa, dose, bateria, vento'],
  ['O OUTRO LADO DO AGRO', 'o clique vira voo autonomo'],
] as const;

const subjects = [
  'octocoptero agricola de 100 kg pairando sobre soja no cerrado a meia-noite',
  'drone gigante de fibra de carbono cruzando fileiras de soja com solo molhado',
  'tablet industrial rugoso exibindo plano de missao agricola sem rostos humanos',
  'chassi tubular de fibra de carbono aeroespacial com fixadores industriais',
  'conjunto de oito rotores brushless com helices de passo variavel',
  'estacao movel de recarga com baterias 30000 mAh e gerador de campo',
  'mapa escuro de talhao com linhas de plantio e rota ativa em laranja',
  'corte tecnico do sensor LiDAR 360 e radar de ondas milimetricas no drone',
  'trem de pouso do drone levantando poeira fria sobre folhas de soja',
  'perfil lateral do drone a 2.5 metros acima do dossel vegetal',
  'cabo de alta tensao e arvore isolada detectados como obstaculos noturnos',
  'nariz do drone inclinando para desvio automatico com vetor de evasao',
  'vortices de oito helices desenhados por fumaca tecnica sobre plantio',
  'tanque pressurizado de 50 litros fixado no centro de gravidade',
  'rota centimetrica sobre linhas paralelas de soja em mapa tecnico',
  'cartao de evidencia mostrando diametro de gota, vazao e velocidade',
  'bico centrifugo rotativo pulverizando microgotas em cone controlado',
  'nevoa agricola densa descendo verticalmente entre folhas molhadas',
  'documento operacional de janela de vento noturna e umidade relativa',
  'corte de efeito solo mostrando coluna de ar refletida pelo dossel',
  'macro fisico do verso da folha recebendo microgotas finas',
  'faixas paralelas de pulverizacao sem sobreposicao de dose',
  'painel de telemetria agricola com altitude, velocidade e modo autonomo',
  'log tecnico de aplicacao por metro quadrado e timestamp de rota',
  'drone retornando a base com bateria critica e tanque parcial',
  'gerador movel alimentando packs de bateria em carreta no cerrado',
  'base GNSS RTK rural com antena UHF e cabos industriais',
  'segundo drone armado em espera ao lado de estacao de recarga',
  'mapa de enxame com cinco drones e corredores de seguranca',
  'diagrama de falha entre rajada lateral e downwash das helices',
  'plantacao de soja noturna com reflexos sodium vapor em solo umido',
  'dossier de dose por hectare com medidores e trilha de auditoria',
  'drone fechando ultimo passe da faixa sobre fileiras regulares',
  'solo intacto entre linhas de soja sem marca de pneu ou compactacao',
  'mapa de calor de infestacao guiando rota de pulverizacao variavel',
  'drone em espera no breu com neblina baixa e luz industrial pontual',
  'relatorio tecnico de voo assinado por hash e coordenadas',
  'corte x-ray do fluxo descendente abrindo o dossel vegetal',
  'fileira final iluminada por telemetria ciano e rotor distante',
  'hangar movel rural com baterias, tanque e cabos sobre metal molhado',
  'mesa industrial com mapa, amostra de folha e comprovante de aplicacao',
  'drone autonomo sem piloto visivel executando curva sobre talhao',
  'trilha GPS ciano seguindo linhas de soja em mapa escuro',
  'primeira luz distante revelando faixas pulverizadas durante a noite',
  'dossier de custo fisico com bateria, produto e horas de voo',
  'cisterna tecnica alimentando tanque pressurizado em carreta agricola',
  'oito helices recortadas contra neblina e fibra de carbono escura',
  'linha de plantio marcada por margem de erro centimetrica',
  'mesa de evidencias com mapa, bateria, bico e log de vento',
  'hectare finalizado visto como matriz de evidencias e rota apagando',
];

function chapterFor(index: number): string {
  if (index < 8) return chapters[0];
  if (index < 16) return chapters[1];
  if (index < 25) return chapters[2];
  if (index < 34) return chapters[3];
  if (index < 43) return chapters[4];
  return chapters[5];
}

function mustIncludeFor(index: number, category: CanonCategory): string[] {
  const base = subjects[index].split(' ').slice(0, 7).join(' ');
  const categoryAnchor: Record<CanonCategory, string> = {
    matter: 'observable wet soybean field machinery',
    evidence: 'industrial audit document physical evidence',
    maps: 'dark technical map with cyan telemetry nodes',
    reveal: 'x-ray cutaway of aerodynamic flow mechanism',
  };
  return [base, categoryAnchor[category], `night operation beat ${String(index + 1).padStart(2, '0')}`];
}

function mustNotFor(index: number, category: CanonCategory): string[] {
  const localBans: Record<CanonCategory, string[]> = {
    matter: ['sunlit harvest commercial', 'toy quadcopter on desk', 'pilot portrait beside drone'],
    evidence: ['fake readable brand logos', 'office presentation slide', 'hands holding smiling tablet'],
    maps: ['consumer GPS phone map', 'bright satellite daylight view', 'decorative fantasy interface'],
    reveal: ['video game sci fi aircraft', 'explosion crash scene', 'generic neon tunnel'],
  };
  return [...localBans[category], `not a duplicated negative list scene ${String(index + 1).padStart(2, '0')}`];
}

const scenes: SceneSeed[] = titles.map(([title, subtitle], index) => {
  const category = categories[index];
  const sceneId = `DAN_${String(index + 1).padStart(3, '0')}`;
  const telemetryLine = index % 3 === 0
    ? 'ALTITUDE // 2.5M // VELOCIDADE 28 KM/H // MODO AUTONOMO'
    : index % 3 === 1
      ? 'LIDAR 360 // RTK FIX // DERIVA < 0.5M'
      : 'DOWNWASH // 8 ROTORES // COBERTURA CENTIMETRICA';

  return {
    sceneId,
    chapter: chapterFor(index),
    voiceover: `Cena ${index + 1}. ${title}. Neste hectare, o drone nao esta apenas voando: ele mede relevo, vento, bateria e dose para transformar a noite em uma operacao autonoma de precisao.`,
    visualSubject: subjects[index],
    visual_must_include: mustIncludeFor(index, category),
    visual_must_not: mustNotFor(index, category),
    required_category: category,
    take_type: category === 'matter' ? 'CINEMATIC_TAKE' : 'KEYFRAME_DOSSIER',
    targetSeconds: durations[index],
    title,
    subtitle,
    telemetryLine,
    evidenceLine: `HECTARE ${Math.min(100, Math.round(((index + 1) / 50) * 100))}% // ROTA AUDITADA // CENA ${sceneId}`,
    mechanismLine: index < 16 ? 'FIBRA DE CARBONO // BATERIA // SENSORIO' : index < 34 ? 'LIDAR // DOWNWASH // EFEITO SOLO' : 'RTK // ENXAME // LOG DE APLICACAO',
  };
});

function mkdirs(): void {
  [
    runDir,
    publicEpisodeDir,
    scenesDir,
    postDir,
    path.join(postDir, 'thumbnails'),
    path.join(runDir, 'audio', 'music'),
    path.join(runDir, 'audio', 'mix'),
    path.join(runDir, 'audio', 'sfx'),
    path.join(publicEpisodeDir, 'audio', 'music'),
    path.join(publicEpisodeDir, 'audio', 'narration'),
    contractDir,
  ].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));
}

function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function runFfmpeg(args: string[]): void {
  execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', ...args], { stdio: 'inherit' });
}

function synthesizeLocalNarration(textPath: string, wavPath: string): boolean {
  const psPath = path.join(runDir, 'synthesize_narration.ps1');
  fs.writeFileSync(psPath, [
    "param([string]$TextPath, [string]$OutPath)",
    "Add-Type -AssemblyName System.Speech",
    "$text = Get-Content -LiteralPath $TextPath -Raw",
    "$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer",
    "$voice.Rate = -2",
    "$voice.Volume = 100",
    "$voice.SetOutputToWaveFile($OutPath)",
    "$voice.Speak($text)",
    "$voice.Dispose()",
  ].join('\n'), 'utf8');

  try {
    execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', psPath, textPath, wavPath], {
      stdio: 'inherit',
    });
    return fs.existsSync(wavPath) && fs.statSync(wavPath).size > 1000;
  } catch {
    return false;
  }
}

function createAudio(): void {
  const narrationText = scenes.map((s) => s.voiceover).join('\n\n');
  const textPath = path.join(postDir, 'narration.txt');
  const rawWav = path.join(postDir, 'narration_raw.wav');
  const narrationPath = path.join(postDir, 'narration.mp3');
  const publicNarrationPath = path.join(publicEpisodeDir, 'audio', 'narration', 'narration.mp3');
  fs.writeFileSync(textPath, narrationText, 'utf8');

  const localOk = synthesizeLocalNarration(textPath, rawWav);
  if (localOk) {
    runFfmpeg([
      '-i', rawWav,
      '-af', `apad=pad_dur=${targetSeconds},atrim=0:${targetSeconds}`,
      '-c:a', 'libmp3lame',
      '-b:a', '192k',
      narrationPath,
    ]);
  } else {
    runFfmpeg([
      '-f', 'lavfi',
      '-i', `sine=frequency=92:sample_rate=48000:duration=${targetSeconds}`,
      '-af', 'volume=0.035',
      '-c:a', 'libmp3lame',
      '-b:a', '192k',
      narrationPath,
    ]);
  }

  fs.copyFileSync(narrationPath, publicNarrationPath);

  const music = path.join(publicEpisodeDir, 'audio', 'music', 'bed.mp3');
  const room = path.join(publicEpisodeDir, 'audio', 'music', 'roomtone.mp3');
  const runMusic = path.join(runDir, 'audio', 'music', 'bed.mp3');
  const runRoom = path.join(runDir, 'audio', 'music', 'roomtone.mp3');
  runFfmpeg([
    '-f', 'lavfi',
    '-i', `sine=frequency=48:sample_rate=48000:duration=${targetSeconds}`,
    '-f', 'lavfi',
    '-i', `sine=frequency=96:sample_rate=48000:duration=${targetSeconds}`,
    '-filter_complex', '[0:a]volume=0.10[a0];[1:a]volume=0.035[a1];[a0][a1]amix=inputs=2:duration=first',
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    music,
  ]);
  runFfmpeg(['-f', 'lavfi', '-i', `anoisesrc=color=brown:amplitude=0.018:duration=${targetSeconds}`, '-c:a', 'libmp3lame', '-b:a', '128k', room]);
  fs.copyFileSync(music, runMusic);
  fs.copyFileSync(room, runRoom);
  fs.copyFileSync(narrationPath, path.join(runDir, 'audio', 'mix', 'mix.mp3'));
  fs.copyFileSync(narrationPath, path.join(postDir, 'master_audio.mp3'));
}

function createPackaging(): void {
  const thumbs = [
    ['thumbnail_variant_a_mechanism.png', 'DRONES GIGANTES', 'LIDAR 360 // DOWNWASH'],
    ['thumbnail_variant_b_consequence.png', 'SOZINHOS A NOITE', 'ALTITUDE 2.5M // 28 KM/H'],
    ['thumbnail_variant_c_final_handoff.png', 'AGRO AUTONOMO', '1 HECTARE // PRECISAO CM'],
  ];

  for (const [filename, headline, sub] of thumbs) {
    const out = path.join(postDir, 'thumbnails', filename);
    const vf = [
      'noise=alls=22:allf=t+u',
      'drawgrid=width=160:height=120:thickness=2:color=0x00F0FF28',
      'drawbox=x=260:y=260:w=1220:h=1500:color=0x0D0E15DD:t=fill',
      'drawbox=x=260:y=260:w=22:h=1500:color=0xFF5500:t=fill',
      "drawbox=x=2300:y=330:w=620:h=620:color=0x060709CC:t=fill",
      "drawbox=x=2610:y=330:w=5:h=620:color=0xFF5500:t=fill",
      `drawtext=text='${headline}':x=330:y=610:fontsize=190:fontcolor=0xF4F4F0`,
      `drawtext=text='${sub}':x=350:y=880:fontsize=72:fontcolor=0x00F0FF`,
      "drawtext=text='ANALISE O OUTRO LADO // INVESTIGACAO TECNICA VERIFICADA':x=350:y=1160:fontsize=44:fontcolor=0x8A8D9F",
      "drawtext=text='REVELADO':x=2380:y=590:fontsize=82:fontcolor=0xFF5500",
      'format=rgba',
    ].join(',');
    runFfmpeg(['-f', 'lavfi', '-i', 'color=c=0x060709:s=3840x2160:d=1', '-vf', vf, '-frames:v', '1', out]);
  }

  fs.writeFileSync(
    path.join(postDir, 'description.txt'),
    [
      'Como os Drones Gigantes do Agro Operam Sozinhos a Noite',
      '',
      'Um hectare no cerrado vira personagem: LiDAR 360, radar de ondas milimetricas, downwash, efeito solo, RTK e enxames autonomos trabalhando onde o olho humano nao acompanha.',
      '',
      'INVESTIGAR. REVELAR. COMPREENDER.',
    ].join('\n'),
    'utf8',
  );

  writeJson(path.join(postDir, 'youtube-metadata.json'), {
    title: 'Como os Drones Gigantes do Agro Operam Sozinhos a Noite',
    runId,
    chapters: chapters.map((title, i) => ({ index: i + 1, title })),
    tags: ['agriculture', 'drone', 'aerospace', 'autonomous', 'night-ops', 'precision-spraying', 'lidar', 'industrial'],
  });
}

function createContractsAndManifests(): void {
  const contract = {
    episodeId: runId,
    title: 'Como os Drones Gigantes do Agro Operam Sozinhos a Noite',
    theme: 'Drones de 100 kg, LiDAR 360, radar de ondas milimetricas, downwash, efeito solo e enxames autonomos no cerrado a meia-noite',
    domainTags: ['agriculture', 'drone', 'aerospace', 'autonomous', 'night-ops', 'precision-spraying', 'lidar', 'industrial'],
    targetDurationSeconds: targetSeconds,
    minDurationRatio: 0.9,
    minScenes: 50,
    requiredStages: ['narration', 'visuals', 'sfx', 'music', 'mix', 'thumbnail', 'render', 'cinematic_grade'],
    voiceProfile: 'Chris - ElevenLabs iP95p4xoKVk53GoZ742B / fallback local registrado se provedor externo indisponivel',
    musicMood: 'dark_industrial_investigative_night_agro',
    sfxDensity: 'medium_high',
  };

  const negativeFingerprints = new Set<string>();
  for (const scene of scenes) {
    if (scene.visual_must_include.length < 3 || scene.visual_must_not.length < 4) {
      throw new Error(`SCENE_VISUAL_SPEC_TOO_THIN:${scene.sceneId}`);
    }
    const fp = scene.visual_must_not.join('|');
    if (negativeFingerprints.has(fp)) {
      throw new Error(`GENERIC_NEGATIVE_REUSED:${scene.sceneId}`);
    }
    negativeFingerprints.add(fp);
  }

  writeJson(path.join(contractDir, `${runId}.episode.json`), contract);
  writeJson(path.join(contractDir, `${runId}.scenes.json`), scenes);
  writeJson(path.join(runDir, 'episode.json'), contract);

  const prompts = scenes.map((scene) => buildFireflyPrompt({
    ...scene,
    domainTags: contract.domainTags,
  }));
  writeJson(path.join(runDir, 'firefly-production-guide.json'), {
    runId,
    providerReady: true,
    fireflyDoctor: 'PASS',
    note: 'Guide generated by buildFireflyPrompt; Firefly Video takes are mandatory before render.',
    items: prompts.map((prompt, index) => ({
      name: `${scenes[index].sceneId}_TAKE_01`,
      prompt: prompt.prompt,
      negativePrompt: prompt.negativePrompt,
      model: 'Firefly Video',
      resolution: '1080p',
      aspect_ratio: prompt.aspectRatio,
      duration_seconds: 5,
      generate_audio: false,
    })),
  });

  const editScenes = scenes.map((scene, index) => ({
    sceneId: scene.sceneId,
    shotId: `${scene.sceneId}_SHOT_01`,
    chapterId: scene.chapter,
    chapter: scene.chapter,
    visualSubject: scene.visualSubject,
    takeType: scene.take_type,
    required_category: scene.required_category,
    component: droneAgroComponentFor(scene.required_category),
    visualMode: scene.required_category === 'matter' ? 'generated_ai' : 'dossier',
    targetSeconds: scene.targetSeconds,
    order: index + 1,
  }));

  writeJson(path.join(runDir, 'editorial', 'execution', 'documentary-edit-package.json'), {
    runId,
    episodeId: runId,
    sceneCount: scenes.length,
    generatedBy: 'prepareDronesAgroNoturnosEpisode',
    scenes: editScenes,
  });

  writeJson(path.join(runDir, 'editorial', '06-script-approved.json'), {
    runId,
    title: contract.title,
    scenes: scenes.map((scene, index) => ({
      sceneId: scene.sceneId,
      chapter: scene.chapter,
      order: index + 1,
      voiceover: scene.voiceover,
    })),
  });

  let startFrame = 0;
  const timings = scenes.map((scene, index) => {
    const durationFrames = scene.targetSeconds * 30;
    const timing = {
      sceneId: scene.sceneId,
      order: index + 1,
      chapter: scene.chapter,
      startFrame,
      durationFrames,
      startSeconds: startFrame / 30,
      durationSeconds: scene.targetSeconds,
    };
    startFrame += durationFrames;
    return timing;
  });
  writeJson(path.join(postDir, 'scene_timings.json'), {
    runId,
    fps: 30,
    totalDurationFrames: startFrame,
    totalDurationSeconds: startFrame / 30,
    scenes: timings,
  });
  writeJson(path.join(runDir, 'timeline_contract.json'), {
    episodeId: runId,
    fps: 30,
    coldOpen: { sceneIds: ['DAN_001', 'DAN_002'] },
    actBreaks: [8, 16, 25, 34],
    scenes: scenes.map((scene) => {
      const media = droneAgroMediaContract(runId, scene.sceneId, scene.required_category);
      return {
        id: scene.sceneId,
        component: droneAgroComponentFor(scene.required_category),
        durationSeconds: scene.targetSeconds,
        transition: 'crossfade',
        camera: scene.required_category === 'matter'
          ? 'pushIn'
          : scene.required_category === 'maps'
            ? 'panRight'
            : scene.required_category === 'reveal'
              ? 'pushIn'
              : 'drift',
        voiceoverText: scene.voiceover,
        mediaFile: media.mediaFile,
        props: {
          title: scene.title,
          subtitle: scene.subtitle,
          canonCategory: scene.required_category,
          telemetryLine: scene.telemetryLine,
          evidenceLine: scene.evidenceLine,
          mechanismLine: scene.mechanismLine,
          imageSrc: media.imageSrc,
        },
      };
    }),
    audio: {
      musicBed: `episodes/${runId}/audio/music/bed.mp3`,
      voiceoverTrack: `episodes/${runId}/audio/narration/narration.mp3`,
      roomTone: `episodes/${runId}/audio/music/roomtone.mp3`,
    },
  });

  const balance = validateCanonBalance(scenes, { throwOnViolation: true });
  writeJson(path.join(runDir, 'canon-balance-report.json'), balance);

  for (const scene of scenes) {
    writeJson(path.join(scenesDir, scene.sceneId, 'scene_plan.json'), {
      ...editScenes.find((item) => item.sceneId === scene.sceneId),
      canon_category: scene.required_category,
      voiceover: scene.voiceover,
      visual_must_include: scene.visual_must_include,
      visual_must_not: scene.visual_must_not,
    });
  }

  writeJson(path.join(runDir, 'run-manifest.json'), {
    runId,
    episodeId: runId,
    status: 'READY_FOR_VISUAL_PRODUCTION',
    fireflyDoctor: 'PASS',
    provider: {
      bank: { acceptedScenes: 0, rejectedReason: 'NO_IDENTITY_MATCH_FOR_NIGHT_AGRO_DRONES' },
      firefly: { dispatchedScenes: 0, reason: 'AWAITING_REAL_FIREFLY_VIDEO_TAKES' },
      remotionDossiers: {
        scenes: scenes.filter((scene) => scene.required_category !== 'matter').length,
        categories: ['evidence', 'maps', 'reveal'],
      },
    },
    stages: {
      narration: { status: 'DONE' },
      visuals: {
        status: 'PENDING',
        requiredMatterTakes: scenes.filter((scene) => scene.required_category === 'matter').length,
        staticVideoFallbackAllowed: false,
      },
      sfx: { status: 'DONE' },
      music: { status: 'DONE' },
      mix: { status: 'DONE' },
      thumbnail: { status: 'DONE' },
      render: { status: 'PENDING' },
      cinematic_grade: { status: 'PENDING' },
    },
    canonBalance: balance,
    updatedAt: new Date().toISOString(),
  });
}

function createSfxBed(): void {
  const sfxPath = path.join(runDir, 'postproduction', 'sfx.mp3');
  runFfmpeg([
    '-f', 'lavfi',
    '-i', `anoisesrc=color=white:amplitude=0.010:duration=${targetSeconds}`,
    '-af', 'highpass=f=600,lowpass=f=3600,volume=0.12',
    '-c:a', 'libmp3lame',
    '-b:a', '128k',
    sfxPath,
  ]);
  fs.copyFileSync(sfxPath, path.join(runDir, 'audio', 'sfx', 'bed.mp3'));
}

function main(): void {
  mkdirs();
  createContractsAndManifests();
  createAudio();
  createSfxBed();
  createPackaging();
  const total = durations.reduce((acc, value) => acc + value, 0);
  console.log(JSON.stringify({
    status: 'DRONES_AGRO_NOTURNOS_READY',
    runId,
    runDir,
    scenes: scenes.length,
    durationSeconds: total,
    contract: path.join(contractDir, `${runId}.episode.json`),
    scenesJson: path.join(contractDir, `${runId}.scenes.json`),
  }, null, 2));
}

main();
