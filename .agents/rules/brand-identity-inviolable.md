---
trigger: always_on
---

# 🛡️ REGRA INVIOLÁVEL: IDENTIDADE VISUAL & EDITORIAL — O OUTRO LADO

> **ESTA REGRA É PERMANENTE E INVIOLÁVEL. NENHUM AGENTE DEVE ALTERAR ESTES PADRÕES.**

## 1. Identidade Visual Obrigatória
- **Direção:** `DOSSIÊ DO SISTEMA` (Versão 3.0 — Identidade Industrial X-Ray com Linguagem Investigativa Editorial)
- **Estética:** `Denis Villeneuve Cyber-Industrial (35mm Anamorphic)`
- **Tese Visual:** *"A verdade de um sistema aparece quando seus rastros são colocados lado a lado."*
- **Slogan:** *"O que acontece depois que você clica, compra, liga ou aperta."*
- **Assinatura:** *"INVESTIGAR. REVELAR. COMPREENDER."* (`REVELAR` com destaque pontual em `#FF5500`, sem banhar todas as aplicações)
- **Voz Oficial:** `Chris` (ElevenLabs — `iP95p4xoKVk53GoZ742B`, `eleven_multilingual_v2`), tom moderno, íntimo e investigativo.

## 2. Tokens Cromáticos & Proporções
- `COLOR_BG`: `#060709` (Carbon Black - ~70% da tela)
- `COLOR_SURFACE`: `#0D0E15` (Deep Steel - superfícies, máquinas, matéria física)
- `COLOR_PRIMARY_XRAY`: `#FF5500` (Sodium-Vapor Orange - **Uso pontual e significativo**: descoberta, evidência, rota ativa, alerta, ponto crítico)
- `COLOR_TELEMETRY`: `#00F0FF` (Laser Cyan - **Uso estritamente restrito**: nós, coordenadas, fluxo ou conexões)
- `COLOR_GLASS`: `rgba(255,255,255,0.08)` (Frosted Glass - sobreposição de documentos e painéis)
- `COLOR_TEXT_PRIMARY`: `#F4F4F0` (Titanium White - títulos e informação principal)
- `COLOR_TEXT_MUTED`: `#8A8D9F` (Muted Slate - fontes, metadados e notas)

## 3. O Princípio das Duas Camadas (A Realidade Comanda)
- **Camada 1 (Superfície Visível):** Mundo real observado em 35mm chiaroscuro (concreto, aço escuro, asfalto molhado, documentos, telas reais, água, máquinas). Zero rostos humanos forçados.
- **Camada 2 (Mecanismo Revelado):** Rota ativa, dados, diagramas e cortes técnicos. A segunda camada **NUNCA deve dominar todas as cenas**; ela entra apenas para esclarecer o que a primeira camada não consegue mostrar.

## 4. Proporções Canônicas de Produção por Episódio
- **50–60%** Realidade e filmagem/arquivo contextualizado (matéria bruta).
- **20–30%** Documentos, registros, dados e evidências (`EvidenceCard`, `DocumentHighlight`).
- **10–20%** Mapas, timelines e gráficos editoriais (`RouteMap`, `Timeline`, `ComparisonChart`).
- **05–15%** Reconstruções 3D e revelações técnicas controladas (`TechnicalReveal`, `IndustrialCutaway`).

## 5. Prompt Master de IA
```text
Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, {SUBJECT}, real observable physical textures, [concrete / weathered steel / wet asphalt / industrial cables / authentic paperwork], monumental scale, atmospheric chiaroscuro lighting, deep carbon blacks (#060709), subtle sodium-vapor amber reflections (#FF5500) and sharp cyan laser telemetry lights (#00F0FF), dense volumetric fog and steam, wet reflective ground, shallow depth of field, creamy anamorphic bokeh, filmic texture, raw realistic industrial photography, 8k, no text, no synthetic CGI artifacts, no human faces --ar 16:9
```

## 6. Proibições Absolutas & Critério de Aprovação
- ❌ NUNCA usar rostos humanos forçados com expressões de espanto.
- ❌ NUNCA usar setas vermelhas, emojis ou clickbait barato.
- ❌ NUNCA usar estética de videogame, dashboard futurista genérico ou cripto.
- ❌ NUNCA começar roteiros ou vídeos pelo nome técnico de protocolos.
- ❌ NUNCA aplicar efeitos gráficos ou Laranja/Ciano sem função direta de prova ou descoberta.
- ❓ **Pergunta Definitiva:** *"Se eu remover o efeito, ainda resta uma evidência, uma pergunta ou uma descoberta?"* Se não, remova o efeito.

## 7. Composição Orientada a Dados & Motor Cinematográfico
- **Caminho Único**: Novos episódios = `contracts/episodes/<id>.episode.json` + `TimelineContract` (`contracts/timelineContract.ts`).
- ❌ **Proibição Total**: PROIBIDO criar componente `EpisodeXXX.tsx` artesanal ou `<Sequence>` com corte seco fora do `CinematicEpisode`.
- **Motor Canônico**: `<CinematicEpisode timeline={timeline} audio={audioManifest} />` em `remotion/cinema/CinematicEpisode.tsx` é a autoridade única de renderização.

