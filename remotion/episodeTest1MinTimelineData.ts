export interface SceneTimelineItem {
  sceneId: string;
  chapterId: string;
  chapterTitle: string;
  name: string;
  voiceover: string;
  durationSeconds: number;
  durationFrames: number;
  startFrame: number;
  endFrame: number;
  takeType: 'KEYFRAME_DOSSIER' | 'CINEMATIC_TAKE';
  integratedText?: string;
  calloutMain?: string;
  calloutSub?: string;
  calloutCategory?: string;
  motionMode?: 'slow_push_in' | 'crash_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift';
  audioFile?: string;
}

export const EPISODE_TEST_1MIN_TOTAL_FRAMES = 2177;
export const EPISODE_TEST_1MIN_TOTAL_SECONDS = 72.58;

export const EPISODE_TEST_1MIN_TIMELINE: SceneTimelineItem[] = [
  {
    "sceneId": "OOL_001",
    "chapterId": "CH_01",
    "chapterTitle": "O EFEITO COTIDIANO",
    "name": "O Corte Oculto no Pavimento",
    "voiceover": "Toda vez que você passa por uma rodovia ou cruza um semáforo inteligente, você pisa sobre uma fenda cortada a laser no asfalto.",
    "durationSeconds": 7.89,
    "durationFrames": 237,
    "startFrame": 0,
    "endFrame": 237,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-TEST-1MIN\\audio_scenes\\OOL_001.mp3",
    "takeType": "CINEMATIC_TAKE",
    "calloutMain": "FENDA DE DIAMANTE",
    "calloutSub": "CORTE MILIMÉTRICO NO PAVIMENTO ASFÁLTICO",
    "calloutCategory": "EVIDÊNCIA DE CAMPO // NÓ 01",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_002",
    "chapterId": "CH_01",
    "chapterTitle": "O EFEITO COTIDIANO",
    "name": "A Resina Epóxi de Selagem",
    "voiceover": "Essa linha preta não é uma rachadura qualquer. Ela é selada com resina de poliuretano industrial para resistir a quarenta toneladas de pressão.",
    "durationSeconds": 8.22,
    "durationFrames": 247,
    "startFrame": 237,
    "endFrame": 484,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-TEST-1MIN\\audio_scenes\\OOL_002.mp3",
    "takeType": "CINEMATIC_TAKE",
    "calloutMain": "POLÍMERO INDUSTRIAL",
    "calloutSub": "SELAGEM HERMÉTICA CONTRA ÁGUA E IMPACTO",
    "calloutCategory": "ENGENHARIA DE MATERIAIS // RESINA",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_003",
    "chapterId": "CH_02",
    "chapterTitle": "O MECANISMO OCULTO",
    "name": "A Bobina de Cobre Subterrânea",
    "voiceover": "Apenas cinco centímetros abaixo da superfície, há uma espira retangular com quatro voltas de cabo de cobre puro.",
    "durationSeconds": 6.69,
    "durationFrames": 201,
    "startFrame": 484,
    "endFrame": 685,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-TEST-1MIN\\audio_scenes\\OOL_003.mp3",
    "takeType": "CINEMATIC_TAKE",
    "calloutMain": "ESPIRA DE COBRE",
    "calloutSub": "BOBINA DE INDUÇÃO ENTERRADA A 5 CM",
    "calloutCategory": "INFRAESTRUTURA // CONDUTOR",
    "motionMode": "crash_push_in"
  },
  {
    "sceneId": "OOL_004",
    "chapterId": "CH_02",
    "chapterTitle": "O MECANISMO OCULTO",
    "name": "O Intervalo Métrico de Calibração",
    "voiceover": "Exatamente três metros à frente, uma segunda espira idêntica espera a chegada do veículo.",
    "durationSeconds": 5.25,
    "durationFrames": 158,
    "startFrame": 685,
    "endFrame": 843,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-TEST-1MIN\\audio_scenes\\OOL_004.mp3",
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "DISTÂNCIA PADRÃO: 3,00 METROS",
    "calloutMain": "3,00 METROS",
    "calloutSub": "DISTÂNCIA FIXA ENTRE LAÇOS INDUTIVOS",
    "calloutCategory": "CALIBRAÇÃO MÉTRICA // INMETRO",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_005",
    "chapterId": "CH_03",
    "chapterTitle": "A FÍSICA DO SISTEMA",
    "name": "O Campo Magnético de Alta Frequência",
    "voiceover": "O sistema emite uma corrente contínua oscilando entre vinte e cinquenta quilohertz, gerando uma barreira invisível de fluxo magnético.",
    "durationSeconds": 8.13,
    "durationFrames": 244,
    "startFrame": 843,
    "endFrame": 1087,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-TEST-1MIN\\audio_scenes\\OOL_005.mp3",
    "takeType": "CINEMATIC_TAKE",
    "calloutMain": "20 A 50 KHZ",
    "calloutSub": "CAMPO OSCILATÓRIO DE ALTA FREQUÊNCIA",
    "calloutCategory": "FÍSICA ELETROMAGNÉTICA // CAMPO",
    "motionMode": "cinematic_drift"
  },
  {
    "sceneId": "OOL_006",
    "chapterId": "CH_03",
    "chapterTitle": "A FÍSICA DO SISTEMA",
    "name": "A Perturbação de Indutância",
    "voiceover": "Quando a carcaça de metal do seu carro entra no campo, as correntes de Foucault reduzem a indutância da bobina em milissegundos.",
    "durationSeconds": 7.89,
    "durationFrames": 237,
    "startFrame": 1087,
    "endFrame": 1324,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-TEST-1MIN\\audio_scenes\\OOL_006.mp3",
    "takeType": "CINEMATIC_TAKE",
    "calloutMain": "DELTA INDUTÂNCIA",
    "calloutSub": "VARIAÇÃO PROVOCADA PELA MASSA DO CHASSI",
    "calloutCategory": "CORRENTES DE FOUCAULT // FLUXO",
    "motionMode": "pan_left"
  },
  {
    "sceneId": "OOL_007",
    "chapterId": "CH_04",
    "chapterTitle": "O CÁLCULO INSTANTÂNEO",
    "name": "O Processamento em Microssegundos",
    "voiceover": "O oscilador eletrônico registra o intervalo exato entre o primeiro e o segundo laço, dividindo a distância pelo tempo em tempo real.",
    "durationSeconds": 7.71,
    "durationFrames": 231,
    "startFrame": 1324,
    "endFrame": 1555,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-TEST-1MIN\\audio_scenes\\OOL_007.mp3",
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "V = ΔS / ΔT (MICROSSEGUNDOS)",
    "calloutMain": "V = ΔS / ΔT",
    "calloutSub": "CÁLCULO EXECUTADO EM MENOS DE 1 MS",
    "calloutCategory": "CINEMÁTICA PURA // DSP",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_008",
    "chapterId": "CH_05",
    "chapterTitle": "O PONTO CRÍTICO",
    "name": "A Deformação do Asfalto a 60°C",
    "voiceover": "Mas o asfalto dilata com o calor escaldante de sessenta graus, criando o risco de micro-distorções na distância real.",
    "durationSeconds": 6.97,
    "durationFrames": 209,
    "startFrame": 1555,
    "endFrame": 1764,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-TEST-1MIN\\audio_scenes\\OOL_008.mp3",
    "takeType": "CINEMATIC_TAKE",
    "calloutMain": "DILATAÇÃO 60°C",
    "calloutSub": "PONTO DE FALHA: DEFORMAÇÃO TÉRMICA DA PISTA",
    "calloutCategory": "ALERTA CRÍTICO // GARGALO",
    "motionMode": "dramatic_pull_out"
  },
  {
    "sceneId": "OOL_009",
    "chapterId": "CH_05",
    "chapterTitle": "A AUDITORIA REGULATÓRIA",
    "name": "A Margem Legal do INMETRO",
    "voiceover": "É exatamente por essa variação física que a metrologia brasileira exige a tolerância de sete quilômetros por hora.",
    "durationSeconds": 6.22,
    "durationFrames": 187,
    "startFrame": 1764,
    "endFrame": 1951,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-TEST-1MIN\\audio_scenes\\OOL_009.mp3",
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "TOLERÂNCIA INMETRO: ±7 KM/H",
    "calloutMain": "±7 KM/H",
    "calloutSub": "MARGEM REGULATÓRIA OBRIGATÓRIA POR LEI",
    "calloutCategory": "AUDITORIA OFICIAL // INMETRO",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_010",
    "chapterId": "CH_06",
    "chapterTitle": "A ASSINATURA EDITORIAL",
    "name": "Investigar. Revelar. Compreender.",
    "voiceover": "O sistema não descansa. Investigar, revelar e compreender o que acontece depois que você acelera.",
    "durationSeconds": 7.533333333333333,
    "durationFrames": 226,
    "startFrame": 1951,
    "endFrame": 2177,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-TEST-1MIN\\audio_scenes\\OOL_010.mp3",
    "takeType": "CINEMATIC_TAKE",
    "calloutMain": "INVESTIGAR. REVELAR. COMPREENDER.",
    "calloutSub": "O QUE ACONTECE DEPOIS QUE VOCÊ CLICA, COMPRA OU ACELERA",
    "calloutCategory": "CANAL O OUTRO LADO // MASTER",
    "motionMode": "slow_push_in"
  }
];
