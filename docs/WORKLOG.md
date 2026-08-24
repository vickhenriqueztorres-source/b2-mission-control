# Worklog - Hidden Systems Lab

Atualizado em: 2026-08-20

## 2026-08-20 - RAG Eugene como complemento editorial

- RAG local `Breakthrough Advertising` integrado sem remover a camada Abraham;
- Chroma validado com 285 chunks, dimensao 768 e nove conceitos editoriais;
- snapshot local sem prosa-fonte, com hashes do PDF/Chroma, recibos de pagina e 61.033 fingerprints;
- retrieval separado para pauta, publico, angulo/titulo/thumbnail, hook/roteiro e entrega da promessa;
- `AudienceStrategyAgent` registra consciencia 1-5, sofisticacao 1-5, desejo, conflito, mecanismo, crenca e progressao;
- titulo aprovado permanece em `seed.title`; variantes exigem revisao humana;
- thumbnail limitada a quatro palavras e ligada a mesma promessa do titulo;
- `EugeneRagOriginalityGate` bloqueia copia literal de 12 palavras;
- `PromiseDeliveryGate` exige evidencia cedo, loop fechado, payoff e reframe proporcional;
- dry run `HSL-EUGENE-COMPLEMENT-VERIFY-001` concluiu 8 contratos executaveis e 2 cenas generativas, sem dispatch pago;
- build TypeScript, 98 testes automatizados, check de integracao e render Remotion real aprovados.

## 2026-08-20 - Integracao editorial Abraham e QA de narracao

- cinco transcricoes JSON integradas como referencia de metodo, separadas do source pack factual;
- filtro ASR aplicado por `no_speech_prob`, `compression_ratio` e `avg_logprob`: 1.019 segmentos aceitos e 37 rejeitados;
- snapshot sem prosa-fonte com 11.927 fingerprints SHA-256 de shingles de dez palavras;
- `AttentionArchitectureAgent` implementado com hook, loop, payoff, reframe e pausa por cena;
- `PhraseOriginalityGate` bloqueia copia literal longa antes da aprovacao do pacote editorial;
- banco parametrizado de frases originais HSL anexado aos artefatos de atencao e roteiro, sem substituir a narracao aprovada;
- papeis `HOOK`, `DEEPEN`, `PARTIAL_PAYOFF`, `PAYOFF` e `REFRAME` propagados ao contrato de execucao e ao ritmo;
- `NarrationPerformanceAgent` cria instrucoes em sidecar sem contaminar o texto falado;
- `DialogLevelingAgent` normaliza a voz em duas passagens para `-16 LUFS`, WAV PCM estereo 48 kHz;
- `LoudnessQaAgent` valida loudness integrado, true peak, codec, sample rate e canais antes do Remotion;
- build TypeScript, 93 testes automatizados, check de integracao e render audiovisual real aprovados;
- dry run `HSL-ABRAHAM-INTEGRATION-VERIFY-001` concluiu 8 contratos executaveis e 2 cenas generativas, sem dispatch pago.

## 2026-08-20 - HSL Video Example 001

- microdocumentario real de 15,744 segundos produzido pelo pipeline HSL;
- 3 cenas: Kling image-to-video, diagrama Remotion e conclusao tipografica;
- Start Frame original gerado em 16:9, normalizado para 1920x1080 e aprovado por SHA-256;
- job Firefly/Kling `HSL_EX_001_TAKE_01`, ID externo `104`, gerado em 720p e 10 segundos;
- worker Firefly ampliado para suportar `Widescreen (16:9)` pelo seletor real `firefly-menu-item-widescreen`;
- intake validou MP4 real, lineage do motion package e hash do Start Frame;
- narracao inglesa gerada pela ElevenLabs configurada no projeto;
- master Remotion em 1920x1080, 30 fps, H.264 `yuv420p`, AAC estereo 48 kHz;
- QA final `FINAL_RENDER_QA_PASS` e SHA-256 registrado;
- video em `runs/HSL-VIDEO-EXAMPLE-001/postproduction/HSL_FINAL_DOCUMENTARY.mp4`;
- manifest em `runs/HSL-VIDEO-EXAMPLE-001/video-example-manifest.json`.

