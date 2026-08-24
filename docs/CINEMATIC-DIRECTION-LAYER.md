# HSL Cinematic Direction Layer - Step 1

Atualizado em: 2026-08-19

## Escopo

Este documento descreve a fundacao V1 da camada cinematografica. Ela opera como sidecar em `shadow` e nao possui autoridade editorial ou operacional. Os Passos 2, 3 e 4 adicionaram Beat Director, Shot Director e Continuity Director, documentados separadamente.

Nao existem agentes de Kling motion, ritmo de edicao, transicoes, coreografia ou QA cinematografico. Camera e continuidade atuais sao somente intencoes estruturadas, sem conexao com executores.

## Feature flags

Defaults:

```text
HSL_CINEMATIC_PIPELINE_V1=false
HSL_CINEMATIC_SHADOW_MODE=false
```

Precedencia:

```text
PIPELINE_V1=false                         -> nenhuma execucao ou carregamento do runner
PIPELINE_V1=true + SHADOW_MODE=false      -> nenhuma execucao
PIPELINE_V1=true + SHADOW_MODE=true       -> sidecars paralelos em shadow mode
```

Desligar qualquer uma das flags e o rollback imediato. Nenhum executor consome os sidecars.

## Ponto de integracao

O hook fica em `ProductionRunner`, imediatamente depois de `HiddenSystemsLabAdapter.runPreproduction` retornar um pacote editorial real e antes da transicao para `HSL_EPISODE_PACKAGE_READY`.

O hook recebe somente:

- `productionId`;
- caminho do pacote editorial;
- `expectedEpisodeId`, quando o runtime expuser esse identificador separadamente.

O resultado e deliberadamente ignorado pelo restante do pipeline. Falha cinematografica gera telemetria e log explicito, mas nao altera production truth.

## Contratos

- `hsl.cinematic.scene.v1`, versao `1.3.0`;
- `hsl.cinematic.episode.v1`, versao `1.1.0`;
- ruleset `HSL_CINEMATIC_V1`;
- modo unico permitido: `shadow`.

Cada cena aprovada recebe:

```text
cinematic/<scene_id>.cinematic.json
```

O episodio recebe:

```text
cinematic/episode.cinematic.json
```

Os nomes sao deterministas. A mesma revisao preserva `generated_at`, revisoes e bytes. O episode pass valida e prepara todo o conjunto antes do staging; o commit usa temporarios, backups e rollback controlado.

## Autoridade e read-only

O runner le o pacote como uma view `Readonly`, congela recursivamente o objeto em memoria e nunca escreve no arquivo fonte. Os sidecars nao podem carregar campos editoriais protegidos nem variantes de override.

Continuam fora da autoridade cinematografica:

- claims, fontes e licencas;
- evidence status e procedencia;
- tese e roteiro aprovados;
- narrative function e original contribution;
- review status e disclosure;
- Scene Contract, Visual Plan e Causal Model.

## Dependencias obrigatorias do Step 1

O shadow runner exige apenas:

- pacote editorial JSON real;
- `episode_id`;
- pelo menos uma cena real aprovada.

Script, Visual Plan e Claim Registry sao apenas detectados e registrados como disponibilidade. Quando ausentes, o manifesto registra `false`; nenhum equivalente e fabricado.

## Telemetria

O wrapper usa `AgentTelemetryAdapter` com provider `HIDDEN_SYSTEMS_LAB`. Como o adapter possui tipos operacionais fechados, o nome namespaced e preservado em `task_id` e `payload.event_name`:

- `cinematic.shadow.started`;
- `cinematic.shadow.scene_plan_created`;
- `cinematic.shadow.episode_plan_created`;
- `cinematic.shadow.validation_failed`;
- `cinematic.shadow.completed`;
- `cinematic.shadow.failed`.

Nao existe banco ou EventBus paralelo.

## Isolamento

O namespace cinematic nao importa Firefly, Kling, Remotion, Start Frame ou StateMachine. O hook nao modifica o pacote retornado pela preproducao e nao entrega seu resultado aos bridges existentes.

Portanto:

```text
feature OFF = comportamento existente
shadow ON   = comportamento existente + sidecars e telemetria
```

## Interface atual

O `NarrativeBeatDirectorAgent` preenche `beats` e `direction.narrative_intent`. O `CinematicShotDirectorAgent` preenche `direction.focus_target`, `shot.*`, `camera.*` e `decision_reason`. O `ContinuityDirectorAgent` executa um pass ordenado do episodio e preenche somente `continuity`.

`direction.energy`, `micro_events`, `transition` e `remotion_choreography` continuam reservados. Sidecars de cena 1.1 e 1.2 sao reconhecidos pela migracao explicita e regenerados a partir do pacote editorial aprovado; o sistema nao fabrica defaults de camera ou continuidade.
