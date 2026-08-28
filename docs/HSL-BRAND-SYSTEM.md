# MANUAL DE IDENTIDADE VISUAL: O OUTRO LADO

Este documento é a **especificação técnica definitiva** da identidade visual **Industrial X-Ray** para o canal **O Outro Lado**, pronta para alimentar o pipeline automatizado no Remotion, Kling e geradores de imagem.

Contrato executavel atual: **`HSL_VISUAL_IDENTITY_V2`** (Dossiê do Sistema v3.0).

---

## 1. Conceito Central & Universo Visual

* **Arquétipo Estético:** *Industrial X-Ray / Cinematic Thriller*.
* **Sensação:** Revelação de segredos de engenharia, mistério técnico, acesso a áreas restritas e iluminação cinematográfica de alta tensão.
* **Pilares Visuais:**
  1. **A Linha Laser de Corte:** Uma lâmina de luz laranja (`#FF5500`) que divide a realidade opaca da máquina e revela suas entranhas luminosas.
  2. **Vidro Fosco (Glassmorphism):** Painéis e cards translúcidos flutuando sobre as cenas reais com telemetria técnica.
  3. **Atmosfera Volumétrica:** Névoa, partículas em suspensão e reflexos metálicos nos vídeos gerados por I.A.

---

## 2. Paleta de Cores Oficial (Design Tokens)

