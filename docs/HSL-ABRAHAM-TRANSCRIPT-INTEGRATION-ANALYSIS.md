# Analise de integracao - Transcricoes Abraham no HSL

Atualizado em: 2026-08-20

Status: implementado no runtime editorial e na pos-producao. O snapshot canonico esta em `assets/editorial-references/abraham/reference-insights.json`.

## Escopo

Fonte analisada:

`C:/Users/brend/OneDrive/Desktop/PROJETO 30K ATE 27/DOCS ABRAHAM/transcriptions`

As transcricoes devem funcionar como referencia de metodo editorial. Elas nao sao fonte factual para os documentarios, nao autorizam copiar frases e nao substituem pesquisa primaria, tecnica ou independente.

## Inventario

| Aula | Duracao | Segmentos JSON | Uso principal no HSL |
|---|---:|---:|---|
| Trabalhando com Audio | 32:09 | 448 | hierarquia de voz, stems, ambiente, ducking e QA |
| Va na Contramao | 09:11 | 125 | angulo contraintuitivo e profundidade editorial |
| Psicologia da Atencao | 15:05 | 194 | hook, contraste, pergunta aberta e payoff |
| Sobre o que Falar | 09:07 | 123 | selecao e expansao de pauta |
| Criatividade Vs Produtividade | 12:47 | 166 | captura, organizacao e incubacao de ideias |

Cada aula possui JSON com `text`, `segments` e `language`. Os segmentos incluem `start`, `end`, `avg_logprob`, `compression_ratio` e `no_speech_prob`, portanto podem alimentar analise temporal e um gate automatico de qualidade.

## Qualidade e restricoes

- Aula 1: 29 segmentos com `no_speech_prob >= 0.5` e 34 com `compression_ratio > 2.4`. Parte disso coincide com demonstracoes de audio, mas exige filtro.
- Aula 4: o ultimo segmento possui repeticao alucinada, `compression_ratio` muito alto e `no_speech_prob` elevado. Deve ser descartado.
- As transcricoes contêm erros foneticos como nomes de ferramentas e termos tecnicos incorretos.
- Afirmacoes psicologicas ou numericas das aulas nao devem entrar no `ClaimRegistryAgent` sem pesquisa externa independente.
- Nenhum trecho literal deve ser enviado ao `DocumentaryScriptAgent` como texto para imitacao.

Gate recomendado para ingestao:

```text
reject if no_speech_prob >= 0.50
reject if compression_ratio > 2.40
reject if avg_logprob < -1.00
normalize transcription errors only for internal summaries
retain source file, segment id, start and end for audit
```

## Onde usar no pipeline

### 1. ReferenceInsightIngestAgent - implementado antes do briefing

Le os JSONs, aplica o gate de qualidade e produz `reference-insights.json`. A saida contem somente principios abstratos:

- contraste e angulo contraintuitivo;
- problema, mecanismo, consequencia e payoff;
- pergunta aberta e cena de resposta;
- hierarquia sonora e prioridade da narracao;
- metodo de captura e organizacao de ideias.

Esse agente nao cria claims, titulo final ou roteiro.

### 2. EpisodeBriefAgent

Adicionar ao brief:

- `counterintuitive_angle`: o que parece verdadeiro versus o que o sistema revela;
- `viewer_question`: pergunta concreta que abre o episodio;
- `promised_payoff`: entendimento que sera entregue no final;
- `audience_relevance`: por que o sistema afeta a vida visivel do espectador.

A aula 2 ajuda no angulo; a aula 4 ajuda a ampliar uma pauta tecnica ate uma pergunta de interesse geral.

### 3. ThesisAgent e CausalModelAgent

Aplicar a estrutura `aparencia -> mecanismo oculto -> restricao -> consequencia`. O angulo contraintuitivo so e aceito quando sustentado pelo source pack.

### 4. AttentionArchitectureAgent - implementado antes do roteiro

Produzir um contrato sem prosa final:

```json
{
  "hook": {
    "pattern": "VISIBLE_VS_HIDDEN",
    "viewer_question": "What has to happen before the visible event becomes possible?"
  },
  "loops": [
    {
      "loop_id": "L001",
      "open_scene_id": "HSL_001",
      "payoff_scene_id": "HSL_006",
      "question_role": "reveal_constraint"
    }
  ],
  "ending_reframe": "visible_product_vs_hidden_product"
}
```

O agente deve impedir pergunta sem payoff e payoff sem preparacao.

### 5. DocumentaryScriptAgent

Usar os insights como estrutura, nunca como estilo copiado. Cada bloco de voz deve cumprir uma funcao:

1. observacao concreta;
2. contraste ou pergunta;
3. relacao causal;
4. consequencia;
5. ponte para o proximo bloco.

Numeros especificos so entram quando existem no `ClaimRegistryAgent`. Vies negativo nao deve virar sensacionalismo; no HSL ele se traduz em risco, limite ou falsa intuicao demonstravel.

### 6. PhraseOriginalityGate - implementado depois do roteiro

- comparar o roteiro com as transcricoes normalizadas;
- bloquear sequencias literais longas e similaridade estrutural excessiva;
- permitir termos tecnicos inevitaveis;
- registrar quais insights foram usados e confirmar `reference_only: true`.