## 2026-08-19 - HSL Docs Motion Test 001

- motion test tecnico de 10 segundos gerado com a identidade oficial HSL Docs;
- formato 1920x1080, 30 fps, H.264, `yuv420p` e audio AAC;
- logo oficial, watermark, grid, tipografia Bebas Neue e paleta HSL aplicados;
- promessa do canal e titulo do piloto usados sem claims factuais adicionais;
- disclosure permanente `AI VISUALIZATION`;
- output em `runs/HSL-MOTION-TEST-001/HSL_DOCS_MOTION_TEST_001.mp4`;
- `manifest.json`, `ffprobe.json` e contact sheet incluidos no run;
- render reproduzivel por `npm run hsl:motion-test`.

Este artefato valida somente a linguagem de motion e a cadeia local de encode. Nao representa episodio aprovado, runtime Remotion concluido ou liberacao do gate editorial HSL.

## 2026-08-19 - HSL Documentary Edit Test 002

- referencia externa analisada somente por ritmo, enquadramento, hierarquia e uso de diagramas;
- nenhum frame, audio, texto ou elemento de identidade da referencia foi reutilizado;
- dois planos documentais originais produzidos para abastecimento no patio e fuel farm;
- montagem de 16 segundos com cortes entre 2,2 e 3,2 segundos;
- B-roll dominante, detalhe tecnico, diagrama de cadeia e title card curta;
- narracao em ingles gerada com a voz ElevenLabs configurada no projeto;
- disclosure permanente `AI VISUALIZATION`;
- entrega 1920x1080, 30 fps, H.264 `yuv420p`, AAC estereo 48 kHz;
- loudness medido em `-16.5 LUFS` e true peak em `-1.8 dBFS`;
- output em `runs/HSL-DOC-EDIT-TEST-002/HSL_DOCS_DOCUMENTARY_EDIT_TEST_002.mp4`;
- `manifest.json`, `ffprobe.json`, assets e contact sheet incluidos no run;
- render reproduzivel por `npm run hsl:documentary-test`;
- linguagem consolidada em `docs/HSL-EDITING-STYLE.md`.

Este artefato valida a direcao de edicao solicitada. O episodio factual completo continua bloqueado pelo source pack e pelo gate editorial HSL.

## 2026-08-19 - Migracao completa de identidade

O produto ativo foi convertido para Hidden Systems Lab / HSL Docs.

Concluido:

- nova documentacao canonica;
- briefing, PRD, brand system, rules e piloto;
- novo `HiddenSystemsLabAdapter` apontando para o pacote fonte recebido;
- novos estados editoriais e de montagem Remotion;
- projeto do banco renomeado para Hidden Systems Lab;
- telemetria `HIDDEN_SYSTEMS_LAB`;
- bridge Kling com default 16:9/1080p;
- remocao do fallback que fabricava start frame;
- intake multi-asset com hashes reais obrigatorios para motion package e start frame;
- piloto autonomo bloqueado sem `HSL_PILOT_SOURCE_IMAGE` fisico em 16:9;
- metadata obrigatoria de funcao, evidence status e disclosure;
- prompt Kling industrial sem apresentador, rosto, logo ou falsa evidencia;
- `hslEpisodeGate` com fontes, cenas e Originality Score;
- schema `hsl-episode.schema.json`;
- testes HSL de bridge, prompt e gate;
- dashboard atualizado com agentes HSL;
- voz configurada como `HSL_ELEVENLABS_VOICE_ID`;
- assets de logo e identidade incorporados aos docs.
- quatro briefings fonte arquivados integralmente em `docs/source-briefings/`.

