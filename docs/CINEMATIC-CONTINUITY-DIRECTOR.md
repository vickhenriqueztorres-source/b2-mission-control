# ContinuityDirectorAgent - Step 4

Atualizado em: 2026-08-19

## Responsabilidade

O `ContinuityDirectorAgent` analisa os planos cinematograficos ordenados de um episodio e preenche exclusivamente `continuity`. O Shot Director dirige cada plano isoladamente; o Continuity Director descreve como planos adjacentes se relacionam em fluxo, eixo de sistema, escala, foco e troca de midia.

Ele nao reescreve beats, narrative intent, focus target, shot ou camera. Conflitos viram warnings e recomendacoes de revisao, nunca auto-repair.

## Episode pass

```text
approved scenes na ordem editorial
  -> NarrativeBeatDirectorAgent
  -> CinematicShotDirectorAgent
  -> planos provisorios em memoria
  -> views compactas de continuidade
  -> ContinuityDirectorAgent.runEpisode
  -> validacao do conjunto e ownership
  -> scene-plan validation 1.3
  -> staging de todos os artefatos
  -> commit controlado com rollback
  -> manifesto de episodio 1.1
```

Nenhum sidecar e promovido durante a geracao de beats ou shots. A ordem vem diretamente do array `scenes` do pacote editorial aprovado; filenames, IDs lexicos e ordem do filesystem nao participam.

## Contexto explicito

Cada view read-only contem somente:

- IDs de cena e capitulo;
- narrative function e resumo semantico dos beats;
- narrative intent e focus target;
- shot, composition, depth e lens language;
- camera intent;
- visual mode.

A janela por cena possui ate tres cenas anteriores e duas seguintes. Nao ha roteiro integral, sources, assets, prompts ou hashes no contexto de continuidade.

## Sequence memory

`CinematicSequenceMemoryBuilder` reconstroi uma janela de no maximo seis cenas terminando na cena atual. Ela inclui:

```text
shot_type_counts
shot_size_sequence
camera_sequence
composition_sequence
same_shot_type_run
same_shot_size_run
same_camera_movement_run
same_composition_run
```

A memoria deriva sempre das views ordenadas. Nao existe banco paralelo, estado invisivel de LLM ou verdade independente.

## System axis e screen flow

O eixo analisado e o `SYSTEM AXIS`: origin/destination, input/output, upstream/downstream e before/after. A regra dramatica de 180 graus nao e aplicada cegamente.

Screen flow:

```text
LEFT_TO_RIGHT RIGHT_TO_LEFT FORWARD BACKWARD UP DOWN STATIC UNKNOWN
```

Fontes:

```text
VISUAL_PLAN CAMERA_INTENT BEAT_SEMANTICS FOCUS_RELATION NOT_AVAILABLE
```

Camera direction nao vira automaticamente movimento percebido do assunto. Atualmente, fluxo direcional e sustentado por marcacao explicita no Visual Plan ou por camera com motivacao `FOLLOW_FLOW`; quando nao ha evidencia, o resultado e `UNKNOWN / NOT_AVAILABLE`.

## Axis strategy

```text
PRESERVE REVERSE_MOTIVATED RESET NOT_APPLICABLE
```

`REVERSE_MOTIVATED` exige uma motivacao fechada:

```text
COUNTER_FLOW RETURN_PATH FAILURE_REVERSAL TEMPORAL_REVERSAL
GEOGRAPHIC_REORIENTATION NARRATIVE_CONTRAST
```

Uma direcao oposta sem suporte nao e normalizada silenciosamente: gera `UNMOTIVATED_DIRECTION_REVERSAL` e `AXIS_DISCONTINUITY`.

## Relacoes entre planos

Shot scale relation:

```text
CONTRACT EXPAND HOLD RESET NOT_APPLICABLE
```

O ranking analitico e `EXTREME_WIDE=0` ate `EXTREME_CLOSE=5`. Ele classifica a relacao, mas nunca muda shot size.

