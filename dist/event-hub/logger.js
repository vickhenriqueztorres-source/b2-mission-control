"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static info(context, message, data) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [INFO] [${context}] ${message}`, data ? JSON.stringify(data) : '');
    }
    static warn(context, message, data) {
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] [WARN] [${context}] ${message}`, data ? JSON.stringify(data) : '');
    }
    static error(context, message, error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] [${context}] ${message}`, error || '');
    }
}
exports.Logger = Logger;
