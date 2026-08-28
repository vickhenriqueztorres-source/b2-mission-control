---
name: artifact-registry-derivation
description: >-
  Use when querying artifact handles (@PROJECT/EPISODE:vVERSION), resolving file paths, deriving new runs from approved narration audio (npm run derive:run), rebuilding the registry, or performing safe disk cleanups.
---

# 📦 Artifact Registry & Run Derivation Skill

Governa a identidade canônica, catálogo central de artefatos, linhagem de versões e derivação de runs.

---

## ⚡ REGRAS INVIOLÁVEIS

1. **Endereçamento por Handle:** Use sempre handles estáveis (`@OOL/EP02:v1/master`, `@OOL/EP02:v1/audio`). Nunca use descrições em prosa para localizar artefatos.
2. **Derivação de Áudio Aprovado:** Derivar runs reaproveita o áudio da versão anterior gerando novos visuais do zero. A linhagem é registrada com hash SHA-256 no manifesto.
3. **Isolamento entre Projetos:** É terminantemente proibido cruzar ou referenciar assets de projetos distintos (`CROSS_PROJECT_DERIVATION_BLOCKED`).
4. **Limpeza Segura:** A limpeza (`npm run registry -- clean`) remove apenas intermediários descartáveis (`chunk_*.mp4`, takes brutos), preservando integralmente entregáveis e áudios aprovados.

---

## 🚀 COMANDOS OFICIAIS

```bash
# 1. Listar runs registradas:
npm run registry -- list

# 2. Inspecionar artefato ou resolver caminho físico:
npm run registry -- inspect @OOL/EP02_CABOS:v1/master
npm run registry -- resolve @OOL/EP02_CABOS:v1/audio

# 3. Derivar nova run a partir de áudio aprovado:
npm run derive:run -- --source @OOL/EP02_CABOS:v1

# 4. Executar suíte de testes de registry e derivação:
npx ts-node tests/artifact_registry_derivation.test.ts
```
