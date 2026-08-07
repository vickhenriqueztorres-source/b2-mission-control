import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { getDatabase } from '../database/db';
import { ProductionStateMachine } from './stateMachine';
import { MotionToFireflyBridge } from '../production-bridge/motionToFirefly';
import { FireflyToIntakeBridge } from '../production-bridge/fireflyToIntake';
import { RafaLoboAdapter } from '../adapters/rafaLoboAdapter';
import { FireflyAdapter } from '../adapters/fireflyAdapter';
import { AntigravityAdapter } from '../adapters/antigravityAdapter';
import { CodexAdapter } from '../adapters/codexAdapter';
import { Logger } from '../event-hub/logger';
import { ProductionSafetyGuard } from '../config/productionSafetyGuard';

export class ProductionRunner {
  private rafaAdapter: RafaLoboAdapter;
  private fireflyAdapter: FireflyAdapter;
  private builderAdapter: AntigravityAdapter;
  private reviewerAdapter: CodexAdapter;

  constructor() {
    this.rafaAdapter = new RafaLoboAdapter();
    this.fireflyAdapter = new FireflyAdapter();
    this.builderAdapter = new AntigravityAdapter();
    this.reviewerAdapter = new CodexAdapter();
  }

  public async initialize(): Promise<void> {
    ProductionSafetyGuard.assertSafeForProduction();
    await this.rafaAdapter.initialize();
    await this.fireflyAdapter.initialize();
    await this.builderAdapter.initialize();
    await this.reviewerAdapter.initialize();
  }

  public async runFullProduction(briefingText: string): Promise<{ success: boolean; productionId: string; finalVideoPath: string }> {
    ProductionSafetyGuard.assertSafeForProduction();
    const productionId = crypto.randomUUID();
    Logger.info('ProductionRunner', `Iniciando Produção Completa. GUID: ${productionId}`);

    // Inserir registro inicial da produção no SQLite WAL
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO productions (production_id, project_name, status, current_step, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    stmt.run(productionId, 'Rafa Lobo', 'IDLE', 1);

    const sm = new ProductionStateMachine(productionId, 'IDLE');

    try {
      // Step 1: Submeter briefing
      sm.transitionTo('BRIEFING_RECEIVED', { briefing: briefingText });

      // Step 2: Executar Fase 1 do Rafa Lobo
      sm.transitionTo('RAFA_LOBO_PRE_KLING_RUNNING');
      const phase1Result = await this.rafaAdapter.runPhase1(productionId, briefingText);

      // Step 3: Motion Package Pronto (Trava de Handoff Manual 20 atingida)
      sm.transitionTo('MOTION_PACKAGE_READY', { motionPackagePath: phase1Result.motionPackagePath });

      // Step 4: Converter para Guia do Firefly via Production Bridge
      sm.transitionTo('FIREFLY_INGESTION_PENDING');
      const prodDir = path.join('C:\\B2-AI-STUDIO\\productions', productionId);
      const fireflyGuidePath = path.join(prodDir, 'firefly_production_guide.json');
      
      MotionToFireflyBridge.convert(phase1Result.motionPackagePath, fireflyGuidePath);

      // Step 5: Executar geração de vídeos no Firefly
      sm.transitionTo('FIREFLY_GENERATION_RUNNING');
      const fireflyResult = await this.fireflyAdapter.feedGuideAndRun(productionId, fireflyGuidePath);

      // Step 6: Conclusão do Firefly
      sm.transitionTo('FIREFLY_GENERATION_COMPLETED');

      // Step 7: Converter mídias para Manifesto de Ingestão da Fase 3 do Rafa Lobo
      sm.transitionTo('RAFA_LOBO_POST_KLING_RUNNING');
      const intakeManifestPath = path.join(prodDir, 'manual_kling_clip_intake.json');
      FireflyToIntakeBridge.convert(productionId, fireflyResult.completedJobs, intakeManifestPath);

      // Step 8: Executar Fase 3 do Rafa Lobo
      const phase3Result = await this.rafaAdapter.runPhase3(productionId, intakeManifestPath);

      // Step 9: Render Final de Vídeo concluído!
      sm.transitionTo('FINAL_VIDEO_RENDERED', { finalVideoPath: phase3Result.finalVideoPath });

      Logger.info('ProductionRunner', `SUCESSO TOTAL! Vídeo renderizado e publicado em: ${phase3Result.finalVideoPath}`);

      return {
        success: true,
        productionId,
        finalVideoPath: phase3Result.finalVideoPath
      };
    } catch (err: any) {
      Logger.error('ProductionRunner', `FALHA NA PRODUÇÃO ${productionId}: ${err.message}`);
      try {
        sm.transitionTo('PRODUCTION_FAILED', { error: err.message });
      } catch (e) {
        // Estado de erro capturado
      }
      throw err;
    }
  }
}

// Permitir execução direta via CLI se chamado diretamente
if (require.main === module) {
  const runner = new ProductionRunner();
  runner.initialize().then(() => {
    runner.runFullProduction('Briefing de Exemplo para Teste de Integração B2 Mission Control');
  }).catch((err) => {
    console.error('Erro na execução:', err);
  });
}
