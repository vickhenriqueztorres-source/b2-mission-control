# 🛡️ REGRA INVIOLÁVEL: GOVERNANÇA DE MOTION GRAPHICS — O OUTRO LADO

> **ESTA REGRA É PERMANENTE E OBRIGATÓRIA PARA TODA E QUALQUER PRODUÇÃO DE VÍDEO DO CANAL.**

---

## 1. O PRINCÍPIO DA COMPOSIÇÃO INTEGRADA (ZERO BYPASS)

1. **PROIBIDO BYPASS DE MOTION GRAPHICS:** É terminantemente proibido montar ou entregar um arquivo `final_master.mp4` apenas concatenando takes de vídeo brutos (`ffmpeg concat`) sem renderizar a camada completa de Motion Graphics do Remotion.
2. **MOTOR DE RENDER OFICIAL:** Todo vídeo final DEVE ser renderizado a partir das composições oficiais do Remotion (`Episode04GpsTempo`, `HslEpisode` ou a composição do episódio correspondente) com resolução Full HD 1080p @ 30fps.
3. **CAMADAS OBRIGATÓRIAS EM 100% DAS CENAS:**
   - **Camada 0 (Fundo / Base):** `#060709` (*Carbon Black*).
   - **Camada 1 (Mídia 35mm):** Take de vídeo cinematográfico com iluminação chiaroscuro e movimentação contínua (zero planos estáticos).
   - **Camada 2 (Telemetria Superior):** `<AtomicStopwatch />` com contagem em nanossegundos reais e status de nós/satélites.
   - **Camada 3 (Motion Graphic Específico):** Chamada de impacto (`<KineticEditorialCallout>`), contagem monumental (`<KineticNumberCounter>`), corte em raio-x (`<TechnicalCutawaySchematic>`) ou dossiê técnico (`<LaserScanDossier>`).
   - **Camada 4 (Tratamento Anamórfico 35mm):** `<AnamorphicCinematicOverlay />` (Letterbox 2.39:1, cantoneiras técnicas `[  ]`, granulação de filme 35mm e vinheta).

---

## 2. ARQUÉTIPOS CANÔNICOS DE MOTION GRAPHICS

| Arquétipo | Componente Remotion | Gatilho Narrativo | Elementos Visuais Chave |
|---|---|---|---|
| **Telemetria Master** | `<AtomicStopwatch />` | Global (100% do vídeo) | Horário UTC oscilando em nanossegundos, SV status |
| **Letterbox & 35mm** | `<AnamorphicCinematicOverlay />` | Global (100% do vídeo) | Barras 2.39:1, grão analógico, cantoneiras `[ ]` |
| **Headlines de Tensão**| `<KineticEditorialCallout />` | Hooks, transições de atos | Palavra de tensão em `#FF5500`, subheadline em `#00F0FF` |
| **Métricas Monumentais**| `<KineticNumberCounter />` | Frequências, dados de choque | Contagem rápida até valor final, destaque em `#FF5500` |
| **Raio-X de Hardware** | `<TechnicalCutawaySchematic>` | Revelação de máquinas internas | Corte a laser, cards de vidro translúcido `rgba(255,255,255,0.08)` |
| **Dossiê / Auditoria** | `<LaserScanDossier />` | Fórmulas, normas, protocolos | Selo de auditoria ciano, referências técnicas (Bacen, NIST) |
| **Rastreamento de Rede**| `<CyberMapTrace />` | Órbitas, fluxos globais | Linhas de rota laser ciano sobre relevo escuro |
| **Corte de Revelação** | `<LaserRevealWipe />` | Divisão Camada 1 vs Camada 2 | Feixe laser laranja varrendo a tela com glow |

---

## 3. TOKENS CROMÁTICOS & TIPOGRAFIA OBRIGATÓRIOS

* `COLOR_BG`: `#060709` (*Carbon Black*)
* `COLOR_SURFACE`: `#0D0E15` (*Deep Steel*)
* `COLOR_PRIMARY_XRAY`: `#FF5500` (*Sodium-Vapor Orange*)
* `COLOR_TELEMETRY`: `#00F0FF` (*Laser Cyan*)
* `COLOR_GLASS`: `rgba(255,255,255,0.08)` (*Frosted Glass*)
* `COLOR_TEXT_PRIMARY`: `#F4F4F0` (*Titanium White*)
* `COLOR_TEXT_MUTED`: `#8A8D9F` (*Muted Slate*)

* **Tipografia:**
  - Headlines: *Bebas Neue* ou *Druk Wide* (Caixa alta condensada).
  - Telemetria e Dados: *JetBrains Mono* (Monoespaçada com alta densidade técnica).
  - Subtítulos e Fontes: *Inter Medium*.

---

## 4. MATRIZ DE REGRAS PARA GERAÇÃO DE QUALQUER NOVO VÍDEO

1. **Ao criar o roteiro:** Cada cena deve ter seu `motionArchetype` e `calloutText` definidos no script/seed.
2. **Ao compilar a timeline:** O compilador deve gerar as sequences do Remotion com as posições dos callouts (`bottom_left`, `center`, `top_right`).
3. **Ao renderizar o master:** Chamar explicitamente a renderização via Remotion CLI (`npx remotion render`) em pedaços seguros (chunks) ou composição unificada.
4. **Verificação do Gatekeeper:** O `PipelineContractGate` deve rejeitar vídeos que não contenham as camadas gráficas validadas.
