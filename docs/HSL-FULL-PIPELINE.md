# Pipeline completo - Hidden Systems Lab

Atualizado em: 2026-08-20

## Objetivo

Este e o fluxo executavel do Wolf AI Studio para produzir documentarios Hidden Systems Lab. A referencia externa orienta ritmo, densidade e linguagem de edicao, mas nenhum frame, audio, texto ou identidade e copiado.

## Ordem de execucao

1. `ReferenceInsightIngestAgent`: carrega o snapshot Abraham filtrado como metodo editorial `reference_only`, nunca como fonte factual.
2. `EugeneRagIngestAgent` e `EugeneRagRetrievalAgent`: validam o indice Chroma e recuperam conceitos especificos para cada etapa.
3. `AudienceStrategyAgent`: define desejo, consciencia, sofisticacao, conflito, mecanismo, crenca, promessa, titulo, thumbnail e progressao.
4. `EpisodeBriefAgent`: transforma a pauta aprovada e a estrategia de publico em pergunta, fluxo, sistema, restricao, consequencia e promessa de payoff.
5. `SystemsResearchAgent`: exige fontes primaria, tecnica e independente.
6. `ClaimRegistryAgent`: liga afirmacoes verificaveis aos respectivos source IDs.
7. `ThesisAgent`: fixa tese, trade-off, consequencia e interpretacao original.
8. `CausalModelAgent`: cria o modelo de interfaces e o hero visual do episodio.
9. `AttentionArchitectureAgent`: combina o papel de atencao Abraham com o ponto de entrada adequado ao nivel de consciencia Eugene.
10. `DocumentaryScriptAgent`: consolida narracao inglesa, progressao de informacao e banco parametrizado de frases HSL, sem receber prosa das referencias.
11. `PhraseOriginalityGate`: bloqueia sequencias literais longas presentes nas aulas Abraham.
12. `EugeneRagOriginalityGate`: bloqueia sequencias literais de 12 palavras presentes no RAG Eugene.
13. `HslVisualPlanBuilder`: classifica as cenas e registra thumbnail, tensao visual e promessa compartilhada.
14. `PromiseDeliveryGate` e `OriginalitySafetyGate`: exigem titulo aprovado, evidencia cedo, payoff, conclusao proporcional, procedencia e score minimo.
15. `NarrativeBeatDirectorAgent`: divide a narracao literal em beats sem reescrever claims.
16. `CinematicShotDirectorAgent`: define enquadramento, foco, lente, profundidade e camera.
17. `ContinuityDirectorAgent`: coordena eixo, escala, fluxo de tela e handoff de foco entre cenas.
18. `SceneChoreographyAgent`, `EditRhythmDirectorAgent` e `TransitionDirectorAgent`: definem microeventos, duracao e cortes.
19. `VisualShotDirectorAgent`: separa cada cena narrativa em dois a quatro shots visuais, com alvo configuravel de 4,6 segundos, sem duplicar a narracao.
20. `RemotionChoreographyAgent` e `KlingMotionDirectorAgent`: separam instrucao grafica de movimento fisico.
21. `VisualCoverageQaAgent` e `CinematicEditQaAgent`: validam IDs, soma de duracoes, densidade, prompts e cobertura antes de qualquer geracao.
22. O contrato de execucao entrega um prompt por shot ao gerador de Start Frame; `StartFrameQaAgent` e `StartFrameContinuityAgent` so aceitam cada arquivo em 16:9 com resolucao, SHA-256 e aprovacao humana.
23. `MotionToFireflyBridge` e `KlingProviderPromptAdapter`: geram prompts image-to-video preservando o primeiro frame e o lineage.
24. `FireflyAdapter`: abre o Firefly/Kling com a sessao persistente, gera em 720p conforme o picker suportado pelo worker atual e coleta os MP4s. Esta etapa tem gate explicito de custo.
25. `FireflyToIntakeBridge`: exige MP4 real, `ffprobe`, hash do motion package e hash do Start Frame.
26. `LicensedAssetAgent`: admite somente footage real com origem e licenca aprovadas.
27. `NarrationVoiceAgent`: gera narracao ElevenLabs quando um audio aprovado nao foi fornecido; textos acima do limite por requisicao sao segmentados entre cenas e concatenados em um unico audio long-form.
28. `NarrationPerformanceAgent`: registra entrega vocal e pausas em sidecar, sem falar instrucoes.
29. `DialogLevelingAgent` e `LoudnessQaAgent`: entregam WAV PCM estereo 48 kHz em torno de `-16 LUFS`, com true peak controlado.
30. `SoundFxDesignAgent`: le coreografia, microeventos, gargalos e capitulos; gera somente cues narrativamente motivados.
31. `KenneySoundFxAssetAgent`, `SoundFxMixAgent` e `SoundFxQaAgent`: validam fontes Kenney CC0, registram URLs e SHA-256 e entregam `soundfx-bed.wav` estereo em 48 kHz.
32. `RemotionAssemblyAgent`: monta videos reais, cenas generativas, diagramas, tipografia, labels, narracao nivelada e a faixa SFX aprovada.
33. `TypographyQaAgent`, `MonetizationSafetyQaAgent`, `SoundDesignAgent` e `FinalRenderQaAgent`: normalizam o conjunto para master 1080p, 30 fps, H.264, `yuv420p`, AAC 48 kHz, audio estereo e SHA-256.

