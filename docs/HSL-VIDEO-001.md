# Video 1 - The Hidden System That Keeps Planes Flying

Atualizado em: 2026-08-20
Production ID: `HSL-VIDEO-001`
Status: completo; 24 videos Firefly aprovados, master Motion V2 renderizado e `FINAL_RENDER_QA_PASS`

## Entrega editorial

- idioma: ingles;
- formato: `THE_JOURNEY`;
- roteiro: 2.321 palavras em 57 cenas;
- duracao da narracao: 883,008 segundos;
- timeline calibrada: 883,5 segundos;
- diferenca audio/timeline: 0,492 segundo;
- cenas narrativas: 57;
- shots visuais: 187;
- cadencia media: 4,725 segundos por shot;
- P90: 5,333 segundos; maior shot: 5,334 segundos;
- shots Remotion: 147;
- shots tipograficos: 16;
- shots image-to-video Firefly/Kling: 24;
- footage Firefly bruto planejado: 240 segundos para 106,45 segundos de uso editorial, sem loop;
- footage licenciado: nenhum; o episodio nao depende de asset real sem licenca.

## Promessa

Titulo aprovado: `The Hidden System That Keeps Planes Flying`.

Thumbnail: `BEFORE TAKEOFF`.

Interpretacao entregue: o produto visivel e o voo; o produto oculto e a sincronizacao entre qualidade, capacidade, rotas, equipamentos, pessoas, informacao e tempo.

## Fontes

O source pack usa:

- FAA AC 150/5230-4C para armazenamento, manuseio, abastecimento, treinamento e variacao local;
- IATA Aviation Fuel Infrastructure para cadeia upstream, modalidades, fuel farm, hydrant e redundancia;
- ACRP / National Academies para componentes, metodos de abastecimento, inspecao e manutencao;
- IATA Technical Fuel para contaminacao, inspecoes compartilhadas e alertas de disrupcao;
- ICAO SAF Guide para garantia de qualidade e compatibilidade drop-in.

As limitacoes regionais e documentais estao registradas em `editorial/02-source-pack.json`.

## Gates concluidos

- `OriginalitySafetyGate`: `PASS`, score 20;
- `PhraseOriginalityGate` Abraham: `PASS`;
- `EugeneRagOriginalityGate`: `PASS`;
- `AudienceStrategyAgent`: `AUDIENCE_STRATEGY_APPROVED`;
- `PromiseDeliveryGate`: `PASS`;
- 57 planos de beat, camera e continuidade compilados em 187 visual shots;
- `VisualCoverageQaAgent`: `VISUAL_COVERAGE_QA_PASS`;
- Start Frame QA anterior: `PASS` em 8 imagens, todas 1672x941; elas foram preservadas como os shots `V01`;
- Start Frame QA expandido: `START_FRAME_SET_QA_PASS`, 24 imagens, todas 1672x941;
- Firefly/Kling real: 24/24 jobs concluidos e validados no intake;
- narracao ElevenLabs: gerada com a voz configurada;
- loudness da narracao: `NARRATION_AUDIO_QA_PASS`, -16,21 LUFS, -4,48 dBTP;
- sound effects Kenney CC0: `SFX_QA_PASS`, 55 cues, PCM 48 kHz estereo;
- Remotion Motion V2: 147 shots distribuidos em dez modulos, textos progressivos e tipografia cinetica, sem boilerplate editorial visivel;
- Remotion visual inspection: preview dos dez modulos e master integral renderizados sem overflow.
- master final: `FINAL_RENDER_QA_PASS`, 1920x1080, 30 fps, H.264 `yuv420p`, AAC estereo 48 kHz.

## Cobertura visual

A referencia possui aproximadamente 184 cortes em 847 segundos, com media de 4,58 segundos e mediana de 2,53 segundos. O plano anterior possuia apenas 57 mudancas em 883,5 segundos, media de 15,5 segundos, e exigiria repetir oito clipes Firefly para preencher cenas maiores que dez segundos.

O novo contrato separa cena narrativa de shot visual. Cada cena conserva uma unica narracao, timing, SFX e evidence lineage, mas recebe de dois a quatro shots `ESTABLISH`, `PROCESS`, `DETAIL` e `CONSEQUENCE`. O relatorio auditavel esta em `runs/HSL-VIDEO-001/editorial/execution/visual-coverage.json`.

