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

export const EPISODE_GASOLINA_TOTAL_FRAMES = 2521;
export const EPISODE_GASOLINA_TOTAL_SECONDS = 84.03;

export const EPISODE_GASOLINA_TIMELINE: SceneTimelineItem[] = [
  {
    "sceneId": "GAS_001",
    "chapterId": "CH_01",
    "chapterTitle": "O EFEITO COTIDIANO",
    "name": "O Clique no Bocal do Tanque",
    "voiceover": "Toda vez que você encosta o carro no posto e pede para encher o tanque, você confia cegamente no display digital da bomba.",
    "durationSeconds": 7.06,
    "durationFrames": 212,
    "startFrame": 0,
    "endFrame": 212,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-EP06-GASOLINA\\audio_scenes\\GAS_001.mp3",
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "A CONFIANÇA CEGA NO DISPLAY DIGITAL",
    "calloutMain": "50 LITROS NO PAINEL",
    "calloutSub": "A CONFIANÇA CEGA NO DISPLAY",
    "calloutCategory": "COTIDIANO",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "GAS_002",
    "chapterId": "CH_01",
    "chapterTitle": "O EFEITO COTIDIANO",
    "name": "A Anomalia no Ponteiro",
    "voiceover": "Mas se você já teve a sensação de que o ponteiro do combustível desceu mais rápido do que deveria, a física pode estar do seu lado.",
    "durationSeconds": 7.99,
    "durationFrames": 240,
    "startFrame": 212,
    "endFrame": 452,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-EP06-GASOLINA\\audio_scenes\\GAS_002.mp3",
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "DESVIO INVISÍVEL NO TANQUE DE COMBUSTÍVEL",
    "calloutMain": "A ANOMALIA DO CONSUMO",
    "calloutSub": "DESVIO INVISÍVEL NO TANQUE",
    "calloutCategory": "DIAGNÓSTICO",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "GAS_003",
    "chapterId": "CH_02",
    "chapterTitle": "A MÁQUINA OCULTA",
    "name": "O Bloco Medidor de Quatro Pistões",
    "voiceover": "Por trás da carcaça de aço da bomba, o combustível passa por um bloco mecânico de quatro pistões de alumínio de alta precisão.",
    "durationSeconds": 7.48,
    "durationFrames": 224,
    "startFrame": 452,
    "endFrame": 676,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-EP06-GASOLINA\\audio_scenes\\GAS_003.mp3",
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "DESLOCAMENTO POSITIVO DE FLUIDO // 4 PISTÕES",
    "calloutMain": "BLOCO MEDIDOR DE 4 PISTÕES",
    "calloutSub": "DESLOCAMENTO POSITIVO DE FLUIDO",
    "calloutCategory": "MECÂNICA",
    "motionMode": "cinematic_drift"
  },
  {
    "sceneId": "GAS_004",
    "chapterId": "CH_02",
    "chapterTitle": "A MÁQUINA OCULTA",
    "name": "O Gerador de Pulsos Magnéticos",
    "voiceover": "A cada rotação completa do medidor, um disco dentado aciona um sensor magnético, gerando exatamente duzentos pulsos elétricos por litro.",
    "durationSeconds": 8.45,
    "durationFrames": 254,
    "startFrame": 676,
    "endFrame": 930,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-EP06-GASOLINA\\audio_scenes\\GAS_004.mp3",
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "CALIBRAÇÃO PADRÃO INMETRO: 200 PULSOS = 1,000 L",
    "calloutMain": "200 PULSOS / LITRO",
    "calloutSub": "CALIBRAÇÃO PADRÃO INMETRO",
    "calloutCategory": "SENSOR MAGNÉTICO",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "GAS_005",
    "chapterId": "CH_03",
    "chapterTitle": "O MECANISMO DA FRAUDE",
    "name": "A Placa-Mãe Adulterada",
    "voiceover": "É aqui que a fraude nasce. Criminosos instalam uma placa eletrônica clandestina soldada diretamente na trilha do microcontrolador.",
    "durationSeconds": 8.59,
    "durationFrames": 258,
    "startFrame": 930,
    "endFrame": 1188,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-EP06-GASOLINA\\audio_scenes\\GAS_005.mp3",
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "HARDWARE CLANDESTINO SOLDADO NA TRILHA PRINCIPAL",
    "calloutMain": "MICROCONTROLADOR CLANDESTINO",
    "calloutSub": "INTERCEPTAÇÃO DA TRILHA DE DADOS",
    "calloutCategory": "HARDWARE FRAUDULENTO",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "GAS_006",
    "chapterId": "CH_03",
    "chapterTitle": "O MECANISMO DA FRAUDE",
    "name": "O Receptor Bluetooth Camuflado",
    "voiceover": "O chip é menor que uma moeda de dez centavos, consome energia do próprio display e possui uma antena Bluetooth camuflada na resina.",
    "durationSeconds": 7.94,
    "durationFrames": 238,
    "startFrame": 1188,
    "endFrame": 1426,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-EP06-GASOLINA\\audio_scenes\\GAS_006.mp3",
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "CHIP MILIMÉTRICO OCULTO EM RESINA EPÓXI",
    "calloutMain": "ANTENA BLUETOOTH EMBARCADA",
    "calloutSub": "CHIP MILIMÉTRICO OCULTO EM RESINA",
    "calloutCategory": "CONECTIVIDADE",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "GAS_007",
    "chapterId": "CH_04",
    "chapterTitle": "A FÍSICA DA FRAUDE",
    "name": "A Manipulação dos Pulsos Digitais",
    "voiceover": "O software fraudador altera a matemática básica. Para cada cem litros medidos mecanicamente, a bomba diz ao display que entregou cento e oito.",
    "durationSeconds": 9.38,
    "durationFrames": 281,
    "startFrame": 1426,
    "endFrame": 1707,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-EP06-GASOLINA\\audio_scenes\\GAS_007.mp3",
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "DESVIO MATEMÁTICO: +8 PULSOS FANTASMAS A CADA 100",
    "calloutMain": "DESVIO PROGRAMADO: +8,0%",
    "calloutSub": "8 PULSOS FANTASMAS A CADA 100",
    "calloutCategory": "MANIPULAÇÃO DIGITAL",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "GAS_008",
    "chapterId": "CH_05",
    "chapterTitle": "O PONTO DE TENSÃO",
    "name": "O Botão de Pânico Remoto",
    "voiceover": "Quando a viatura de fiscalização estaciona no posto, um comando acionado pelo celular desativa o chip em microssegundos, restaurando a calibração perfeita.",
    "durationSeconds": 9.8,
    "durationFrames": 294,
    "startFrame": 1707,
    "endFrame": 2001,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-EP06-GASOLINA\\audio_scenes\\GAS_008.mp3",
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "DESATIVAÇÃO REMOTA INSTANTÂNEA // EVASÃO FISCAL",
    "calloutMain": "DESATIVAÇÃO EM 40 µs",
    "calloutSub": "RESTAURAÇÃO DO MODO LEGAL",
    "calloutCategory": "EVASÃO",
    "motionMode": "crash_push_in"
  },
  {
    "sceneId": "GAS_009",
    "chapterId": "CH_05",
    "chapterTitle": "O PONTO DE TENSÃO",
    "name": "A Perícia Forense do INMETRO",
    "voiceover": "Para desmascarar o golpe, os peritos precisam de osciloscópios e analisadores lógicos para interceptar os pacotes de dados antes do bico.",
    "durationSeconds": 8.59,
    "durationFrames": 258,
    "startFrame": 2001,
    "endFrame": 2259,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-EP06-GASOLINA\\audio_scenes\\GAS_009.mp3",
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "AUDITORIA METROLÓGICA FORENSE // PORTARIA 559",
    "calloutMain": "PERÍCIA FORENSE METROLÓGICA",
    "calloutSub": "ANÁLISE DE PULSOS EM TEMPO REAL",
    "calloutCategory": "AUDITORIA INMETRO",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "GAS_010",
    "chapterId": "CH_06",
    "chapterTitle": "O VEREDITO CAUSAL",
    "name": "A Assinatura do Sistema",
    "voiceover": "A fraude moderna não mexe mais em engrenagens, ela opera em código. Investigar. Revelar. Compreender.",
    "durationSeconds": 8.733333333333333,
    "durationFrames": 262,
    "startFrame": 2259,
    "endFrame": 2521,
    "audioFile": "C:\\Users\\brend\\OneDrive\\Desktop\\PROJETO 30K ATE 27\\02 - O OUTRO LADO\\AUTOMACAO - O OUTRO LADO\\runs\\OOL-EP06-GASOLINA\\audio_scenes\\GAS_010.mp3",
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "A FRAUDE MODERNA OPERA EM CÓDIGO // O OUTRO LADO",
    "calloutMain": "INVESTIGAR. REVELAR. COMPREENDER.",
    "calloutSub": "O OUTRO LADO DO SISTEMA",
    "calloutCategory": "VEREDITO",
    "motionMode": "dramatic_pull_out"
  }
];
