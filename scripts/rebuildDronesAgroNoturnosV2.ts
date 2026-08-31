import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import baseScenes from '../contracts/episodes/drones-agro-noturnos.scenes.json';
import {buildFireflyPrompt} from '../contracts/buildFireflyPrompt';

const episodeId = 'drones-agro-noturnos';
const root = process.cwd();
const runDir = path.join(root, 'runs', episodeId);
const publicRoot = path.join(root, 'public', 'episodes', episodeId);
const sourceRoot = path.join(root, 'assets', 'episode_source_frames', episodeId);
const guideRoot = path.join(runDir, 'firefly-v2');
const guideImages = path.join(guideRoot, 'imagens');
const sceneRoot = path.join(runDir, 'editorial', 'execution', 'scenes');
const domainTags = ['agriculture', 'drone', 'aerospace', 'autonomous', 'night-ops', 'precision-spraying', 'lidar', 'industrial'];

const narrationBeats = [
  'À meia-noite, um hectare de soja continua trabalhando. Sobre ele, uma aeronave agrícola pesada inicia uma missão planejada linha por linha.',
  'Os cem quilos não descrevem o drone vazio. São a ordem de grandeza da massa máxima de decolagem, já com bateria e carga.',
  'Antes da primeira hélice girar, o talhão vira rota: limite, dose, altura, velocidade, obstáculos e ponto de retorno entram no plano.',
  'Braços de fibra de carbono reduzem massa estrutural, mas cada união precisa suportar vibração, torque e repetidos ciclos de carga.',
  'Nesta plataforma octocóptero, o empuxo é distribuído entre oito rotores. Isso muda estabilidade, consumo e o ar lançado sobre as folhas.',
  'Baterias de trinta mil miliampère-hora alimentam voos curtos e intensos. No campo, a logística depende de troca, resfriamento e recarga.',
  'A rota não é um desenho decorativo. Cada faixa precisa respeitar o contorno real do cultivo e manter margem contra árvores e postes.',
  'Dois sensores cumprem tarefas diferentes: o LiDAR mede distância com laser; o radar usa radiofrequência para perceber terreno e obstáculos.',
  'O posicionamento RTK corrige a trajetória em tempo real. Precisão centimétrica de posição, porém, não significa deposição centimétrica do produto.',
  'Quando a aeronave sobe carregada, o controlador compara atitude, rotação dos motores e resposta dos sensores antes de liberar a missão.',
  'A noite costuma oferecer vento mais estável, mas não elimina deriva. Um anemômetro ainda pode interromper toda a aplicação.',
  'Na borda do talhão, fios e galhos são gargalos físicos. Detectar cedo importa; a decisão final continua sob supervisão humana.',
  'A altura operacional é pequena porque o alvo está nas plantas. Voar baixo reduz dispersão, mas aproxima o drone do terreno irregular.',
  'A velocidade de vinte e oito quilômetros por hora é um parâmetro de missão, não uma promessa universal para qualquer lavoura.',
  'A bomba mede vazão enquanto os bicos atomizadores formam gotas. Pressão, rotação e formulação alteram o espectro lançado sobre o dossel.',
  'Se a vazão real diverge da dose programada, o mapa bonito deixa de valer. O sistema precisa registrar e reagir à diferença.',
  'Aqui começa a parte invisível: cada rotor produz uma esteira de ar descendente, turbulenta e diferente perto do solo.',
  'Oito esteiras se encontram sobre a soja. Essa interação abre o dossel, movimenta folhas e transporta gotas para regiões escondidas.',
  'O efeito solo aumenta a pressão sob a aeronave quando ela voa baixo. O mesmo fenômeno que sustenta também reorganiza a pulverização.',
  'Gotas muito finas acompanham o vento; gotas grandes podem escorrer. O tamanho precisa equilibrar cobertura, retenção e risco de deriva.',
  'Vista de cima, a faixa parece uniforme. Sob as folhas, a cobertura depende de turbulência, arquitetura da planta e ajuste dos bicos.',
  'O verso da folha é a prova mais difícil. É ali que o downwash pode ajudar, mas nenhum controlador garante cobertura perfeita sozinho.',
  'Uma rajada lateral muda o problema em segundos. A missão deve reduzir velocidade, corrigir a faixa ou pausar antes de sair do alvo.',
  'A aeronave também estima a distância do dossel. Manter altura relativa é diferente de manter uma altitude fixa sobre terreno ondulado.',
  'Quando a bateria chega ao limite de retorno, a rota é interrompida em um ponto conhecido. A próxima unidade retoma dali.',
  'Na estação móvel, energia e produto precisam chegar no mesmo ritmo. Um gargalo de recarga deixa o enxame parado no chão.',
  'O tanque, as mangueiras e os filtros carregam outra vulnerabilidade: contaminação, bolhas ou entupimento alteram a dose aplicada.',
  'O bico centrífugo usa rotação para atomizar líquido. A escolha do modelo e da rotação define gotas; não é detalhe cosmético.',
  'Sob cada rotor, a vorticidade não forma uma coluna limpa. Ela pulsa, mistura ar lateral e varia com altura, massa e velocidade.',
  'É essa turbulência controlada que pode empurrar microgotas para o interior da planta sem simplesmente lançá-las para fora da linha.',
  'O gargalo é estreito: downwash suficiente para penetrar o dossel, mas vento e gotas ajustados para conter a deriva noturna.',
  'Sensores não enxergam química. Eles medem distância, movimento e vazão; a eficácia agronômica ainda precisa de amostragem no campo.',
  'No último passe, o sistema fecha a faixa e grava posição, horário e dose. O hectare começa a virar um documento auditável.',
  'Sem pneus sobre o talhão, não há trilha de compactação causada por essa passagem. Ainda assim, logística terrestre continua na borda.',
  'Mapas de infestação permitem dose variável, mas só funcionam quando a origem dos dados, a resolução e a data são conhecidas.',
  'A escuridão não é autonomia. É apenas uma condição operacional em que iluminação, sensores e supervisão precisam compensar a baixa visibilidade.',
  'O recibo técnico reúne logs de voo, coordenadas, volume e alertas. Sem esses dados, não há como reconstruir o que aconteceu.',
  'O raio-X aerodinâmico revela o mecanismo central: o produto não cai em silêncio; ele atravessa um campo de ar criado pelas hélices.',
  'A última fileira recebe a mesma checagem da primeira. Erros acumulados de posição ou vazão não podem ser escondidos no final.',
  'O hangar móvel é uma pequena fábrica: gera energia, mistura produto, resfria baterias e devolve aeronaves ao ciclo.',
  'Depois do voo, folhas amostradas e mapas de aplicação ficam lado a lado. A evidência física precisa concordar com a telemetria.',
  'Não ver um piloto na imagem não torna o voo sem responsabilidade. A operação automatizada permanece supervisionada por piloto remoto habilitado.',
  'A trilha GNSS mostra onde a aeronave passou. Ela não prova sozinha quanto produto ficou em cada centímetro da folha.',
  'A primeira luz revela fileiras intactas e a estação ainda ativa. O resultado da noite aparece no campo, não no painel.',
  'Autonomia tem custo físico: baterias, gerador, água, produto, manutenção e equipe de supervisão fazem parte da conta.',
  'Cisterna e tanque alimentam o ciclo, mas a mistura precisa de rastreabilidade. Volume sem concentração correta não representa dose correta.',
  'O som das hélices denuncia energia transformada em empuxo e turbulência. Cada minuto de voo consome uma reserva limitada.',
  'A linha invisível é uma margem operacional. Sair dela pode atingir cultura vizinha, área protegida ou equipamento energizado.',
  'Mapa, bateria, bico, vento e amostra de folha formam uma cadeia de evidências. Nenhuma peça isolada conta a história inteira.',
  'Um hectare concluído é o resultado de matéria, sensores e decisões supervisionadas. O outro lado do agro está nesse sistema conectado.',
];

