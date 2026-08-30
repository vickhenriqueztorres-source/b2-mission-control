import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { VideoRepositoryMatcher } from '../hsl/media/videoRepositoryMatcher';
import { VideoCatalogEntry } from '../hsl/media/types';

interface VideoDefinition {
  pattern: string;
  id: string;
  category: string;
  description: string;
  tags: string[];
  recommendedMotion: string;
  colorTone: string;
}

const VIDEO_METADATA_MAP: VideoDefinition[] = [
  {
    pattern: 'Camera_pushing_toward_concrete',
    id: 'INFRA_CONCRETE_STRUCTURE_PUSH_01',
    category: 'infrastructure',
    description: 'Câmera avançando em direção a estrutura de concreto monumental em 35mm chiaroscuro.',
    tags: ['concreto', 'estrutura', 'rodovia', 'predio', 'camera_push', '35mm', 'arquitetura', 'monumental', 'obra'],
    recommendedMotion: 'slow_push_in',
    colorTone: 'Chiaroscuro / Deep Steel'
  },
  {
    pattern: 'Car_crossing_neighborhood_street',
    id: 'INFRA_CAR_CROSSING_STREET_01',
    category: 'infrastructure',
    description: 'Carro cruzando rua residencial observada em ângulo documental 35mm.',
    tags: ['carro', 'veiculo', 'rua', 'bairro', 'cotidiano', 'transito', 'cruzamento', 'asfalto'],
    recommendedMotion: 'slow_push_in',
    colorTone: 'Low-Key / Sodium Amber'
  },
  {
    pattern: 'City_skyline_at_dawn',
    id: 'ATMOS_CITY_SKYLINE_DAWN_01',
    category: 'atmospheric',
    description: 'Skyline urbano de metrópole ao amanhecer com luz suave e névoa atmosférica.',
    tags: ['skyline', 'cidade', 'amanhecer', 'predios', 'atmosfera', 'urbano', 'aurora', 'escala', 'horizonte'],
    recommendedMotion: 'cinematic_drift',
    colorTone: 'Chiaroscuro / Muted Slate'
  },
  {
    pattern: 'Clouds_moving_over_neighborhood',
    id: 'ATMOS_CLOUDS_OVER_NEIGHBORHOOD_01',
    category: 'atmospheric',
    description: 'Nuvens densas se movendo sobre área urbana em escala documental.',
    tags: ['nuvens', 'timelapse', 'bairro', 'ceu', 'atmosfera', 'clima', 'tempo', 'ambiente'],
    recommendedMotion: 'cinematic_drift',
    colorTone: 'Atmospheric Fog'
  },
  {
    pattern: 'Crane_lifts_container_in_port',
    id: 'IND_PORT_CRANE_CONTAINER_01',
    category: 'industrial',
    description: 'Guindaste portuário STS içando contêiner de 40 pés em porto de grande escala.',
    tags: ['guindaste', 'conteiner', 'porto', 'navio', 'logistica', 'sts', 'carga', 'santos', 'transporte'],
    recommendedMotion: 'slow_push_in',
    colorTone: 'Industrial X-Ray / Deep Steel'
  },
  {
    pattern: 'Forklift_turning_in_warehouse',
    id: 'IND_FORKLIFT_WAREHOUSE_01',
    category: 'industrial',
    description: 'Empilhadeira operando e manobrando cargas em centro de distribuição logístico.',
    tags: ['empilhadeira', 'galpao', 'armazem', 'logistica', 'estoque', 'distribuicao', 'pallet', 'carga'],
    recommendedMotion: 'cinematic_drift',
    colorTone: 'Sodium Amber / Industrial'
  },
  {
    pattern: 'Freight_train_moving_laterally',
    id: 'INFRA_FREIGHT_TRAIN_TRACKS_01',
    category: 'infrastructure',
    description: 'Trem de carga pesado em movimento lateral sobre malha ferroviária.',
    tags: ['trem', 'ferrovia', 'carga', 'trilhos', 'locomotiva', 'logistica', 'transporte', 'malha'],
    recommendedMotion: 'cinematic_drift',
    colorTone: 'Deep Steel / Chiaroscuro'
  },
  {
    pattern: 'Gloved_hand_turning_valve',
    id: 'IND_GLOVED_HAND_VALVE_01',
    category: 'industrial',
    description: 'Mão com luva industrial de segurança girando válvula de alta pressão em tubulação.',
    tags: ['valvula', 'mao', 'luva', 'tubulacao', 'encanamento', 'agua', 'pressao', 'oleo', 'hidraulica', 'operador'],
    recommendedMotion: 'slow_push_in',
    colorTone: 'Industrial Chiaroscuro'
  },
  {
    pattern: 'Hands_comparing_documents',
    id: 'CYBER_HANDS_COMPARING_DOCUMENTS_01',
    category: 'cyber_telemetry',
    description: 'Mãos examinando e comparando relatórios e documentos técnicos em visão superior de investigação.',
    tags: ['documentos', 'auditoria', 'papeis', 'relatorio', 'investigacao', 'analise', 'overhead', 'evidencia', 'dossie'],
    recommendedMotion: 'slow_push_in',
    colorTone: 'Documentary Desk / Frosted'
  },
  {
    pattern: 'Hand_adjusting_phone_on_rooftop',
    id: 'CYBER_PHONE_ROOFTOP_ANTENNA_01',
    category: 'cyber_telemetry',
    description: 'Mão segurando e ajustando smartphone no topo de edifício com antenas de telecomunicação.',
    tags: ['celular', 'antena', 'rooftop', 'terraco', '5g', 'sinal', 'conectividade', 'telefonia', 'smartphones', 'torre'],
    recommendedMotion: 'slow_push_in',
    colorTone: 'Laser Cyan / Amber'
  },
  {
    pattern: 'Maintenance_vehicle_passing',
    id: 'INFRA_MAINTENANCE_VEHICLE_SECURITY_01',
    category: 'infrastructure',
    description: 'Veículo de manutenção e vistoria técnica passando por guarita de segurança perimetral.',
    tags: ['veiculo', 'manutencao', 'seguranca', 'portaria', 'acesso', 'perimetro', 'vigilancia', 'patrulha', 'guarita'],
    recommendedMotion: 'cinematic_drift',
    colorTone: 'Low-Key Surveillance'
  },
  {
    pattern: 'Parcel_moving_on_conveyor_belt',
    id: 'IND_PARCEL_CONVEYOR_BELT_01',
    category: 'industrial',
    description: 'Pacote de encomenda deslizando sobre esteira rolante automatizada de triagem.',
    tags: ['pacote', 'encomenda', 'esteira', 'triagem', 'correios', 'logistica', 'distribuicao', 'entrega', 'ecommerce'],
    recommendedMotion: 'cinematic_drift',
    colorTone: 'Sodium Amber / Industrial'
  },
  {
    pattern: 'Parcel_passes_under_scanner',
    id: 'IND_PARCEL_SCANNER_LASER_01',
    category: 'industrial',
    description: 'Pacote passando sob feixe laser de scanner óptico e raio-x de verificação.',
    tags: ['scanner', 'raio_x', 'leitor_otica', 'codigo_barras', 'rastreamento', 'pacote', 'encomenda', 'aduana', 'laser'],
    recommendedMotion: 'slow_push_in',
    colorTone: 'Laser Cyan / Sodium Orange'
  },
  {
    pattern: 'Phone_sliding_to_fiber_connector',
    id: 'CYBER_PHONE_TO_FIBER_CONNECTOR_01',
    category: 'cyber_telemetry',
    description: 'Transição visual entre tela de smartphone e conector óptico de alta velocidade.',
    tags: ['fibra_otica', 'conector', 'dados', 'internet', 'cabo', 'rede', 'celular', 'patch_cord', 'transmissao', 'bits'],
    recommendedMotion: 'slow_push_in',
    colorTone: 'Laser Cyan / Laser Orange'
  },
  {
    pattern: 'Printer_ejects_paper_in_office',
    id: 'CYBER_PRINTER_EJECTS_PAPER_01',
    category: 'cyber_telemetry',
    description: 'Impressora emitindo folha de documento oficial e relatório técnico em ambiente de escritório.',
    tags: ['impressora', 'papel', 'documento', 'escritorio', 'comprovante', 'registro', 'fiscal', 'nota', 'extrato'],
    recommendedMotion: 'slow_push_in',
    colorTone: 'Muted Slate / Office'
  },
  {
    pattern: 'Water_fills_glass_from_faucet',
    id: 'PHYS_WATER_GLASS_FAUCET_01',
    category: 'macro_physics',
    description: 'Fluxo límpido de água saindo da torneira e preenchendo copo de vidro em close macro.',
    tags: ['agua', 'torneira', 'copo', 'hidraulica', 'consumo', 'fluido', 'transparente', 'cotidiano', 'abastecimento'],
    recommendedMotion: 'slow_push_in',
    colorTone: 'High Contrast / Clean Water'
  },
  {
    pattern: 'Worker_redirects_parcel_on_belt',
    id: 'IND_WORKER_REDIRECTS_PARCEL_01',
    category: 'industrial',
    description: 'Operador de centro de distribuição redirecionando caixas e encomendas na linha de triagem.',
    tags: ['operador', 'trabalhador', 'esteira', 'triagem', 'pacote', 'logistica', 'manuseio', 'distribuicao', 'correios'],
    recommendedMotion: 'cinematic_drift',
    colorTone: 'Industrial Chiaroscuro'
  }
];

