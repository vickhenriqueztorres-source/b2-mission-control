# AGENT EXECUTION TRUTH // CANAL O OUTRO LADO
> **Diagnóstico Arquitetural de Execução: Grafo Real vs Grafo Documentado**  
> **Status:** LEI DE PRODUÇÃO BLOQUEANTE RESTAURADA  
> **Data:** 2026-08-28

---

## 1. O Diagnóstico Raiz: A Ilusão da Autoridade dos Agentes

O projeto `b2-mission-control` possui uma arquitetura de agentes e direção cinematográfica sofisticada em TypeScript (`hsl/cinematic/*`, `hsl/execution/*`, `sound-agent/*`, `packaging-agent/*`), mas que vinha sendo **sistematicamente ignorada ou executada em modo shadow não-bloqueante** nos scripts de produção diária (`produceGasolinaEpisode.ts`, `runFullPipelineTest1Min.ts`, `hslVideoNFinish.ts`).

O resultado observado no episódio da Bomba de Gasolina (`OOL-EP06-GASOLINA`) — vídeo de 84 segundos com B-rolls desconexos de esteira, porto e tanque d'água — é a consequência direta de 7 falhas estruturais de governança de código:

1. **Grafo Real ≠ Grafo Documentado:** Enquanto a documentação promete 33 agentes em pipeline linear restrito, os scripts de produção reais chamavam diretamente loops ad-hoc de síntese de voz, casavam B-rolls por sobreposição de palavras soltas do prompt e chamavam `remotion render` via subprocesso shell.
2. **Direção Cinematográfica Opcional / Shadow Silencioso:** As flags `HSL_CINEMATIC_PIPELINE_V1` e `HSL_CINEMATIC_SHADOW_MODE` precisavam estar ambas ativas para que a direção sequer rodasse; e caso falhasse, o `CinematicDirectionShadowHook` capturava a exceção, logava uma mensagem de aviso e retornava `{ executed: true, success: false }` sem interromper a geração do vídeo master.
3. **Gate Cego por Existência de Bytes:** O `PipelineContractGate` auditava apenas se arquivos `.png`, `.mp4` e `.mp3` existiam no disco e tinham tamanho superior a zero (`ffprobe.duration > 0`), sem jamais auditar o alinhamento semântico visual entre o assunto da fala e o conteúdo do plano.
4. **Sorteio Aleatório & Memória Compartilhada Podre:** Na falta de um start frame real aprovado, o `HybridVideoEngine` executava um hash aritmético `hash(sceneId) % videos.length` no diretório `banco de videos`, extraindo um frame de um vídeo qualquer de infraestrutura (porto, asfalto, turbina) e forjando um recibo de conformidade.
5. **Score Fraco de Casamento Semântico:** O `VideoRepositoryMatcher` tokenizava todo o prompt estilístico de Denis Villeneuve e operava com threshold permissivo de `0.50`. Como a palavra "industrial" ou "35mm" estava em todos os prompts, clips não-relacionados atingiam o score mínimo e passavam como "cache hit".
6. **Remotion como Template Global Estático:** Em vez de receber decisões individuais por beat, as composições Remotion aplicavam HUDs de Raio-X em 100% das cenas e importavam trilhas sonoras hardcoded de outros episódios (`Episode02SoundTrack`).
7. **Ausência de Duration Gate Relativo ao Seed:** O contrato de duração validava apenas o delta entre a narração e a timeline Remotion (`|narration - timeline| <= 2.5s`), ignorando completamente se o episódio de 84 segundos violava o briefing original de 6 ou 16 minutos.

---

## 2. Mapeamento de Arquivos: Diagnóstico Linha a Linha

