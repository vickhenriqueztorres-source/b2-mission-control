# 🛡️ LEI DE IDENTIDADE INVIOLÁVEL — CANAL O OUTRO LADO

> **ESTA REGRA TEM PRECEDÊNCIA MÁXIMA E NUNCA DEVE SER ALTERADA OU DESVIADA POR NENHUM AGENTE.**
> 
> *Direção Aprovada:* **DOSSIÊ DO SISTEMA (Versão 3.0)** — *Identidade Industrial X-Ray com Linguagem Investigativa Editorial*  
> *Estética Cinematográfica:* **Denis Villeneuve Cyber-Industrial (35mm Anamorphic / Blade Runner 2049)**  
> *Tese Visual:* **"A verdade de um sistema aparece quando seus rastros são colocados lado a lado."**  
> *Slogan Mestre:* **"O que acontece depois que você clica, compra, liga ou aperta."**  
> *Assinatura da Marca:* **INVESTIGAR. REVELAR. COMPREENDER.** (*REVELAR* com destaque pontual em `#FF5500`, sem banhar todas as aplicações)

---

## 1. O PRINCÍPIO DAS DUAS CAMADAS (A REALIDADE COMANDA)

Toda imagem, plano de vídeo, miniatura e gráfico DEVE obedecer ao contraste disciplinado entre duas camadas:

1. **Camada 1 — A Superfície Visível (A Matéria Bruta):**
   - Aço carbono escuro (`#060709` / `#0D0E15`), asfalto molhado, concreto armado, carcaça de máquinas, navios, turbinas, subestações, documentos reais e telas observadas.
   - Fotografia 35mm cinematográfica com iluminação *low-key* chiaroscuro, sombras profundas e textura física observada.
   - **PROIBIÇÃO TOTAL:** Proibido rostos humanos forçados, apresentador na tela, expressões de espanto ou pessoas olhando para a câmera.

2. **Camada 2 — O Mecanismo Revelado (O Raio-X Físico & Editorial):**
   - Rota ativa, conexão de dados, fenda de corte técnico, estrutura interna e fluxo invisível.
   - Iluminação pontual em **Laranja Vapor de Sódio (`#FF5500`)** para alertas, evidências e pontos críticos.
   - Coordenadas geográficas, status de nós e telemetria estritamente em **Ciano Laser (`#00F0FF`)**.
   - Painéis de contexto e cards em **Vidro Fosco (`rgba(255,255,255,0.08)`)**.
   - **Regra de Ouro:** A segunda camada **NUNCA deve dominar todas as cenas**; ela entra apenas para esclarecer o que a primeira camada não consegue mostrar sozinha.

---

## 2. TABELA DE TOKENS CROMÁTICOS OBRIGATÓRIOS

| Token | Hex / Valor | Nome Oficial | Aplicação Obrigatória |
|---|---|---|---|
| `COLOR_BG` | `#060709` | **Carbon Black** | Fundo mestre, sombras profundas (~70% da tela) |
| `COLOR_SURFACE` | `#0D0E15` | **Deep Steel** | Carcaças de máquinas, concreto, superfícies físicas |
| `COLOR_PRIMARY_XRAY` | `#FF5500` | **Sodium-Vapor Orange** | **Uso pontual**: rota ativa, alerta, evidência, ponto crítico |
| `COLOR_TELEMETRY` | `#00F0FF` | **Laser Cyan** | **Uso restrito**: nós, coordenadas GPS, dados de telemetria |
| `COLOR_GLASS` | `rgba(255,255,255,0.08)` | **Frosted Glass** | Painéis translúcidos, sobreposição de documentos |
| `COLOR_TEXT_PRIMARY` | `#F4F4F0` | **Titanium White** | Tipografia principal, títulos, perguntas |
| `COLOR_TEXT_MUTED` | `#8A8D9F` | **Muted Slate** | Metadados, referências regulatórias, timestamps |

---

## 3. PROMPT MASTER MATRIX (DALL-E 3 / FIREFLY)

Todo prompt de geração de imagem ou início de plano DEVE conter obrigatoriamente a fórmula:

```text
Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, 
[SUBJECT / MACHINERY / INFRASTRUCTURE], monumental scale, atmospheric chiaroscuro 
lighting, deep carbon blacks (#060709), illuminated by glowing sodium-vapor amber 
reflections (#FF5500) and sharp cyan laser telemetry lights (#00F0FF), dense 
volumetric fog and steam, wet reflective ground, shallow depth of field, creamy 
anamorphic bokeh, filmic texture, raw realistic industrial photography, 8k, 
no text, no human faces --ar 16:9
```