As evidencias em `runs/` anteriores a esta migracao permanecem apenas como historico tecnico. Elas nao definem o produto atual e nao devem ser reutilizadas em novas producoes.

## Estado atual

- fonte editorial HSL: encontrada e validavel;
- runtime editorial executavel: implementado;
- direcao cinematografica e compiler de execucao: implementados;
- Start Frame com aprovacao e SHA-256: implementado;
- Kling/Firefly: preparo e intake implementados, dispatch pago protegido por gate;
- runtime Remotion: implementado e validado com render real 1920x1080;
- seed do piloto: prova estrutural de 8 cenas, ainda nao e roteiro publicavel de 16 minutos;
- episodio final: depende de expansao editorial, footage licenciado, Start Frames definitivos, geracoes externas e revisao humana.

## 2026-08-19 - Cinematic Direction Layer Step 1

- contratos `hsl.cinematic.scene.v1` e `hsl.cinematic.episode.v1`;
- sidecars deterministas e escrita atomica;
- inputs read-only e campos editoriais protegidos;
- feature flags com default `false`;
- runner apenas em shadow mode;
- telemetria namespaced no `AgentTelemetryAdapter` existente;
- hook nao bloqueante depois da preproducao;
- dez testes de isolamento, validacao, idempotencia e falha;
- nenhum agente cinematografico do Passo 2 implementado.

## 2026-08-19 - NarrativeBeatDirectorAgent Step 2

- schema cinematic V1 atualizado para `1.1.0`;
- beats estruturados com spans de palavras e texto literal;
- taxonomia semantica fechada;
- coverage textual obrigatoria de 100%;
- claims apenas por referencia existente;
- timing fisico somente com alignment real;
- apenas `direction.narrative_intent` preenchido;
- telemetria `cinematic.beats.*` com metricas;
- treze testes adicionais;
- nenhum agente de camera, continuity, Kling, ritmo ou transicao implementado.

## 2026-08-19 - CinematicShotDirectorAgent Step 3

- schema de cena `hsl.cinematic.scene.v1` atualizado de `1.1.0` para `1.2.0`;
- manifesto de episodio preservado em `1.1.0`;
- input read-only com narrative intent, beats, visual mode, contexto e Brand Rules;
- shot grammar, camera grammar, lens language, depth e composition em taxonomias fechadas;
- `direction.focus_target`, `shot.*`, `camera.*` e `decision_reason` preenchidos deterministicamente;
- beats e narrative intent preservados;
- campos de energy, continuity, micro-events, transition e Remotion mantidos sem decisoes;
- validator de motivacao, foco, enums, combinacoes e campos futuros;
- migracao explicita de sidecars 1.1 por regeneracao do pacote editorial aprovado;
- telemetria `cinematic.shot.*` com metricas estruturadas;
- integracao apenas no shadow runner entre Beat Director e escrita atomica;
- 22 testes especificos, incluindo os 20 cenarios obrigatorios;
- nenhuma integracao com Start Frame, Kling, Firefly, Remotion ou `ProductionStateMachine`;
- `ContinuityDirectorAgent` permanece nao implementado.

## 2026-08-19 - ContinuityDirectorAgent Step 4

- scene schema atualizado de `1.2.0` para `1.3.0`; manifesto de episodio preservado em `1.1.0`;
- episode pass deterministico sobre a ordem canonica do pacote editorial;
- contexto read-only com tres cenas anteriores e duas seguintes;
- sequence memory reconstruivel com janela maxima de seis cenas;
- system axis, screen flow, scale relation, focus handoff, bridge candidate e cross-media continuity estruturados;
- warnings fechados para repeticao, reversao, eixo, escala, midia e monotonia;
- reversao motivada exige motivacao validada;
- primeira cena sem predecessor e ultima sem sucessor;
- ownership validator preserva beats, narrative intent, focus target, shot e camera;
- planos provisorios gerados integralmente antes do continuity pass;
- batch store com validacao total, staging, backups e rollback para falhas normais de processo;
- migracao 1.2 explicita por regeneracao, sem continuidade inventada;
- telemetria `cinematic.continuity.*` de episodio e cena;
- 34 testes especificos, incluindo os 30 cenarios obrigatorios;
- nenhuma integracao com Start Frame, Kling, Firefly, Remotion ou `ProductionStateMachine`;
- nenhuma etapa posterior implementada.

