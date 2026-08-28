---
name: pipeline-resilience-orchestrator
description: >-
  Use when running full episode productions, resuming interrupted runs, inspecting run manifests (run-manifest.json), managing stage checkpoints, or handling Firefly bot retries and idempotency.
---

# ⚙️ Pipeline Resilience & Orchestrator Skill

Governa a execução determinística, checkpoints, retries e o ciclo de vida das 7 etapas de produção de **O Outro Lado**.

---

## ⚡ FLUXO OBRIGATÓRIO DE EXECUÇÃO HÍBRIDA & SOB DEMANDA

Quando o usuário escolhe um tema ou ordena a produção de um episódio, o pipeline segue a cadeia otimizada de 7 etapas:

```
[1. PREPRODUCTION] 
   → Pesquisa documental, Roteiro em 6 Atos, Narração Neural & scene_timings.json
[2. IMAGE_ENGINE & BANCO CENTRAL] 
   → Geração dos Start Frames 16:9 em estética 35mm Chiaroscuro (Prompt Master Matrix)
   → Auto-ingestão e arquivamento no Banco Central de Imagens (`assets/image_repository/`)
[3. VIDEO_ENGINE (REPOSITÓRIO CENTRAL + FIREFLY SOB DEMANDA)] 
   → 3.1 Consulta inteligente ao Repositório Central de Vídeos (`assets/video_repository/`)
   → 3.2 Se um clip compatível existir: Reutiliza o vídeo diretamente (Cache Hit)
   → 3.3 Se necessário take inédito: Dispara o Firefly Bot cirurgicamente apenas para cenas faltantes:
         `python -m firefly_bot.main --root firefly-automation --feed-guide <GUIA> && python -m firefly_bot.main --run`
   → 3.4 Auto-ingestão de takes recém-gerados no Repositório Central para reuso futuro
   → 3.5 Cenas com foco em esquemáticos/dados utilizam Motion Procedural / Paralaxe Remotion 2.5D
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
# 1. Ingerir novo vídeo no Repositório Central:
npm run media:ingest-video -- --file <VIDEO.mp4> --category infrastructure --tags "rodovia,noturno"

# 2. Sincronizar imagens de uma run com o Banco Central de Imagens:
npm run media:sync-images -- --runId <RUN_ID> --topic <TOPIC>

# 3. Testar algoritmo de matching semântico de vídeos:
npm run media:test-matcher

# 4. Alimentar e disparar o Firefly Bot sob demanda:
python -m firefly_bot.main --root firefly-automation --feed-guide <PATH_TO_GUIDE.json>
python -m firefly_bot.main --root firefly-automation --run

# 5. Inspecionar o manifesto e integridade de uma run:
npm run verify:run -- --runId <RUN_ID>

# 6. Validar conformidade total do PRD:
npm run check:prd -- --runId <RUN_ID>
```

---

## 🛡️ REGRAS INVIOLÁVEIS DE ORQUESTRAÇÃO

1. **Manifesto Obrigatório (`run-manifest.json`):** Toda run mantém registro em tempo real das etapas.
2. **Prioridade ao Repositório Central:** Sempre consultar o repositório de vídeos para reaproveitamento inteligente antes de abrir navegadores.
3. **Geração Cirúrgica Sob Demanda:** O Firefly Bot é disparado apenas quando necessário para as cenas faltantes, auto-catalogando o resultado no repositório.
4. **Imagens Inéditas & Auto-Arquivamento:** Start frames são gerados do zero para cada novo episódio e sincronizados com o Banco Central de Imagens.
5. **Retomada Idempotente:** Uma run interrompida retoma a partir do último checkpoint concluído com sucesso, sem refazer etapas íntegras.