function probeVideo(filePath: string): { duration: number; fps: number; resolution: string } {
  try {
    const probe = spawnSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration:stream=width,height,r_frame_rate',
      '-of', 'json',
      filePath
    ], { encoding: 'utf8' });

    if (probe.status !== 0) {
      return { duration: 6.0, fps: 24, resolution: '1280x720' };
    }

    const parsed = JSON.parse(probe.stdout);
    const duration = parseFloat(parsed.format?.duration || '6.0');
    const firstStream = parsed.streams?.find((s: any) => s.width && s.height) || parsed.streams?.[0];
    const width = firstStream?.width || 1280;
    const height = firstStream?.height || 720;
    let fps = 24;
    if (firstStream?.r_frame_rate) {
      const parts = firstStream.r_frame_rate.split('/');
      if (parts.length === 2 && parseInt(parts[1], 10) > 0) {
        fps = Math.round(parseInt(parts[0], 10) / parseInt(parts[1], 10));
      }
    }

    return { duration, fps, resolution: `${width}x${height}` };
  } catch {
    return { duration: 6.0, fps: 24, resolution: '1280x720' };
  }
}

function calculateSha256(filePath: string): string {
  const hash = crypto.createHash('sha256');
  const buffer = fs.readFileSync(filePath);
  hash.update(buffer);
  return hash.digest('hex');
}