## 2026-08-20 - Pipeline executavel completo

- runtime editorial com 8 agentes e artefatos atomicos;
- source pack inicial do piloto com fontes primaria, tecnica e independente;
- compiler cinematografico com ritmo, coreografia, transicoes e motion contracts;
- Start Frames obrigatorios em 16:9, minimo 1280x720, aprovacao humana e SHA-256;
- handoff estrito para Firefly/Kling com lineage e provider prompt;
- dispatch pago bloqueado por default;
- intake de MP4 real antes da montagem;
- runtime Remotion 4 com video, diagramas, tipografia, chapters, disclosure e narracao;
- agentes de licenca, voz, som, tipografia, monetizacao e QA final;
- teste E2E tecnico renderizando MP4 real 1920x1080, H.264, `yuv420p`, AAC estereo 48 kHz e validando `ffprobe` e SHA-256;
- comando `npm run hsl:pipeline-dry-run` sem custo externo;
- documentacao operacional consolidada em `HSL-FULL-PIPELINE.md`.
- build TypeScript aprovado e 88 testes automatizados aprovados, alem do check de integracao.

## Proximos passos editoriais P0

1. expandir o seed para roteiro e cobertura reais de aproximadamente 16 minutos;
2. revisar cada claim e enriquecer o source pack do piloto;
3. produzir e aprovar os Start Frames definitivos das cenas generativas;
4. registrar footage real e licencas no manifest de assets;
5. aprovar a narracao inglesa definitiva;
6. autorizar e executar o batch Firefly somente apos revisar o guia;
7. revisar o master final e registrar a aprovacao de publicacao.

## Restricao de release

Uma release pode declarar o pipeline tecnico implementado quando build, testes e gates passarem. Ela nao pode declarar o episodio pronto para publicacao sem assets finais, licencas, geracoes externas, master validado e aprovacao humana.

## 2026-08-20 - Video 1 em producao

- seed publicavel criado em `hsl/editorial/config/video1EpisodeSeed.ts`;
- roteiro ingles com 2.321 palavras, 57 cenas e pergunta refinery-to-wing;
- cinco fontes registradas com claims e limitacoes;
- Eugene, Abraham, promessa e originalidade aprovados; score 20;
- 57 contratos de beats, shot direction, continuity e execucao gerados;
- composicao: 49 cenas Remotion/tipografia e 8 cenas Firefly/Kling;
- timeline calibrada para a voz real: 883,5 s contra 883,008 s de narracao;
- `NarrationVoiceAgent` corrigido para long-form acima de 10.000 caracteres;
- narracao ElevenLabs gerada e aprovada em -16,21 LUFS, PCM 48 kHz estereo;
- cama Kenney CC0 gerada com 55 cues e `SFX_QA_PASS`;
- Remotion atualizado com diagramas semanticos por tipo de sistema, tipografia responsiva e clipes generativos persistentes;
- oito Start Frames 16:9 gerados, copiados para o run e aprovados pelo QA automatico;
- review dos Start Frames permanece `PENDING_HUMAN_REVIEW`;
- Firefly pago ainda nao foi disparado;
- documento operacional: `docs/HSL-VIDEO-001.md`.

## 2026-08-20 - Skill e runtime de Sound FX