const titleFixes: Record<string, string> = {
  DAN_002: 'ATÉ 103 KG NA DECOLAGEM', DAN_008: 'LASER E RADAR, SEPARADOS',
  DAN_009: 'RTK POSICIONA A ROTA', DAN_042: 'AUTOMAÇÃO SUPERVISIONADA',
};

function ensureDir(dir: string) { fs.mkdirSync(dir, {recursive: true}); }
function writeJson(file: string, value: unknown) { ensureDir(path.dirname(file)); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8'); }
function sha256(file: string) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function copyAsset(source: string, destination: string) {
  ensureDir(path.dirname(destination));
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try { fs.copyFileSync(source, destination); return; } catch (error) {
      if (attempt === 3) throw error;
    }
  }
}

function masterFor(scene: any): number {
  const value = `${scene.visualSubject} ${scene.title}`.toLowerCase();
  if (/(amanhecer|finalizado|primeira luz)/.test(value)) return 8;
  if (/(enxame|multipl|paralel)/.test(value)) return 7;
  if (/(mapa|relatorio|ordem|recibo|dossier|evidencia)/.test(value)) return 6;
  if (/(folha|gota|bico|downwash|vortic|pulver|dossel)/.test(value)) return 5;
  if (/(fio|arvore|lidar|radar|sensor|obstac)/.test(value)) return 4;
  if (/(bateria|gerador|tanque|cisterna|hangar|recarga)/.test(value)) return 3;
  if (/(fibra|rotor|helice|chassi|motor)/.test(value)) return 2;
  return 1;
}

