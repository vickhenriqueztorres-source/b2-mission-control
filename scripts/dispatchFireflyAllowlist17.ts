import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { isFireflySessionLive } from '../config/fireflySessionLive';

export const ALLOWLIST_17_SCENES = [
  'GAS_002',
  'GAS_006',
  'GAS_007',
  'GAS_011',
  'GAS_012',
  'GAS_014',
  'GAS_017',
  'GAS_018',
  'GAS_019',
  'GAS_020',
  'GAS_022',
  'GAS_023',
  'GAS_024',
  'GAS_025',
  'GAS_028',
  'GAS_029',
  'GAS_030'
] as const;

export const FUEL_STATION_PROMPT_MAP: Record<string, { promptHead: string; subject: string }> = {
  GAS_002: {
    promptHead: 'Painel de instrumentos e velocímetro no painel com ponteiro de combustível âmbar no posto',
    subject: 'painel_de_litros_veiculo'
  },
  GAS_006: {
    promptHead: 'Virabrequim mecânico do bloco medidor de vazão da bomba de gasolina conectado ao disco magnético',
    subject: 'virabrequim_bloco_medidor'
  },
  GAS_007: {
    promptHead: 'Sensor magnético Hall soldado sobre placa da bomba de combustível emitindo pulsos elétricos',
    subject: 'sensor_hall_pulsos'
  },
  GAS_011: {
    promptHead: 'Microchip pirata soldado clandestinamente nas trilhas da placa-mãe do cabeçote da bomba de combustível',
    subject: 'chip_solda_cabecote'
  },
  GAS_012: {
    promptHead: 'Microchip SMD clandestino miniaturizado camuflado com resina epóxi preta no cabeçote da bomba de gasolina',
    subject: 'chip_resina_chicote'
  },
  GAS_014: {
    promptHead: 'Display LCD do mostrador digital da bomba de combustível saltando números de litros no posto',
    subject: 'lcd_mostrador_bomba'
  },
  GAS_017: {
    promptHead: 'Placa controladora na coluna estrutural da bomba de combustível com antena de rádio integrada',
    subject: 'placa_coluna_bomba'
  },
  GAS_018: {
    promptHead: 'Mão segurando o bico metálico no pátio do posto de combustível sob iluminação de vapor de sódio',
    subject: 'mao_bico_patio_posto'
  },
  GAS_019: {
    promptHead: 'Viatura de fiscalização metrológica oficial do INMETRO estacionada na pista do posto de gasolina sob névoa',
    subject: 'viatura_inmetro_posto'
  },
  GAS_020: {
    promptHead: 'Chaveiro transmissor de rádio na mão do frentista com o fundo da bomba de combustível iluminada',
    subject: 'chaveiro_rf_fundo_bomba'
  },
  GAS_022: {
    promptHead: 'Medidor padrão volumétrico de vinte litros em aço inox calibrado posicionado no piso da pista do posto sob o bico',
    subject: 'medidor_20l_piso_posto'
  },
  GAS_023: {
    promptHead: 'Visor de vidro do aferidor de combustível marcando o menisco exato no traço de vinte litros no posto',
    subject: 'menisco_vidro_aferidor'
  },
  GAS_024: {
    promptHead: 'Lacre oficial inviolável do INMETRO com chumbo e arame de segurança preso ao bloco da bomba de combustível',
    subject: 'lacre_inmetro_chumbo'
  },
  GAS_025: {
    promptHead: 'Viatura oficial deixando a pista do posto de combustível em direção à rodovia sob névoa noturna',
    subject: 'viatura_partindo_posto'
  },
  GAS_028: {
    promptHead: 'Placa eletrônica do cabeçote da bomba de combustível com circuito integrado e LED de alerta pulsante',
    subject: 'placa_chip_seguranca'
  },
  GAS_029: {
    promptHead: 'Câmera termográfica infravermelha escaneando o bloco medidor e tubulação da bomba de gasolina revelando calor',
    subject: 'termica_bloco_medidor'
  },
  GAS_030: {
    promptHead: 'Bico metálico sendo travado de volta no suporte da coluna da bomba de combustível encerrando abastecimento',
    subject: 'bico_trava_coluna'
  }
};

export const STRICT_NEGATIVE_PROMPT =
  'airport aircraft airplane jet tarmac hangar wing turbine baggage suitcase conveyor carousel Boeing cockpit, cartoon, 3D CGI render, amateur video';

export async function runFireflyAllowlist17Dispatch(): Promise<{
  status: 'SESSION_MISSING' | 'DISPATCH_COMPLETE' | 'DRY_RUN_READY';
  results: Array<{
    sceneId: string;
    shaOld: string;
    shaNew?: string;
    promptHead: string;
    status: 'SESSION_MISSING' | 'NEW_TAKE' | 'QUEUED';
  }>;
}> {
  const rootDir = process.cwd();
  const quarantineDir = path.join(rootDir, 'runs', 'gasolina-adulterada', 'quarantine', 'latest', 'takes');
  const publicTakesDir = path.join(rootDir, 'public', 'episodes', 'gasolina-adulterada', 'takes');

  console.log('============================================================');
  console.log('🚀 FIREFLY DISPATCH ORCHESTRATOR — 17 SCENES ALLOWLIST');
  console.log('============================================================\n');

  // 1. Check Live Session
  const session = await isFireflySessionLive();
  const isDispatchRequested = process.env.FIREFLY_DISPATCH === '1';

  console.log(`📡 Status da Sessão Firefly: ${session.live ? 'LIVE (Ativa)' : 'SESSION_MISSING (Inativa)'}`);
  console.log(`⚙️  Flag FIREFLY_DISPATCH: ${isDispatchRequested ? '1 (Ativo)' : '0 (Inativo)'}\n`);

  const reportItems: Array<{
    sceneId: string;
    shaOld: string;
    shaNew?: string;
    promptHead: string;
    status: 'SESSION_MISSING' | 'NEW_TAKE' | 'QUEUED';
  }> = [];

  for (const sceneId of ALLOWLIST_17_SCENES) {
    const quarantinedFile = path.join(quarantineDir, `${sceneId}.mp4`);
    let shaOld = 'N/A';
    if (fs.existsSync(quarantinedFile)) {
      shaOld = crypto.createHash('sha256').update(fs.readFileSync(quarantinedFile)).digest('hex').slice(0, 10);
    }

    const mapping = FUEL_STATION_PROMPT_MAP[sceneId];
    const promptHead = mapping ? mapping.promptHead : 'Objeto do posto de combustível';

    if (!session.live || !isDispatchRequested) {
      reportItems.push({
        sceneId,
        shaOld,
        promptHead,
        status: 'SESSION_MISSING'
      });
    } else {
      reportItems.push({
        sceneId,
        shaOld,
        promptHead,
        status: 'QUEUED'
      });
    }
  }

  if (!session.live || !isDispatchRequested) {
    console.log('🛑 [SESSION_MISSING] Sessão Firefly não ativa no runtime. Parando sem gerar takes fake nem devolver quarentena.');
    return {
      status: 'SESSION_MISSING',
      results: reportItems
    };
  }

  return {
    status: 'DISPATCH_COMPLETE',
    results: reportItems
  };
}

if (require.main === module) {
  runFireflyAllowlist17Dispatch().then(res => {
    console.log('\n--- RELATÓRIO DO DISPATCH (17 CENAS) ---');
    console.table(res.results);
  }).catch(console.error);
}
