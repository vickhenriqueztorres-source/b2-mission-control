# HSL Documentary Editing Style

Atualizado em: 2026-08-19

## Direcao

O HSL usa edicao de documentario explicativo: o sistema real permanece em primeiro plano e os graficos entram apenas quando tornam uma relacao invisivel legivel. A montagem deve parecer investigativa, concreta e clara, sem depender de uma abertura longa ou de tipografia cinetica constante.

## Ritmo

- planos de B-roll entre 2 e 5 segundos;
- cortes secos como transicao principal;
- movimentos discretos de push-in, pan ou crop para orientar o olhar;
- alternancia entre contexto, detalhe mecanico e explicacao diagramatica;
- title card curta somente depois que o tema ja foi visualmente estabelecido.

## Hierarquia visual

1. B-roll documental do objeto, infraestrutura ou operacao;
2. detalhes que comprovam a mecanica do sistema;
3. diagramas simples de fluxo, comparacao ou sequencia;
4. labels curtos e localizados;
5. assinatura HSL Docs e disclosure.

## Graficos

- fundo Obsidian Matte, grid tecnico discreto e linhas brancas de baixa opacidade;
- amarelo eletrico reservado para fluxo, conexao e foco;
- caixas retangulares compactas, sem cards decorativos;
- no maximo uma ideia diagramatica por tela;
- texto nunca deve substituir a demonstracao visual.

## Audio

- narracao em ingles com tom observacional e ritmo controlado;
- pausas curtas entre elementos de uma cadeia;
- cama sonora quase imperceptivel, sem competir com a voz;
- alvo de entrega proximo a `-16 LUFS`, true peak abaixo de `-1.5 dBTP`.

## Procedencia

Referencias externas servem somente para analisar linguagem de edicao. Quadros, audio, texto e identidade visual de terceiros nao sao reutilizados. Imagens geradas devem ser originais, marcadas como `AI VISUALIZATION` e nao podem ser apresentadas como evidencia factual.

## Teste executavel

Execute `npm run hsl:documentary-test`.

O artefato auditado fica em `runs/HSL-DOC-EDIT-TEST-002/` e valida ritmo, composicao, narracao, encode e identidade. Ele nao substitui o source pack nem libera o gate editorial do episodio completo.