if (narrationBeats.length !== 50 || (baseScenes as any[]).length !== 50) throw new Error('DAN_V2_REQUIRES_50_SCENES');
ensureDir(guideImages); ensureDir(sceneRoot); ensureDir(path.join(publicRoot, 'images')); ensureDir(path.join(publicRoot, 'takes'));

const scenes = (baseScenes as any[]).map((scene, index) => {
  const title = titleFixes[scene.sceneId] || scene.title;
  const master = masterFor(scene);
  const source = path.join(sourceRoot, `master-${String(master).padStart(2, '0')}.png`);
  const publicImage = path.join(publicRoot, 'images', `${scene.sceneId}.png`);
  const runSceneDir = path.join(sceneRoot, scene.sceneId);
  const runFrame = path.join(runSceneDir, 'start_frame.png');
  ensureDir(runSceneDir);
  copyAsset(source, publicImage); copyAsset(source, runFrame);
  const receipt = {
    schema: 'hsl.visual.provenance.v2', sourceSystem: 'openai_imagegen',
    sourceAsset: path.relative(root, source), sceneId: scene.sceneId,
    sha256: sha256(runFrame), generatedAt: new Date().toISOString(),
    productionUse: 'APPROVED_PHOTOREAL_START_FRAME',
  };
  writeJson(path.join(runSceneDir, 'start_frame_receipt.json'), receipt);
  const currentTotal = (baseScenes as any[]).reduce((sum, item) => sum + Number(item.targetSeconds || 0), 0);
  const currentColdOpen = (baseScenes as any[]).slice(0, 2).reduce((sum, item) => sum + Number(item.targetSeconds || 0), 0);
  const remainingScale = (494.12 - 18) / Math.max(1, currentTotal - currentColdOpen);
  return {
    ...scene, episodeId, title, voiceover: narrationBeats[index], domainTags,
    targetSeconds: index < 2 ? 9 : Number((scene.targetSeconds * remainingScale).toFixed(2)),
    allowed_sources: scene.required_category === 'matter' ? ['firefly'] : ['dossier'],
    telemetryLine: index % 3 === 0
      ? 'ALTITUDE // 2,5 m // VELOCIDADE // 28 km/h // MISSAO AUTOMATIZADA'
      : index % 3 === 1 ? 'RTK // POSICAO CORRIGIDA // PILOTO REMOTO RESPONSAVEL' : 'LIDAR // LASER // RADAR // RADIOFREQUENCIA',
    evidenceLine: `HECTARE // ${Math.round((index + 1) * 2)}% // LOG ${scene.sceneId}`,
    visual_must_include: [scene.visualSubject, `physical subject visible in master frame ${master}`, `wet soybean field at midnight for ${scene.sceneId}`],
    visual_must_not: [...scene.visual_must_not.slice(0, 3), `unrelated substitute for ${scene.visualSubject}`],
  };
});

