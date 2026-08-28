---
name: pipeline-resilience-orchestrator
description: >-
  Use when running full episode productions, resuming interrupted runs, inspecting run manifests (run-manifest.json), managing stage checkpoints, or handling Firefly bot retries and idempotency.
---

# ⚙️ Pipeline Resilience & Orchestrator Skill

Governa a execução determinística, checkpoints, retries e o ciclo de vida das 7 etapas de produção de **O Outro Lado**.

---

## ⚡ FLUXO OBRIGATÓRIO DE EXECUÇÃO END-TO-END (ZERO FALLBACK PREMATURO)

Quando o usuário escolhe um tema ou ordena a produção completa de um episódio, o agente DEVE seguir obrigatoriamente a cadeia de 7 etapas:

```
[1. PREPRODUCTION] 
   → Pesquisa documental, Roteiro em 6 Atos, Narração Neural & scene_timings.json
[2. IMAGE_ENGINE] 
   → Geração dos 50 Start Frames 16:9 em estética 35mm Chiaroscuro (Prompt Master Matrix)
[3. FIREFLY_BOT (DISPARO OBRIGATÓRIO)] 
   → Alimentação da fila (`firefly-production-guide.json`) e execução do robô Firefly:
     `python -m firefly_bot.main --feed-guide <GUIA> && python -m firefly_bot.main --run`
   → Monitoramento dos jobs até o download dos takes MP4 em `editorial/execution/<SCENE>/firefly_take.mp4`
[4. REMOTION_COMPOSITOR] 
   → Composição das 50 cenas com a biblioteca modular de `remotion/documentary/` e acabamento 2.39:1
[5. FFMPEG_MUX] 
   → Muxing do vídeo com narração master, trilha sonora e sound design
[6. PACKAGING_4K] 
   → Renderização das 3 Thumbnails 4K (Industrial X-Ray) + metadados SEO
[7. REGISTRY] 
   → Registro canônico no Artifact Registry (`@OOL/EPXX:v1/master`)
```

---

## 🚀 COMANDOS OFICIAIS DO PIPELINE

```bash
# 1. Alimentar e disparar o Firefly Bot para um episódio:
python -m firefly_bot.main --root firefly-automation --feed-guide <PATH_TO_GUIDE.json>
python -m firefly_bot.main --root firefly-automation --run

# 2. Verificar status da fila do Firefly Bot:
python -m firefly_bot.main --root firefly-automation --status

# 3. Inspecionar o manifesto de execução de uma run:
npm run verify:run -- --runId <RUN_ID>

# 4. Validar conformidade total do PRD:
npm run check:prd -- --runId <RUN_ID>

# 5. Listar e consultar o Artifact Registry:
npm run registry -- list
```

---

## 🛡️ REGRAS INVIOLÁVEIS DE ORQUESTRAÇÃO

1. **Manifesto Obrigatório (`run-manifest.json`):** Toda run mantém registro em tempo real das 7 etapas.
2. **Proibido Pular o Firefly Bot:** Em produção real, o Firefly Bot deve ser explicitamente alimentado e acionado.
3. **Retomada Idempotente:** Uma run interrompida retoma a partir do último checkpoint concluído com sucesso, sem refazer etapas íntegras.
4. **Imutabilidade de Runs Concluídas:** Runs com status `COMPLETED` NUNCA são sobrescritas. Novas tentativas criam versões incrementais (`v2`, `v3`).
