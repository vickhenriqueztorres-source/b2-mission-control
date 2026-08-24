# Integracao RAG Eugene - Hidden Systems Lab

Atualizado em: 2026-08-20

## Objetivo

O RAG Eugene complementa a camada Abraham sem substitui-la. Ele ajuda o Wolf AI Studio a decidir o que prometer, para qual nivel de consciencia, com qual grau de novidade e como entregar essa promessa ao longo do documentario.

Fonte local:

`C:/Users/brend/OneDrive/Desktop/B2 ENTERPRISE/WOLF AI STUDIO/RAG EUGENE`

O Chroma original possui 285 chunks, embeddings de dimensao 768 e metadados de parte, secao, pagina e conceito. O snapshot usado pelo HSL guarda apenas hashes, metadados, principios abstratos e fingerprints; a prosa do livro nao e copiada para o projeto.

## Divisao de responsabilidade

| Camada | Responsabilidade |
|---|---|
| Abraham | contraste, hook, loops, payoff, ritmo, performance vocal e audio |
| Eugene | desejo, consciencia, sofisticacao, angulo, promessa, titulo, thumbnail, progressao e satisfacao |
| Source pack HSL | fatos, claims, limitacoes e evidencia do episodio |
| Editor humano | tema, titulo selecionado, tese, interpretacao, assets e publicacao |

Nenhuma referencia editorial entra no `ClaimRegistryAgent`. Eugene e Abraham orientam metodo; somente o source pack sustenta fatos.

## Retrieval por etapa

| Etapa | Conceitos recuperados |
|---|---|
| `TOPIC_SELECTION` | desejo de massa, dimensoes do desejo e sofisticacao |
| `AUDIENCE_DIAGNOSIS` | consciencia, identificacao e desejo |
| `ANGLE_TITLE_THUMBNAIL` | headline, sofisticacao e mecanismo |
| `HOOK_AND_SCRIPT` | consciencia, mecanismo e crenca |
| `PROMISE_DELIVERY` | crenca, headline e canalizacao do desejo |

Cada consulta produz `hsl.editorial.eugene-retrieval.v1` com conceitos solicitados, principios recuperados, recibos de chunks e `retrieval_revision`. Os recibos registram hash do conteudo, parte, secao e paginas, mas nao o texto.

## Ficha no seed

```json
{
  "audience_strategy": {
    "primary_audience": "Curious general viewers...",
    "awareness_level": 1,
    "sophistication_level": 2,
    "what_they_know": "Aircraft receive fuel before departure...",
    "knowledge_gap": "How the complete system works...",
    "mass_desire": "Discover the invisible infrastructure...",
    "human_conflict": "One delayed handoff can affect the visible schedule",
    "thumbnail_text": "BEFORE TAKEOFF",
    "title_candidates": ["Mechanism variant", "Consequence variant"],
    "next_video_question": "Which adjacent system should be investigated next?"
  }
}
```

O titulo em `seed.title` continua sendo o unico titulo aprovado. As variantes sao alternativas para revisao humana, nunca substituicao automatica.

## Agentes e gates

- `EugeneRagIngestAgent`: valida o indice local e sua politica `reference_only`.
- `EugeneRagRetrievalAgent`: recupera conceitos diferentes em cada etapa.
- `AudienceStrategyAgent`: produz consciencia 1-5, sofisticacao 1-5, desejo, conflito, mecanismo, crenca, promessa, titulo, thumbnail e progressao.
- `EugeneRagOriginalityGate`: bloqueia sequencias literais de 12 palavras presentes no RAG.
- `PromiseDeliveryGate`: exige titulo aprovado, evidencia ate a terceira cena, alinhamento do hook, payoff posterior e final proporcional a promessa.

## Artefatos

- snapshot: `assets/editorial-references/eugene/eugene-rag-index.json`;
- retrieval auditado: `editorial/00a-eugene-rag-retrieval.json`;
- estrategia: `editorial/00b-audience-strategy.json`;
- gate de copia: `editorial/06d-eugene-originality-gate.json`;
- gate de entrega: `editorial/08a-promise-delivery-gate.json`.

## Operacao

```powershell
npm run hsl:eugene-sync
npm run hsl:pipeline-dry-run
```

`HSL_EUGENE_RAG_ROOT` permite apontar para outra copia valida do RAG. O runtime de producao usa o snapshot local e nao exige Anthropic, OpenAI ou carregamento do modelo de embeddings.