---

## 4. DESIGN DAS THUMBNAILS (MOCKUP OFICIAL)

Toda thumbnail DEVE reproduzir fielmente os elementos do board de referência:
1. **Símbolo Split Core:** Círculo industrial bipartido ao meio por laser laranja.
2. **Headline Curta:** 1 a 4 palavras em caixa alta (*Bebas Neue* / *Druk*), com a palavra de tensão em `#FF5500`.
3. **Subheadline Técnica:** Em Ciano Laser (`#00F0FF`) com barra indicadora vertical.
4. **Selo Circular de Auditoria:** Anel concêntrico ciano com `ANÁLISE O OUTRO LADO // INVESTIGAÇÃO TÉCNICA VERIFICADA`.
5. **UI Accents:** Indicador com listras diagonais laranja, Coordenadas geográficas reais, Dial circular `% REVELADO`, Status de Análise (Fontes, Testemunhos, Documentos) e Alerta de Revelação.
6. **PROIBIDO:** Zero emojis, zero setas vermelhas, zero rostos humanos, zero estética de videogame ou cripto.

---

## 5. REGRAS EDITORIAIS E DE NARRATIVA

1. **Vender a Descoberta do Invisível:** Não dar aula acadêmica; transformar familiaridade em espanto.
2. **Ordem Explicativa Rígida:**
   $$\text{Efeito Cotidiano} \longrightarrow \text{Mecanismo Oculto} \longrightarrow \text{Nome Técnico} \longrightarrow \text{Implicação para Você}$$
3. **A Unidade como Personagem:** Acompanhar sempre uma única unidade em movimento (R$ 1, Uma Mensagem, Um Pacote, Um kWh, Um Litro, Um Contêiner).
4. **Cadência de Áudio e Voz Oficial:**
   - **Provedor:** `ElevenLabs` | **Voz:** `Chris` (`iP95p4xoKVk53GoZ742B`) | **Modelo:** `eleven_multilingual_v2`.
   - **Tom:** Moderno e íntimo, sóbrio e autoritário (~146 WPM).
   - **Montagem:** Cortes de 2.5s a 4.5s por plano (micro-movimento contínuo, zero planos estáticos).

---

## 6. PRÉ-REQUISITO OBRIGATÓRIO DE PRODUÇÃO: FIREFLY DOCTOR

Antes de iniciar qualquer execução ou pipeline de produção de takes reais via Firefly, o agente DEVE rodar e validar o checklist de ambiente e sessão:

```bash
pnpm firefly:doctor
# ou npm run firefly:doctor
```

### Regras Inegociáveis de Execução do Firefly:
1. **Sessão Autenticada Real:** O comando `firefly:doctor` executa probe real via Chrome headless. Se a sessão estiver expirada ou deslogada (`FIREFLY_SESSION_DEAD`), a produção é bloqueada imediatamente.
2. **Zero Fallbacks Sintéticos:** É estritamente proibido criar takes simulados com Ken Burns ou marcar cenas com falha como sucesso. Toda falha é registrada como `FAILED` (ou `DEGRADED` se infraestrutura permitida) no manifesto.
3. **Auditoria Honesta:** O `PipelineContractGate` reprova qualquer execução com cenas degradadas a menos que `--allow-degraded` seja passado explicitamente.

---

## 7. REGRA INVIOLÁVEL: COMPOSIÇÃO ORIENTADA A DADOS (CINEMATIC EPISODE)

1. **Caminho Único de Produção:**
   - Episódio novo = **APENAS** `contracts/episodes/<id>.episode.json` + timeline data validado pelo `timelineContract` (`contracts/timelineContract.ts`).
2. **Proibição Total de Composição Artesanal:**
   - **PROIBIDO** criar componente `EpisodeXXX.tsx` artesanal, `<Sequence>` com corte seco fora do `CinematicEpisode`, ou `<Audio>` com volume constante. Antes de concluir: `pnpm check`.
3. **Camada Cinematográfica Obrigatória por Construção:**
   - Todo episódio renderiza compulsoriamente via `<CinematicEpisode timeline={timeline} audio={audioManifest} />` em `remotion/cinema/CinematicEpisode.tsx`.
   - Aplica SEMPRE e sem flags para desligar:
     $$\text{FilmGrade (35mm)} \longrightarrow \text{HudDirector} \longrightarrow [\text{SceneTransition} + \text{CameraLanguage}] + \text{CinematicAudioMix}$$
   - Transição sem especificação recebe `crossfade` por default (nunca corte seco). Mudanças de ato (`actBreaks`) recebem `dipToBlack` automaticamente.