export function syncBancoDeVideos(): { syncedCount: number; totalCatalog: number } {
  const bancoDir = path.join(process.cwd(), 'banco de videos');
  const repoDir = path.join(process.cwd(), 'assets', 'video_repository');

  if (!fs.existsSync(bancoDir)) {
    console.error(`[SYNC_BANCO] Diretório '${bancoDir}' não encontrado.`);
    return { syncedCount: 0, totalCatalog: 0 };
  }

  const files = fs.readdirSync(bancoDir).filter(f => f.endsWith('.mp4'));
  console.log(`[SYNC_BANCO] Encontrados ${files.length} vídeos em 'banco de videos'. Sincronizando com repositório central...`);

  // Carrega catálogo existente preservando histórico
  const catalog = VideoRepositoryMatcher.loadCatalog(true);

  let syncedCount = 0;

  for (const file of files) {
    const srcPath = path.join(bancoDir, file);
    const matchingMeta = VIDEO_METADATA_MAP.find(m => file.includes(m.pattern));

    const isKnown = !!matchingMeta;
    const category = matchingMeta?.category || 'industrial';
    const id = matchingMeta?.id || `VIDEO_${file.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
    const description = matchingMeta?.description || `Take de vídeo em 35mm chiaroscuro para o tema ${file}`;
    const tags = matchingMeta?.tags || file.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    const recommendedMotion = matchingMeta?.recommendedMotion || 'slow_push_in';
    const colorTone = matchingMeta?.colorTone || 'Chiaroscuro / Industrial';

    // Verifica se já existe no catálogo
    const existingEntry = catalog.videos.find(v => v.id === id || v.filename.endsWith(file));

    // Determina qaStatus e destino do arquivo
    const qaStatus = existingEntry?.qaStatus || (isKnown ? 'approved' : 'quarantined');
    const isQuarantined = qaStatus === 'quarantined';

    const targetSubDir = isQuarantined ? path.join('_quarantine', category) : category;
    const targetDir = path.join(repoDir, targetSubDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const canonicalFilename = `${targetSubDir}/${file}`.replace(/\\/g, '/');
    const destPath = path.join(repoDir, canonicalFilename);

    // Copia o arquivo físico
    if (!fs.existsSync(destPath) || fs.statSync(destPath).size !== fs.statSync(srcPath).size) {
      fs.copyFileSync(srcPath, destPath);
    }

    // Extrai metadados via ffprobe
    const probe = probeVideo(srcPath);
    const sha256 = calculateSha256(srcPath);

    const entry: VideoCatalogEntry = {
      id,
      category,
      filename: canonicalFilename,
      tags,
      description,
      durationSeconds: probe.duration,
      fps: probe.fps,
      resolution: probe.resolution,
      colorTone,
      recommendedMotion: recommendedMotion as any,
      sha256,
      provenance: 'stock_curated',
      qaStatus,
      approvedBy: existingEntry?.approvedBy || (qaStatus === 'approved' ? 'curator_banco_sync' : undefined),
      approvedAt: existingEntry?.approvedAt || (qaStatus === 'approved' ? new Date().toISOString() : undefined),
      createdAt: existingEntry?.createdAt || new Date().toISOString()
    };

    VideoRepositoryMatcher.registerVideo(entry);
    syncedCount++;
    console.log(`  ✅ [${category.toUpperCase()}] Sincronizado: ${file} ➔ ${id} (${qaStatus.toUpperCase()}, ${probe.duration.toFixed(1)}s, ${probe.resolution})`);
  }

  const finalCatalog = VideoRepositoryMatcher.loadCatalog(true);
  console.log(`\n══════════════════════════════════════════════════════════════════`);
  console.log(`🎉 SINCRONIZAÇÃO CONCLUÍDA! ${syncedCount} vídeos sincronizados.`);
  console.log(`Total de vídeos no catálogo central: ${finalCatalog.videos.length}`);
  console.log(`Categorias ativas: ${finalCatalog.categories.join(', ')}`);
  console.log(`══════════════════════════════════════════════════════════════════\n`);

  return { syncedCount, totalCatalog: finalCatalog.videos.length };
}

// Execução direta via CLI
if (require.main === module) {
  syncBancoDeVideos();
}
