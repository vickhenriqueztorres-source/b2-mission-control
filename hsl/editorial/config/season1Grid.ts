export interface SeasonEpisodeDefinition {
  readonly episodeNumber: number;
  readonly title: string;
  readonly subtitle: string;
  readonly movingUnit: string;
  readonly enablingSystem: string;
  readonly operationalBottleneck: string;
  readonly category: 'Dinheiro & Telecom' | 'Logística & Cargas' | 'Recursos & Energia' | 'Mecânica Urbana';
  readonly durationTargetMinutes: number;
}

export const OUTRO_LADO_SEASON_1: readonly SeasonEpisodeDefinition[] = [
  {
    episodeNumber: 1,
    title: 'O Outro Lado do Pix',
    subtitle: 'O que acontece em 1,4 segundo antes do dinheiro cair na conta',
    movingUnit: 'R$ 1,00 (transação financeira instantânea)',
    enablingSystem: 'Rede SPB, CIP, BACEN (Sistema de Pagamentos Instantâneos - SPI) e Nuvem bancária',
    operationalBottleneck: 'Janela de 1,4s, latência de rede, motor de antifraude e liquidação bruta em tempo real',
    category: 'Dinheiro & Telecom',
    durationTargetMinutes: 12
  },
  {
    episodeNumber: 2,
    title: 'O Outro Lado da Sua Encomenda',
    subtitle: 'A jornada de um pacote de R$ 30 da China até sua porta',
    movingUnit: '1 pacote de R$ 30,00',
    enablingSystem: 'Navios cargueiros, Porto de Santos / Viracopos, esteiras de raio-X de Curitiba e malha rodoviária',
    operationalBottleneck: 'Desembaraço aduaneiro da Receita Federal e logística de última milha (last mile)',
    category: 'Logística & Cargas',
    durationTargetMinutes: 14
  },
  {
    episodeNumber: 3,
    title: 'O Outro Lado da Tomada',
    subtitle: 'O caminho da energia de Itaipu até a lâmpada da sua sala',
    movingUnit: '1 kWh / fluxo contínuo de elétrons',
    enablingSystem: 'Usina Hidrelétrica de Itaipu, linhas de transmissão de 765 kV, subestações e ONS',
    operationalBottleneck: 'Equilíbrio instantâneo de frequência (60 Hz) e capacidade térmica das linhas',
    category: 'Recursos & Energia',
    durationTargetMinutes: 13
  },
  {
    episodeNumber: 4,
    title: 'O Outro Lado do WhatsApp',
    subtitle: 'Por onde viaja uma mensagem de texto antes de ser entregue',
    movingUnit: '1 pacote de dados criptografado (mensagem de texto)',
    enablingSystem: 'Antenas de telefonia, backhaul de fibra óptica, cabos submarinos e data centers',
    operationalBottleneck: 'Roteamento BGP, saturação de fibra submarina e sincronização de chaves ponta a ponta',
    category: 'Dinheiro & Telecom',
    durationTargetMinutes: 11
  },
  {
    episodeNumber: 5,
    title: 'O Outro Lado do Porto de Santos',
    subtitle: 'Como um contêiner não se perde entre 100 mil caixas',
    movingUnit: '1 contêiner TEU (20 pés)',
    enablingSystem: 'Canal de navegação, guindastes STS, pátios automatizados (TOS) e modal ferroviário/rodoviário',
    operationalBottleneck: 'Calado do canal de navegação, filas de atracação e tempo de giro de pátio',
    category: 'Logística & Cargas',
    durationTargetMinutes: 14
  },
  {
    episodeNumber: 6,
    title: 'O Outro Lado da Descarga',
    subtitle: 'O sistema subterrâneo que impede uma metrópole de colapsar',
    movingUnit: '1 litro de efluente / esgoto residencial',
    enablingSystem: 'Tubulações por gravidade, estações elevatórias de esgoto, interceptores e ETEs',
    operationalBottleneck: 'Capacidade volumétrica de bombeamento em dias de chuva e digestão bacteriana',
    category: 'Mecânica Urbana',
    durationTargetMinutes: 12
  },
  {
    episodeNumber: 7,
    title: 'O Outro Lado da Bomba de Combustível',
    subtitle: 'De onde vem a gasolina que abastece o país',
    movingUnit: '1 litro de gasolina',
    enablingSystem: 'Plataformas offshore pré-sal, oleodutos Transpetro, refinarias e bases de distribuição',
    operationalBottleneck: 'Capacidade de craqueamento catalítico e tancagem nas distribuidoras',
    category: 'Recursos & Energia',
    durationTargetMinutes: 13
  },
  {
    episodeNumber: 8,
    title: 'O Outro Lado do Supermercado',
    subtitle: 'Como a comida fresca cruza 3.000 km de estrada sem estragar',
    movingUnit: '1 caixa de alimentos frescos (hortifrúti / proteína)',
    enablingSystem: 'Cadeia de frio (Cold Chain), caminhões frigoríficos, CEASAs e centros de distribuição',
    operationalBottleneck: 'Quebra de temperatura, malha asfáltica precária e perecibilidade biológica',
    category: 'Logística & Cargas',
    durationTargetMinutes: 13
  },
  {
    episodeNumber: 9,
    title: 'O Outro Lado do 5G',
    subtitle: 'A infraestrutura física invisível por trás da internet móvel',
    movingUnit: '1 onda milimétrica de radiofrequência',
    enablingSystem: 'Small cells urbanas, postes inteligentes, anéis de fibra subterrânea e Core 5G SA',
    operationalBottleneck: 'Atenuação por obstáculos físicos (paredes/chuva) e densidade de postes por km²',
    category: 'Dinheiro & Telecom',
    durationTargetMinutes: 12
  },
  {
    episodeNumber: 10,
    title: 'O Outro Lado da Torneira',
    subtitle: 'Como a água sobe até o 20º andar dos prédios sem estourar os canos',
    movingUnit: '1 litro de água tratada',
    enablingSystem: 'Represas, Estações de Tratamento de Água (ETA), adutoras de pressão e bombas de recalque prediais',
    operationalBottleneck: 'Válvulas redutoras de pressão contra golpe de aríete e perdas físicas na rede',
    category: 'Mecânica Urbana',
    durationTargetMinutes: 12
  }
] as const;