| Componente | Arquivo e Linhas | Comportamento Diagnosticado (Causa do Problema) |
|---|---|---|
| **Shadow Hook** | [`hsl/cinematic/runners/cinematicShadowHook.ts:27-45`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/hsl/cinematic/runners/cinematicShadowHook.ts#L27-L45) | Se `shouldRunShadow` for falso, retorna `success: true`. Se o runner falhar, captura o erro e retorna `success: false` sem lançar exceção. |
| **Flags de Direção** | [`config/hslCinematicFlags.ts:13-22`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/config/hslCinematicFlags.ts#L13-L22) | `pipelineV1Enabled` e `shadowModeEnabled` desligados por padrão. Direção cinematográfica nasce morta se não forçada em `.env`. |
| **Sorteio de B-Rolls** | [`pipeline/hybridVideoEngine.ts:334-350`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/pipeline/hybridVideoEngine.ts#L334-L350) | `ensureStartFrameExists` usa `Math.abs(hashString(sceneId)) % videos.length` para sortear vídeo do banco e tirar screenshot quando falta start frame. |
| **Matcher Permissivo** | [`hsl/media/videoRepositoryMatcher.ts:148-167`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/hsl/media/videoRepositoryMatcher.ts#L148-L167) | Threshold de `0.50` com divisor `12.0`. Não exige palavras-chave obrigatórias (`visual_must_include`) nem exclui negativas (`visual_must_not`). |
| **Auto-Ingestão sem QA** | [`hsl/media/videoRepositoryMatcher.ts:225-260`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/hsl/media/videoRepositoryMatcher.ts#L225-L260) | Ingestão automática adiciona takes gerados no `catalog.json` imediatamente sem auditoria de qualidade ou relevância. |
| **Auditoria Cega** | [`pipeline/pipelineContractGate.ts:101-260`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/pipeline/pipelineContractGate.ts#L101-L260) | Gatekeeper só testa presença física e ffprobe de duração/codec. Não avalia alinhamento de tema e permite durações arbitrárias de 84s. |
| **Atalho Gasolina** | [`scripts/produceGasolinaEpisode.ts:112-385`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/scripts/produceGasolinaEpisode.ts#L112-L385) | Script bypassa o `MasterDocumentaryOrchestrator` e `ProductionRunner`, chamando `ElevenLabsAdapter` e `HybridVideoEngine` isoladamente. |
| **Remotion Template** | [`remotion/EpisodeGasolina.tsx:9,33,84-90`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/remotion/EpisodeGasolina.tsx#L9-L90) | Hardcoded `<Episode02SoundTrack />` e HUD de telemetria renderizado indiscriminadamente em todas as 10 cenas. |

---

## 3. Tabela Comparativa de Execução dos Scripts

| npm script | Agentes que rodam de verdade | Agentes documentados que NÃO rodam | O que o Gate aceita | O que vaza no Master |
|---|---|---|---|---|
| `npm run produce:gasolina` | `ElevenLabsAdapter`, `HybridVideoEngine`, `PipelineContractGate`, `ArtifactRegistry` | `NarrativeBeatDirector`, `CinematicShotDirector`, `ContinuityDirector`, `SoundDesignPlanner`, `RemotionChoreographyAgent` | `narration.mp3` e `final_master.mp4` existirem com delta <= 2.5s | B-rolls aleatórios por hash, trilha do EP02, HUD em todas as cenas, duração de 84s em vez de 6 min |
| `npm run test:pipeline-1min` | `ElevenLabsAdapter`, `HybridVideoEngine`, `PipelineContractGate`, `ArtifactRegistry` | `NarrativeBeatDirector`, `CinematicShotDirector`, `ContinuityDirector`, `VisualShotDirector` | Arquivos existirem na pasta de teste e render do Remotion concluir | Clips genéricos sem validação de semântica visual |
| `npm run hsl:video-1-finish` | `HslPostproductionRuntime`, `PipelineContractGate` | `CinematicDirectionShadowRunner` (apenas em shadow se flag on), `SoundDesignPlanner` | Presença de `paid-dispatch-result.json` e `final-render-manifest.json` | Animação padrão se faltar take real |
| `npm run start` (`ProductionRunner`) | `HiddenSystemsLabAdapter`, `CinematicDirectionShadowRunner` (não bloqueante), `CinematicExecutionCompiler` | `ContinuityDirector` como veto bloqueante, `VisualSubjectAlignmentGate` | `episodePackagePath` aprovado | Fluxo interrompido por falta de variáveis de ambiente de diretório |

---

## 4. As 8 Leis da Nova Arquitetura Bloqueante

1. **Unificação do Orquestrador Master:** `MasterDocumentaryOrchestrator` é a autoridade única de produção documental. Scripts como `produceGasolinaEpisode.ts` atuam apenas como adaptadores de entrada de briefing.
2. **Direção Cinematográfica Bloqueante:** `NarrativeBeatDirector`, `CinematicShotDirector` e `ContinuityDirector` rodam como pré-requisito estrito antes de qualquer disparo de renderização ou geração de áudio. Falhas lançam `Error` fatal e abortam a execução (`process.exit(1)`).
3. **Exigência de Pipeline V1:** Para gerar um vídeo master final, a flag `HSL_CINEMATIC_PIPELINE_V1` deve estar obrigatoriamente ativa.
4. **Contrato Visual por Cena (`SceneVisualContract`):** Toda cena define obrigatoriamente `visual_must_include`, `visual_must_not`, `required_category`, `take_type` e `allowed_sources`.
5. **Casamento Semântico Rigoroso (Threshold 0.85):** O banco de vídeos só é utilizado se houver correspondência exata de categoria, interseção obrigatória com `visual_must_include`, ausência de termos de `visual_must_not` e score >= 0.85. Caso contrário, a cena é roteada para geração on-demand ou o pipeline para.
6. **Morte Definitiva do Sorteio por Hash:** A função `ensureStartFrameExists` com fallback de módulo de hash foi completamente erradicada. Se não houver Start Frame com hash SHA-256 verificado e aprovado, o sistema interrompe o processamento com erro de integridade.
7. **VisualSubjectAlignmentGate:** Novo gate determinístico que rejeita o master se qualquer cena utilizar vídeo ou imagem que não contenha os elementos visuais obrigatórios da narrativa.
8. **Duration Gate com Tolerância de 15%:** Validação matemática estrita entre a duração final em segundos e a meta do briefing (`targetDurationMinutes * 60`). Desvios superiores a 15% causam reprovação automática no Gatekeeper.

---

## 5. Governança de Contrato Visual de Cena & Veto do Banco (Prompt 03)

1. **`contracts/sceneVisualContract.ts`:** Schema Zod rígido sem defaults silenciosos (`visual_must_include` mín. 2 termos, `visual_must_not` mín. 1 termo, `required_category` slug específico proibindo 'industrial' genérico).
2. **`contracts/buildSceneContracts.ts`:** Construtor determinístico que deriva contratos das cenas a partir do `EpisodeContract`, validando número mínimo de cenas (`minScenes`) e duração total planejada (`SCENE_DURATION_PLAN_SHORT`).
3. **`contracts/episodes/gasolina-adulterada.scenes.json`:** 30 cenas temáticas especializadas em metrologia e fraude de combustível (bico, pulso, chip, painel, aferidor) com soma de 360s (>= 324s exigidos).
4. **Matcher Fail-Fast Canônico:** Ordem estrita de rejeição: `BANK_CLIP_UNINDEXED` -> `BANK_DOMAIN_MISMATCH` -> `BANK_SUBJECT_MISS` -> `BANK_FORBIDDEN_TAG` -> `BANK_CATEGORY_MISS` -> `BANK_SCORE_LOW` (< 0.85) -> `BANK_SOURCE_NOT_ALLOWED` -> `HIT`.
5. **Limpeza do MatchText:** Eliminada a tokenização de adjetivos de estilo Villeneuve (`35mm`, `chiaroscuro`, `anamorphic`) para evitar falsos positivos com B-rolls genéricos.
6. **Veto Temático ao Banco:** Clipes de porto, navio e esteira são vetados por `BANK_DOMAIN_MISMATCH` e `BANK_FORBIDDEN_TAG` em cenas de combustível.
7. **Engine Strict Mode:** Sem `SceneVisualContract` o engine aborta com `SCENE_CONTRACT_REQUIRED`. Em caso de MISS, gera `PENDING_FIREFLY` sem tentar sorteio ou "próximo arquivo". Se `firefly` não for permitido, lança `NO_LEGAL_VISUAL`.
8. **Gatekeeper Zero Tolerância a Fallbacks:** O `PipelineContractGate` reprova imediatamente qualquer master que contenha cenas não contratadas (`UNCONTRACTED_SCENE`), mocks/placeholders (`FALLBACK_IN_MASTER`) ou tomadas pendentes de geração (`PENDING_FIREFLY`).
9. **Status Atual da Run Gasolina:** A produção da Gasolina permanece com status **REPROVADA** no gate até que todas as 30 tomadas cinematográficas tenham seus takes reais gerados e aprovados.

---

## 6. O Runner Único & O npm Script Oficial de Master (Prompt 04)

1. **O Runner Único de Produção:** [`pipeline/episodeProductionRunner.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/pipeline/episodeProductionRunner.ts) (`runEpisodeProduction`) é a autoridade central e inegociável de produção de master do canal.
2. **O npm Script Canônico de Master:** `npm run produce:gasolina` é o único ponto de entrada para o episódio da gasolina, operando como wrapper estrito que invoca `runEpisodeProduction({ contractPath, scenesPath })`.
3. **Morte de Loops Ad-Hoc:** Todos os scripts legados (`hslVideo1Finish.ts` até `hslVideo5Finish.ts`) foram travados para lançar `LEGACY_FINISH_DISABLED`.
4. **Execução Real dos RequiredStages:** Cada uma das 7 etapas obrigatórias (`narration`, `visuals`, `sfx`, `music`, `mix`, `thumbnail`, `render`) executa seu módulo real com persistência em `runs/<episodeId>/<runId>/checkpoints/<stage>.json`.
5. **Zero Fakes / Zero Dummies:** Se um módulo de áudio/vídeo estiver indisponível ou sem assets, o runner lança `STAGE_UNAVAILABLE: <stage>` — sem criar arquivos dummy de zero bytes ou pular etapas em silêncio.
6. **Isolamento de Trilha:** Trilha sonora é exclusiva do próprio `episodeId` via `music-agent`. `Episode02SoundTrack` foi erradicado de qualquer composição do episódio da gasolina.
7. **Duração do Master Reconciliada:** A duração da timeline Remotion foi corrigida de `84.03s` para `360.0s` (`EPISODE_GASOLINA_TOTAL_SECONDS = 360.0`), sincronizada com os 30 contratos de cena.
8. **Ordem de Veto do Matcher Restaurada:** Ordem estrita `UNINDEXED` -> `DOMAIN_MISMATCH` -> `SUBJECT_MISS` -> `FORBIDDEN_TAG` -> `CATEGORY_MISS` -> `SCORE_LOW` -> `SOURCE_NOT_ALLOWED` -> `HIT`. Clipes legais no banco retornam `USE_MATCHED_VIDEO`.
9. **Reprovação Final do Gate:** Se qualquer etapa falhar ou houver descompasso contratual, o runner define `process.exitCode = 1` e lança `EPISODE_GATE_FAILED`.
10. **Comando de Produção Master Atual:**
    ```bash
    npm run produce:gasolina
    ```

---

## 7. Inventário do Banco Real × 30 Cenas & Prompts Firefly (Prompt 05)

1. **Script de Inventário Oficial:** [`scripts/inventoryBankAgainstEpisode.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/scripts/inventoryBankAgainstEpisode.ts) (`npm run bank:inventory-gasolina`) gera diagnóstico exato em `runs/gasolina-adulterada/inventory/latest/`.
2. **Cobertura Real do Banco:** **0 HITs** e **30 MISSes** (100% de veto contra contaminação por B-Rolls de porto, guindaste, concreto e esteiras).
3. **Fila de Geração Firefly:** **21 cenas cinematográficas** enfileiradas como `PENDING_FIREFLY`; **9 cenas** diagramáticas direcionadas como `dossier` via componentes HUD Remotion.
4. **Higiene do Catálogo:** **0 clipes retaggeados** (`catalog-retags.json`), pois nenhum dos 17 arquivos físicos no banco de vídeos possui termos de combustível em seu nome ou metadados originais.
5. **Arquitetura de Prompt Firefly:** [`contracts/buildFireflyPrompt.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/contracts/buildFireflyPrompt.ts) encabeça o prompt com o elemento físico substantivo (`visual_must_include`), seguido por categoria/domínio e aplicando o look 35mm apenas no final.
6. **Proibição de Estilo Genérico:** Proibido iniciar prompts com `"Denis Villeneuve cinematic industrial"`.
7. **Negative Prompts Rigorosos:** Incorporam todas as tags de `visual_must_not` da cena acrescidas de `NO TEXT, NO HUD, NO NUMBERS, NO LOGO, NO HUMAN FACES`.
8. **Artefatos de Inventário Gerados:** `bank-inventory.json`, `bank-inventory.md`, `catalog-retags.json` e `pending-firefly-prompts.json` salvos e validados.

---

## 8. Dispatch Governação do Lote 1 Firefly (Prompt 06)

1. **Script de Dispatch Oficial:** [`scripts/dispatchFireflyBatch.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/scripts/dispatchFireflyBatch.ts) (`npm run firefly:lote1-gasolina`).
2. **Escopo Estrito do Lote 1 (10 Cenas):** `GAS_001`, `GAS_002`, `GAS_003`, `GAS_006`, `GAS_007`, `GAS_009`, `GAS_010`, `GAS_011`, `GAS_012`, `GAS_014` na ordem canônica.
3. **Isolamento de Lote 2 & Dossier:** As outras 11 cenas `PENDING_FIREFLY` ficam reservadas para o Lote 2; as 9 cenas `KEYFRAME_DOSSIER` são exclusivas do Remotion (`dossier-plan.md`) e nunca enviadas ao Firefly.
4. **Comportamento Padrão Dry-Run:** Por padrão, gera `runs/gasolina-adulterada/dispatch/<runId>/lote1-plan.json` e `dossier-plan.md` sem acionar APIs externas.
5. **Geração Real Condicionada:** Apenas quando `FIREFLY_DISPATCH=1`, executa em série start frame + take com probe de duração e checagem de integridade.
6. **Proteção Anti-Dummy:** Sem sessão Firefly autenticada ativa, lança `STAGE_UNAVAILABLE: visuals (firefly session)` sem inventar imagens falsas.
7. **Isolamento do Repositório Central:** Proibido copiar takes gerados para o banco central (`banco de videos` / `video_repository`); os arquivos permanecem isolados na run (`runs/gasolina-adulterada/<runId>/visuals/`).
8. **Status do Master do Episódio:** Permanece **REPROVADO** no `PipelineContractGate` até a entrega completa das 30 cenas, áudio master, SFX e render final.

---

## 9. Dispatcher Unificado dos Dois Lotes & Barreira Bloqueante (Prompt 07)

1. **Dispatcher Único de Lotes:** [`scripts/dispatchFireflyBatch.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/scripts/dispatchFireflyBatch.ts) unifica a governança de ambos os lotes via `FIREFLY_LOTE=1` (`npm run firefly:lote1-gasolina`, 10 cenas) e `FIREFLY_LOTE=2` (`npm run firefly:lote2-gasolina`, 11 cenas).
2. **Validação de Parâmetros:** Qualquer valor de lote fora de 1 ou 2 lança imediatamente `FIREFLY_LOTE_INVALID`.
3. **Barreira Inviolável de Produção:** O disparo real do Lote 2 (`FIREFLY_DISPATCH=1`) exige que `validateVisualBatch(runId, BATCH_1_SCENE_IDS)` passe integralmente no disco; caso contrário, aborta com `LOTE1_INCOMPLETE: Lote 2 bloqueado`.
4. **Isolamento de Planos:** Modo dry-run gera `dispatch/latest/lote1-plan.json` (10 cenas) e `dispatch/latest/lote2-plan.json` (11 cenas) com zero colisão entre lotes e zero contaminação de cenas de dossiê.
5. **Health-Check de Sessão:** Sem sessão autenticada ativa, o sistema registra `lote<N>-session.json` com status `STAGE_UNAVAILABLE` e proíbe criação de arquivos falsos ou dummies.
6. **Status Canônico Deste Turno:** **`DRY_ONLY`** (Planos do Lote 1 e Lote 2 gerados e validados; geração real travada por ausência de sessão Firefly no ambiente).
7. **Catálogo Intocado:** O repositório central (`banco de videos` / `video_repository`) permanece estritamente com seus 16 clipes originais (zero ingest).
8. **Master do Episódio:** Segue rigorosamente **REPROVADO** no gatekeeper.

---

## 10. Plano de Narração Canônico & Dispatcher de Locução (Prompt 08)

1. **Construtor do Plano de Narração:** [`contracts/buildNarrationPlan.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/contracts/buildNarrationPlan.ts) valida as 30 locuções, rejeitando textos curtos (< 8 palavras com `VOICEOVER_TOO_SHORT`) e exigindo soma $\ge 324$s (`NARRATION_PLAN_SHORT`).
2. **Dispatcher de Locução Oficial:** [`scripts/dispatchNarrationBatch.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/scripts/dispatchNarrationBatch.ts) (`npm run narration:gasolina`).
3. **Padrão Dry-Run Seguro:** Por padrão, gera `narration-plan.json` (522 palavras, 360.0s) e `narration-plan.md` sem acionar síntese paga.
4. **Disparo Real Condicionado:** Apenas quando `ELEVENLABS_DISPATCH=1`, dispara a síntese em série com checkpoints por cena e probe de duração.
5. **Proteção Anti-Dummy:** Sem chave de API (`ELEVENLABS_API_KEY`), registra `narration-session.json` com `STAGE_UNAVAILABLE` e aborta sem criar arquivos de 0 bytes.
6. **Integração no Runner Único:** `episodeProductionRunner.ts` delega a etapa `narration` diretamente a este dispatcher, eliminando síntese duplicada.
7. **Status Canônico Deste Turno:** **`NARRATION_DRY_ONLY`** (Plano das 30 cenas validado e salvo; síntese bloqueada por ausência de chave).
8. **Master do Episódio:** Permanece **REPROVADO** no `PipelineContractGate` (acusando `MISSING_STAGE: narration` até a síntese real dos 30 MP3s).

---

## 11. Plano de Áudio Bed (SFX, Música & Mix) & Dispatcher (Prompt 09)

1. **Contrato Zod de Áudio:** [`contracts/audioBedContract.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/contracts/audioBedContract.ts) estrutura 51 cues de SFX substantivos (mínimo de 2 por cena cinematográfica e 1 por dossiê), proibindo "whoosh" ou "impact" genéricos isolados.
2. **Dispatcher de Áudio Oficial:** [`scripts/dispatchAudioBed.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/scripts/dispatchAudioBed.ts) (`npm run audio:gasolina`).
3. **Padrão Dry-Run Seguro:** Por padrão, gera `audio-bed-plan.json` e `audio-bed-plan.md` em `runs/gasolina-adulterada/audio/latest/` sem criar arquivos WAV dummy.
4. **Disparo Real Condicionado:** Apenas quando `AUDIO_DISPATCH=1`, gera stems em série e valida duração dos arquivos físicos.
5. **Barreira Bloqueante de Mixagem:** O estágio de mixagem exige a presença comprovada dos 30 MP3s de narração e dos stems de áudio; caso contrário, aborta com `MIX_BLOCKED: narration missing`.
6. **Proteção Anti-Dummy:** Sem sound pack ou gerador ativo, registra `audio-session.json` com status `STAGE_UNAVAILABLE` sem criar áudios vazios ou silêncio falso.
7. **Status Canônico Deste Turno:** **`AUDIO_DRY_ONLY`** (Plano das 30 cenas validado e salvo; geração física travada).
8. **Master do Episódio:** Permanece **REPROVADO** no `PipelineContractGate` (acusando `MISSING_STAGE: sfx`, `MISSING_STAGE: music` e `MISSING_STAGE: mix`).

---

## 12. Composição Remotion das 30 Cenas & Gate de Renderização (Prompt 10)

1. **Timeline Canônica dos Contratos:** [`remotion/episodeGasolinaTimelineData.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/remotion/episodeGasolinaTimelineData.ts) governada estritamente por 10.800 frames (360.0s a 30 fps), com 84.03s completamente erradicado das exportações públicas.
2. **Composição Fiel aos Contratos:** [`remotion/EpisodeGasolina.tsx`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/remotion/EpisodeGasolina.tsx) implementa 30 Sequences e isola a renderização de HUDs de telemetria exclusivamente nas 9 cenas de dossiê (`DOSSIER_SCENE_IDS`).
3. **Isolamento Total de Áudio & Vídeo:** Zero dependência de `Episode02SoundTrack` ou clipes genéricos do repositório central; cada cena lê seus stems de narração, SFX e vídeo sob a run isolada.
4. **Script de Render com Pré-Condições Rígidas:** [`scripts/renderGasolinaMaster.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/scripts/renderGasolinaMaster.ts) (`npm run render:gasolina` e `npm run render:gasolina:preview`).
5. **Proteção Remotion (Anti-Dummy):** A renderização é abortada com `RENDER_BLOCKED:<reason>` se faltar qualquer take de vídeo, locução ou stem de áudio, sem invocar o Remotion desnecessariamente.
6. **Alvo de Preview Isolado:** O script de preview gera estritamente `preview_lote1.mp4` e jamais `final_master.mp4`.
7. **Status Canônico Deste Turno:** **`COMPOSITION_WIRED + RENDER_BLOCKED`** (Composição ligada aos contratos; renderização de master bloqueada no gate).
8. **Master do Episódio:** Permanece **REPROVADO** no `PipelineContractGate` (proibido `MASTER_RENDERED` sem a produção física real de todos os assets).

---

## 13. Pipeline E2E de Produção Real & Resiliência de Áudio Parcial (Prompt 11)

1. **Pipeline E2E de Diagnóstico:** [`scripts/e2eGasolinaDebug.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/scripts/e2eGasolinaDebug.ts) (`npm run e2e:gasolina`).
2. **Reconhecimento Seguro de Sessões:** Detecta `SESSION_OK` para Adobe Firefly e ChatGPT Bot a partir dos perfis e scripts salvos, sem abrir telas ou solicitar senhas.
3. **Resiliência de Áudio sem Dummy:** Ausência ou erro 401/429 na ElevenLabs ativa `AUDIO_SKIPPED_NO_CREDITS` sem abortar a esteira de vídeo, mantendo `passed: false` e status `PARTIAL_NO_AUDIO`.
4. **Governança de Áudio Parcial no Render:** A flag `--allow-partial-audio` em `renderGasolinaMaster.ts` relaxa apenas narração/SFX/mix, mantendo **100% obrigatórios os 21 takes cinematográficos e os 9 dossiês**.
5. **Relatório Oficial Transparente:** Gravado em `runs/gasolina-adulterada/e2e/latest/E2E-REPORT.md` com aviso explícito no topo: `"AUDIO: SKIPPED (sem chave/crédito ElevenLabs). Vídeo sem locução/SFX/mix."`.
6. **Proteção Anti-Vazamento:** Zero exposição de credenciais ou chaves nos logs e artefatos de saída.
7. **Status Canônico Deste Turno:** **`PARTIAL_NO_AUDIO`** (E2E executado na íntegra; 0/21 takes visuais presentes no disco).
8. **Master do Episódio:** Segue rigorosamente **REPROVADO** no `PipelineContractGate`.

---

## 14. Unificação Canônica de Sessão Firefly Viva (Prompt 12)

1. **Diagnóstico da Discrepância:** A condição em `scripts/dispatchFireflyBatch.ts:373` exigia `process.env.FIREFLY_SESSION_ACTIVE === '1'`, enquanto o E2E anterior checava apenas a presença física de pastas do perfil Chrome, gerando um falso `SESSION_OK` seguido de `STAGE_UNAVAILABLE`.
2. **Módulo Canônico Centralizado:** Criado [`config/fireflySessionLive.ts`](file:///c:/Users/brend/OneDrive/Desktop/PROJETO%2030K%20ATE%2027/02%20-%20O%20OUTRO%20LADO/AUTOMACAO%20-%20O%20OUTRO%20LADO/config/fireflySessionLive.ts) com a função `isFireflySessionLive()`.
3. **Consistência Total:** Compartilhado por `e2eGasolinaDebug.ts`, `dispatchFireflyBatch.ts` e `fireflyAdapter.ts`. A mera existência de `login_firefly.bat` ou pastas não conta como sessão viva.
4. **Governança de Status Estrita:** Sem sessão viva, o E2E encerra com status `E2E_BLOCKED` e instrui o operador humano a realizar login interativo via `login_firefly.bat`. Zero ocorrências de `SESSION_OK + STAGE_UNAVAILABLE`.
5. **Status Canônico Deste Turno:** **`E2E_BLOCKED`** (Sessão Firefly viva ausente; 0 takes gerados no disco).
6. **Master do Episódio:** Permanece rigorosamente **REPROVADO** no `PipelineContractGate`.










