# NarrativeBeatDirectorAgent - Step 2

Atualizado em: 2026-08-19

## Responsabilidade

O `NarrativeBeatDirectorAgent` segmenta o roteiro aprovado de cada cena em beats sem reescrever, resumir ou completar o texto. Ele opera apenas dentro do `CinematicDirectionShadowRunner`.

Entradas read-only:

- `episode_id` e `scene_id` existentes;
- `voiceover`, `narration_text` ou `script_text` aprovado;
- `narrative_function` como autoridade da cena;
- `claim_id` somente como referencia existente;
- `chapter_id`, quando presente;
- alignment palavra a palavra, quando real e valido.

Sem texto aprovado por cena, a execucao falha com `CINEMATIC_APPROVED_SCRIPT_REQUIRED`. Nenhum roteiro, cena ou claim substituto e criado.

## Contrato

No Passo 2, o schema `hsl.cinematic.scene.v1` permaneceu V1 e passou para `schema_version: 1.1.0`. O Passo 3 posterior evoluiu a revisao de cena para `1.2.0` sem alterar este contrato de beats.

Cada beat possui:

- ID deterministico `<scene_id>_B001`;
- span por palavra com `end_word` exclusivo;
- texto literal extraido do roteiro;
- funcao semantica da taxonomia fechada;
- conceito deterministico;
- importancia;
- emphasis literal;
- candidatos de corte e mudanca visual;
- timing sem estimativa fisica.

## Taxonomia fechada

```text
introduce_object
introduce_system
establish_context
follow_flow
explain_mechanism
handoff
reveal_dependency
reveal_constraint
compare
quantify
cause
consequence
failure_trigger
propagation
response
recovery
tradeoff
limitation
interpretation
conclusion
```

O agente e deterministico e baseado em regras auditaveis. Nao existe chamada de LLM ou prompt cinematografico neste passo.

## Fidelidade textual

O tokenizer usa tokens nao vazios e offsets no texto original. Cada `beat.text` e obtido por slice exato entre o primeiro e o ultimo token do span.

O validator exige:

- coverage de 100% dos tokens;
- ordem continua e sem sobreposicao;
- texto exato do roteiro;
- IDs sequenciais;
- `scene_id` existente;
- `claim_id` existente ou `null`;
- emphasis contida literalmente no beat.

## Timing

Sem alignment:

```json
{"source": "not_available"}
```

Com alignment real palavra a palavra:

```json
{"source": "narration_alignment", "start_ms": 83420, "end_ms": 85180}
```

Contagem, ordem, texto e monotonicidade do alignment precisam corresponder ao roteiro. O agente nao estima milissegundos.

## Fronteira do Passo 2

O output direto do agente preenche somente beats, `narrativeIntent` e metricas. No Passo 2 isolado, os demais campos permaneciam reservados. No runner atual, o Passo 3 consome esse output e preenche foco, shot e camera sem alterar beats ou narrative intent.

- `direction.energy`;
- `continuity`;
- `micro_events`;
- `transition`;
- `remotion_choreography`.

## Telemetria

- `cinematic.beats.started`;
- `cinematic.beats.generated`;
- `cinematic.beats.validation_failed`;
- `cinematic.beats.completed`;
- `cinematic.beats.failed`.

As metricas incluem contagem de beats e palavras, coverage, candidatos de corte/mudanca visual, beats de alta importancia e fonte de timing.

## Isolamento

Beats continuam sidecars sem consumidor. Nenhum dado chega a Start Frame, Kling, Firefly, Remotion ou Sound Design.

O `CinematicShotDirectorAgent` implementado no Passo 3 recebe o `CinematicScenePlanV1` com beats validados. O diretor de beats continua sem autoridade sobre enquadramento, camera ou executores.