Uso estrito e semântico de cores:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ PALETA SEMÂNTICA: INDUSTRIAL X-RAY                                    │
├────────────────────────────────────────────────────────────────────────┤
│ [ #060709 ] CARBON BLACK        Base void / Fundo cinematográfico      │
│ [ #FF5500 ] SODIUM-VAPOR ORANGE Interior revelado / Gargalo / Laser Cut│
│ [ #00F0FF ] LASER CYAN          Fluxo de dados / Análise e telemetria  │
│ [ rgba(255,255,255,0.08) ]      FROSTED GLASS (Cards e painéis)        │
│ [ #F4F4F5 ] TITANIUM WHITE      Títulos e dados primários de alto peso │
│ [ #71717A ] MUTED SLATE         Textos secundários e coordenadas HUD   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tipografia Oficial

Fontes abertas para carregamento nativo no Remotion via `@remotion/google-fonts`:

| Função | Família Tipográfica | Peso / Tracking | Aplicação |
| :--- | :--- | :--- | :--- |
| **Hero / Títulos** | `Bebas Neue` ou `Anton` | Bold / Tracking `2px` | "O OUTRO LADO", nomes de capítulos, números massivos |
| **Texto de Apoio** | `Inter` | Regular (400) / Semi-Bold (600) | Explicações técnicas, descrição de documentos |
| **Telemetria / HUD** | `JetBrains Mono` | Medium (500) / Uppercase | Coordenadas, percentual de revelação, fontes, labels |

---

## 4. Logo, Avatar & Ícone Oficial

### O Símbolo: "The Split Core" (O Núcleo Dividido)
Uma escotilha mecânica escura cortada verticalmente ao meio por um feixe de luz laser:
* **Lado Esquerdo:** Metal escuro fosco e blindagem mecânica fria (`#060709`).
* **Lado Direito:** Mecanismo interno em corte transversal brilhando em laranja incandescente (`#FF5500`).

### Prompt para Gerar o Avatar Master (Midjourney v6.1 / Flux 1.1 Pro):
> `Cinematic documentary studio icon logo, circular industrial mechanical reactor core split vertically in half by a blazing laser light beam, left half is dark matte carbon steel, right half is an illuminated glowing orange internal mechanical cross-section with high-tech gears and conduits (#FF5500), dark carbon background (#060709), technical precision, ultra-clean vector textures, 8k, centered icon, isolated --v 6.1 --style raw`

<<<<<<< HEAD
Elementos editoriais sao usados somente quando a informacao precisa permanecer exata. O master documental nao usa moldura ou telemetria persistente.

- `HSL DOCS`, `AI VISUALIZATION` e barra de carregamento ficam desligados no master;
- textos aparecem como beats pontuais, nunca como overlay global;
- Start Frames generativos nao possuem texto embutido;
- area de acao principal permanece livre de safe areas editoriais.
=======
---

## 5. Banner do YouTube (2560 x 1440 px)
>>>>>>> 83e11b5 (feat: complete end-to-end documentary production engine and EP06 Gasolina)

* **Composição da Safe Area Central (1546 x 423 px):**
  * **Lado Esquerdo:** Símbolo *Split Core* + Assinatura tipográfica: **O OUTRO LADO** (com o "O" em Laranja `#FF5500` e o restante em Titânio `#F4F4F5`) + Subtítulo em `JetBrains Mono`: `INVESTIGAR • REVELAR • COMPREENDER`.
  * **Lado Direito:** Corte esquemático X-Ray de um duto/sistema industrial com feixes de laser laranja e ciano.

### Prompt para Gerar o Fundo do Banner:
> `Cinematic YouTube documentary banner backdrop, ultra-wide 16:9 framing, dark atmospheric industrial infrastructure interior, heavy dark machinery and pipes cut open by an intense vertical orange laser line (#FF5500) revealing glowing mechanical interiors, cyan telemetry laser grids (#00F0FF), volumetric smoke, anamorphic lens flare, dark carbon black background (#060709), empty center area for text, hyper-detailed 8k --ar 16:9 --v 6.1 --style raw`

---

## 6. Sistema de Thumbnails de Alto CTR (A Fórmula X-Ray)

```text
┌─────────────────────────────────────────────────────────────┐
│  [ HERO SHOT ]                                              │
│  Uma máquina, estrutura ou duto gigante à noite em 4K.      │
│                                                             │
│  [ CORTE X-RAY INDUSTRIAL ]                                 │
│  Metade do objeto cortado revelando o interior incandescente│
│  em Laranja Vapor de Sódio (#FF5500) com vapor/luz.         │
│                                                             │
│  [ SELO TÉCNICO DE VERIFICAÇÃO ]                            │
│  Badge holográfico em ciano: "[ ANÁLISE TÉCNICA VERIFICADA ]"│
│                                                             │
│  [ TEXTO MASSIVO EM 2 LINHAS ]                              │
│  "O QUE ESTÁ" (Branco) / "POR DENTRO?" (Laranja #FF5500)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Linguagem de Movimento no Remotion (Motion Specs)

```ts
export const XRAY_MOTION = {
  laserWipe: { damping: 20, mass: 0.8, stiffness: 90 },     // Transição de revelação X-Ray
  glassFloat: { damping: 15, mass: 1.0, stiffness: 120 },   // Cards de vidro entrando
  telemetryScan: { damping: 30, mass: 0.5, stiffness: 200 } // Rotação do gauge de revelação
};
```

### Regras dos Componentes:
1. **`<LaserRevealWipe />`:** Uma barra de luz laranja com glow passa da esquerda para a direita, revelando o gráfico Remotion por baixo do vídeo do Kling.
2. **`<GlassCard />`:** Caixa com `background: rgba(255,255,255,0.06)`, `backdrop-filter: blur(12px)` e borda fina de `1px solid rgba(255,85,0,0.3)`.
3. **`<RevelationGauge />`:** Mostrador radial com contagem de `0%` a `100%` (`"NÍVEL DE REVELAÇÃO"`).

---

## 8. Diretrizes de Prompts do Kling (Atmosfera & Luz)

Todo prompt para a API do Kling deve incluir o bloco de modificadores de iluminação industrial:

```text
[AÇÃO INDUSTRIAL OU SISTEMA ESPECÍFICO], documentary cinematography, 35mm anamorphic lens, 
dramatic moody lighting dominated by deep carbon black (#060709) and fiery sodium-vapor orange (#FF5500) glowing accents, 
subtle cyan highlights (#00F0FF), volumetric steam and haze, slow controlled tracking shot, 
photorealistic metal textures, high dynamic range, no human faces visible, pristine cinematic framing --motion 3
```
<<<<<<< HEAD

Texto, logo, labels e dados sao adicionados no Remotion. Nao pedir ao Kling que gere tipografia legivel.

## Start Frame Identity Lock

- referencia minima: `assets/hsl/motion-reference-set-v1/manifest.json`;
- fotografia documental realista e infografico espacial devem coexistir;
- amarelo acompanha o fluxo ativo, azul revela a infraestrutura e laranja marca somente a falha;
- um assunto dominante, um foco luminoso e uma transformacao planejada por shot;
- o Start Frame representa o estado inicial, nao o resultado completo;
- procedural previs, flat vector, placeholder e proxy sao proibidos em producao;
- todo asset aprovado registra `hsl.start-frame.provenance.v2` e hashes de frame, prompt, referencia e contact sheet.

## Thumbnail

Formula: objeto central isolado, detalhe mecanico forte, seta amarela grande e no maximo uma frase curta em Bebas Neue. A thumbnail deve prometer o mecanismo real entregue pelo episodio, sem falso misterio.

## Audio

- trilha eletroacustica minimalista e industrial;
- narracao ativa: trilha em -18 dB;
- bumper sem voz: ate -6 dB;
- SFX de pop, gargalo e chapter drop sincronizados com a acao;
- atmosfera continua sob o episodio.
=======
>>>>>>> 83e11b5 (feat: complete end-to-end documentary production engine and EP06 Gasolina)
