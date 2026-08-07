import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { ProductionSafetyGuard } from '../config/productionSafetyGuard';

const DB_PATH = path.join(__dirname, 'mission_control.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

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
