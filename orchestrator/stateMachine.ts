import { getDatabase } from '../database/db';
import { EventBus } from '../event-hub/eventBus';
import { Logger } from '../event-hub/logger';

export type ProductionStatus =
  | 'IDLE'
  | 'BRIEFING_RECEIVED'
  | 'RAFA_LOBO_PRE_KLING_RUNNING'
  | 'MOTION_PACKAGE_READY'
  | 'FIREFLY_INGESTION_PENDING'
  | 'FIREFLY_GENERATION_RUNNING'
  | 'FIREFLY_GENERATION_COMPLETED'
  | 'RAFA_LOBO_POST_KLING_RUNNING'
  | 'FINAL_VIDEO_RENDERED'
  | 'PRODUCTION_FAILED';

const VALID_TRANSITIONS: Record<ProductionStatus, ProductionStatus[]> = {
  IDLE: ['BRIEFING_RECEIVED'],
  BRIEFING_RECEIVED: ['RAFA_LOBO_PRE_KLING_RUNNING', 'PRODUCTION_FAILED'],
  RAFA_LOBO_PRE_KLING_RUNNING: ['MOTION_PACKAGE_READY', 'PRODUCTION_FAILED'],
  MOTION_PACKAGE_READY: ['FIREFLY_INGESTION_PENDING', 'PRODUCTION_FAILED'],
  FIREFLY_INGESTION_PENDING: ['FIREFLY_GENERATION_RUNNING', 'PRODUCTION_FAILED'],
  FIREFLY_GENERATION_RUNNING: ['FIREFLY_GENERATION_COMPLETED', 'PRODUCTION_FAILED'],
  FIREFLY_GENERATION_COMPLETED: ['RAFA_LOBO_POST_KLING_RUNNING', 'PRODUCTION_FAILED'],
  RAFA_LOBO_POST_KLING_RUNNING: ['FINAL_VIDEO_RENDERED', 'PRODUCTION_FAILED'],
  FINAL_VIDEO_RENDERED: [],
  PRODUCTION_FAILED: ['BRIEFING_RECEIVED'] // permitir retry
};

export class ProductionStateMachine {
  private productionId: string;
  private currentStatus: ProductionStatus;

  constructor(productionId: string, initialStatus: ProductionStatus = 'IDLE') {
    this.productionId = productionId;
    this.currentStatus = initialStatus;
  }

  public getStatus(): ProductionStatus {
    return this.currentStatus;
  }

  public transitionTo(newStatus: ProductionStatus, metadata?: Record<string, any>): boolean {
    const allowed = VALID_TRANSITIONS[this.currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      const err = `Transição inválida de ${this.currentStatus} para ${newStatus} na produção ${this.productionId}`;
      Logger.error('StateMachine', err);
      throw new Error(`INVALID_STATE_TRANSITION: ${err}`);
    }

    const oldStatus = this.currentStatus;
    this.currentStatus = newStatus;

    // Atualizar no banco de dados SQLite
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE productions 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE production_id = ?
    `);
    stmt.run(newStatus, this.productionId);

    Logger.info('StateMachine', `Produção ${this.productionId} transicionou: ${oldStatus} -> ${newStatus}`);

    // Emitir evento
    EventBus.getInstance().emitEvent({
      production_id: this.productionId,
      source: 'MISSION_CONTROL',
      agent_name: 'orchestrator_state_machine',
      event_type: 'STEP_COMPLETED',
      payload: { old_status: oldStatus, new_status: newStatus, metadata }
    });

    return true;
  }
}
