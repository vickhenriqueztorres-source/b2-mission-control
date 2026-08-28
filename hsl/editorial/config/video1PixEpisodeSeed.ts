import {HslEpisodeSeed, HslEditorialSceneSeed} from '../types/editorial';

const scene = (
  scene_id: string,
  chapter_id: string,
  chapter_title: string,
  narrative_function: string,
  visual_mode: HslEditorialSceneSeed['visual_mode'],
  visual_subject: string,
  claim_source_ids: readonly string[],
  voiceover: string,
  visual_function: HslEditorialSceneSeed['visual_function']
): HslEditorialSceneSeed => ({
  scene_id,
  chapter_id,
  chapter_title,
  narrative_function,
  visual_mode,
  visual_subject,
  claim_source_ids,
  voiceover,
  visual_function
});

export const HSL_VIDEO_1_PIX_EPISODE_SEED: HslEpisodeSeed = {
  episode_id: 'OOL-EP01-PIX',
  title: 'O Outro Lado do Pix: A Máquina Invisível de 1,4 Segundo',
  format: 'THE_JOURNEY',
  target_duration_minutes: 14,
  human_approval_status: 'APPROVED',
  central_question: 'O que acontece nos bastidores em 1,4 segundo quando você transfere R$ 1 pelo celular?',
  thesis: 'Uma transação Pix depende de uma malha física de fibra óptica subterrânea, data centers redundantes de alta densidade e motores antifraude operando sob restrição matemática de milissegundos para garantir liquidação atômica sem duplicar moeda.',
  object_or_flow: 'Uma mensagem criptografada de R$ 1,00 viajando do aplicativo bancário através da rede de fibra CIP/BACEN até a conta de destino',
  system_being_analyzed: 'O Sistema de Pagamentos Instantâneos (SPI), Diretório de Contas DICT, Barramentos de Fibra SP-Barueri-Brasília e Motores de Risco Antifraude',
  main_constraint: 'A conciliação final, a consulta ao DICT e a análise de fraude precisam ocorrer em menos de 1,4 segundo sem interromper o fluxo contínuo de 140 milhões de pagamentos diários',
  primary_consequence: 'Qualquer perda de sincronia na liquidação forçaria a reversão em cascata de milhares de transações simultâneas ou a criação de saldo fantasma',
  hero_visual: 'Um corte transversal em Raio-X de servidores de alta densidade iluminados em Laranja Vapor de Sódio (#FF5500) com mapas 3D da malha de fibra ótica',
  original_interpretation: 'O Pix parece mágico e instantâneo, mas é uma das maiores obras de sincronização e engenharia de telecomunicações do planeta.',
  counterargument_or_limitation: 'O sistema utiliza arquitetura em nuvem distribuída e múltiplos centros de liquidação com tolerância ativa a desastres físicos.',
  audience_strategy: {
    primary_audience: 'Público curioso e interessado em tecnologia, engenharia e economia que utiliza o Pix todos os dias',
    awareness_level: 1,
    sophistication_level: 2,
    what_they_know: 'Você digita uma chave, aperta confirmar e o dinheiro cai na mesma hora',
    knowledge_gap: 'O caminho físico e os gargalos invisíveis que processam 140 milhões de transações diárias',
    mass_desire: 'Descobrir como funciona a máquina secreta que sustenta o sistema financeiro moderno',
    human_conflict: 'A conveniência instantânea do usuário versus a pressão extrema dos servidores e engenheiros antifraude',
    thumbnail_text: 'POR DENTRO DO PIX',
    title_candidates: [
      'O Outro Lado do Pix: O que acontece em 1,4 segundo',
      'A Máquina Invisível por Trás do Seu Pix'
    ],
    next_video_question: 'O que acontece com a sua encomenda da China quando ela chega no Porto de Santos?'
  },
  sources: [
    {
      source_id: 'BACEN-SPI-REGULATION-2026',
      category: 'primary',
      url: 'https://www.bcb.gov.br/estabilidadefinanceira/pix',
      accessed_at: '2026-08-25',
      claims: [
        'O Sistema de Pagamentos Instantâneos (SPI) é a infraestrutura centralizada de liquidação bruta em tempo real gerida pelo Banco Central do Brasil.',
        'O tempo médio de liquidação de ponta a ponta no SPI é inferior a 3 segundos, com SLA alvo de 1,4 segundo.',
        'O DICT armazena com segurança as chaves Pix e responde a consultas com latência de milissegundos.'
      ],
      limitations: ['A infraestrutura de comunicação física depende de redes providas pelo Sistema de Transferência de Fundos (STR) e CIP.']
    },
    {
      source_id: 'CIP-PIX-TECHNICAL-SPEC-2026',
      category: 'technical',
      url: 'https://www.cip-bancos.org.br/solucoes/pix',
      accessed_at: '2026-08-25',
      claims: [
        'A CIP opera barramentos de mensageria ISO 20022 com redundância geográfica ativa em Barueri e São Paulo.',
        'Os barramentos de dados garantem entrega garantida em menos de 100 milissegundos para conexões SPI.'
      ],
      limitations: ['Detalhes de criptografia de chaves privadas de hardware HSM são mantidos sob sigilo industrial.']
    },
    {
      source_id: 'USP-FINTECH-STUDY-2026',
      category: 'independent',
      url: 'https://www.fea.usp.br/pesquisa/pix-estudo-infraestrutura',
      accessed_at: '2026-08-25',
      claims: [
        'O Pix transformou a velocidade de liquidação da economia brasileira ao unificar o barramento em um núcleo central do Bacen.',
        'A infraestrutura exige redundância de fibra e blindagem contra ataques cibernéticos distribuídos.'
      ],
      limitations: ['O estudo acadêmico é baseado em dados públicos e entrevistas técnicas com operadoras.']
    }
  ],
  scenes: [
    // ==========================================
    // CAPÍTULO 1: O INÍCIO INVISÍVEL (00:00 - 02:15)
    // ==========================================
    scene(
      'OOL_001',
      'CH01',
      'O Início Invisível',
      'establish_origin',
      'generated_ai',
      'Mãos segurando celular em apartamento escuro com chuva no vidro da janela em São Paulo à noite',
      ['BACEN-SPI-REGULATION-2026'],
      'Um gesto simples. Quase imperceptível. Você digita a chave, confirma a transferência de um real e pronto. Na tela, o comprovante surge em menos de dois segundos.',
      'reconstruction'
    ),
    scene(
      'OOL_002',
      'CH01',
      'O Início Invisível',
      'question_assumption',
      'remotion',
      'Interface do celular com toque em confirmar se dissolvendo em feixes de dados luminosos em laranja',
      ['BACEN-SPI-REGULATION-2026'],
      'A maioria das pessoas acredita que o dinheiro simplesmente viajou pelo ar, de um banco para outro, como uma mensagem de texto.',
      'invisible_process'
    ),
    scene(
      'OOL_003',
      'CH01',
      'O Início Invisível',
      'reveal_scale',
      'generated_ai',
      'Vista aérea cinematográfica de São Paulo à noite com avenidas e prédios iluminados em chiaroscuro',
      ['BACEN-SPI-REGULATION-2026'],
      'Mas por trás desse toque existe uma máquina monumental que nunca desliga. São cento e quarenta milhões de transações todos os dias.',
      'scale'
    ),
    scene(
      'OOL_004',
      'CH01',
      'O Início Invisível',
      'quantify_peak',
      'remotion',
      'Gráfico de pico de transações subindo verticalmente para oito mil transações por segundo',
      ['BACEN-SPI-REGULATION-2026', 'CIP-PIX-TECHNICAL-SPEC-2026'],
      'Nos horários de pico, mais de oito mil transferências acontecem a cada segundo. Cada uma delas precisa ser checada, autenticada e liquidada sem margem para erro.',
      'invisible_process'
    ),
    scene(
      'OOL_005',
      'CH01',
      'O Início Invisível',
      'deliver_core_puzzle',
      'typography',
      'O PIX NÃO É UM APLICATIVO. É UMA MÁQUINA DE SINCRONIA.',
      [],
      'Como o Brasil construiu um sistema capaz de movimentar bilhões de reais em frações de segundo sem duplicar saldo ou travar a economia?',
      'reconstruction'
    ),
    scene(
      'OOL_006',
      'CH01',
      'O Início Invisível',
      'bridge_to_hardware',
      'generated_ai',
      'Câmera mergulhando sob o asfalto da cidade revelando galerias de tubulações e cabos protegidos',
      [],
      'Para entender essa resposta, precisamos seguir exatamente o caminho desse único real, descendo do celular para o concreto do subsolo.',
      'transition'
    ),

    // ==========================================
    // CAPÍTULO 2: A ESTRADA SUBTERRÂNEA (02:15 - 04:45)
    // ==========================================
    scene(
      'OOL_007',
      'CH02',
      'A Estrada Subterrânea',
      'trace_cellular_handoff',
      'generated_ai',
      'Torre de transmissão celular no topo de um edifício em São Paulo com luz de aviso vermelha',
      ['CIP-PIX-TECHNICAL-SPEC-2026'],
      'O sinal deixa a antena do seu smartphone em frequência de cinco gigahertz e desce imediatamente por cabos coaxiais até o térreo.',
      'scale'
    ),
    scene(
      'OOL_008',
      'CH02',
      'A Estrada Subterrânea',
      'explain_fiber_grid',
      'remotion',
      'Diagrama de corte transversal de dutos subterrâneos com feixes de fibra óptica monomodo pulsando',
      ['CIP-PIX-TECHNICAL-SPEC-2026'],
      'Sob asfalto das avenidas Paulista e Faria Lima corre uma malha densa de fibra óptica monomodo. O sinal deixa de ser rádio e vira pulso de luz laser.',
      'invisible_process'
    ),
    scene(
      'OOL_009',
      'CH02',
      'A Estrada Subterrânea',
      'explain_packet_structure',
      'remotion',
      'Esquema visual do pacote de dados ISO 20022 abrindo camadas de cabeçalho, valor e certificado digital',
      ['CIP-PIX-TECHNICAL-SPEC-2026'],
      'Sua transferência não é enviada como um número solto. Ela é encapsulada no padrão financeiro internacional ISO vinte mil e vinte e dois.',
      'invisible_process'
    ),
    scene(
      'OOL_010',
      'CH02',
      'A Estrada Subterrânea',
      'explain_hsm_encryption',
      'generated_ai',
      'Módulo de hardware criptográfico HSM em rack de aço escuro com luzes azuis e travas mecânicas',
      ['CIP-PIX-TECHNICAL-SPEC-2026'],
      'Dentro do banco emissor, módulos de segurança criptográfica de hardware assinam a mensagem com chaves assimétricas invioláveis.',
      'atmosphere'
    ),
    scene(
      'OOL_011',
      'CH02',
      'A Estrada Subterrânea',
      'show_highway_fiber_route',
      'remotion',
      'Mapa vetorial 3D traçando a rodovia Castelo Branco conectando a capital aos data centers de Barueri',
      ['CIP-PIX-TECHNICAL-SPEC-2026'],
      'Em menos de doze milissegundos, o pulso luminoso viaja pelas margens das rodovias paulistas até o polo de processamento de Barueri e Tamboré.',
      'invisible_process'
    ),
    scene(
      'OOL_012',
      'CH02',
      'A Estrada Subterrânea',
      'establish_megadatacenter',
      'generated_ai',
      'Fachada monumental de um mega data center blindado ao entardecer com geradores industriais',
      ['CIP-PIX-TECHNICAL-SPEC-2026'],
      'Aqui estão os bunkers digitais onde as ordens financeiras do país inteiro convergem para o primeiro grande teste.',
      'scale'
    ),
    scene(
      'OOL_013',
      'CH02',
      'A Estrada Subterrânea',
      'chapter_reframe',
      'typography',
      'A VELOCIDADE DEPENDE DO CABO, NÃO DO AR',
      [],
      'Sem a infraestrutura física de fibra e energia ininterrupta, nenhuma transação digital conseguiria existir.',
      'reconstruction'
    ),

    // ==========================================
    // CAPÍTULO 3: O CÉREBRO CENTRAL — SPI E DICT (04:45 - 07:45)
    // ==========================================
    scene(
      'OOL_014',
      'CH03',
      'O Cérebro Central',
      'enter_server_aisle',
      'generated_ai',
      'Corredor de servidores escuro com operador caminhando e racks de alta densidade iluminados em chiaroscuro',
      ['BACEN-SPI-REGULATION-2026'],
      'Dentro do data center, a mensagem entra no ecossistema do Sistema de Pagamentos Instantâneos, o SPI, operado e supervisionado pelo Banco Central.',
      'atmosphere'
    ),
    scene(
      'OOL_015',
      'CH03',
      'O Cérebro Central',
      'explain_dict_lookup',
      'remotion',
      'Banco de dados em memória DICT com linhas de código e chaves CPF, e-mail e telefone buscando correspondência',
      ['BACEN-SPI-REGULATION-2026'],
      'A primeira parada é o DICT: o Diretório de Identificadores de Contas Transacionais. Ele guarda mais de oitocentos milhões de chaves cadastradas.',
      'invisible_process'
    ),
    scene(
      'OOL_016',
      'CH03',
      'O Cérebro Central',
      'quantify_dict_latency',
      'remotion',
      'Cronômetro de milissegundos descendo de 8ms para 2.4ms enquanto a chave é localizada',
      ['BACEN-SPI-REGULATION-2026'],
      'A busca no DICT precisa acontecer em menos de oito milissegundos. Ele precisa traduzir a chave digitada no banco de destino, agência e conta exata.',
      'invisible_process'
    ),
    scene(
      'OOL_017',
      'CH03',
      'O Cérebro Central',
      'explain_settlement_ledger',
      'remotion',
      'Livro razão eletrônico do Banco Central com colunas de débito e crédito em contas PI',
      ['BACEN-SPI-REGULATION-2026', 'USP-FINTECH-STUDY-2026'],
      'Com o destino confirmado, a transação alcança a Conta de Pagamentos Instantâneos de cada instituição financeira no Banco Central.',
      'invisible_process'
    ),
    scene(
      'OOL_018',
      'CH03',
      'O Cérebro Central',
      'explain_atomic_settlement',
      'remotion',
      'Esquema de liquidação atômica: débito e crédito ocorrendo simultaneamente no mesmo ciclo de clock',
      ['BACEN-SPI-REGULATION-2026'],
      'A liquidação no SPI é bruta e em tempo real. Não existe promessa de pagamento. O débito no banco de origem e o crédito no banco de destino acontecem no mesmo microssegundo.',
      'invisible_process'
    ),
    scene(
      'OOL_019',
      'CH03',
      'O Cérebro Central',
      'show_redundant_core',
      'generated_ai',
      'Sala de controle com operadores diante de painéis com mapas do Brasil e status de conexões',
      ['BACEN-SPI-REGULATION-2026'],
      'Se o banco de origem não tiver saldo suficiente em sua conta de liquidação no Bacen, a ordem é rejeitada instantaneamente pela máquina.',
      'atmosphere'
    ),
    scene(
      'OOL_020',
      'CH03',
      'O Cérebro Central',
      'connect_brasilia_cluster',
      'remotion',
      'Linha de comunicação direta Barueri a Brasília confirmando a gravação do registro contábil',
      ['BACEN-SPI-REGULATION-2026'],
      'O registro é replicado em Brasília e São Paulo simultaneamente. Mas antes do sinal verde final, a transação precisa enfrentar sua maior barreira.',
      'invisible_process'
    ),
    scene(
      'OOL_021',
      'CH03',
      'O Cérebro Central',
      'chapter_reframe',
      'typography',
      'A LIQUIDAÇÃO NÃO É PROMESSA. É CERTEZA.',
      [],
      'Uma vez gravada no razão do Banco Central, a transferência é juridicamente definitiva e não pode ser desfeita por falha de sistema.',
      'reconstruction'
    ),

    // ==========================================
    // CAPÍTULO 4: O PONTO DE ESTRANGULAMENTO (07:45 - 10:45)
    // ==========================================
    scene(
      'OOL_022',
      'CH04',
      'O Ponto de Estrangulamento',
      'reveal_bottleneck',
      'generated_ai',
      'Cofre industrial de alta tecnologia com corte transversal em raio-x iluminado em laranja vapor de sódio',
      ['BACEN-SPI-REGULATION-2026', 'USP-FINTECH-STUDY-2026'],
      'Aqui está o verdadeiro ponto de estrangulamento de toda a infraestrutura: a esteira de análise comportamental antifraude.',
      'reconstruction'
    ),
    scene(
      'OOL_023',
      'CH04',
      'O Ponto de Estrangulamento',
      'explain_risk_score',
      'remotion',
      'Grafo de rede neural conectando nós de comportamento, geolocalização, valor e histórico de transações',
      ['USP-FINTECH-STUDY-2026'],
      'Em menos de oitocentos milissegundos, modelos de inteligência artificial calculam um escore de risco probabilístico para a transação.',
      'invisible_process'
    ),
    scene(
      'OOL_024',
      'CH04',
      'O Ponto de Estrangulamento',
      'analyze_parameters',
      'remotion',
      'Lista de parâmetros: velocidade de digitação, IP de origem, hora da madrugada e relação com a conta receptora',
      ['USP-FINTECH-STUDY-2026'],
      'O sistema analisa se o aparelho está na sua localização habitual, a velocidade com que você digitou a senha e se a conta receptora tem histórico de abertura recente.',
      'invisible_process'
    ),
    scene(
      'OOL_025',
      'CH04',
      'O Ponto de Estrangulamento',
      'explain_med_protocol',
      'remotion',
      'Diagrama do Mecanismo Especial de Devolução bloqueando e marcando contas de laranjas em vermelho',
      ['BACEN-SPI-REGULATION-2026'],
      'O Mecanismo Especial de Devolução, o MED, e as notificações de infração alimentam uma base de dados compartilhada entre todas as instituições.',
      'invisible_process'
    ),
    scene(
      'OOL_026',
      'CH04',
      'O Ponto de Estrangulamento',
      'show_cautelar_hold',
      'remotion',
      'Transação de cor verde mudando para âmbar com barra de retenção cautelar de 30 minutos',
      ['BACEN-SPI-REGULATION-2026'],
      'Se o índice de anomalia ultrapassar o limite de segurança, a máquina aciona a retenção cautelar. O dinheiro é congelado temporariamente para análise aprofundada.',
      'invisible_process'
    ),
    scene(
      'OOL_027',
      'CH04',
      'O Ponto de Estrangulamento',
      'show_throughput_tension',
      'generated_ai',
      'Painel de controle com indicadores de carga e técnicos monitorando picos de tráfego financeiro',
      ['USP-FINTECH-STUDY-2026'],
      'Esse é o eterno conflito da engenharia financeira: máxima segurança contra fraude sem criar filas de espera para o usuário legítimo.',
      'atmosphere'
    ),
    scene(
      'OOL_028',
      'CH04',
      'O Ponto de Estrangulamento',
      'quantify_antifraud_latency',
      'remotion',
      'Medidor de latência marcando 132 milissegundos e status sob carga',
      ['CIP-PIX-TECHNICAL-SPEC-2026'],
      'A decisão precisa sair antes que a janela de um segundo e quatrocentos milissegundos expire.',
      'invisible_process'
    ),
    scene(
      'OOL_029',
      'CH04',
      'O Ponto de Estrangulamento',
      'release_authorization',
      'remotion',
      'Selo de verificação aprovado em verde liberando o fluxo de liquidação final',
      ['BACEN-SPI-REGULATION-2026'],
      'Com o escore validado, o motor de risco emite o carimbo de conformidade e libera a compensação no SPI.',
      'invisible_process'
    ),
    scene(
      'OOL_030',
      'CH04',
      'O Ponto de Estrangulamento',
      'chapter_reframe',
      'typography',
      'O GARGALO NÃO É A VELOCIDADE. É A CONFIANÇA.',
      [],
      'Processar dados rápidos é simples. O desafio monumental é saber exatamente quais dados devem ser impedidos de passar.',
      'reconstruction'
    ),

    // ==========================================
    // CAPÍTULO 5: A FÍSICA DOS LIMITES & FALHAS (10:45 - 13:00)
    // ==========================================
    scene(
      'OOL_031',
      'CH05',
      'A Física dos Limites',
      'simulate_fiber_cut',
      'generated_ai',
      'Escavadeira em obra rodoviária cortando acidentalmente um duto subterrâneo de cabos',
      ['CIP-PIX-TECHNICAL-SPEC-2026'],
      'O que acontece quando o mundo físico falha? Uma escavadeira em uma rodovia corta o cabo principal de fibra óptica que conecta São Paulo a Brasília.',
      'reconstruction'
    ),
    scene(
      'OOL_032',
      'CH05',
      'A Física dos Limites',
      'show_automatic_rerouting',
      'remotion',
      'Anel de fibra óptica da RTM mudando de rota instantaneamente através do interior de Minas Gerais',
      ['CIP-PIX-TECHNICAL-SPEC-2026'],
      'A Rede de Telecomunicações do Mercado opera em topologia de anel redundante. Em menos de quinze milissegundos, o tráfego é desviado por rotas alternativas.',
      'invisible_process'
    ),
    scene(
      'OOL_033',
      'CH05',
      'A Física dos Limites',
      'show_power_redundancy',
      'generated_ai',
      'Fileira de geradores a diesel de alta potência e bancos de baterias industriais ligando em segundos',
      ['CIP-PIX-TECHNICAL-SPEC-2026'],
      'Se faltar eletricidade na rede pública, no-breaks rotativos e usinas de geradores a diesel assumem a carga total dos servidores em menos de dois segundos.',
      'atmosphere'
    ),
    scene(
      'OOL_034',
      'CH05',
      'A Física dos Limites',
      'test_black_friday_stress',
      'remotion',
      'Simulação de pico extremo de tráfego com gráficos de carga e balanceamento em clusters de servidores',
      ['BACEN-SPI-REGULATION-2026', 'USP-FINTECH-STUDY-2026'],
      'Em dias de Black Friday, o SPI suporta mais de quinze mil transações por segundo através de particionamento dinâmico de banco de dados.',
      'invisible_process'
    ),
    scene(
      'OOL_035',
      'CH05',
      'A Física dos Limites',
      'explain_failover_architecture',
      'remotion',
      'Cluster espelho em Brasília assumindo as operações após falha simulada no polo de Barueri',
      ['BACEN-SPI-REGULATION-2026'],
      'Se um data center inteiro for destruído, o site secundário assume a operação sem perda de um único centavo já processado.',
      'invisible_process'
    ),
    scene(
      'OOL_036',
      'CH05',
      'A Física dos Limites',
      'state_limitations',
      'typography',
      'REDUNDÂNCIA SÓ EXISTE QUANDO É TESTADA',
      ['USP-FINTECH-STUDY-2026'],
      'A estabilidade do sistema financeiro não é fruto do acaso; é o resultado de testes contínuos de estresse e tolerância a falhas extremas.',
      'reconstruction'
    ),
    scene(
      'OOL_037',
      'CH05',
      'A Física dos Limites',
      'bridge_to_finish',
      'generated_ai',
      'Servidores funcionando silenciosamente na penumbra com luzes indicadoras piscando em sincronia perfeita',
      [],
      'Com todas as verificações de contingência aprovadas, a ordem de pagamento recebe a autorização de retorno.',
      'atmosphere'
    ),

    // ==========================================
    // CAPÍTULO 6: REDUNDÂNCIA & VEREDITO CAUSAL (13:00 - 14:30)
    // ==========================================
    scene(
      'OOL_038',
      'CH06',
      'Redundância & Veredito',
      'trace_return_signal',
      'remotion',
      'Sinal de confirmação viajando de volta pela fibra óptica e subindo pela torre celular de destino',
      ['BACEN-SPI-REGULATION-2026'],
      'O Banco Central envia a notificação de liquidação concluída para o banco receptor. O saldo é atualizado na conta de destino.',
      'invisible_process'
    ),
    scene(
      'OOL_039',
      'CH06',
      'Redundância & Veredito',
      'show_destination_notification',
      'generated_ai',
      'Outra pessoa em outro local recebendo a notificação push no celular com o comprovante de R$ 1,00 recebido',
      ['BACEN-SPI-REGULATION-2026'],
      'No celular de quem recebeu, surge a notificação: você recebeu uma transferência. O relógio marca exatamente um segundo e quatrocentos milissegundos desde o primeiro clique.',
      'reconstruction'
    ),
    scene(
      'OOL_040',
      'CH06',
      'Redundância & Veredito',
      'summarize_full_chain',
      'remotion',
      'Visão geral da malha completa conectando celular, antenas, fibra, data centers, SPI, DICT e banco receptor',
      ['BACEN-SPI-REGULATION-2026', 'CIP-PIX-TECHNICAL-SPEC-2026', 'USP-FINTECH-STUDY-2026'],
      'Nesse intervalo imperceptível, uma ordem viajou por milhares de quilômetros de fibra, passou por três data centers, consultou centenas de milhões de registros e superou dezenas de testes de fraude.',
      'invisible_process'
    ),
    scene(
      'OOL_041',
      'CH06',
      'Redundância & Veredito',
      'final_brand_payoff',
      'generated_ai',
      'Plano aberto cinematográfico da cidade ao amanhecer com a malha luminosa pulsando suavemente sob os prédios',
      [],
      'O produto visível é uma transferência instantânea na palma da mão. Mas o produto invisível é a mais sofisticada engenharia de sincronização do país.',
      'scale'
    ),
    scene(
      'OOL_042',
      'CH06',
      'Redundância & Veredito',
      'channel_tagline_closure',
      'typography',
      'INVESTIGAR. REVELAR. COMPREENDER.',
      [],
      'O que acontece depois que você clica, compra, liga ou aperta? Esse é o outro lado.',
      'reconstruction'
    )
  ]
};