## Start Frames

Os oito frames anteriores foram preservados como `V01`, um por cena generativa:

1. `HSL_001`: ultimo handoff visivel sob a asa;
2. `HSL_004`: refinaria costeira ao amanhecer;
3. `HSL_011`: fuel farm aeroportuario;
4. `HSL_018`: processo invisivel no manifold;
5. `HSL_027`: dispenser, hydrant pit e asa;
6. `HSL_035`: pico simultaneo e gargalo;
7. `HSL_043`: atraso local no turnaround;
8. `HSL_052`: fluxo final em direcao a aeronave.

Artefatos:

- `runs/HSL-VIDEO-001/start-frame-candidates/contact-sheet-labeled.png`;
- `runs/HSL-VIDEO-001/start-frame-candidates/start-frame-candidate-review.json`.
- `runs/HSL-VIDEO-001/start-frame-candidates/start-frame-shot-plan.json`.

O plano exige 24 Start Frames independentes. Os oito candidatos `V01` foram preservados e os 16 shots adicionais foram gerados com continuidade de familia, composicao propria e funcao `PROCESS`, `DETAIL` ou `CONSEQUENCE`. Todos os 24 arquivos possuem 1672x941, hash SHA-256 e `START_FRAME_SET_QA_PASS`. O usuario aprovou explicitamente o conjunto; o manifest registra os 24 hashes, revisor e timestamp.

Novos artefatos:

- `runs/HSL-VIDEO-001/start-frame-candidates/contact-sheet-24-shots.png`;
- `runs/HSL-VIDEO-001/start-frame-candidates/start-frame-technical-qa.json`.
- `runs/HSL-VIDEO-001/start-frame-candidates/start-frame-approval-manifest.json`;
- `runs/HSL-VIDEO-001/generation/start-frame-manifest.json`.

## Resultado final

Depois da aprovacao dos 24 hashes:

1. `start-frame-approval-manifest.json` foi criado com revisor e timestamp;
2. `HslStartFrameRuntime` executou 24 motion packages;
3. guia Firefly foi preparado com 24 jobs Kling 3.0, 720p, 16:9 e 10 segundos;
4. dispatch pago foi autorizado explicitamente na task Codex;
5. os 24 MP4 foram gerados, baixados e validados;
6. `FireflyToIntakeBridge` salvou `hsl_kling_asset_intake.json` com 24 assets;
7. Remotion montou 187 shots com narracao, SFX Kenney CC0 e clipes Firefly reais;
8. `FinalRenderQaAgent` aprovou o master final.

## Motion Design V2

Os 147 shots Remotion deixaram de usar um unico diagrama horizontal. O contrato `hsl.motion-design.v2` gera headline curta, etapas, takeaway e quatro beats temporais por shot. A selecao final ficou assim:

- `FLOW_MAP`: 28;
- `BRANCHING_ROUTES`: 4;
- `PROCESS_CUTAWAY`: 7;
- `STATE_TRANSITION`: 12;
- `CAPACITY_VS_AVAILABILITY`: 35;
- `BOTTLENECK`: 8;
- `PARALLEL_TURNAROUND`: 2;
- `DELAY_PROPAGATION`: 3;
- `BEFORE_AFTER`: 37;
- `EVIDENCE_CARD`: 11.

As 16 cenas tipograficas tambem passaram a revelar palavras progressivamente e destacar o termo semantico principal. Os 24 videos Firefly, a narracao ElevenLabs e os 55 cues Kenney foram reutilizados sem novo dispatch pago. A versao anterior foi preservada em `postproduction/HSL_FINAL_DOCUMENTARY_V1_ORIGINAL.mp4`.

Artefatos Firefly preparados:

- `runs/HSL-VIDEO-001/firefly/firefly-production-guide.json`;
- `runs/HSL-VIDEO-001/firefly/video-1-firefly-preparation.json`.

Artefatos finais:

