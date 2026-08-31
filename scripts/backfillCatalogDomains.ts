import fs from 'fs';
import path from 'path';
import { VideoCatalog, VideoCatalogEntry } from '../hsl/media/types';

/**
 * Script de Backfill: Atribui domínios temáticos explícitos aos 16 clipes do catálogo mestre.
 * Garante que o veto temático do VideoRepositoryMatcher opere em modo fail-closed.
 */
const CATALOG_PATH = path.join(process.cwd(), 'assets', 'video_repository', 'catalog.json');

const DOMAIN_MAP: Record<string, string[]> = {
  'INFRA_CONCRETE_STRUCTURE_PUSH_01': ['infrastructure', 'urban', 'civil_engineering'],
  'INFRA_CAR_CROSSING_STREET_01': ['infrastructure', 'urban', 'transportation', 'traffic'],
  'ATMOS_CITY_SKYLINE_DAWN_01': ['urban', 'atmospheric', 'cityscape'],
  'ATMOS_CLOUDS_OVER_NEIGHBORHOOD_01': ['atmospheric', 'urban', 'weather'],
  'IND_FORKLIFT_WAREHOUSE_01': ['logistics', 'industrial', 'supply_chain'],
  'INFRA_FREIGHT_TRAIN_TRACKS_01': ['transportation', 'infrastructure', 'railway', 'logistics'],
  'IND_GLOVED_HAND_VALVE_01': ['industrial', 'hydraulics', 'infrastructure', 'utilities'],
  'CYBER_HANDS_COMPARING_DOCUMENTS_01': ['audit', 'investigation', 'cyber_telemetry', 'finance', 'regulatory'],
  'CYBER_PHONE_ROOFTOP_ANTENNA_01': ['telecommunications', 'cyber_telemetry', 'networks', 'radio_frequency'],
  'INFRA_MAINTENANCE_VEHICLE_SECURITY_01': ['infrastructure', 'security', 'surveillance', 'perimeter'],
  'IND_PARCEL_CONVEYOR_BELT_01': ['logistics', 'ecommerce', 'supply_chain', 'industrial'],
  'IND_PARCEL_SCANNER_LASER_01': ['logistics', 'security', 'customs', 'optics', 'inspection'],
  'CYBER_PHONE_TO_FIBER_CONNECTOR_01': ['telecommunications', 'fiber_optics', 'cyber_telemetry', 'networks', 'internet'],
  'CYBER_PRINTER_EJECTS_PAPER_01': ['office', 'audit', 'regulatory', 'financial', 'documentation'],
  'PHYS_WATER_GLASS_FAUCET_01': ['hydraulics', 'utilities', 'physics', 'water_supply'],
  'IND_WORKER_REDIRECTS_PARCEL_01': ['logistics', 'supply_chain', 'industrial', 'ecommerce']
};

function runBackfill() {
  console.log('══════════════════════════════════════════════════════════════════════════════════════');
  console.log('⚡ BACKFILL DE DOMÍNIOS TEMÁTICOS DO CATÁLOGO DE VÍDEOS');
  console.log('══════════════════════════════════════════════════════════════════════════════════════');

  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`❌ Catálogo não encontrado em ${CATALOG_PATH}`);
    process.exit(1);
  }

  const catalog: VideoCatalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  let updatedCount = 0;

  for (const video of catalog.videos) {
    const assignedDomains = DOMAIN_MAP[video.id];
    if (assignedDomains) {
      video.domains = assignedDomains;
      updatedCount++;
      console.log(`✅ [${video.id}] Domínios atribuídos: [${assignedDomains.join(', ')}]`);
    } else {
      console.warn(`⚠️ [${video.id}] Nenhum domínio mapeado explicitamente. Atribuindo categoria default.`);
      video.domains = [String(video.category)];
      updatedCount++;
    }
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`\n🎉 Backfill concluído com sucesso! ${updatedCount}/${catalog.videos.length} vídeos atualizados com 'domains'.`);
}

runBackfill();
