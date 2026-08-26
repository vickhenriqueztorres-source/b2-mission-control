import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { ProductionSafetyGuard } from '../config/productionSafetyGuard';

const projectRoot = path.basename(path.dirname(__dirname)) === 'dist'
  ? path.resolve(__dirname, '..', '..')
  : path.resolve(__dirname, '..');
const DB_PATH = process.env.MISSION_CONTROL_DB_PATH
  ? path.resolve(process.env.MISSION_CONTROL_DB_PATH)
  : path.join(projectRoot, 'database', 'mission_control.db');
const SCHEMA_PATH = path.join(projectRoot, 'database', 'schema.sql');

export function getDatabase(): Database.Database {
  ProductionSafetyGuard.assertSafeForProduction();
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  
  if (fs.existsSync(SCHEMA_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schemaSql);
  }
  
  return db;
}
