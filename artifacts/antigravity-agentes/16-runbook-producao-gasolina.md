# 🚀 RUNBOOK DE PRODUÇÃO REAL // EPISÓDIO: GASOLINA ADULTERADA
> **Episódio:** `gasolina-adulterada` | **Duração Alvo:** 360.0s (10.800 frames @ 30 fps)  
> **Composição:** 30 cenas canônicas (`GAS_001` a `GAS_030`)  
> **Arquitetura Visual:** 21 Cenas Cinematográficas 35mm (Firefly) + 9 Cenas de Dossiê (Remotion HUDs)

---

## 1. ESTADO ATUAL DO AMBIENTE (GROUND TRUTH)

| Stage | Status Contratual | Status no Disco | Ação Necessária |
|---|---|---|---|
| **visuals** | `DRY_ONLY` | `0/21` takes no disco | Executar Lote 1 e Lote 2 via Firefly Bot |
| **narration** | `NARRATION_DRY_ONLY` | `0/30` mp3 no disco | Sintetizar 30 locuções via ElevenLabs |
| **sfx / music / mix** | `AUDIO_DRY_ONLY` | `0` wav no disco | Gerar stems de SFX, trilha e mix |
| **render** | `RENDER_BLOCKED` | Protegido contra master falso | Desbloqueia automaticamente ao suprir assets |
| **master** | **REPROVADO** | `final_master.mp4` dummy bloqueado | Validado após renderização completa |

---

## 2. ORDEM DE EXECUÇÃO NA MÁQUINA

Execute rigorosamente nesta sequência pelo terminal:

### Passo 0: Teste do Gatekeeper de Render (Sanity Check)
```bash
npm run render:gasolina
```
* **Comportamento Esperado:** **FALHAR** imediatamente com `RENDER_BLOCKED: visuals_incomplete_master (0/21 takes cinematográficos encontrados)`.
* **Critério de Sucesso:** Remotion **NÃO** deve ser invocado.

---

### Passo 1: Geração Visual do Lote 1 (Firefly - 10 Cenas)
```bash
# Cenas: GAS_001, GAS_002, GAS_003, GAS_006, GAS_007, GAS_009, GAS_010, GAS_011, GAS_012, GAS_014
FIREFLY_DISPATCH=1 npm run firefly:lote1-gasolina
```
* **O que faz:** Autentica a sessão do Firefly Bot, gera start frames em 16:9 e faz polling do `take.mp4` para cada uma das 10 cenas do Lote 1.
* **Destino no Disco:** `runs/gasolina-adulterada/<runId>/visuals/<sceneId>/take.mp4`.
* **Se quebrar:** Copie o `runId` e o `stderr` completo.

---

### Passo 2: Geração Visual do Lote 2 (Firefly - 11 Cenas)
```bash
# Cenas: GAS_017, GAS_018, GAS_019, GAS_020, GAS_022, GAS_023, GAS_024, GAS_025, GAS_028, GAS_029, GAS_030
FIREFLY_DISPATCH=1 npm run firefly:lote2-gasolina
```
* **Barreira Inviolável:** O script checa a existência dos 10 takes do Lote 1 no disco. Se faltar algum, aborta com `LOTE1_INCOMPLETE`.
* **Destino no Disco:** `runs/gasolina-adulterada/<runId>/visuals/<sceneId>/take.mp4`.

---

### Passo 3: Síntese de Narração das 30 Cenas (ElevenLabs)
```bash
ELEVENLABS_DISPATCH=1 npm run narration:gasolina
```
* **O que faz:** Sintetiza em série os 30 arquivos de locução com a voz oficial `Chris` (`iP95p4xoKVk53GoZ742B`, `eleven_multilingual_v2`).
* **Validação:** Checa se cada áudio gerado possui duração $> 0$s e se a soma cumpre $\ge 324.0$s.
* **Destino no Disco:** `runs/gasolina-adulterada/<runId>/audio/narration/<sceneId>.mp3`.

---

### Passo 4: Geração de SFX, Trilha Musical e Stems de Áudio
```bash
AUDIO_DISPATCH=1 npm run audio:gasolina
```
* **O que faz:** Gera a trilha sonora `dark_industrial_investigative` (360s) em `audio/music/bed.wav` e os 30 stems de efeitos sonoros substantivos em `audio/sfx/<sceneId>.wav`.
* **Destino no Disco:** `runs/gasolina-adulterada/<runId>/audio/`.

---

### Passo 5 (Opcional): Render de Preview do Lote 1
```bash
npm run render:gasolina:preview
```
* **O que faz:** Renderiza os primeiros 120 segundos correspondentes ao Lote 1.
* **Destino no Disco:** `runs/gasolina-adulterada/<runId>/preview_lote1.mp4` (**JAMAIS** substitui o master).

---

### Passo 6: Renderização do Master Final 4K/FHD (360s)
```bash
npm run render:gasolina
```
* **Pré-requisitos Auditados:**
  1. 21 takes de vídeo cinematográficos presentes e com tamanho $> 100$ bytes.
  2. 9 cenas de dossiê mapeadas nos componentes Remotion.
  3. 30 arquivos de locução `.mp3` presentes.
  4. Trilha musical `bed.wav` e 30 stems de SFX `.wav` presentes.
* **Destino Final:** `runs/gasolina-adulterada/<runId>/final_master.mp4`.

---

## 3. PROTOCOLO DE DIAGNÓSTICO EM CASO DE ERRO

Se qualquer comando falhar durante a execução real:

1. **Localize o Identificador da Run:**
   - Procure nos logs a linha: `RunId: RUN_LOTE1_...` ou `RUN_AUDIO_...`
2. **Localize a Sessão/Manifesto do Erro:**
   - `runs/gasolina-adulterada/dispatch/latest/<stage>-session.json`
3. **Cole no Prompt:**
   - O comando executado.
   - O `runId`.
   - O trecho de erro (`stderr` / stack trace).