- skill pessoal `hsl-soundfx-design` adicionada para a fase de edicao;
- `SoundFxDesignAgent` mapeia setas/fluxos, alertas/gargalos e mudancas de capitulo;
- efeitos HSL originais gerados deterministicamente, sem copiar o audio de referencia;
- `soundfx-plan.json` registra cena, frame, ganho, motivo, procedencia e SHA-256;
- `SoundFxMixAgent` entrega faixa PCM estereo em 48 kHz com prioridade da narracao;
- `SoundFxQaAgent` bloqueia assets, hashes, timing, densidade ou formato invalidos;
- Remotion e manifesto final passam a incorporar e auditar `soundfx-bed.wav`.
- fontes sinteticas substituidas por selecoes dos packs oficiais Kenney `Interface Sounds` e `Impact Sounds`, ambos CC0;
- comando `npm run hsl:sfx-sync` baixa ZIPs oficiais, valida hashes fixados e guarda somente os OGG utilizados;
- cada WAV de edicao conserva URL da pagina, hash do arquivo-fonte, licenca CC0 e hash do derivado.

## 2026-08-20 - Remix do exemplo com Kenney SFX

- master original `HSL-VIDEO-EXAMPLE-001` preservado com SHA-256 `223d503915dfda2a2cb57040f72fc484676c1ae3329f3a047ef468fbef61a9c6`;
- video Kling/Firefly do job 104 e narracao ElevenLabs existentes reutilizados, sem novo dispatch externo;
- tres cues aplicados: `CHAPTER_DROP` em 6,240 s, `SNAP_POP` em 8,036 s e `CHAPTER_DROP` em 11,640 s;
- novo master em `runs/HSL-VIDEO-EXAMPLE-001/postproduction-kenney-sfx/HSL_FINAL_DOCUMENTARY.mp4`;
- duracao 15,744 s, 1920x1080, 30 fps, H.264 `yuv420p`, AAC estereo 48 kHz;
- `SFX_QA_PASS` e `FINAL_RENDER_QA_PASS`;
- novo SHA-256 `a8c5cf16e7bf1e324885d2c9dd5103e2b47e6540de137d6863864ed8b6ac0ccc`;
- hash dos frames de video decodificados preservado entre original e remix: `c1654f47ea4bd5edbf17fdccc12efc806921a8462e2003ed475ca7780b092874`.

## 2026-08-20 - Correcao de densidade visual do Video 1

- referencia medida em aproximadamente 184 cortes para 847 s, media de 4,58 s e mediana de 2,53 s;
- plano anterior diagnosticado com 57 mudancas para 883,5 s, media de 15,5 s, e loop inevitavel nos oito clipes Firefly;
- contrato de cena narrativa preservado e novo contrato `hsl.execution.visual-shot.v1` adicionado;
- `VisualShotDirectorAgent` compila de dois a quatro shots por cena, com alvo padrao de 4,6 s;
- Video 1 recompilado com 187 shots: 24 Firefly, 147 Remotion e 16 tipograficos;
- media final de 4,725 s, P90 de 5,333 s e maximo de 5,334 s;
- 240 s brutos de Firefly planejados para 106,45 s de uso editorial, sem loop;
- oito Start Frames existentes preservados como `V01`; plano registra 16 novos frames como `GENERATION_REQUIRED`;
- Start Frame, motion package, Firefly intake e Remotion migrados de `scene_id` para `shot_id`, com fallback para contratos antigos;
- QA auditavel em `runs/HSL-VIDEO-001/editorial/execution/visual-coverage.json`;
- plano de candidatos em `runs/HSL-VIDEO-001/start-frame-candidates/start-frame-shot-plan.json`.

## 2026-08-20 - Start Frames expandidos para 24 shots

- 16 novos Start Frames gerados por shot, usando cada `V01` apenas como referencia de continuidade visual;
- enquadramentos separados para processo, detalhe operacional e consequencia;
- oito frames anteriores preservados sem sobrescrita como `V01`;
- conjunto completo validado em 1672x941, proporcao 16:9 dentro da tolerancia e resolucao acima de 1280x720;
- hashes SHA-256 registrados para os 24 candidatos;
- `START_FRAME_SET_QA_PASS` emitido em `runs/HSL-VIDEO-001/start-frame-candidates/start-frame-technical-qa.json`;
- contact sheet identificada em `runs/HSL-VIDEO-001/start-frame-candidates/contact-sheet-24-shots.png`;
- aprovacao humana permanece `PENDING` e nenhum job Firefly pago foi disparado.

