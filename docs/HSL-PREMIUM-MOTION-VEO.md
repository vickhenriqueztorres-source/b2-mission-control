# HSL Premium Motion e Veo 3.1 Fast

Atualizado em: 2026-08-20

## Objetivo

Adicionar uma rota de motion graphic cinematografico por Start Frame usando Veo 3.1 Fast no Firefly, sem remover Kling, Remotion, footage licenciado ou SoundFX Kenney.

## Estrategias por shot

| Estrategia | Uso |
|---|---|
| `KLING_CINEMATIC` | movimento fisico, escala, atmosfera e reconstrucao |
| `VEO_MOTION_GRAPHIC` | anatomia, fluxo, jornada e revelacao sem texto critico |
| `VEO_REMOTION_HYBRID` | movimento Veo com labels, etapas ou valores exatos em Remotion |
| `REMOTION_DETERMINISTIC` | texto, dados, documentos e diagramas totalmente deterministas |

`MotionRouteDirectorAgent` decide a estrategia usando apenas o assunto editorial aprovado, a funcao visual e a variante do shot. Sufixos internos de direcao nao participam da decisao.

## Familias premium

- `SYSTEM_ANATOMY`;
- `FLOW_JOURNEY`;
- `CINEMATIC_REVEAL`;
- `BOTTLENECK_PROPAGATION`;
- `CAPACITY_STATE`;
- `LAST_METER`.

## Pacote de Start Frame

Cada shot Veo aprovado produz:

```text
start-frame-base.png
start-frame-preview-composite.png
overlay-spec.json
motion-path-spec.json
audio-intent.json
negative-motion-rules.json
approval-manifest.json
```

O arquivo base e o frame enviado ao Veo. O preview mostra a composicao aprovada. Textos criticos ficam em `overlay-spec.json` e sao renderizados novamente no Remotion.

## Linguagem visual

- amarelo acompanha o objeto ou fluxo em movimento;
- azul representa infraestrutura persistente;
- laranja identifica restricao, bloqueio ou alerta;
- branco fica reservado para informacao editorial;
- um unico foco luminoso principal por clip;
- sem cortes, morphing, novos objetos, flare explosivo ou particulas cobrindo o assunto;
- o Start Frame mostra o estado inicial, nunca o resultado completo.

O conjunto de referencia canonico esta em `assets/hsl/motion-reference-set-v1/manifest.json` com hashes dos cinco assets aprovados.

## Firefly

O guia `hsl.firefly.multi-provider-guide.v2` permite modelo, duracao e audio por item. O worker suporta `Kling 3.0` e `Veo 3.1 Fast`. Kling conserva o comportamento anterior; Veo aceita 4, 6 ou 8 segundos e pode ativar o toggle de audio.

Dispatch externo continua protegido por `HSL_ALLOW_PAID_FIREFLY_DISPATCH=true`.

## Audio nativo

Estados aceitos:

- `PRESENT_VALIDATED`;
- `ABSENT_FALLBACK`;
- `REJECTED_FALLBACK`;
- `NOT_REQUESTED`.

Audio Veo aceito e extraido, filtrado, normalizado para WAV estereo 48 kHz e posicionado pelo inicio do shot. Cenas com audio nativo aprovado nao recebem cues Kenney automaticos. O Remotion mantem os videos mudos e recebe um bed hibrido controlavel.

## Gates

- `MOTION_ROUTE_APPROVED`;
- `PREMIUM_START_FRAME_APPROVED`;
- `VEO_MOTION_CONTRACT_READY`;
- `FIRST_FRAME_FIDELITY_PASS`;
- `GEOMETRY_DRIFT_PASS`;
- `TEXT_OCR_PASS` por composicao deterministica;
- `NATIVE_AUDIO_QA_PASS`;
- `FINAL_RENDER_QA_PASS`.

O intake usa SSIM no primeiro frame para jobs Veo com lineage completa. Score abaixo de 0,70 bloqueia a ingestao.

## Compatibilidade

Contratos antigos sem `generation_strategy` continuam Kling. Manifests `HSL_KLING_ASSET_INTAKE_READY` permanecem validos. O renderer deriva Motion V2 quando um contrato antigo nao possui overlay explicito.

## Teste real no Video 1

O run preservado `HSL-VIDEO-001-VEO-TEST` promoveu estrategicamente 12 dos 147 shots Remotion para `VEO_REMOTION_HYBRID`, sem alterar o master original nem os 24 assets Kling aprovados.

- 12 Start Frames premium novos em 1672x941;
- 12 jobs Veo 3.1 Fast reais em 720p, 16:9 e 24 fps;
- duracoes discretas de 4 ou 6 segundos confirmadas antes de cada geracao;
- 12 audios nativos com `PRESENT_VALIDATED`;
- SSIM minimo do primeiro frame: 0,947687;
- 24 Kling + 12 Veo no intake combinado;
- 135 shots continuam Remotion deterministico;
- master de 883,562 s com `FINAL_RENDER_QA_PASS`;
- SHA-256: `f25f127d8a1bacc4164ba16045811b79a0ab98008a76a71b36a90751075d5433`.

O bot Firefly precisou suportar o picker discreto de duracao do Veo. A verificacao agora registra `control_type=discrete_picker` e bloqueia o clique em Gerar se o valor de 4, 6 ou 8 segundos nao estiver confirmado na interface.