writeJson(path.join(root, 'contracts', 'episodes', `${episodeId}.scenes.json`), scenes);
writeJson(path.join(root, 'contracts', 'episodes', `${episodeId}.episode.json`), {
  episodeId, title: 'Como os Drones Gigantes do Agro Operam Sozinhos à Noite',
  theme: 'Operação noturna automatizada de drones agrícolas pesados', domainTags,
  targetDurationSeconds: scenes.reduce((sum, scene) => sum + scene.targetSeconds, 0), minDurationRatio: 0.9,
  minScenes: 50, requiredStages: ['narration', 'visuals', 'sfx', 'music', 'mix', 'thumbnail', 'render', 'cinematic_grade'],
  voiceProfile: 'ElevenLabs Chris iP95p4xoKVk53GoZ742B', musicMood: 'cyber-industrial restrained', sfxDensity: 'narrative sparse',
});

writeJson(path.join(runDir, 'editorial', 'execution', 'documentary-edit-package.json'), {
  episodeId, status: 'READY_FOR_MEDIA', scenes: scenes.map((scene, index) => ({
    sceneId: scene.sceneId, shotId: `${scene.sceneId}_SHOT_01`, takeType: scene.take_type,
    visualMode: scene.required_category === 'matter' ? 'generated_ai' : 'dossier',
    visualSubject: scene.visualSubject, mediaFile: scene.required_category === 'matter' ? `episodes/${episodeId}/takes/${scene.sceneId}.mp4` : `episodes/${episodeId}/images/${scene.sceneId}.png`,
    category: scene.required_category, order: index + 1,
  })),
});
const totalTimelineSeconds = scenes.reduce((sum, scene) => sum + scene.targetSeconds, 0);
writeJson(path.join(runDir, 'postproduction', 'scene_timings.json'), {
  totalDurationSeconds: totalTimelineSeconds,
  totalDurationFrames: Math.round(totalTimelineSeconds * 30),
  scenes: scenes.map((scene, index) => ({sceneId: scene.sceneId, order: index + 1, durationSeconds: scene.targetSeconds}))
});

const motions = ['slow lateral tracking with stable aircraft', 'controlled forward push with natural rotor motion'];
const guideItems = Array.from({length: 16}, (_, index) => {
  const master = (index % 8) + 1;
  const source = path.join(sourceRoot, `master-${String(master).padStart(2, '0')}.png`);
  const image = `DANV2_${String(index + 1).padStart(2, '0')}.png`;
  copyAsset(source, path.join(guideImages, image));
  const built = buildFireflyPrompt({
    sceneId: `DANV2_${String(index + 1).padStart(2, '0')}`,
    visualSubject: `${motions[Math.floor(index / 8)]}, preserve exact machinery and midnight field geometry from the input frame`,
    visual_must_include: [`photoreal agricultural machinery from master ${master}`, 'continuous micro-movement with physically plausible rotor and mist motion'],
    visual_must_not: ['morphing drone geometry', 'new human figures', 'camera collision or impossible flight', `identity drift from master ${master}`],
    required_category: 'agricultural-night-operations', domainTags,
  });
  return {name: `DANV2_${String(index + 1).padStart(2, '0')}`, image, prompt: built.prompt, model: 'Firefly Video', resolution: '1080p', aspect_ratio: '16:9', duration_seconds: 5, generate_audio: false};
});
writeJson(path.join(guideRoot, 'firefly-production-guide.json'), {model: 'Firefly Video', resolution: '1080p', aspect_ratio: '16:9', duration_seconds: 5, generate_audio: false, items: guideItems});
writeJson(path.join(runDir, 'run-manifest.json'), {runId: episodeId, status: 'MEDIA_PENDING', generatedImages: 8, generatedVideos: 0, bankClips: 0, fallbackRemotion: 0, stages: {visuals: {status: 'PENDING_FIREFLY'}, narration: {status: 'PENDING'}, sfx: {status: 'PENDING'}, render: {status: 'PENDING'}}, updatedAt: new Date().toISOString()});
console.log(JSON.stringify({status: 'DAN_V2_CONTRACTS_READY', scenes: scenes.length, guideItems: guideItems.length, guide: path.join(guideRoot, 'firefly-production-guide.json')}, null, 2));
