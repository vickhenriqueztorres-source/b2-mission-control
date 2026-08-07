"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecoveryVerifier = void 0;
class RecoveryVerifier {
    static verifyRecovery(initialRunId, initialProductionId, eventsBefore, eventsAfter) {
        // 1. Verificar se run_id e production_id se mantiveram idênticos
        const runIdPreserved = eventsAfter.every(e => e.run_id === initialRunId);
        const productionIdPreserved = eventsAfter.every(e => e.production_id === initialProductionId);
        if (!runIdPreserved) {
            return { passed: false, message: `FALHA: run_id alterou durante a recuperação (${initialRunId}).` };
        }
        if (!productionIdPreserved) {
            return { passed: false, message: `FALHA: production_id alterou durante a recuperação (${initialProductionId}).` };
        }
        // 2. Verificar se o histórico prévio de eventos foi preservado (sem perda)
        const initialEventIds = new Set(eventsBefore.map(e => e.event_id));
        const preservedAllPrevEvents = Array.from(initialEventIds).every(id => eventsAfter.some(e => e.event_id === id));
        if (!preservedAllPrevEvents) {
            return { passed: false, message: 'FALHA: Histórico de eventos anterior à falha foi corrompido ou perdido.' };
        }
        // 3. Verificar se evento terminal de recuperação foi registrado
        const hasRecoveryEvent = eventsAfter.some(e => e.type === 'AGENT_RETRYING' || e.type === 'AGENT_COMPLETED' || e.type === 'STATE_RECOVERED');
        if (!hasRecoveryEvent) {
            return { passed: false, message: 'FALHA: Nenhum evento de retomada/retry registrado após a recuperação.' };
        }
        return {
            passed: true,
            message: `Retomada confirmada com sucesso! run_id=${initialRunId}, production_id=${initialProductionId}, histórico intacto.`
        };
    }
}
exports.RecoveryVerifier = RecoveryVerifier;
