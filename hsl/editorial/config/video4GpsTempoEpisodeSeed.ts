import { HslEpisodeSeed, HslEditorialSceneSeed } from '../types/editorial';

export interface GpsChapterDef {
  chapter_id: string;
  title: string;
  focus: string;
  scenes: Array<{
    scene_id: string;
    name: string;
    narrative_function: string;
    visual_subject: string;
    voiceover_text: string;
  }>;
}

export const GPS_TEMPO_CHAPTERS: GpsChapterDef[] = [
  {
    chapter_id: 'CH01',
    title: 'O Mito do Mapa & O Clique Invisível',
    focus: 'Desconstrução da ilusão do GPS como navegador e revelação do seu papel como relógio mestre da sociedade.',
    scenes: [
      {
        scene_id: 'OOL_001',
        name: 'O Mito da Localização',
        narrative_function: 'hook',
        visual_subject: 'Smartphone com aplicativo de mapa aberto em close-up 35mm em mesa de centro de comando escuro',
        voiceover_text: 'Quando você abre o mapa no celular para pedir um carro ou conferir uma rota, quase todo mundo imagina que um satélite no espaço está olhando para você.'
      },
      {
        scene_id: 'OOL_002',
        name: 'A Realidade Invertida',
        narrative_function: 'reframe',
        visual_subject: 'Câmara anecoica escura com antena GPS recebendo ondas de rádio ultrafracas com telemetria neon',
        voiceover_text: 'Mas a realidade é exatamente o oposto: os satélites de GPS não fazem ideia de onde você está. Eles não recebem nada. Eles apenas gritam as horas.'
      },
      {
        scene_id: 'OOL_003',
        name: 'O Experimento Mental do Desligamento',
        narrative_function: 'escalation',
        visual_subject: 'Tráfego urbano fluindo na penumbra sob viadutos iluminados por vapor de sódio enquanto painéis eletrônicos piscam',
        voiceover_text: 'Se a constelação inteira de satélites fosse desligada agora, os carros continuariam andando pelas ruas com mapas salvos na memória.'
      },
      {
        scene_id: 'OOL_004',
        name: 'O Colapso Invisível',
        narrative_function: 'crisis',
        visual_subject: 'Servidores bancários em rack industrial com leds vermelhos de erro em sala de alta segurança',
        voiceover_text: 'Porém, em menos de dez minutos, o sistema bancário global travaria, transações de Pix seriam rejeitadas e as antenas de telefonia celular entrariam em colapso.'
      },
      {
        scene_id: 'OOL_005',
        name: 'A Fundação da Civilização',
        narrative_function: 'revelation',
        visual_subject: 'Relógio atômico de Césio industrial com display digital marcando nanossegundos em laser azul',
        voiceover_text: 'Porque o GPS não é um sistema de localização. Ele é o relógio mestre sobre o qual toda a economia digital do planeta foi construída.'
      },
      {
        scene_id: 'OOL_006',
        name: 'O Nanossegundo',
        narrative_function: 'quantification',
        visual_subject: 'Gráfico cibernético de onda senoidal perfeita de alta frequência cruzando o leito escuro da tela',
        voiceover_text: 'Cada fração de segundo da vida moderna está ancorada em uma unidade invisível: o nanossegundo, a bilionésima parte de um segundo.'
      },
      {
        scene_id: 'OOL_007',
        name: 'A Conexão Oculta',
        narrative_function: 'bridge',
        visual_subject: 'Cabo coaxial blindado conectado a uma antena de telhado em centro financeiro na noite chuvosa',
        voiceover_text: 'E a história desse mecanismo começa a mais de vinte mil quilômetros de altitude, no vácuo congelante da órbita da Terra.'
      },
      {
        scene_id: 'OOL_008',
        name: 'O Início da Viagem',
        narrative_function: 'transition',
        visual_subject: 'Satélite GPS Block III em órbita média com a curvatura da Terra no horizonte escuro',
        voiceover_text: 'Onde trinta e um satélites executam silenciosamente a coreografia mais precisa já concebida pela engenharia humana.'
      }
    ]
  },
  {
    chapter_id: 'CH02',
    title: 'A Constelação Orbital & A Física do Tempo',
    focus: 'Funcionamento técnico da constelação GPS, relógios atômicos de Césio e trilateração esférica temporal.',
    scenes: [
      {
        scene_id: 'OOL_009',
        name: 'A Órbita Média',
        narrative_function: 'explain_map',
        visual_subject: 'Modelo 3D orbital com planos inclinados a 55 graus envolvendo o globo terrestre',
        voiceover_text: 'A constelação GPS opera em órbita média a vinte mil e duzentos quilômetros de altitude, completando duas voltas completas no planeta a cada dia.'
      },
      {
        scene_id: 'OOL_010',
        name: 'O Coração Atômico',
        narrative_function: 'hardware_reveal',
        visual_subject: 'Interior blindado de um satélite revelando o módulo do relógio atômico de Césio-133',
        voiceover_text: 'No coração de cada satélite existem relógios atômicos de Césio e Rubídio que não usam engrenagens nem cristais de quartzo comuns.'
      },
      {
        scene_id: 'OOL_011',
        name: 'A Frequência Imutável',
        narrative_function: 'physical_law',
        visual_subject: 'Esquema quântico do átomo de Césio transicionando entre estados hiperfinos sob laser',
        voiceover_text: 'Eles medem a oscilação quântica do átomo de Césio cento e trinta e três, que vibra exatamente nove bilhões, cento e noventa e dois milhões de vezes por segundo.'
      },
      {
        scene_id: 'OOL_012',
        name: 'A Mensagem de Rádio',
        narrative_function: 'signal_flow',
        visual_subject: 'Transmissor de micro-ondas emitindo pulsos eletromagnéticos em frequência L1 de 1575 MHz',
        voiceover_text: 'O satélite não envia sua posição geográfica. Ele transmite apenas um pacote de rádio dizendo a sua hora atômica exata e de qual satélite ela veio.'
      },
      {
        scene_id: 'OOL_013',
        name: 'A Viagem na Velocidade da Luz',
        narrative_function: 'propagation',
        visual_subject: 'Pulsos de rádio esféricos descendo da órbita e atravessando as camadas da atmosfera',
        voiceover_text: 'Esse sinal viaja pelo vácuo na velocidade da luz: quase trezentos mil quilômetros por segundo, levando cerca de sessenta e sete milissegundos para tocar a superfície.'
      },
      {
        scene_id: 'OOL_014',
        name: 'A Matemática da Distância',
        narrative_function: 'equation',
        visual_subject: 'Fórmula física D igual a C vezes Delta T projetada em vidro transparente com luz ciano',
        voiceover_text: 'Ao medir a diferença infinitesimal entre a hora em que o sinal saiu do satélite e a hora em que chegou, o seu aparelho calcula a distância exata.'
      },
      {
        scene_id: 'OOL_015',
        name: 'Trilateração Esférica',
        narrative_function: 'geometry',
        visual_subject: 'Interseção de quatro esferas geométricas tridimensionais no espaço convergindo em um ponto único',
        voiceover_text: 'Com quatro satélites visíveis simultaneamente, as quatro esferas temporais se cruzam em um único ponto geométrico no espaço e no tempo.'
      },
      {
        scene_id: 'OOL_016',
        name: 'A Quarta Dimensão',
        narrative_function: 'insight',
        visual_subject: 'Diagrama de grade espaço-temporal quadridimensional com coordenadas X, Y, Z e T',
        voiceover_text: 'Três satélites calculam latitude, longitude e altitude. O quarto satélite existe exclusivamente para sincronizar o relógio barato do seu celular com os relógios atômicos orbitais.'
      }
    ]
  },
  {
    chapter_id: 'CH03',
    title: 'A Jornada do Nanossegundo: Dos Satélites a Wall Street e à Faria Lima',
    focus: 'Como a sincronização temporal governa servidores de alta frequência, transações bancárias e antenas 5G.',
    scenes: [
      {
        scene_id: 'OOL_017',
        name: 'A Chegada na Terra',
        narrative_function: 'ground_station',
        visual_subject: 'Antena de recepção GPS de alta precisão em topo de arranha-céu financeiro sob neblina',
        voiceover_text: 'Na superfície, o sinal atômico que desce do espaço com a potência de uma lâmpada fraca é capturado por receptores industriais em telhados de centros de dados.'
      },
      {
        scene_id: 'OOL_018',
        name: 'A Sala dos Servidores',
        narrative_function: 'datacenter',
        visual_subject: 'Corredor escuro de data center refrigerado com cabos de fibra óptica laranjas brilhando sob luz de leds',
        voiceover_text: 'Dentro das salas de servidores da B3 em São Paulo e de Wall Street em Nova York, o tempo precisa ser absoluto.'
      },
      {
        scene_id: 'OOL_019',
        name: 'Alta Frequência Financeira',
        narrative_function: 'trading_flow',
        visual_subject: 'Telas de negociação de ações processando milhões de ordens financeiras em nanossegundos',
        voiceover_text: 'Robôs de negociação de alta frequência compram e vendem ativos em frações de microssegundos. Quem chega primeiro, lucra.'
      },
      {
        scene_id: 'OOL_020',
        name: 'O Perigo da Duplicidade',
        narrative_function: 'financial_risk',
        visual_subject: 'Livro de ofertas de bolsa de valores com carimbo de timestamp colidindo em milissegundos',
        voiceover_text: 'Se dois bancos tiverem uma discrepância de apenas um microssegundo em seus relógios, é impossível saber qual ordem entrou primeiro no mercado.'
      },
      {
        scene_id: 'OOL_021',
        name: 'O Carimbo do Pix',
        narrative_function: 'pix_mechanism',
        visual_subject: 'Interface bancária processando transação instantânea com carimbo temporal criptográfico',
        voiceover_text: 'O mesmo princípio rege o Pix: cada transação precisa de um carimbo temporal inviolável para garantir que o dinheiro não foi gasto duas vezes simultaneamente.'
      },
      {
        scene_id: 'OOL_022',
        name: 'O Protocolo PTP',
        narrative_function: 'network_protocol',
        visual_subject: 'Placa de rede de fibra óptica com chip de temporização PTP IEEE 1588 brilhando em macro',
        voiceover_text: 'Esse alinhamento é feito pelo protocolo de tempo de precisão, que distribui o sinal do GPS para cada processador com tolerância menor que dez nanossegundos.'
      },
      {
        scene_id: 'OOL_023',
        name: 'As Antenas 5G',
        narrative_function: 'telecom_sync',
        visual_subject: 'Torre de transmissão 5G em close-up emitindo feixes direcionais com visualização de ondas',
        voiceover_text: 'E nas telecomunicações, as antenas de cinco G dependem dessa mesma sincronia para enviar múltiplos feixes de dados sem que um feixe destrua o outro por interferência.'
      },
      {
        scene_id: 'OOL_024',
        name: 'A Teia Invisível',
        narrative_function: 'macro_system',
        visual_subject: 'Visão noturna aérea de uma metrópole conectada por linhas de luz que pulsam em uníssono',
        voiceover_text: 'Sem que ninguém perceba, toda a infraestrutura física de pagamentos, energia e internet pulsa no mesmo compasso vindo do espaço.'
      },
      {
        scene_id: 'OOL_025',
        name: 'O Inimigo Oculto',
        narrative_function: 'transition_to_bottleneck',
        visual_subject: 'Ilustração conceitual do espaço-tempo curvo de Einstein ao redor do planeta Terra',
        voiceover_text: 'Mas manter esse compasso perfeito esbarra em um dos maiores obstáculos da física fundamental: as leis do próprio universo.'
      }
    ]
  },
  {
    chapter_id: 'CH04',
    title: 'O Gargalo de Einstein: O Erro de 38 Microssegundos que Quebraria o Planeta',
    focus: 'A relatividade especial e geral de Einstein alterando a passagem do tempo na órbita e o erro acumulado.',
    scenes: [
      {
        scene_id: 'OOL_026',
        name: 'O Paradoxo do Tempo',
        narrative_function: 'physics_hook',
        visual_subject: 'Dois relógios conceituais idênticos, um no solo e outro na órbita, começando a dessincronizar',
        voiceover_text: 'Quando o primeiro satélite experimental foi lançado, muitos engenheiros duvidavam que a teoria da relatividade de Einstein afetaria sistemas práticos de engenharia.'
      },
      {
        scene_id: 'OOL_027',
        name: 'A Relatividade Especial',
        narrative_function: 'special_relativity',
        visual_subject: 'Satélite se deslocando velozmente a quatorze mil quilômetros por hora na escuridão orbital',
        voiceover_text: 'Pela Relatividade Especial, corpos em alta velocidade experimentam o tempo mais devagar. A quatorze mil quilômetros por hora, o relógio do satélite perde sete microssegundos por dia.'
      },
      {
        scene_id: 'OOL_028',
        name: 'A Relatividade Geral',
        narrative_function: 'general_relativity',
        visual_subject: 'Curvatura da gravidade da Terra distorcendo a malha do espaço-tempo em visualização chiaroscuro',
        voiceover_text: 'Porém, pela Relatividade Geral, a gravidade desacelera o tempo. A vinte mil quilômetros de altitude, a gravidade é quatro vezes mais fraca, e o tempo no satélite passa mais rápido.'
      },
      {
        scene_id: 'OOL_029',
        name: 'O Saldo Relativístico',
        narrative_function: 'calculation',
        visual_subject: 'Cálculo matemático na tela: mais quarenta e cinco vírgula nove menos sete vírgula dois igual a mais trinta e oito vírgula sete microssegundos',
        voiceover_text: 'Somando os dois efeitos, o relógio atômico no espaço anda exatamente trinta e oito vírgula sete microssegundos mais rápido a cada vinte e quatro horas.'
      },
      {
        scene_id: 'OOL_030',
        name: 'A Escala do Desastre',
        narrative_function: 'consequence',
        visual_subject: 'Ponteiro de radar expandindo um círculo de erro geométrico sobre o mapa da América do Sul',
        voiceover_text: 'Trinta e oito microssegundos parece nada para um ser humano. Mas na velocidade da luz, trinta e oito microssegundos equivalem a mais de onze quilômetros de erro a cada dia.'
      },
      {
        scene_id: 'OOL_031',
        name: 'O Colapso do Posicionamento',
        narrative_function: 'map_drift',
        visual_subject: 'Ponto de localização em mapa digital derivando quilômetros para dentro do oceano em velocidade acelerada',
        voiceover_text: 'Em uma semana, o seu celular erraria a sua posição por quase cem quilômetros, tornando qualquer rota ou pouso por instrumentos completamente impossível.'
      },
      {
        scene_id: 'OOL_032',
        name: 'O Colapso Financeiro',
        narrative_function: 'financial_rejection',
        visual_subject: 'Terminal financeiro rejeitando blocos de dados com alerta vermelho de carimbo temporal inválido',
        voiceover_text: 'E nos bancos, transações financeiras com carimbos futuros ou passados seriam sumariamente descartadas por firewalls de auditoria.'
      },
      {
        scene_id: 'OOL_033',
        name: 'A Solução dos Físicos',
        narrative_function: 'engineering_solution',
        visual_subject: 'Placa controladora com chip sintetizador alterando a frequência base de dez vírgula vinte e três megahertz',
        voiceover_text: 'Para resolver isso, os cientistas programaram os sintetizadores dos satélites para vibrar ligeiramente mais devagar na fábrica, compensando a relatividade com perfeição milimétrica.'
      },
      {
        scene_id: 'OOL_034',
        name: 'A Fragilidade do Ajuste',
        narrative_function: 'vulnerability',
        visual_subject: 'Gráfico de desvio de frequência exigindo correções diárias via link de telemetria terrestre',
        voiceover_text: 'Mas a física não é o único desafio. Manter esse castelo de cartas de pé exige um exército de estações terrestres corrigindo o sistema vinte e quatro horas por dia.'
      }
    ]
  },
  {
    chapter_id: 'CH05',
    title: 'A Sala de Controle & As Redes Terrestres de Redundância',
    focus: 'Estações de controle terrestre, o Observatório Nacional e a defesa contra ataques de interferência e spoofing.',
    scenes: [
      {
        scene_id: 'OOL_035',
        name: 'A Sala de Controle Mestre',
        narrative_function: 'military_base',
        visual_subject: 'Sala de operações blindada da Base Espacial de Schriever com consoles iluminados e operadores',
        voiceover_text: 'No interior de uma base fortificada no Colorado, o Segundo Esquadrão de Operações Espaciais monitora cada pulso dos trinta e um satélites.'
      },
      {
        scene_id: 'OOL_036',
        name: 'A Correção Diária',
        narrative_function: 'telemetry_upload',
        visual_subject: 'Antena parabólica maciça apontada para o céu transmitindo sinal de calibração em feixe de luz',
        voiceover_text: 'Pelo menos uma vez ao dia, estações de controle enviam comandos de correção para ajustar o arrasto atmosférico e o desvio residual dos relógios atômicos.'
      },
      {
        scene_id: 'OOL_037',
        name: 'A Hora Legal Brasileira',
        narrative_function: 'national_observatory',
        visual_subject: 'Laboratório estéril do Observatório Nacional no Rio de Janeiro com banco de relógios de Césio',
        voiceover_text: 'No Brasil, o Observatório Nacional mantém os padrões primários da Hora Legal Brasileira, comparando dados com laboratórios de metrologia em todo o mundo.'
      },
      {
        scene_id: 'OOL_038',
        name: 'A Ameaça do Jamming',
        narrative_function: 'electronic_warfare',
        visual_subject: 'Dispositivo transmissor portátil gerando ruído eletromagnético que apaga sinal de recepção',
        voiceover_text: 'No entanto, o sinal do GPS chega à Terra tão fraco quanto a luz de uma vela vista a quilômetros de distância, tornando-o vulnerável a interferência proposital.'
      },
      {
        scene_id: 'OOL_039',
        name: 'O Ataque de Spoofing',
        narrative_function: 'spoofing_attack',
        visual_subject: 'Display de navegação marítima mostrando navio no meio da pista de um aeroporto devido a sinal falso',
        voiceover_text: 'Com transmissores de spoofing, atacantes conseguem transmitir sinais falsificados mais fortes, enganando navios e aviões sobre sua localização e sobre a própria hora certa.'
      },
      {
        scene_id: 'OOL_040',
        name: 'A Corrida por Alternativas',
        narrative_function: 'terrestrial_backup',
        visual_subject: 'Cabo de fibra óptica subterrâneo transmitindo sinal óptico de tempo em laboratório de alta precisão',
        voiceover_text: 'Por essa razão, bancos centrais e setores de defesa estão construindo redes terrestres de fibra óptica com relógios atômicos locais para não dependerem exclusivamente do céu.'
      },
      {
        scene_id: 'OOL_041',
        name: 'A Rede Resiliente',
        narrative_function: 'redundancy_architecture',
        visual_subject: 'Diagrama em malha combinando satélites, fibra óptica e relógios atômicos locais em camadas de redundância',
        voiceover_text: 'Camadas de backup que garantem que, mesmo em caso de tempestades solares severas ou conflitos geopolíticos, o carimbo temporal continue existindo.'
      },
      {
        scene_id: 'OOL_042',
        name: 'O Ponto de Virada',
        narrative_function: 'transition_to_conclusion',
        visual_subject: 'Placa de circuito em close-up com luz azul pulsando através de condutores de ouro puro',
        voiceover_text: 'Revelando a verdadeira dimensão de uma infraestrutura que opera em silêncio absoluto abaixo dos nossos olhos.'
      }
    ]
  },
  {
    chapter_id: 'CH06',
    title: 'Conclusão Causal: A Infraestrutura Mais Frágil da Terra',
    focus: 'Síntese causal, impacto existencial da temporização e encerramento reflexivo do episódio.',
    scenes: [
      {
        scene_id: 'OOL_043',
        name: 'A Ilusão do Concreto',
        narrative_function: 'synthesis',
        visual_subject: 'Arranha-céus de concreto e vidro em centro urbano moderno sob luz crepuscular chiaroscuro',
        voiceover_text: 'Nós nos acostumamos a pensar que a civilização moderna é feita de pontes de aço, edifícios de concreto e cabos de fibra óptica.'
      },
      {
        scene_id: 'OOL_044',
        name: 'A Realidade Imaterial',
        narrative_function: 'deep_reframe',
        visual_subject: 'Ponto luminoso isolado de um satélite cortando o céu estrelado profundo',
        voiceover_text: 'Mas a verdade física é que todo esse ecossistema material depende de uma abstração invisível transmitida por trinta e um pontos brilhantes no céu.'
      },
      {
        scene_id: 'OOL_045',
        name: 'O Preço da Sincronia',
        narrative_function: 'philosophical_truth',
        visual_subject: 'Milhões de pessoas interagindo com celulares, cartões e terminais em uma estação ferroviária movimentada',
        voiceover_text: 'Para que milhões de pessoas possam pagar um café, enviar uma mensagem ou se deslocar em segurança ao mesmo tempo, todos os relógios precisam concordar a cada bilionésimo de segundo.'
      },
      {
        scene_id: 'OOL_046',
        name: 'O Triunfo de Einstein',
        narrative_function: 'scientific_tribute',
        visual_subject: 'Retrato conceitual estilizado de Einstein integrado à telemetria orbital em luz monocromática',
        voiceover_text: 'O mesmo cálculo que parecia uma teoria abstrata no início do século vinte é hoje a única coisa que impede o seu banco de falhar.'
      },
      {
        scene_id: 'OOL_047',
        name: 'A Fragilidade do Tempo',
        narrative_function: 'existential_warning',
        visual_subject: 'Vela acesa na escuridão profunda com a chama oscilando suavemente em câmera lenta',
        voiceover_text: 'O tempo não é um fluxo natural e garantido. No mundo digital, ele é uma engenharia frágil, cara e constantemente mantida à beira do descompasso.'
      },
      {
        scene_id: 'OOL_048',
        name: 'O Próximo Clique',
        narrative_function: 'audience_reconnection',
        visual_subject: 'Dedo tocando a tela de um smartphone moderno com o reflexo da cidade nas lentes',
        voiceover_text: 'Da próxima vez que você abrir um aplicativo ou confirmar um pagamento em um segundo, lembre-se do que está acontecendo acima da sua cabeça.'
      },
      {
        scene_id: 'OOL_049',
        name: 'A Máquina Cósmica',
        narrative_function: 'closing_hero',
        visual_subject: 'A Terra inteira vista da órbita com a rede de trinta e um satélites traçando linhas de tempo perfeitas',
        voiceover_text: 'Trinta e um relógios atômicos no vácuo, corrigindo a gravidade de Einstein para que o mundo na Terra não pare de girar.'
      },
      {
        scene_id: 'OOL_050',
        name: 'Encerramento O Outro Lado',
        narrative_function: 'brand_outro',
        visual_subject: 'Logotipo O Outro Lado revelado em preto carbono com linha laser laranja vapor de sódio #FF5500',
        voiceover_text: 'Este é o outro lado do tempo. O sistema invisível que sustenta a sua realidade.'
      }
    ]
  }
];