## 2026-08-20 - Aprovacao humana e guia Firefly do Video 1

- usuario aprovou explicitamente os 24 Start Frames na task Codex;
- manifest de aprovacao criado com 24 hashes, revisor e timestamp;
- `HslStartFrameRuntime` concluiu com status `HUMAN_APPROVED`;
- 24 motion packages e handoffs com lineage foram gerados;
- guia Firefly preparado para Kling 3.0, 720p, 16:9 e 10 s por job;
- todas as 24 imagens referenciadas pelo guia existem fisicamente;
- preparo registrado em `runs/HSL-VIDEO-001/firefly/video-1-firefly-preparation.json`;
- `paid_dispatch_authorized` permanece `false`; nenhum credito foi consumido.

## 2026-08-20 - Firefly real e master final do Video 1

- usuario autorizou explicitamente o dispatch pago Firefly/Kling na task Codex;
- 24 jobs reais foram gerados com Kling 3.0, 720p, 16:9 e 10 s por job;
- jobs 105 a 128 foram concluidos e registrados em `runs/HSL-VIDEO-001/firefly/paid-dispatch-result.json`;
- job 120 precisou de retry de infraestrutura e concluiu na tentativa 2;
- job 125 tambem aparece com tentativa 2 apos retomada, sem erro final e com output validado;
- `FireflyToIntakeBridge` salvou `runs/HSL-VIDEO-001/hsl_kling_asset_intake.json` com 24 assets validados;
- script repetivel `npm run hsl:video-1-finish` criado em `scripts/hslVideo1Finish.ts`;
- postproducao reutilizou a narracao ElevenLabs existente, gerou SFX Kenney CC0 com 55 cues e `SFX_QA_PASS`;
- Remotion montou 187 shots e normalizou o master para H.264 `yuv420p`, AAC estereo 48 kHz;
- `FINAL_RENDER_QA_PASS` emitido em `runs/HSL-VIDEO-001/postproduction/final-render-manifest.json`;
- master final salvo em `runs/HSL-VIDEO-001/postproduction/HSL_FINAL_DOCUMENTARY.mp4`;
- duracao 883,562 s, 1920x1080, 30 fps, tamanho 135.371.616 bytes;
- SHA-256 final `b3fa33398c9e7b980fe54ae922cad5e6531bdfc8df6b848583d9c9c5a9280c7d`;
- contact sheet salvo em `runs/HSL-VIDEO-001/postproduction/contact-sheet.png`;
- manifesto final salvo em `runs/HSL-VIDEO-001/video-1-final-manifest.json`.

## 2026-08-20 - Motion Design V2 e novo master do Video 1

- diagnostico confirmou 147 shots Remotion e 700,6 s reduzidos ao mesmo `SystemsDiagram`;
- contrato `hsl.motion-design.v2` adicionado com headline, stages, takeaway, beats, direcao, metrica e cor semantica;
- `VisualShotDirectorAgent` passa a gravar `motion_design` nos novos contratos de shot;
- pos-producao deriva Motion V2 para contratos antigos sem alterar aprovacoes, hashes ou assets Firefly;
- dez modulos implementados: flow, branching, cutaway, state, capacity, bottleneck, parallel, propagation, comparison e evidence;
- textos genericos de direcao editorial deixam de chegar ao renderer;
- cenas tipograficas agora possuem entrada progressiva por palavra e destaque semantico;
- preview de 40 s com os dez modulos salvo em `runs/HSL-MOTION-V2-PREVIEW/`;
- testes cobrem mapeamento dos dez modulos, remocao de boilerplate, variacao por shot e precedencia narrativa;
- `npm test` e `npm run build` aprovados;
- master anterior preservado como `HSL_FINAL_DOCUMENTARY_V1_ORIGINAL.mp4`;
- 24 videos Firefly, narracao ElevenLabs e 55 cues Kenney reutilizados sem novo dispatch;
- novo master com 147 shots Motion V2 recebeu `FINAL_RENDER_QA_PASS`;
- duracao 883,562 s, 1920x1080, 30 fps, H.264 `yuv420p`, AAC estereo 48 kHz;
- tamanho 145.935.035 bytes e SHA-256 `b6a71fd7959502961afc84081f19ecc4515d744dc3cc10dfc7002af8ef7ddc85`.

