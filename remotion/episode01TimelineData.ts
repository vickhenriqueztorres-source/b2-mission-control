// Gerado automaticamente pelo compilador de Timeline Dinâmica
export interface CompiledSceneItem {
  id: string;
  from: number;
  durationInFrames: number;
  voiceover: string;
  chapterId: string;
  visual: {
    type: string;
    config?: any;
  };
  hud: {
    sceneNumber: string;
    title: string;
    subtitle: string;
    latencyMs: number;
    systemStressPercent: number;
    sourceText: string;
  };
}

export const EPISODE_01_TIMELINE_TOTAL_FRAMES = 10848;

export const EPISODE_01_SCENES: CompiledSceneItem[] = [
  {
    "id": "OOL_001",
    "from": 0,
    "durationInFrames": 330,
    "voiceover": "Um gesto simples. Quase imperceptível. Você digita a chave, confirma a transferência de um real e pronto. Na tela, o comprovante surge em menos de dois segundos.",
    "chapterId": "CH01",
    "visual": {
      "type": "smartphone_mockup",
      "config": {
        "amount": "R$ 1,00",
        "stage": "confirming"
      }
    },
    "hud": {
      "sceneNumber": "CENA 01",
      "title": "HOOK",
      "subtitle": "UM GESTO SIMPLES. QUASE IMPERCEPTÍVEL. VOCÊ DIGITA A CHAVE, CONFIRMA A TRAN...",
      "latencyMs": 12,
      "systemStressPercent": 20,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_002",
    "from": 330,
    "durationInFrames": 208,
    "voiceover": "A maioria das pessoas acredita que o dinheiro simplesmente viajou pelo ar, de um banco para outro, como uma mensagem de texto.",
    "chapterId": "CH01",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_001/firefly_take.mp4",
        "kenBurns": "push_in"
      }
    },
    "hud": {
      "sceneNumber": "CENA 02",
      "title": "DEEPEN",
      "subtitle": "A MAIORIA DAS PESSOAS ACREDITA QUE O DINHEIRO SIMPLESMENTE VIAJOU PELO AR, ...",
      "latencyMs": 15,
      "systemStressPercent": 27,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_003",
    "from": 538,
    "durationInFrames": 252,
    "voiceover": "Mas por trás desse toque existe uma máquina monumental que nunca desliga. São cento e quarenta milhões de transações todos os dias.",
    "chapterId": "CH01",
    "visual": {
      "type": "kinetic_counter",
      "config": {
        "startValue": 0,
        "endValue": 140000000,
        "suffix": " tx/dia",
        "label": "VOLUME DIÁRIO SPI / BACEN",
        "sublabel": "Transações processadas sem interrupção."
      }
    },
    "hud": {
      "sceneNumber": "CENA 03",
      "title": "DEEPEN",
      "subtitle": "MAS POR TRÁS DESSE TOQUE EXISTE UMA MÁQUINA MONUMENTAL QUE NUNCA DESLIGA. S...",
      "latencyMs": 18,
      "systemStressPercent": 34,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_004",
    "from": 790,
    "durationInFrames": 368,
    "voiceover": "Nos horários de pico, mais de oito mil transferências acontecem a cada segundo. Cada uma delas precisa ser checada, autenticada e liquidada sem margem para erro.",
    "chapterId": "CH01",
    "visual": {
      "type": "kinetic_counter",
      "config": {
        "startValue": 0,
        "endValue": 8432,
        "suffix": " tx/seg",
        "label": "PICO DE PROCESSAMENTO",
        "sublabel": "Liquidação em tempo real sem filas."
      }
    },
    "hud": {
      "sceneNumber": "CENA 04",
      "title": "DEEPEN",
      "subtitle": "NOS HORÁRIOS DE PICO, MAIS DE OITO MIL TRANSFERÊNCIAS ACONTECEM A CADA SEGU...",
      "latencyMs": 21,
      "systemStressPercent": 41,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_005",
    "from": 1157,
    "durationInFrames": 234,
    "voiceover": "Como o Brasil construiu um sistema capaz de movimentar bilhões de reais em frações de segundo sem duplicar saldo ou travar a economia?",
    "chapterId": "CH01",
    "visual": {
      "type": "stopwatch",
      "config": {
        "startMs": 0,
        "endMs": 1400,
        "label": "JANELA DE LIQUIDAÇÃO ATÔMICA",
        "sublabel": "Do toque ao crédito na conta destino."
      }
    },
    "hud": {
      "sceneNumber": "CENA 05",
      "title": "DEEPEN",
      "subtitle": "COMO O BRASIL CONSTRUIU UM SISTEMA CAPAZ DE MOVIMENTAR BILHÕES DE REAIS EM ...",
      "latencyMs": 24,
      "systemStressPercent": 48,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_006",
    "from": 1391,
    "durationInFrames": 244,
    "voiceover": "Para entender essa resposta, precisamos seguir exatamente o caminho desse único real, descendo do celular para o concreto do subsolo.",
    "chapterId": "CH01",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_006/firefly_take.mp4",
        "kenBurns": "push_in"
      }
    },
    "hud": {
      "sceneNumber": "CENA 06",
      "title": "DEEPEN",
      "subtitle": "PARA ENTENDER ESSA RESPOSTA, PRECISAMOS SEGUIR EXATAMENTE O CAMINHO DESSE Ú...",
      "latencyMs": 27,
      "systemStressPercent": 55,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_007",
    "from": 1635,
    "durationInFrames": 230,
    "voiceover": "O sinal deixa a antena do seu smartphone em frequência de cinco gigahertz e desce imediatamente por cabos coaxiais até o térreo.",
    "chapterId": "CH02",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_007/firefly_take.mp4",
        "kenBurns": "pan_right"
      }
    },
    "hud": {
      "sceneNumber": "CENA 07",
      "title": "DEEPEN",
      "subtitle": "O SINAL DEIXA A ANTENA DO SEU SMARTPHONE EM FREQUÊNCIA DE CINCO GIGAHERTZ E...",
      "latencyMs": 30,
      "systemStressPercent": 62,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_008",
    "from": 1864,
    "durationInFrames": 280,
    "voiceover": "Sob asfalto das avenidas Paulista e Faria Lima corre uma malha densa de fibra óptica monomodo. O sinal deixa de ser rádio e vira pulso de luz laser.",
    "chapterId": "CH02",
    "visual": {
      "type": "cyber_map",
      "config": {
        "origin": "SÃO PAULO / SP",
        "intermediate": "BARUERI / SP",
        "dest": "BRASÍLIA / DF",
        "latency": 12
      }
    },
    "hud": {
      "sceneNumber": "CENA 08",
      "title": "DEEPEN",
      "subtitle": "SOB ASFALTO DAS AVENIDAS PAULISTA E FARIA LIMA CORRE UMA MALHA DENSA DE FIB...",
      "latencyMs": 33,
      "systemStressPercent": 69,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_009",
    "from": 2144,
    "durationInFrames": 259,
    "voiceover": "Sua transferência não é enviada como um número solto. Ela é encapsulada no padrão financeiro internacional ISO vinte mil e vinte e dois.",
    "chapterId": "CH02",
    "visual": {
      "type": "iso20022_packet",
      "config": {
        "amount": "R$ 1,00",
        "latencyMs": 1.4
      }
    },
    "hud": {
      "sceneNumber": "CENA 09",
      "title": "DEEPEN",
      "subtitle": "SUA TRANSFERÊNCIA NÃO É ENVIADA COMO UM NÚMERO SOLTO. ELA É ENCAPSULADA NO ...",
      "latencyMs": 36,
      "systemStressPercent": 76,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_010",
    "from": 2403,
    "durationInFrames": 223,
    "voiceover": "Dentro do banco emissor, módulos de segurança criptográfica de hardware assinam a mensagem com chaves assimétricas invioláveis.",
    "chapterId": "CH02",
    "visual": {
      "type": "laser_wipe_schematic",
      "config": {
        "media": "editorial/execution/OOL_010/firefly_take.mp4",
        "title": "SPI DATA CORE - CLUSTER SP-01",
        "compartment": "MÓDULO DE HARDWARE HSM (AES-256)"
      }
    },
    "hud": {
      "sceneNumber": "CENA 10",
      "title": "DEEPEN",
      "subtitle": "DENTRO DO BANCO EMISSOR, MÓDULOS DE SEGURANÇA CRIPTOGRÁFICA DE HARDWARE ASS...",
      "latencyMs": 39,
      "systemStressPercent": 83,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_011",
    "from": 2625,
    "durationInFrames": 278,
    "voiceover": "Em menos de doze milissegundos, o pulso luminoso viaja pelas margens das rodovias paulistas até o polo de processamento de Barueri e Tamboré.",
    "chapterId": "CH02",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_003/firefly_take.mp4",
        "kenBurns": "push_in"
      }
    },
    "hud": {
      "sceneNumber": "CENA 11",
      "title": "DEEPEN",
      "subtitle": "EM MENOS DE DOZE MILISSEGUNDOS, O PULSO LUMINOSO VIAJA PELAS MARGENS DAS RO...",
      "latencyMs": 42,
      "systemStressPercent": 90,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_012",
    "from": 2904,
    "durationInFrames": 210,
    "voiceover": "Aqui estão os bunkers digitais onde as ordens financeiras do país inteiro convergem para o primeiro grande teste.",
    "chapterId": "CH02",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_012/firefly_take.mp4",
        "kenBurns": "push_in"
      }
    },
    "hud": {
      "sceneNumber": "CENA 12",
      "title": "DEEPEN",
      "subtitle": "AQUI ESTÃO OS BUNKERS DIGITAIS ONDE AS ORDENS FINANCEIRAS DO PAÍS INTEIRO C...",
      "latencyMs": 45,
      "systemStressPercent": 22,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_013",
    "from": 3114,
    "durationInFrames": 210,
    "voiceover": "Sem a infraestrutura física de fibra e energia ininterrupta, nenhuma transação digital conseguiria existir.",
    "chapterId": "CH02",
    "visual": {
      "type": "cyber_map",
      "config": {
        "origin": "SÃO PAULO",
        "intermediate": "BARUERI",
        "dest": "BRASÍLIA",
        "latency": 24
      }
    },
    "hud": {
      "sceneNumber": "CENA 13",
      "title": "DEEPEN",
      "subtitle": "SEM A INFRAESTRUTURA FÍSICA DE FIBRA E ENERGIA ININTERRUPTA, NENHUMA TRANSA...",
      "latencyMs": 48,
      "systemStressPercent": 29,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_014",
    "from": 3324,
    "durationInFrames": 291,
    "voiceover": "Dentro do data center, a mensagem entra no ecossistema do Sistema de Pagamentos Instantâneos, o SPI, operado e supervisionado pelo Banco Central.",
    "chapterId": "CH03",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_014/firefly_take.mp4",
        "kenBurns": "pan_left"
      }
    },
    "hud": {
      "sceneNumber": "CENA 14",
      "title": "DEEPEN",
      "subtitle": "DENTRO DO DATA CENTER, A MENSAGEM ENTRA NO ECOSSISTEMA DO SISTEMA DE PAGAME...",
      "latencyMs": 51,
      "systemStressPercent": 36,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_015",
    "from": 3614,
    "durationInFrames": 259,
    "voiceover": "A primeira parada é o DICT: o Diretório de Identificadores de Contas Transacionais. Ele guarda mais de oitocentos milhões de chaves cadastradas.",
    "chapterId": "CH03",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_014/firefly_take.mp4",
        "kenBurns": "pan_right"
      }
    },
    "hud": {
      "sceneNumber": "CENA 15",
      "title": "DEEPEN",
      "subtitle": "A PRIMEIRA PARADA É O DICT: O DIRETÓRIO DE IDENTIFICADORES DE CONTAS TRANSA...",
      "latencyMs": 54,
      "systemStressPercent": 43,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_016",
    "from": 3873,
    "durationInFrames": 358,
    "voiceover": "A busca no DICT precisa acontecer em menos de oito milissegundos. Ele precisa traduzir a chave digitada no banco de destino, agência e conta exata.",
    "chapterId": "CH03",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_003/firefly_take.mp4",
        "kenBurns": "push_in"
      }
    },
    "hud": {
      "sceneNumber": "CENA 16",
      "title": "DEEPEN",
      "subtitle": "A BUSCA NO DICT PRECISA ACONTECER EM MENOS DE OITO MILISSEGUNDOS. ELE PRECI...",
      "latencyMs": 57,
      "systemStressPercent": 50,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_017",
    "from": 4231,
    "durationInFrames": 228,
    "voiceover": "Com o destino confirmado, a transação alcança a Conta de Pagamentos Instantâneos de cada instituição financeira no Banco Central.",
    "chapterId": "CH03",
    "visual": {
      "type": "research_lapse",
      "config": {
        "query": "BACEN // SPI PROTOCOL // DICT_DIRECTORY",
        "source": "REGISTRO DE LIQUIDAÇÃO"
      }
    },
    "hud": {
      "sceneNumber": "CENA 17",
      "title": "DEEPEN",
      "subtitle": "COM O DESTINO CONFIRMADO, A TRANSAÇÃO ALCANÇA A CONTA DE PAGAMENTOS INSTANT...",
      "latencyMs": 60,
      "systemStressPercent": 57,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_018",
    "from": 4459,
    "durationInFrames": 312,
    "voiceover": "A liquidação no SPI é bruta e em tempo real. Não existe promessa de pagamento. O débito no banco de origem e o crédito no banco de destino acontecem no mesmo microssegundo.",
    "chapterId": "CH03",
    "visual": {
      "type": "cyber_map",
      "config": {
        "origin": "SÃO PAULO",
        "intermediate": "BARUERI",
        "dest": "BRASÍLIA",
        "latency": 24
      }
    },
    "hud": {
      "sceneNumber": "CENA 18",
      "title": "DEEPEN",
      "subtitle": "A LIQUIDAÇÃO NO SPI É BRUTA E EM TEMPO REAL. NÃO EXISTE PROMESSA DE PAGAMEN...",
      "latencyMs": 63,
      "systemStressPercent": 64,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_019",
    "from": 4771,
    "durationInFrames": 226,
    "voiceover": "Se o banco de origem não tiver saldo suficiente em sua conta de liquidação no Bacen, a ordem é rejeitada instantaneamente pela máquina.",
    "chapterId": "CH03",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_019/firefly_take.mp4",
        "kenBurns": "push_in"
      }
    },
    "hud": {
      "sceneNumber": "CENA 19",
      "title": "DEEPEN",
      "subtitle": "SE O BANCO DE ORIGEM NÃO TIVER SALDO SUFICIENTE EM SUA CONTA DE LIQUIDAÇÃO ...",
      "latencyMs": 66,
      "systemStressPercent": 71,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_020",
    "from": 4997,
    "durationInFrames": 253,
    "voiceover": "O registro é replicado em Brasília e São Paulo simultaneamente. Mas antes do sinal verde final, a transação precisa enfrentar sua maior barreira.",
    "chapterId": "CH03",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_014/firefly_take.mp4",
        "kenBurns": "pan_right"
      }
    },
    "hud": {
      "sceneNumber": "CENA 20",
      "title": "DEEPEN",
      "subtitle": "O REGISTRO É REPLICADO EM BRASÍLIA E SÃO PAULO SIMULTANEAMENTE. MAS ANTES D...",
      "latencyMs": 69,
      "systemStressPercent": 78,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_021",
    "from": 5250,
    "durationInFrames": 233,
    "voiceover": "Uma vez gravada no razão do Banco Central, a transferência é juridicamente definitiva e não pode ser desfeita por falha de sistema.",
    "chapterId": "CH03",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_003/firefly_take.mp4",
        "kenBurns": "push_in"
      }
    },
    "hud": {
      "sceneNumber": "CENA 21",
      "title": "DEEPEN",
      "subtitle": "UMA VEZ GRAVADA NO RAZÃO DO BANCO CENTRAL, A TRANSFERÊNCIA É JURIDICAMENTE ...",
      "latencyMs": 72,
      "systemStressPercent": 85,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_022",
    "from": 5483,
    "durationInFrames": 199,
    "voiceover": "Aqui está o verdadeiro ponto de estrangulamento de toda a infraestrutura: a esteira de análise comportamental antifraude.",
    "chapterId": "CH04",
    "visual": {
      "type": "laser_wipe_dossier",
      "config": {
        "media": "editorial/execution/OOL_022/firefly_take.mp4",
        "title": "BACEN — PROTOCOLO DE RETENÇÃO CAUTELAR (MED)"
      }
    },
    "hud": {
      "sceneNumber": "CENA 22",
      "title": "PAYOFF",
      "subtitle": "AQUI ESTÁ O VERDADEIRO PONTO DE ESTRANGULAMENTO DE TODA A INFRAESTRUTURA: A...",
      "latencyMs": 75,
      "systemStressPercent": 92,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_023",
    "from": 5682,
    "durationInFrames": 237,
    "voiceover": "Em menos de oitocentos milissegundos, modelos de inteligência artificial calculam um escore de risco probabilístico para a transação.",
    "chapterId": "CH04",
    "visual": {
      "type": "cyber_map",
      "config": {
        "origin": "SÃO PAULO",
        "intermediate": "BARUERI",
        "dest": "BRASÍLIA",
        "latency": 24
      }
    },
    "hud": {
      "sceneNumber": "CENA 23",
      "title": "DEEPEN",
      "subtitle": "EM MENOS DE OITOCENTOS MILISSEGUNDOS, MODELOS DE INTELIGÊNCIA ARTIFICIAL CA...",
      "latencyMs": 78,
      "systemStressPercent": 24,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_024",
    "from": 5918,
    "durationInFrames": 288,
    "voiceover": "O sistema analisa se o aparelho está na sua localização habitual, a velocidade com que você digitou a senha e se a conta receptora tem histórico de abertura recente.",
    "chapterId": "CH04",
    "visual": {
      "type": "iso20022_packet",
      "config": {
        "amount": "R$ 1,00",
        "latencyMs": 2.8
      }
    },
    "hud": {
      "sceneNumber": "CENA 24",
      "title": "DEEPEN",
      "subtitle": "O SISTEMA ANALISA SE O APARELHO ESTÁ NA SUA LOCALIZAÇÃO HABITUAL, A VELOCID...",
      "latencyMs": 81,
      "systemStressPercent": 31,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_025",
    "from": 6207,
    "durationInFrames": 277,
    "voiceover": "O Mecanismo Especial de Devolução, o MED, e as notificações de infração alimentam uma base de dados compartilhada entre todas as instituições.",
    "chapterId": "CH04",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_014/firefly_take.mp4",
        "kenBurns": "pan_right"
      }
    },
    "hud": {
      "sceneNumber": "CENA 25",
      "title": "DEEPEN",
      "subtitle": "O MECANISMO ESPECIAL DE DEVOLUÇÃO, O MED, E AS NOTIFICAÇÕES DE INFRAÇÃO ALI...",
      "latencyMs": 84,
      "systemStressPercent": 38,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_026",
    "from": 6483,
    "durationInFrames": 270,
    "voiceover": "Se o índice de anomalia ultrapassar o limite de segurança, a máquina aciona a retenção cautelar. O dinheiro é congelado temporariamente para análise aprofundada.",
    "chapterId": "CH04",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_003/firefly_take.mp4",
        "kenBurns": "push_in"
      }
    },
    "hud": {
      "sceneNumber": "CENA 26",
      "title": "DEEPEN",
      "subtitle": "SE O ÍNDICE DE ANOMALIA ULTRAPASSAR O LIMITE DE SEGURANÇA, A MÁQUINA ACIONA...",
      "latencyMs": 87,
      "systemStressPercent": 45,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_027",
    "from": 6754,
    "durationInFrames": 260,
    "voiceover": "Esse é o eterno conflito da engenharia financeira: máxima segurança contra fraude sem criar filas de espera para o usuário legítimo.",
    "chapterId": "CH04",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_027/firefly_take.mp4",
        "kenBurns": "push_in"
      }
    },
    "hud": {
      "sceneNumber": "CENA 27",
      "title": "DEEPEN",
      "subtitle": "ESSE É O ETERNO CONFLITO DA ENGENHARIA FINANCEIRA: MÁXIMA SEGURANÇA CONTRA ...",
      "latencyMs": 90,
      "systemStressPercent": 52,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_028",
    "from": 7014,
    "durationInFrames": 156,
    "voiceover": "A decisão precisa sair antes que a janela de um segundo e quatrocentos milissegundos expire.",
    "chapterId": "CH04",
    "visual": {
      "type": "cyber_map",
      "config": {
        "origin": "SÃO PAULO",
        "intermediate": "BARUERI",
        "dest": "BRASÍLIA",
        "latency": 24
      }
    },
    "hud": {
      "sceneNumber": "CENA 28",
      "title": "DEEPEN",
      "subtitle": "A DECISÃO PRECISA SAIR ANTES QUE A JANELA DE UM SEGUNDO E QUATROCENTOS MILI...",
      "latencyMs": 93,
      "systemStressPercent": 59,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_029",
    "from": 7170,
    "durationInFrames": 210,
    "voiceover": "Com o escore validado, o motor de risco emite o carimbo de conformidade e libera a compensação no SPI.",
    "chapterId": "CH04",
    "visual": {
      "type": "iso20022_packet",
      "config": {
        "amount": "R$ 1,00",
        "latencyMs": 2.8
      }
    },
    "hud": {
      "sceneNumber": "CENA 29",
      "title": "DEEPEN",
      "subtitle": "COM O ESCORE VALIDADO, O MOTOR DE RISCO EMITE O CARIMBO DE CONFORMIDADE E L...",
      "latencyMs": 96,
      "systemStressPercent": 66,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_030",
    "from": 7380,
    "durationInFrames": 219,
    "voiceover": "Processar dados rápidos é simples. O desafio monumental é saber exatamente quais dados devem ser impedidos de passar.",
    "chapterId": "CH04",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_014/firefly_take.mp4",
        "kenBurns": "pan_right"
      }
    },
    "hud": {
      "sceneNumber": "CENA 30",
      "title": "DEEPEN",
      "subtitle": "PROCESSAR DADOS RÁPIDOS É SIMPLES. O DESAFIO MONUMENTAL É SABER EXATAMENTE ...",
      "latencyMs": 99,
      "systemStressPercent": 73,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_031",
    "from": 7598,
    "durationInFrames": 269,
    "voiceover": "O que acontece quando o mundo físico falha? Uma escavadeira em uma rodovia corta o cabo principal de fibra óptica que conecta São Paulo a Brasília.",
    "chapterId": "CH05",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_031/firefly_take.mp4",
        "kenBurns": "pan_right"
      }
    },
    "hud": {
      "sceneNumber": "CENA 31",
      "title": "DEEPEN",
      "subtitle": "O QUE ACONTECE QUANDO O MUNDO FÍSICO FALHA? UMA ESCAVADEIRA EM UMA RODOVIA ...",
      "latencyMs": 102,
      "systemStressPercent": 80,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_032",
    "from": 7867,
    "durationInFrames": 287,
    "voiceover": "A Rede de Telecomunicações do Mercado opera em topologia de anel redundante. Em menos de quinze milissegundos, o tráfego é desviado por rotas alternativas.",
    "chapterId": "CH05",
    "visual": {
      "type": "research_lapse",
      "config": {
        "query": "BACEN // SPI PROTOCOL // DICT_DIRECTORY",
        "source": "REGISTRO DE LIQUIDAÇÃO"
      }
    },
    "hud": {
      "sceneNumber": "CENA 32",
      "title": "DEEPEN",
      "subtitle": "A REDE DE TELECOMUNICAÇÕES DO MERCADO OPERA EM TOPOLOGIA DE ANEL REDUNDANTE...",
      "latencyMs": 105,
      "systemStressPercent": 87,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_033",
    "from": 8154,
    "durationInFrames": 310,
    "voiceover": "Se faltar eletricidade na rede pública, no-breaks rotativos e usinas de geradores a diesel assumem a carga total dos servidores em menos de dois segundos.",
    "chapterId": "CH05",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_033/firefly_take.mp4",
        "kenBurns": "push_in"
      }
    },
    "hud": {
      "sceneNumber": "CENA 33",
      "title": "DEEPEN",
      "subtitle": "SE FALTAR ELETRICIDADE NA REDE PÚBLICA, NO-BREAKS ROTATIVOS E USINAS DE GER...",
      "latencyMs": 108,
      "systemStressPercent": 94,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_034",
    "from": 8464,
    "durationInFrames": 228,
    "voiceover": "Em dias de Black Friday, o SPI suporta mais de quinze mil transações por segundo através de particionamento dinâmico de banco de dados.",
    "chapterId": "CH05",
    "visual": {
      "type": "iso20022_packet",
      "config": {
        "amount": "R$ 1,00",
        "latencyMs": 2.8
      }
    },
    "hud": {
      "sceneNumber": "CENA 34",
      "title": "DEEPEN",
      "subtitle": "EM DIAS DE BLACK FRIDAY, O SPI SUPORTA MAIS DE QUINZE MIL TRANSAÇÕES POR SE...",
      "latencyMs": 111,
      "systemStressPercent": 26,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_035",
    "from": 8693,
    "durationInFrames": 206,
    "voiceover": "Se um data center inteiro for destruído, o site secundário assume a operação sem perda de um único centavo já processado.",
    "chapterId": "CH05",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_014/firefly_take.mp4",
        "kenBurns": "pan_right"
      }
    },
    "hud": {
      "sceneNumber": "CENA 35",
      "title": "DEEPEN",
      "subtitle": "SE UM DATA CENTER INTEIRO FOR DESTRUÍDO, O SITE SECUNDÁRIO ASSUME A OPERAÇÃ...",
      "latencyMs": 114,
      "systemStressPercent": 33,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_036",
    "from": 8899,
    "durationInFrames": 277,
    "voiceover": "A estabilidade do sistema financeiro não é fruto do acaso; é o resultado de testes contínuos de estresse e tolerância a falhas extremas.",
    "chapterId": "CH05",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_003/firefly_take.mp4",
        "kenBurns": "push_in"
      }
    },
    "hud": {
      "sceneNumber": "CENA 36",
      "title": "DEEPEN",
      "subtitle": "A ESTABILIDADE DO SISTEMA FINANCEIRO NÃO É FRUTO DO ACASO; É O RESULTADO DE...",
      "latencyMs": 117,
      "systemStressPercent": 40,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_037",
    "from": 9175,
    "durationInFrames": 189,
    "voiceover": "Com todas as verificações de contingência aprovadas, a ordem de pagamento recebe a autorização de retorno.",
    "chapterId": "CH05",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_037/firefly_take.mp4",
        "kenBurns": "pan_left"
      }
    },
    "hud": {
      "sceneNumber": "CENA 37",
      "title": "DEEPEN",
      "subtitle": "COM TODAS AS VERIFICAÇÕES DE CONTINGÊNCIA APROVADAS, A ORDEM DE PAGAMENTO R...",
      "latencyMs": 120,
      "systemStressPercent": 47,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_038",
    "from": 9364,
    "durationInFrames": 260,
    "voiceover": "O Banco Central envia a notificação de liquidação concluída para o banco receptor. O saldo é atualizado na conta de destino.",
    "chapterId": "CH06",
    "visual": {
      "type": "cyber_map",
      "config": {
        "origin": "SÃO PAULO",
        "intermediate": "BARUERI",
        "dest": "BRASÍLIA",
        "latency": 24
      }
    },
    "hud": {
      "sceneNumber": "CENA 38",
      "title": "DEEPEN",
      "subtitle": "O BANCO CENTRAL ENVIA A NOTIFICAÇÃO DE LIQUIDAÇÃO CONCLUÍDA PARA O BANCO RE...",
      "latencyMs": 123,
      "systemStressPercent": 54,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_039",
    "from": 9624,
    "durationInFrames": 351,
    "voiceover": "No celular de quem recebeu, surge a notificação: você recebeu uma transferência. O relógio marca exatamente um segundo e quatrocentos milissegundos desde o primeiro clique.",
    "chapterId": "CH06",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_039/firefly_take.mp4",
        "kenBurns": "push_in"
      }
    },
    "hud": {
      "sceneNumber": "CENA 39",
      "title": "DEEPEN",
      "subtitle": "NO CELULAR DE QUEM RECEBEU, SURGE A NOTIFICAÇÃO: VOCÊ RECEBEU UMA TRANSFERÊ...",
      "latencyMs": 126,
      "systemStressPercent": 61,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_040",
    "from": 9975,
    "durationInFrames": 386,
    "voiceover": "Nesse intervalo imperceptível, uma ordem viajou por milhares de quilômetros de fibra, passou por três data centers, consultou centenas de milhões de registros e superou dezenas de testes de fraude.",
    "chapterId": "CH06",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_014/firefly_take.mp4",
        "kenBurns": "pan_right"
      }
    },
    "hud": {
      "sceneNumber": "CENA 40",
      "title": "DEEPEN",
      "subtitle": "NESSE INTERVALO IMPERCEPTÍVEL, UMA ORDEM VIAJOU POR MILHARES DE QUILÔMETROS...",
      "latencyMs": 129,
      "systemStressPercent": 68,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_041",
    "from": 10361,
    "durationInFrames": 308,
    "voiceover": "O produto visível é uma transferência instantânea na palma da mão. Mas o produto invisível é a mais sofisticada engenharia de sincronização do país.",
    "chapterId": "CH06",
    "visual": {
      "type": "firefly_take",
      "config": {
        "media": "editorial/execution/OOL_041/firefly_take.mp4",
        "kenBurns": "pull_out"
      }
    },
    "hud": {
      "sceneNumber": "CENA 41",
      "title": "PARTIAL_PAYOFF",
      "subtitle": "O PRODUTO VISÍVEL É UMA TRANSFERÊNCIA INSTANTÂNEA NA PALMA DA MÃO. MAS O PR...",
      "latencyMs": 12,
      "systemStressPercent": 75,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  },
  {
    "id": "OOL_042",
    "from": 10669,
    "durationInFrames": 179,
    "voiceover": "O que acontece depois que você clica, compra, liga ou aperta? Esse é o outro lado.",
    "chapterId": "CH06",
    "visual": {
      "type": "research_lapse",
      "config": {
        "query": "BACEN // SPI PROTOCOL // DICT_DIRECTORY",
        "source": "REGISTRO DE LIQUIDAÇÃO"
      }
    },
    "hud": {
      "sceneNumber": "CENA 42",
      "title": "REFRAME",
      "subtitle": "O QUE ACONTECE DEPOIS QUE VOCÊ CLICA, COMPRA, LIGA OU APERTA? ESSE É O OUTR...",
      "latencyMs": 15,
      "systemStressPercent": 82,
      "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
    }
  }
];
