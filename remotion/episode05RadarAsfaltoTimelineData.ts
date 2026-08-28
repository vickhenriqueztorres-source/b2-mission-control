// Arquivo gerado automaticamente pelo RemotionCompiler
export interface CompiledSceneItem {
  sceneId: string;
  name: string;
  startFrame: number;
  durationFrames: number;
  durationSeconds: number;
  takeType: 'CINEMATIC_TAKE' | 'KEYFRAME_DOSSIER';
  integratedText?: string;
  motionMode: 'crash_push_in' | 'slow_push_in' | 'dramatic_pull_out' | 'pan_right' | 'pan_left' | 'cinematic_drift';
  callout?: {
    categoryText: string;
    mainText: string;
    subText: string;
    position?: 'center' | 'bottom_left' | 'bottom_right' | 'top_left';
  };
}

export const EPISODE05RADARASFALTO_TOTAL_FRAMES = 11700;

export const EPISODE05RADARASFALTO_TIMELINE: CompiledSceneItem[] = [
  {
    "sceneId": "OOL_001",
    "name": "Cena 1",
    "startFrame": 0,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "cinematic_drift",
    "callout": {
      "categoryText": "TELEMETRIA DE RODOVIA // VELOCIDADE INICIAL",
      "mainText": "118 KM/H",
      "subText": "VELOCÍMETRO ILUMINADO EM CIANO SOB CHUVA",
      "position": "bottom_left"
    }
  },
  {
    "sceneId": "OOL_002",
    "name": "Cena 2",
    "startFrame": 234,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_003",
    "name": "Cena 3",
    "startFrame": 468,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_004",
    "name": "Cena 4",
    "startFrame": 702,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "FLASH // DISPARO A 1/10.000s",
    "motionMode": "crash_push_in",
    "callout": {
      "categoryText": "REGISTRO DE CAMPO // TEMPO DE OBTURAÇÃO",
      "mainText": "1/10.000s",
      "subText": "DISPARO ULTRA-RÁPIDO SEM DISTORÇÃO",
      "position": "bottom_left"
    }
  },
  {
    "sceneId": "OOL_005",
    "name": "Cena 5",
    "startFrame": 936,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_006",
    "name": "Cena 6",
    "startFrame": 1170,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_007",
    "name": "Cena 7",
    "startFrame": 1404,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_008",
    "name": "Cena 8",
    "startFrame": 1638,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_009",
    "name": "Cena 9",
    "startFrame": 1872,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "3 METROS // DISTÂNCIA PADRÃO",
    "motionMode": "slow_push_in",
    "callout": {
      "categoryText": "CALIBRAÇÃO MÉTRICA // DISTÂNCIA PADRÃO",
      "mainText": "3,00 METROS",
      "subText": "INTERVALO FIXO ENTRE LAÇOS INDUTIVOS",
      "position": "bottom_left"
    }
  },
  {
    "sceneId": "OOL_010",
    "name": "Cena 10",
    "startFrame": 2106,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_011",
    "name": "Cena 11",
    "startFrame": 2340,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_012",
    "name": "Cena 12",
    "startFrame": 2574,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_013",
    "name": "Cena 13",
    "startFrame": 2808,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_014",
    "name": "Cena 14",
    "startFrame": 3042,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_015",
    "name": "Cena 15",
    "startFrame": 3276,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "ΔT = 60.000 µs",
    "motionMode": "crash_push_in",
    "callout": {
      "categoryText": "TELEMETRIA DE CAMPO // VARIAÇÃO DE INDUTÂNCIA",
      "mainText": "60.000 µs",
      "subText": "DELTA DE TEMPO REGISTRADO NA PASSAGEM",
      "position": "bottom_left"
    }
  },
  {
    "sceneId": "OOL_016",
    "name": "Cena 16",
    "startFrame": 3510,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_017",
    "name": "Cena 17",
    "startFrame": 3744,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_018",
    "name": "Cena 18",
    "startFrame": 3978,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_019",
    "name": "Cena 19",
    "startFrame": 4212,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_020",
    "name": "Cena 20",
    "startFrame": 4446,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_021",
    "name": "Cena 21",
    "startFrame": 4680,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_022",
    "name": "Cena 22",
    "startFrame": 4914,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "V = ΔS / ΔT",
    "motionMode": "slow_push_in",
    "callout": {
      "categoryText": "FÓRMULA FÍSICA // CINEMÁTICA PURA",
      "mainText": "V = ΔS / ΔT",
      "subText": "CÁLCULO EXECUTADO EM MENOS DE 1 MS",
      "position": "center"
    }
  },
  {
    "sceneId": "OOL_023",
    "name": "Cena 23",
    "startFrame": 5148,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_024",
    "name": "Cena 24",
    "startFrame": 5382,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_025",
    "name": "Cena 25",
    "startFrame": 5616,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_026",
    "name": "Cena 26",
    "startFrame": 5850,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_027",
    "name": "Cena 27",
    "startFrame": 6084,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_028",
    "name": "Cena 28",
    "startFrame": 6318,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_029",
    "name": "Cena 29",
    "startFrame": 6552,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_030",
    "name": "Cena 30",
    "startFrame": 6786,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "OCR // LEITURA DE PLACA",
    "motionMode": "pan_right",
    "callout": {
      "categoryText": "VISÃO COMPUTACIONAL // REDE NEURAL OCR",
      "mainText": "RECONHECIMENTO 99.4%",
      "subText": "LEITURA MONOCROMÁTICA DA PLACA MERCOSUL",
      "position": "bottom_left"
    }
  },
  {
    "sceneId": "OOL_031",
    "name": "Cena 31",
    "startFrame": 7020,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_032",
    "name": "Cena 32",
    "startFrame": 7254,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_033",
    "name": "Cena 33",
    "startFrame": 7488,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_034",
    "name": "Cena 34",
    "startFrame": 7722,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_035",
    "name": "Cena 35",
    "startFrame": 7956,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_036",
    "name": "Cena 36",
    "startFrame": 8190,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_037",
    "name": "Cena 37",
    "startFrame": 8424,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_038",
    "name": "Cena 38",
    "startFrame": 8658,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "MARGEM INMETRO: ±7 KM/H",
    "motionMode": "dramatic_pull_out",
    "callout": {
      "categoryText": "LEGISLAÇÃO METROLÓGICA // CONTRAN & INMETRO",
      "mainText": "±7 KM/H",
      "subText": "MARGEM LEGAL PARA DILATAÇÃO DO ASFALTO",
      "position": "bottom_left"
    }
  },
  {
    "sceneId": "OOL_039",
    "name": "Cena 39",
    "startFrame": 8892,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_040",
    "name": "Cena 40",
    "startFrame": 9126,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_041",
    "name": "Cena 41",
    "startFrame": 9360,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_042",
    "name": "Cena 42",
    "startFrame": 9594,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_043",
    "name": "Cena 43",
    "startFrame": 9828,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_044",
    "name": "Cena 44",
    "startFrame": 10062,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_045",
    "name": "Cena 45",
    "startFrame": 10296,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_046",
    "name": "Cena 46",
    "startFrame": 10530,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_047",
    "name": "Cena 47",
    "startFrame": 10764,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_048",
    "name": "Cena 48",
    "startFrame": 10998,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "pan_right"
  },
  {
    "sceneId": "OOL_049",
    "name": "Cena 49",
    "startFrame": 11232,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "CINEMATIC_TAKE",
    "integratedText": "",
    "motionMode": "slow_push_in"
  },
  {
    "sceneId": "OOL_050",
    "name": "Cena 50",
    "startFrame": 11466,
    "durationFrames": 234,
    "durationSeconds": 7.8,
    "takeType": "KEYFRAME_DOSSIER",
    "integratedText": "INVESTIGAR. REVELAR. COMPREENDER.",
    "motionMode": "slow_push_in",
    "callout": {
      "categoryText": "ASSINATURA OFICIAL // CANAL O OUTRO LADO",
      "mainText": "INVESTIGAR. REVELAR. COMPREENDER.",
      "subText": "O QUE ACONTECE DEPOIS QUE VOCÊ CLICA, COMPRA OU ACELERA",
      "position": "center"
    }
  }
];