### 7. NarrativeBeatDirectorAgent

A taxonomia atual cobre causa, consequencia, restricao e conclusao, mas nao registra loops. Estender o sidecar sem reescrever o roteiro:

- `attention_role`: `HOOK`, `OPEN_LOOP`, `DEEPEN`, `PARTIAL_PAYOFF`, `PAYOFF`, `REFRAME`;
- `loop_id`: referencia ao contrato de atencao;
- `pause_after_ms`: pausa editorial sugerida, dependente do alignment real.

### 8. EditRhythmDirectorAgent

Hoje a duracao depende principalmente da contagem de palavras. O proximo nivel e combinar:

- importance do beat;
- abertura e fechamento de loop;
- mudanca visual a cada 4 a 7 segundos;
- pausa curta antes de restricao ou payoff;
- hold de leitura depois de numero, diagrama ou conclusao.

### 9. NarrationVoiceAgent

Criar um sidecar de performance, sem inserir instrucoes na fala:

- hook: firme e contido;
- explicacao: clara e estavel;
- pergunta: leve subida de entonacao;
- restricao: desaceleracao curta;
- payoff: pausa anterior e leitura direta.

### 10. Pos-producao de audio

A aula 1 reforca mudancas concretas:

- narracao como stem prioritario;
- SFX e ambiente em stems separados;
- ambiente usado como textura e continuidade, nao como ruido constante;
- ducking durante fala;
- nivelacao de dialogo e controle de picos;
- QA de loudness, clipping, sample rate e canais.

O `SoundFxDesignAgent` cobre pop, strike e chapter drop. `DialogLevelingAgent` e `LoudnessQaAgent` agora tratam a voz antes do Remotion. `AmbientTextureAgent` permanece como expansao futura, pois exige um catalogo e uma politica de densidade proprios.

## Banco de frases HSL originais

Estas frases sao novas e adaptadas a identidade Hidden Systems Lab. Elas servem como padroes parametrizados, nao como texto fixo para todos os episodios.

### Hook visivel versus oculto

- `What you see is [VISIBLE EVENT]. What makes it possible begins somewhere else.`
- `The system does not begin where the public first sees it.`
- `Before [VISIBLE RESULT] can happen, a hidden chain has to arrive on time.`

### Pergunta e loop

- `But where does the real constraint appear?`
- `To understand that failure, we have to move backward through the system.`
- `The answer is not at the final machine. It is hidden in the handoffs before it.`

### Mecanismo causal

- `[OBJECT] does not move in one step. It changes custody, control and risk at every handoff.`
- `That interface matters because it decides what can move next.`
- `The process looks continuous. Operationally, it is a sequence of permissions.`

### Restricao

- `The real bottleneck is not always supply. Sometimes it is time.`
- `A full reserve can still become unusable when quality control fails.`
- `Capacity exists on paper. Throughput is what the operation can actually use.`

### Propagacao

- `A local delay does not stay local.`
- `Seconds lost at one interface return as minutes somewhere visible.`
- `The failure begins in one component, but the schedule is a connected system.`

### Conclusao e reframe

- `The visible product is [RESULT]. The hidden product is synchronization.`
- `What looks like one machine is really a timed agreement between many systems.`
- `The system succeeds when every invisible handoff disappears into the final result.`

## Aplicacao ao piloto atual

| Cena | Funcao atual | Melhoria recomendada |
|---|---|---|
| `HSL_001` | introduzir sistema | contraste visivel/oculto e loop sobre o primeiro gargalo |
| `HSL_002` | seguir fluxo | declarar que o objeto muda de controle em cada handoff |
| `HSL_003` | contexto | transformar storage de local passivo em ponto de controle |
| `HSL_004` | mecanismo | abrir com a contradicao de que estoque cheio pode estar indisponivel |
| `HSL_005` | handoff | comparar duas rotas e explicitar a mesma funcao final |
| `HSL_006` | restricao | pagar o loop do hook: o limite pode ser tempo, inspecao ou throughput |
| `HSL_007` | propagacao | usar frase curta, pausa e diagrama de efeito conectado |
| `HSL_008` | conclusao | manter o reframe `visible product / hidden product`, que ja e forte |

## Estado da implementacao

1. Concluido: `ReferenceInsightIngestAgent` com filtros de ASR e snapshot `reference_only`.
2. Concluido: `AttentionArchitectureAgent` com loop e payoff por scene ID.
3. Concluido: campos de atencao propagados pelo pacote editorial ao contrato de execucao, sem alterar o sidecar cinematografico versionado.
4. Concluido: `PhraseOriginalityGate` contra copia literal das referencias.
5. Parcial: ritmo usa o papel de atencao; alignment real continua sendo a autoridade para timing fisico fino.
6. Concluido: `DialogLevelingAgent` e `LoudnessQaAgent`. Pendente: `AmbientTextureAgent`.

## Decisao

Os arquivos sao valiosos para melhorar metodo, retencao e audio. Eles nao devem ser misturados ao source pack factual nem usados como prompt bruto. A integracao correta e uma camada separada de insights editoriais, com lineage, filtro de qualidade e gate de originalidade antes de qualquer frase chegar ao roteiro aprovado.