const flatScenes: HslEditorialSceneSeed[] = GPS_TEMPO_CHAPTERS.flatMap(ch =>
  ch.scenes.map(sc => ({
    scene_id: sc.scene_id,
    chapter_id: ch.chapter_id,
    chapter_title: ch.title,
    narrative_function: sc.narrative_function,
    voiceover: sc.voiceover_text,
    visual_mode: 'generated_ai' as const,
    visual_subject: sc.visual_subject,
    claim_source_ids: ['GPS-RELATIVITY-DOC-2026'],
    visual_function: 'invisible_process' as const
  }))
);

export const VIDEO4_GPS_TEMPO_SEED: HslEpisodeSeed = {
  episode_id: 'OOL-EP04-GPS-TEMPO',
  title: 'O Outro Lado do GPS: O Relógio Atômico que Evita o Colapso dos Bancos',
  format: 'SYSTEM_ANATOMY',
  target_duration_minutes: 7.5,
  central_question: 'Se o GPS não é um mapa, mas um relógio atômico, o que acontece se o tempo no espaço desviar 38 microssegundos?',
  thesis: 'A economia digital, redes bancárias e 5G não usam satélites para navegação, mas como relógios atômicos ultraprecisos que corrigem a relatividade de Einstein.',
  object_or_flow: 'Pulsos de tempo atômico transmitidos a 20.000 km de altitude sincronizando carimbos de transações financeiras na Terra',
  system_being_analyzed: 'Constelação GPS, Relógios Atômicos de Césio-133, Protocolo PTP e Redes de Liquidação Financeira',
  main_constraint: 'Correção diária obrigatória de +38.7 microssegundos gerada pela dilatação temporal relativística',
  primary_consequence: 'Erro de 11.6 km por dia e invalidação total de transações bancárias e blocos de rede 5G',
  hero_visual: 'Cavidade de micro-ondas de relógio atômico de Césio pulsando em laser azul na penumbra com telemetria ciano',
  original_interpretation: 'O GPS é a infraestrutura mais vulnerável e invisível do planeta, ancorando a sociedade não no espaço, mas no tempo atômico.',
  counterargument_or_limitation: 'Mesmo com relógios atômicos locais de backup, o isolamento prolongado do sinal GPS gera deriva cumulativa no sistema financeiro.',
  sources: [
    {
      source_id: 'GPS-RELATIVITY-DOC-2026',
      category: 'technical',
      url: 'https://link.springer.com/article/10.12942/lrr-2003-1',
      accessed_at: '2026-08-27',
      claims: ['Relativistic time dilation causes +38.7 microseconds per day drift in GPS clocks'],
      limitations: ['Requires daily terrestrial monitoring and correction']
    }
  ],
  scenes: flatScenes,
  human_approval_status: 'APPROVED'
};
