Manual de Identidade Visual e Design System Fixo do Hidden Systems
Lab.

Este documento serve como a especificação técnica imutável para alimentar o
Codex, os scripts de automação do Remotion e os geradores de prompts, garantindo
consistência visual absoluta em todos os episódios.

BRAND-SYSTEM-MANUAL.md

1. Regras Imutáveis de Produção (Core Rules)

1.  Formato: 16:9 (3840x2160 4K Master / 1920x1080 Render), 30 fps.
2.  Estética: Kinetic Pop-Documentary (Fundo fosco escuro + amarelo ácido + azul
    elétrico + tipografia condensada massiva).
3.  Pacing: Mudança visual ou movimento a cada 4 a 7 segundos.
4.  Sem Rostos: Zero apresentadores ou pessoas olhando para a câmera.
5.  Divisão de Mídia por Episódio:
      - 50–60% Remotion (diagramas, mapas, fluxos, números).
      - 20–25% Material real e arquivos históricos.
      - 15–20% Vídeo generativo I.A. (Kling).
      - 5% Bumpers de capítulo e tipografia pura.

2. Design Tokens: Paleta Semântica Fixa

É proibido o uso de cores fora desta tabela:

| Token Name               | Hex Code  | Função Narrativa                                        |
| :----------------------- | :-------- | :------------------------------------------------------ |
| `COLOR_BG_DARK`          | `#0D0E15` | Fundo principal (Obsidian Matte)                        |
| `COLOR_SURFACE`          | `#161824` | Fundo de cards, caixas e painéis                        |
| `COLOR_SURFACE_BORDER`   | `#26293D` | Bordas técnicas e grid (1px)                            |
| `COLOR_ACCENT_YELLOW`    | `#FFE500` | **Ponto focal primário**, setas cinéticas, hero metrics |
| `COLOR_ACCENT_BLUE`      | `#0038FF` | Infraestrutura secundária, rotas e água/eletricidade    |
| `COLOR_STATE_BOTTLENECK` | `#FF2E00` | Gargalos, calor, falhas críticas, bloqueios             |
| `COLOR_STATE_RECOVERY`   | `#00FF85` | Redundância, solução, fluxo restabelecido               |
| `COLOR_TEXT_PRIMARY`     | `#F4F4F0` | Títulos principais e dados de alto destaque             |
| `COLOR_TEXT_MUTED`       | `#8C90A4` | Subtítulos, fontes e telemetria técnica                 |

3. Tipografia Oficial

Carregamento via @remotion/google-fonts:

// src/styles/typography.ts
export const TYPOGRAPHY = {
  heading: 'Bebas Neue, sans-serif',      // Títulos gigantes, números hero, bumpers
  body: 'Inter, sans-serif',             // Textos de explicação, cards de evidência
  mono: 'JetBrains Mono, monospace',     // Telemetria, timestamps, unidades ("3,800 L/min")
};

Hierarquia de Tamanhos (Base 1080p):

  - Hero Title (Bumper): 96px - 120px | Bebas Neue | Tracking: 2px
  - Card Header / Pergunta: 44px - 56px | Bebas Neue | Tracking: 1px
  - Texto de Apoio: 22px - 26px | Inter | Regular / Semi-Bold
  - Telemetria / Labels / Fontes: 14px - 16px | JetBrains Mono | Medium /
    Uppercase

4. Grid Global & Layout Master (<KineticLayout />)

Toda cena do Remotion deve ser envolvida pelo componente de layout global:

┌────────────────────────────────────────────────────────────────────────┐
│ [ ┌ HSL ┐ ]                                      CHAPTER 02 // 04:12   │
│ [ └ DOCS┘ ]                                                            │
│                                                                        │
│                                                                        │
│                       ÁREA DINÂMICA DE CONTEÚDO                        │
│                 (Kling Video / Diagrama Remotion)                      │
│                                                                        │
│                                                                        │
│ SOURCE: FAA TECHNICAL REPORT 2025               [ SIMULAÇÃO DE SISTEMA ]│
└────────────────────────────────────────────────────────────────────────┘

  - Margem Segura: 64px em todas as bordas (Safe zone para Smart TVs).
  - Topo Esquerdo: Watermark [ HSL DOCS ] constante (Opacidade 0.85).
  - Topo Direito: Indicador de Capítulo (CHAPTER XX) em JetBrains Mono.
  - Rodapé Esquerdo: SourceLowerThird (Fonte do dado ou relatório).
  - Rodapé Direito: AIReconstructionLabel (Obrigatório em cenas do Kling).