## 2026-08-20 - Premium Motion e Veo 3.1 Fast

- conjunto `HSL Premium Motion Reference Set V1` salvo em `assets/hsl/motion-reference-set-v1/` com cinco imagens e hashes;
- `MotionRouteDirectorAgent` adicionado com rotas Kling, Veo, Veo+Remotion e Remotion deterministico;
- seis familias premium e `VeoMotionDirectorAgent` adicionados com quatro beats, gramatica de cores, regras negativas e audio sem fala ou musica;
- `PremiumMotionStartFrameAgent` entrega base, preview, overlay, motion path, audio intent, negative rules e approval manifest;
- guia Firefly migrado para multi-provedor por item, preservando Kling como default;
- bot externo passa a selecionar Veo 3.1 Fast, duracoes 4/6/8 e toggle de audio por job;
- intake registra provedor, audio solicitado/observado e SSIM do primeiro frame;
- `NativeGeneratedAudioAgent` extrai e normaliza stems Veo; `HybridSoundBedAgent` combina Veo e Kenney sob a narracao;
- cenas com audio Veo aprovado suprimem cues Kenney automaticos;
- Remotion ganhou overlay hibrido transparente com textos e etapas exatos;
- suite completa com 106 testes TypeScript, incluindo render Remotion real, e 52 testes Python aprovados;
- lint funcional (`F`/`E9`) dos arquivos alterados no bot Firefly aprovado.
- nenhum dispatch Firefly foi executado nesta implementacao.

## 2026-08-20 - Teste real Premium Motion no Video 1

- variante preservada criada em `runs/HSL-VIDEO-001-VEO-TEST`, sem sobrescrever o master original;
- 12 shots Remotion estrategicos promovidos para `VEO_REMOTION_HYBRID`;
- 12 Start Frames premium novos gerados em 1672x941 e aprovados por `START_FRAME_SET_QA_PASS`;
- 24 assets Kling existentes preservados e reutilizados;
- bot Firefly corrigido para o picker discreto de duracao do Veo 3.1 Fast;
- 12 jobs reais Veo concluidos em 720p, 16:9, 24 fps e 4/6 segundos;
- todos os jobs entregaram audio nativo `PRESENT_VALIDATED`;
- SSIM minimo do primeiro frame 0,947687, acima do gate 0,70;
- intake combinado fechado com 36 assets: 24 Kling + 12 Veo;
- bed hibrido reuniu audio Veo e 42 cues Kenney com `SFX_QA_PASS`;
- 12 stems Veo posicionados na timeline com `NATIVE_AUDIO_QA_PASS` e zero fallback;
- master final 883,562 s, 1920x1080, 30 fps, H.264 `yuv420p`, AAC estereo 48 kHz;
- tamanho final 180.797.491 bytes;
- `FINAL_RENDER_QA_PASS` e SHA-256 `f25f127d8a1bacc4164ba16045811b79a0ab98008a76a71b36a90751075d5433`;
- folha focada dos 12 replacements em `postproduction/veo-hybrid-contact-sheet.png`;
- finalizador repetivel: `npm run hsl:video-1-veo-test-finish`.