Focus handoff:

```text
DIRECT REVEAL CAUSE_TO_EFFECT OBJECT_TO_SYSTEM SYSTEM_TO_OBJECT RESET NONE
```

Bridge candidate:

```text
MOTION_VECTOR SHAPE LINE OBJECT FOCUS SCALE GEOGRAPHIC COLOR_ROLE SEMANTIC NONE
```

Bridge candidate e oportunidade de continuidade, nao uma transicao. `transition.type` e `transition.motivation` permanecem `null`.

Cross-media continuity:

```text
PRESERVED RESET NOT_APPLICABLE UNKNOWN
```

Trocas entre real, gerado, Remotion e tipografia podem preservar vetor quando os dados sustentam isso. O agente nao cria midia nem altera Visual Plan.

## Warnings

Codigos fechados:

```text
REPEATED_SHOT_TYPE REPEATED_SHOT_SIZE REPEATED_COMPOSITION
REPEATED_CAMERA_MOVEMENT UNMOTIVATED_DIRECTION_REVERSAL AXIS_DISCONTINUITY
FOCUS_DISCONTINUITY SCALE_JUMP CROSS_MEDIA_DISCONTINUITY
VISUAL_MONOTONY UNKNOWN_SCREEN_FLOW
```

Severidades: `LOW`, `MEDIUM`, `HIGH`.

Owners: `CinematicShotDirectorAgent`, `ContinuityDirectorAgent`, `FutureTransitionDirector`, `VisualPlan`, `NONE`.

Quatro movimentos nao estaticos, shot types, shot sizes ou compositions iguais geram warning. Dois iguais sao permitidos. `STATIC` nao e penalizado isoladamente. Runs simultaneos podem produzir `VISUAL_MONOTONY`.

Statuses:

```text
PASS WARN REVISION_RECOMMENDED NOT_APPLICABLE
```

Problema artistico nao usa `FAILED`. Falhas operacionais e de schema continuam no mecanismo de erros e telemetria.

## Primeira e ultima cena

A primeira cena possui `incoming: null`. A ultima possui `outgoing: null`. Um episodio de cena unica recebe `NOT_APPLICABLE`; predecessor ou sucessor nunca e inventado.

## Schema e migracao

O schema logico continua `hsl.cinematic.scene.v1` e evolui de `1.2.0` para `1.3.0`. O manifesto `hsl.cinematic.episode.v1` permanece `1.1.0` porque sua estrutura nao mudou.

Sidecars 1.1 e 1.2 sao legiveis para inspecao, mas exigem `regenerate_from_approved_editorial_package`. A migracao nao inventa continuidade.

## Staging e commit

O store valida todos os candidatos antes de criar temporarios, grava e rele todos os temporarios, depois promove cada alvo. Arquivos anteriores recebem backup e uma falha normal durante o commit aciona rollback em ordem reversa.

Essa garantia cobre erros do processo durante validacao, staging e rename. Nao e declarada atomicidade de diretorio contra queda abrupta do sistema operacional; um backup residual e preservado quando sua limpeza final falha.

## Telemetria

```text
cinematic.continuity.started
cinematic.continuity.scene_analyzed
cinematic.continuity.validation_failed
cinematic.continuity.completed
cinematic.continuity.failed
```

As metricas incluem cenas, statuses, warnings, reversoes, fluxos desconhecidos, continuidade cross-media e repeticoes. Eventos por cena registram vizinhos, eixo, escala, handoff, bridge e warning count.

## Limites

Continuam intocados: Start Frame, Kling, Firefly, Remotion, `ProductionStateMachine`, Scene Contract, Visual Plan, approved Script, duracoes, beat timing, energy, micro-events, transitions e Remotion choreography.

Nao existem videos de referencia, prompts, comandos Kling, image-to-video directives ou executores no namespace Continuity. O resultado e somente um contrato shadow preparado para a proxima etapa da camada cinematografica.