5. Física de Movimento & Transições (Motion Specs)

O canal utiliza física elástica de mola (Spring Physics) para dar o aspecto
Kinetic Pop.

// Configurações padrão do Remotion spring()
export const MOTION_CONFIGS = {
  elasticPop: { damping: 12, mass: 0.6, stiffness: 180 }, // Entrada de cards, números e setas
  smoothPan: { damping: 20, mass: 1.0, stiffness: 80 },   // Câmera em mapas e diagramas
  heavyDrop: { damping: 14, mass: 1.2, stiffness: 140 },  // Cards empilhados caindo
};

Regras de Transição:

  - Entrada de Elementos: Escala de 0.8 para 1.0 + Fade 0 -> 1 em 8 frames.
  - Saída: Fade rápido de 4 frames sem overshoot.
  - Corte entre Cenas: Direto (hard cut) ou Whip-pan horizontal de 6 frames com
    rastro amarelo.

6. Módulos Visuais Padrão (Os 5 Blocos Essenciais)

1. HeroMetricCard

  - Uso: Destacar números massivos e limites de capacidade.
  - Visual: Fundo #161824, número em Bebas Neue gigante (#FFE500), etiqueta em
    JetBrains Mono.

2. KineticFlowTrace

  - Uso: Movimento de combustível, água, carga, dados ou dinheiro.
  - Visual: Vetor com linha tracejada e partículas brilhantes amarelas (#FFE500)
    ou azuis (#0038FF) fluindo na direção real do movimento.

3. ViewfinderCallout

  - Uso: Apontar um detalhe invisível em uma imagem real ou vídeo do Kling.
  - Visual: Seta amarela grossa (#FFE500) + cantoneiras de foco [ ] + caixa de
    pressão/status.

4. SystemSplitFlap

  - Uso: Transições temporais ou incrementos rápidos de volume.
  - Visual: Dígitos mecânicos estilo placar de aeroporto.

5. EvidenceSourceBadge

  - Uso: Exibir documentos reais, plantas e relatórios oficiais.
  - Visual: Card com efeito de papel técnico escurecido e carimbo de validação.

7. Diretrizes Rígidas para Prompts do Kling (I.A.)

Para evitar o aspecto de "vídeo genérico de I.A.", todo prompt submetido à API
deve incluir o HSL Modifier Block:

[AÇÃO OU ESTRUTURA ESPECÍFICA], documentary cinematography, 35mm lens,
shot on Arri Alexa, industrial color palette with matte charcoal (#0D0E15) and vibrant yellow highlights,
volumetric haze, slow continuous mechanical movement, hyper-realistic textures,
no human faces looking at camera, high contrast, clean architectural framing --motion 3

8. Sound Design & Ducking Rules

1.  Trilha Sonora: Eletroacústica minimalista, batidas industriais limpas,
    pulsos graves contínuos.
2.  Regra de Volume:
      - Narração ativa: Volume da trilha reduz para -18dB (ducking automático).
      - Bumpers de capítulo / Sem voz: Volume sobe para -6dB.
3.  SFX Obrigatórios por Ação:
      - Seta cinética / Pop: sfx_snap_pop.wav
      - Alerta / Gargalo: sfx_subtle_strike.wav
      - Transição de Capítulo: sfx_heavy_sub_drop.wav

9. Arquivo de Tokens JSON para Código (hsl-tokens.json)

{
  "name": "Hidden Systems Lab Design Tokens",
  "version": "1.0.0",
  "colors": {
    "background": "#0D0E15",
    "surface": "#161824",
    "border": "#26293D",
    "yellow": "#FFE500",
    "blue": "#0038FF",
    "orange": "#FF2E00",
    "green": "#00FF85",
    "textPrimary": "#F4F4F0",
    "textMuted": "#8C90A4"
  },
  "fonts": {
    "heading": "Bebas Neue",
    "body": "Inter",
    "mono": "JetBrains Mono"
  },
  "springs": {
    "pop": { "damping": 12, "mass": 0.6, "stiffness": 180 },
    "pan": { "damping": 20, "mass": 1.0, "stiffness": 80 },
    "drop": { "damping": 14, "mass": 1.2, "stiffness": 140 }
  }
}
