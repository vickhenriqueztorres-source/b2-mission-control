---
name: pipeline-contract-gate
description: >-
  Use when validating asset integrity, checking pre-render contracts, verifying scene start frames (PNG 16:9), Firefly video takes (MP4), ffprobe durations, or diagnosing and healing missing assets in an episode run.
---

# 🛡️ Pipeline Contract Gate & Anti-Ghosting Skill

Governa a integridade física de mídia e a eliminação de falhas silenciosas no pipeline de vídeo.

---

## ⚡ REGRAS INVIOLÁVEIS

1. **Zero Telas Pretas / Zero Ghosting:** Toda cena deve possuir `firefly_start_frame.png` (>10 KB) e `firefly_take.mp4` (>50 KB).
2. **Validação Binária:** Todo frame PNG deve conter o cabeçalho `0x89 0x50 0x4E 0x47` e takes MP4 devem passar no `ffprobe`.
3. **Bloqueio Determinístico:** Se qualquer asset faltar ou for 0-byte, a renderização DEVE ser abortada com exit code 1.
4. **Healer Cirúrgico:** Em caso de falha, acione o healer cirúrgico para regenerar apenas os beats corrompidos sem reexecutar o pipeline completo.

---

## 🚀 COMANDOS OFICIAIS

```bash
# 1. Validar contrato pré-render da run ativa:
npm run gate:pre-render

# 2. Executar auditoria completa com ffprobe:
npm run gate:full

# 3. Executar suíte de testes de contrato:
npx ts-node tests/pipeline_contract_gate.test.ts
```