## Contratos principais

| Contrato | Artefato |
|---|---|
| pacote editorial aprovado | `editorial/episode-package.json` |
| insights de referencia | `editorial/00-reference-insights.json` |
| retrieval Eugene | `editorial/00a-eugene-rag-retrieval.json` |
| estrategia de publico | `editorial/00b-audience-strategy.json` |
| arquitetura de atencao | `editorial/06b-attention-architecture.json` |
| gate contra copia da referencia | `editorial/06c-reference-originality-gate.json` |
| gate contra copia Eugene | `editorial/06d-eugene-originality-gate.json` |
| gate de entrega da promessa | `editorial/08a-promise-delivery-gate.json` |
| plano cinematografico | `editorial/cinematic/episode.cinematic.json` |
| plano de execucao | `editorial/execution/episode.execution.json` |
| QA de cobertura visual | `editorial/execution/visual-coverage.json` |
| manifest de Start Frames | `generation/start-frame-manifest.json` |
| pacote Kling por shot | `generation/motion-packages/<shot>/<shot>.generation-package.json` |
| guia Firefly | `firefly/firefly-production-guide.json` |
| intake de MP4 | `hsl_kling_asset_intake.json` |
| props Remotion | `postproduction/remotion-props.json` |
| plano de SFX | `postproduction/soundfx/soundfx-plan.json` |
| faixa de SFX | `postproduction/soundfx/soundfx-bed.wav` |
| QA de SFX | `postproduction/soundfx/soundfx-qa.json` |
| narracao nivelada | `postproduction/audio/narration-leveled.wav` |
| plano de performance vocal | `postproduction/narration-performance-plan.json` |
| QA de loudness | `postproduction/narration-audio-qa.json` |
| master final | `postproduction/HSL_FINAL_DOCUMENTARY.mp4` |
| QA final | `postproduction/final-render-manifest.json` |

## Gates humanos e externos

- a ideia e a tese entram com `human_approval_status: APPROVED`;
- cada Start Frame precisa de item `APPROVED` e SHA-256 exato no manifest;
- material real precisa de `license_status: APPROVED`, URL e referencia de licenca;
- o Firefly so recebe jobs quando `HSL_ALLOW_PAID_FIREFLY_DISPATCH=true`;
- o master final nao existe sem arquivos de video reais e narracao fisica;
- o pipeline nao fabrica placeholder, footage, licenca ou evidencia.
- o gerador de imagem de Start Frame e uma dependencia externa; sem arquivo produzido e aprovado, o runtime para antes do Firefly.

## Variaveis de ambiente

```text
HSL_PROJECT_ROOT
HSL_ABRAHAM_TRANSCRIPT_ROOT
HSL_EUGENE_RAG_ROOT
HSL_EPISODE_SEED_PATH
HSL_START_FRAME_SOURCE_DIR
HSL_START_FRAME_APPROVAL_MANIFEST
HSL_VISUAL_CADENCE_SECONDS
HSL_GENERATED_SHOTS_PER_SCENE
HSL_ALLOW_PAID_FIREFLY_DISPATCH
HSL_LICENSED_ASSET_MANIFEST
HSL_NARRATION_PATH
ELEVENLABS_API_KEY
HSL_ELEVENLABS_VOICE_ID
```

## Operacao

Dry run editorial e cinematografico, sem geracao paga:

```powershell
npm run hsl:pipeline-dry-run
```

Seed alternativo:

```powershell
npm run hsl:pipeline-dry-run -- C:\caminho\episode-seed.json
```

Quando `HSL_START_FRAME_SOURCE_DIR` e `HSL_START_FRAME_APPROVAL_MANIFEST` existem, o mesmo dry run valida os frames e prepara o guia Firefly. Ele continua sem dispatch pago.

Execucao integral, com todos os gates externos configurados:

```powershell
npm start
```

Inspecao visual das composicoes:

```powershell
npm run hsl:remotion-studio
```

Sincronizacao ou verificacao do catalogo Kenney CC0:

```powershell
npm run hsl:sfx-sync
```

Sincronizacao das transcricoes Abraham para o snapshot editorial sem prosa-fonte:

```powershell
npm run hsl:reference-sync
```

Sincronizacao do Chroma Eugene para o indice editorial local sem prosa-fonte:

```powershell
npm run hsl:eugene-sync
```

## Estado do piloto

O seed `HSL-PILOT-001` possui 8 cenas e valida a cadeia tecnica completa. Ele e uma prova estrutural, nao um roteiro final de 16 minutos. A liberacao editorial do episodio exige expandir pesquisa, claims, narracao e cobertura visual, aprovar footage real e Start Frames definitivos e revisar o master final.
