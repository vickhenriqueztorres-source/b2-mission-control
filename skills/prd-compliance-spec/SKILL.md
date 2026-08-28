---
name: prd-compliance-spec
description: >-
  Use when auditing PRD compliance, verifying narration duration (5-12 min), checking audio/video synchronization (<=2.5s delta), validating 6-chapter structure, or enforcing typed constants from spec/hsl-spec.ts.
---

# 📋 PRD Compliance & Executable Specification Skill

Governa as regras inegociáveis de produto e a autoridade canônica tipada em `spec/hsl-spec.ts`.

---

## ⚡ AS 6 CLÁUSULAS INEGOCIÁVEIS DO PRD

1. **PRD-R01-NARRATION-DURATION:** Duração do `narration.mp3` entre 300s e 720s (5 a 12 min).
2. **PRD-R02-AUDIO-VIDEO-SYNC:** Descompasso temporal entre áudio e vídeo $\le 2.5\text{s}$.
3. **PRD-R03-CHAPTER-STRUCTURE:** Exatamente 6 capítulos progressivos contínuos sem lacunas.
4. **PRD-R04-BEATS-VS-ASSETS:** 100% das 50 cenas com frames e takes físicos válidos (Zero Tela Preta).
5. **PRD-R05-PACKAGING-PACKAGE:** 3 Thumbnails 4K válidas ($> 100\text{ KB}$) + `description.txt` + `youtube-metadata.json`.
6. **PRD-R06-PLAN-IMMUTABILITY:** Hash SHA-256 do plano de edição verificado.

---

## 🚀 COMANDOS OFICIAIS

```bash
# 1. Auditar conformidade completa da run contra o PRD:
npm run check:prd

# 2. Executar suíte de testes de conformidade do PRD:
npx ts-node tests/prd_compliance.test.ts
```
