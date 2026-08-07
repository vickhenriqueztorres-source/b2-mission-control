"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const productionSafetyGuard_1 = require("../config/productionSafetyGuard");
const DB_PATH = path_1.default.join(__dirname, 'mission_control.db');
const SCHEMA_PATH = path_1.default.join(__dirname, 'schema.sql');
function getDatabase() {
    productionSafetyGuard_1.ProductionSafetyGuard.assertSafeForProduction();
    const db = new better_sqlite3_1.default(DB_PATH);
    db.pragma('journal_mode = WAL');
    if (fs_1.default.existsSync(SCHEMA_PATH)) {
        const schemaSql = fs_1.default.readFileSync(SCHEMA_PATH, 'utf-8');
        db.exec(schemaSql);
    }
    return db;
}
