# PRD - Hidden Systems Lab Production System

Atualizado em: 2026-08-19
Produto operacional: Wolf AI Studio / B2 Mission Control

## Objetivo

Automatizar a producao de documentarios de sistemas sem transformar o canal em conteudo generico, repetitivo ou baseado em footage. O sistema deve tornar pesquisa, tese, mecanismo causal, procedencia e contribuicao original partes verificaveis do pipeline.

## Usuarios

- editor-chefe: escolhe pergunta, tese e aprovacao humana;
- pesquisador: cria source pack e claim registry;
- roteirista: transforma mecanismo em narrativa causal;
- motion designer: constroi modelos Remotion;
- operador: acompanha Kling, render e incidentes;
- revisor: verifica originalidade, licencas, disclosure e qualidade.

## Requisitos funcionais

### FR-01 - Pauta estruturada

Exigir titulo, pergunta, objeto/fluxo, sistema, restricao, consequencia, tese, formato, duracao e interpretacao original.

### FR-02 - Source pack

Exigir, quando disponiveis, fonte primaria, fonte tecnica e fonte independente, com data, claims e limitacoes.

### FR-03 - Claim registry

Cada afirmacao factual deve ter `claim_id`, fonte e classificacao como fato, estimativa ou inferencia.

### FR-04 - Roteiro causal

Cada secao deve adicionar relacao causal, trade-off, limitacao ou consequencia. Roteiro intercambiavel por troca de nomes deve ser rejeitado.

### FR-05 - Hero visual exclusivo

Todo episodio deve ter um mapa, diagrama, fault tree, timeline, flow trace ou modelo de controle criado para sua tese.

### FR-06 - Plano visual multimidia

Separar cenas Remotion, material real, Kling e tipografia. Cada cena deve declarar funcao narrativa, evidence status, procedencia, fonte, licenca e contribuicao original.

### FR-07 - Kling seguro

Kling so pode representar atmosfera, escala, reconstrucao, processo invisivel ou transicao. Nao pode ser evidencia factual. Image-to-video exige start frame fisico e hash.

### FR-08 - Remotion

Remotion e o recurso explicativo principal e deve compor pelo menos metade do episodio piloto.

### FR-09 - Narracao

Narracao em ingles, interpretativa e baseada em fontes. Deve distinguir fato, estimativa, inferencia e limitacao.

### FR-10 - Originality Gate

Calcular score interno de 0 a 20. `16-20` aprova, `12-15` exige revisao e abaixo de 12 bloqueia.

### FR-11 - Procedencia e copyright

Material externo exige origem, criador, licenca, data de acesso, uso permitido, modificacao e episodio.

### FR-12 - Disclosure

Reconstrucao fotorealista de IA exige rotulo em cena e decisao documentada de disclosure no upload.

### FR-13 - Render final

Validar 16:9, 30 fps, texto legivel em TV, audio, fontes, sincronizacao, labels, ausencia de repeticao excessiva, `ffprobe` e SHA-256.

## Requisitos nao funcionais

- nenhum artefato fake, dummy ou placeholder em producao;
- rastreabilidade por episodio, claim, cena, asset e fonte;
- operacao fail-closed quando runtime ou evidencia estiver ausente;
- nenhuma cena generativa promovida a prova;
- variacao editorial real entre episodios;
- controles operacionais restritos ao host confiavel ate existir RBAC.

## Criterios de pronto

Um episodio esta pronto quando todos os seis gates passam: ideia, pesquisa, roteiro, visual, monetizacao/seguranca e render final. Sofisticacao visual isolada nao conta como aprovacao.

## Fora do escopo atual

- apresentador humano ou avatar;
- shorts verticais como formato principal;
- noticias e opiniao politica;
- ingestao automatica de material sem licenca;
- publicacao automatica sem aprovacao humana;
- garantia de decisao de monetizacao de plataforma externa.

## Riscos atuais

- o pacote fonte HSL ainda nao possui runtime executavel;
- biblioteca Remotion ainda precisa ser implementada;
- source pack do piloto ainda nao foi pesquisado e aprovado;
- automacao Kling depende da UI e sessao externas;
- adapter atual bloqueia a producao ate existir runner real;
- endpoints operacionais ainda precisam de autenticacao.

## Roadmap

### P0

- implementar runtime editorial e schemas completos;
- construir componentes Remotion essenciais;
- pesquisar e aprovar o piloto;
- ligar o adapter HSL ao runtime;
- produzir start frames 16:9 dos assets Kling;
- integrar ElevenLabs com voz aprovada;
- certificar render e gates ponta a ponta.

### P1

- dashboard por claim e procedencia;
- importacao controlada de source packs;
- verificacao de licenca;
- comparacao de originalidade com episodios anteriores;
- publicacao assistida com descricoes e fontes.
