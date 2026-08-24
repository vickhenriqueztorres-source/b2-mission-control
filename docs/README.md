# Hidden Systems Lab no Wolf AI Studio

Atualizado em: 2026-08-20
Canal: **Hidden Systems Lab / HSL Docs**
Formato: documentarios narrados em ingles, 16:9, sem apresentador

O Wolf AI Studio agora opera o pipeline do Hidden Systems Lab. A unidade editorial e um objeto ou fluxo atravessando um sistema sob uma restricao, produzindo uma consequencia verificavel e uma interpretacao original.

O pipeline editorial, cinematografico, Start Frame, Firefly/Kling e Remotion esta implementado com gates fail-closed. `npm run hsl:pipeline-dry-run` executa a cadeia ate o plano de execucao e, quando os frames aprovados estao configurados, prepara o guia Firefly sem disparar geracao paga.

## Documentos canonicos

- [BRIEFING.md](./BRIEFING.md): identidade, proposta e funcionamento do canal.
- [PRD.md](./PRD.md): requisitos do produto e criterios de aceite.
- [HSL-BRAND-SYSTEM.md](./HSL-BRAND-SYSTEM.md): identidade visual, tokens, motion e composicao.
- [HSL-EDITING-STYLE.md](./HSL-EDITING-STYLE.md): ritmo, hierarquia visual, graficos, audio e procedencia da montagem documental.
- [HSL-ABRAHAM-TRANSCRIPT-INTEGRATION-ANALYSIS.md](./HSL-ABRAHAM-TRANSCRIPT-INTEGRATION-ANALYSIS.md): analise, limites e aplicacao das aulas como referencia editorial.
- [HSL-EUGENE-RAG-INTEGRATION.md](./HSL-EUGENE-RAG-INTEGRATION.md): consciencia, desejo, sofisticacao, promessa e retrieval complementar por etapa.
- [HSL-PILOT-EPISODE.md](./HSL-PILOT-EPISODE.md): briefing do primeiro episodio.
- [HSL-VIDEO-001.md](./HSL-VIDEO-001.md): roteiro, gates, Start Frames, audio e estado de producao do Video 1.
- [HSL-PREMIUM-MOTION-VEO.md](./HSL-PREMIUM-MOTION-VEO.md): roteamento Kling/Veo/Remotion, pacote premium, audio nativo e QA.
- [ARCHITECTURE.md](./ARCHITECTURE.md): pipeline tecnico e fronteiras de dados.
- [HSL-FULL-PIPELINE.md](./HSL-FULL-PIPELINE.md): ordem executavel, contratos, gates, ambiente e operacao.
- [AGENTS.md](./AGENTS.md): agentes e responsabilidades.
- [RULES.md](./RULES.md): regras editoriais, procedencia, IA e monetizacao.
- [WORKLOG.md](./WORKLOG.md): estado atual e pendencias.
- [CINEMATIC-DIRECTION-LAYER.md](./CINEMATIC-DIRECTION-LAYER.md): fundacao V1 em shadow mode, flags e garantias de isolamento.
- [NARRATIVE-BEAT-DIRECTOR.md](./NARRATIVE-BEAT-DIRECTOR.md): Passo 2, beats semanticos, timing e fidelidade textual.
- [CINEMATIC-SHOT-DIRECTOR.md](./CINEMATIC-SHOT-DIRECTOR.md): Passo 3, enquadramento, composicao e camera estruturados em Shadow Mode.
- [CINEMATIC-CONTINUITY-DIRECTOR.md](./CINEMATIC-CONTINUITY-DIRECTOR.md): Passo 4, memoria de sequencia, system axis e continuidade entre cenas.

## Comandos principais

- `npm run hsl:pipeline-dry-run`: editorial, direcao cinematografica e compiler; sem custo externo.
- `npm run hsl:video-1-prepare`: recompila o Video 1 com a cadencia medida da voz aprovada.
- `npm test`: contratos, bridges, gates, Start Frames e render Remotion real.
- `npm run build`: compilacao TypeScript.
- `npm run hsl:remotion-studio`: inspecao das composicoes.
- `npm run hsl:reference-sync`: atualiza o snapshot filtrado das referencias Abraham sem copiar a prosa-fonte.
- `npm run hsl:eugene-sync`: atualiza o indice editorial derivado do Chroma Eugene sem copiar a prosa-fonte.
- `npm start`: producao integral; exige todos os inputs e autorizacoes externas.

## Briefings fonte integrais

Os documentos abaixo sao copias integrais das fontes recebidas. Os documentos canonicos acima consolidam as decisoes; estas copias preservam todos os exemplos, formatos, listas de episodios, componentes e checklists originais.

- [channel-briefing-source.md](./source-briefings/channel-briefing-source.md)
- [channel-safety-source.md](./source-briefings/channel-safety-source.md)
- [visual-identity-manual-source.md](./source-briefings/visual-identity-manual-source.md)
- [visual-identity-source.md](./source-briefings/visual-identity-source.md)

## Fontes recebidas

As fontes originais permanecem em:

`C:\Users\brend\OneDrive\Desktop\PROJETO 30K ATE 27\1 - HIDDEN SYSTEMS LABS`

Os dois assets visuais foram copiados para `docs/assets/hsl/` para uso interno do projeto.
