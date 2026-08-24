# CinematicShotDirectorAgent - Step 3

Atualizado em: 2026-08-19

## Responsabilidade

O `CinematicShotDirectorAgent` converte `narrative_intent`, beats aprovados e `visual_mode` em direcao cinematografica estruturada por cena. Ele responde o que deve dominar o quadro, como enquadrar esse assunto e se a camera precisa se mover.

O agente e deterministico, baseado em regras auditaveis e executado somente dentro do `CinematicDirectionShadowRunner`. Ele nao chama LLM, gerador de imagem ou servico externo.

## Input read-only

- IDs de producao, episodio e cena;
- `narrative_function`;
- `visual_mode` aprovado pelo Visual Plan;
- `direction.narrative_intent` produzido no Passo 2;
- beats validados e byte-identical ao roteiro;
- candidatos de foco derivados de campos editoriais existentes, emphasis e concepts;
- contexto basico de capitulo;
- `HSL_CINEMATIC_BRAND_RULES`.

`visual_mode` e obrigatorio. Sua ausencia gera `CINEMATIC_VISUAL_MODE_REQUIRED`; o agente nao escolhe outro tipo de midia.

## Output autorizado

O agente retorna somente:

```text
direction.focus_target
shot.*
camera.*
decision_reason
```

O runner preserva `direction.narrative_intent` e os beats recebidos. Permanecem reservados:

```text
direction.energy = null
continuity = reservado ao Passo 4
micro_events = []
transition.type = null
transition.motivation = null
remotion_choreography = []
```

## Schema e migracao

O schema logico continua `hsl.cinematic.scene.v1`; sua revisao passa de `1.1.0` para `1.2.0`. O manifesto `hsl.cinematic.episode.v1` permanece em `1.1.0`.

Este era o contrato produzido pelo Passo 3. Com o Passo 4 ativo, sidecars 1.2 exigem regeneracao para 1.3; continuidade nunca e fabricada pela migracao.

## Shot grammar

`shot_type`:

```text
ESTABLISHING SYSTEM_WIDE OPERATION MECHANICAL_DETAIL MACRO_DETAIL
TRACKING_FLOW TOPDOWN_PROCESS AERIAL_NETWORK TECHNICAL_LOCKED REVEAL SCALE_REFERENCE
```

`shot_size`:

```text
EXTREME_WIDE WIDE MEDIUM_WIDE MEDIUM CLOSE EXTREME_CLOSE
```

`composition`:

```text
CENTERED RULE_OF_THIRDS_LEFT RULE_OF_THIRDS_RIGHT SYMMETRIC
ASYMMETRIC_LEFT ASYMMETRIC_RIGHT TOP_HEAVY BOTTOM_HEAVY LEADING_LINES LAYERED_DEPTH
```

`subject_anchor`:

```text
CENTER LEFT_THIRD RIGHT_THIRD LOWER_LEFT LOWER_RIGHT UPPER_LEFT UPPER_RIGHT FULL_FRAME
```

`negative_space`:

```text
NONE LEFT RIGHT TOP BOTTOM UPPER_LEFT UPPER_RIGHT LOWER_LEFT LOWER_RIGHT
```

Espaco negativo diferente de `NONE` exige uma motivacao fechada para callout, metric, flow overlay, visual reveal, label ou evidence futuro.

`depth_design`:

```text
FLAT TWO_LAYER THREE_LAYER DEEP
```

`lens_language`:

```text
WIDE_24 DOCUMENTARY_35 NATURAL_50 DETAIL_85 MACRO
```

## Camera grammar

Movimentos permitidos:

```text
STATIC SLOW_DOLLY_IN SLOW_DOLLY_OUT TRACK_LEFT TRACK_RIGHT PAN_LEFT PAN_RIGHT
SUBTLE_CRANE_UP SUBTLE_CRANE_DOWN TOPDOWN_DESCEND PARALLAX_PUSH
```

Direcoes:

```text
LEFT_TO_RIGHT RIGHT_TO_LEFT FORWARD BACKWARD UP DOWN NONE
```

Intensidades:

```text
NONE LOW MEDIUM
```

Motivacoes:

```text
FOLLOW_FLOW REVEAL_DETAIL REVEAL_SCALE APPROACH_MECHANISM LEAVE_MECHANISM
TRANSFER_ATTENTION ESTABLISH_GEOGRAPHY SHOW_PROCESS
```

Todo movimento nao estatico exige direcao, intensidade e motivacao. `STATIC` exige `NONE`, `NONE` e motivacao `null`. Decidir `STATIC` e valido; converter falha operacional em `STATIC` nao e.

O validator rejeita explicitamente `ORBIT_360`, `FAST_ZOOM`, `CRASH_ZOOM`, `RANDOM_SHAKE`, `DRONE_SPIN`, `HANDHELD_CHAOTIC`, `WHIP_CAMERA`, `FISHEYE_SWING` e `UNMOTIVATED_ORBIT`.

## Validacao

Antes da promocao atomica, o sistema valida:

- todas as taxonomias fechadas;
- foco principal nao vazio e derivado dos candidatos existentes;
- motivacao de movimento e de negative space;
- combinacoes manifestamente incoerentes;
- `decision_reason` ligado ao narrative intent e a um beat real;
- narrative intent inalterado;
- campos futuros nulos ou vazios;
- contrato de shot do schema 1.2 e IDs editoriais existentes; o runner atual o incorpora ao sidecar final 1.3.

Exemplos rejeitados incluem `AERIAL_NETWORK + EXTREME_CLOSE`, `MACRO_DETAIL + EXTREME_WIDE`, `TRACKING_FLOW + MACRO` e camera em movimento sem motivacao.

## Fluxo shadow

```text
approved scene
  -> NarrativeBeatDirectorAgent
  -> beat validation
  -> CinematicShotDirectorAgent
  -> shot validation
  -> ContinuityDirectorAgent
  -> full scene-plan validation 1.3
  -> staged episode commit
```

Falha de beats impede o Shot Director. Falha de shot impede a promocao do sidecar. O hook registra a falha sem mudar production truth.

## Telemetria

```text
cinematic.shot.started
cinematic.shot.generated
cinematic.shot.validation_failed
cinematic.shot.completed
cinematic.shot.failed
```

As metricas incluem shot type, size, composition, movimento, intensidade, foco e indicador de camera estatica. Nao existem prompts na telemetria.

## Fronteiras

Este passo nao cria nem modifica Start Frame, Kling, Firefly, Remotion, prompts, video de referencia, Visual Plan, Scene Contract, roteiro, claims, evidence, provenance, timeline ou `ProductionStateMachine`.

`camera.*` expressa intencao do plano, nao comando para Kling. `negative_space_motivation` reserva composicao, nao cria overlays. O Passo 4 consome esse contrato como read-only e adiciona continuidade sem alterar suas decisoes.