- `runs/HSL-VIDEO-001/firefly/paid-dispatch-result.json`;
- `runs/HSL-VIDEO-001/hsl_kling_asset_intake.json`;
- `runs/HSL-VIDEO-001/postproduction/HSL_FINAL_DOCUMENTARY.mp4`;
- `runs/HSL-VIDEO-001/postproduction/HSL_FINAL_DOCUMENTARY_V1_ORIGINAL.mp4`;
- `runs/HSL-VIDEO-001/postproduction/final-render-manifest.json`;
- `runs/HSL-VIDEO-001/postproduction/contact-sheet.png`;
- `runs/HSL-VIDEO-001/video-1-final-manifest.json`.
- `runs/HSL-MOTION-V2-PREVIEW/HSL_MOTION_V2_PREVIEW.mp4`.

Master final:

- duracao: 883,562 s;
- resolucao: 1920x1080;
- frame rate: 30 fps;
- video: H.264, `yuv420p`;
- audio: AAC estereo 48 kHz;
- tamanho: 145.935.035 bytes;
- SHA-256 Motion V2: `b6a71fd7959502961afc84081f19ecc4515d744dc3cc10dfc7002af8ef7ddc85`;
- SHA-256 da versao original preservada: `b3fa33398c9e7b980fe54ae922cad5e6531bdfc8df6b848583d9c9c5a9280c7d`.

## Codigo e comandos

- seed definitivo: `hsl/editorial/config/video1EpisodeSeed.ts`;
- runner: `npm run hsl:video-1-prepare`;
- plano de novos Start Frames: `npm run hsl:video-1-start-frame-plan`;
- QA e contact sheet: `npm run hsl:video-1-start-frame-qa`;
- aprovacao deliberada e preparo Firefly: `npm run hsl:video-1-approve-and-prepare-firefly` com `HSL_CONFIRMED_HUMAN_APPROVAL=true` e `HSL_START_FRAME_REVIEWER`;
- dispatch Firefly pago: `npm run hsl:video-1-dispatch-firefly` com `HSL_CONFIRMED_PAID_DISPATCH=true` e `HSL_ALLOW_PAID_FIREFLY_DISPATCH=true`;
- finalizacao: `npm run hsl:video-1-finish`;
- preview dos dez modulos: `npm run hsl:motion-v2-preview`;
- output: `runs/HSL-VIDEO-001/`.

O `NarrationVoiceAgent` agora divide textos longos por fronteiras de cena em requisicoes abaixo de 9.000 caracteres e concatena os blocos. Isso remove o limite pratico de 10.000 caracteres da chamada unica sem cortar frases.

## Variante premium Veo testada

O run `HSL-VIDEO-001-VEO-TEST` preserva o Video 1 original e substitui 12 pontos explicativos por Start Frame premium + Veo 3.1 Fast + overlay Remotion exato. Foram escolhidos fluxos, rotas, cutaways, estados, filtro, turnaround, gargalo, propagacao de atraso e sintese final; os 135 shots restantes continuam deterministas.

Resultado:

- 12/12 jobs Veo concluidos e ingeridos;
- 12/12 audios nativos validados;
- SSIM minimo 0,947687;
- 24 assets Kling reutilizados, totalizando 36 assets gerados;
- SFX com 42 cues e `SFX_QA_PASS`;
- audio nativo com `NATIVE_AUDIO_QA_PASS`, sem fallback;
- master 1920x1080, 30 fps, H.264 `yuv420p`, AAC estereo 48 kHz;
- duracao 883,562 s;
- tamanho 180.797.491 bytes;
- `FINAL_RENDER_QA_PASS`;
- SHA-256 `f25f127d8a1bacc4164ba16045811b79a0ab98008a76a71b36a90751075d5433`.

Artefatos:

- `runs/HSL-VIDEO-001-VEO-TEST/postproduction/HSL_FINAL_DOCUMENTARY.mp4`;
- `runs/HSL-VIDEO-001-VEO-TEST/postproduction/veo-hybrid-contact-sheet.png`;
- `runs/HSL-VIDEO-001-VEO-TEST/hsl_veo_asset_intake.json`;
- `runs/HSL-VIDEO-001-VEO-TEST/hsl_generated_asset_intake.json`;
- `runs/HSL-VIDEO-001-VEO-TEST/video-1-veo-test-final-manifest.json`.

Comandos:

- preparo: `npm run hsl:video-1-veo-test-prepare`;
- dispatch: `npm run hsl:video-1-veo-test-dispatch`;
- montagem e QA: `npm run hsl:video-1-veo-test-finish`.
