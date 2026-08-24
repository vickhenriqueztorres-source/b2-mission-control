# Rules - Hidden Systems Lab

Atualizado em: 2026-08-20

## 1. Regra editorial

Nenhum episodio e publicado apenas porque parece sofisticado. Ele precisa demonstrar pesquisa, raciocinio original, modelo causal exclusivo, procedencia, variacao e revisao de risco.

## 2. Gates obrigatorios

1. **Ideia:** pergunta especifica, sistema, fluxo, restricao e consequencia.
2. **Pesquisa:** fontes primaria, tecnica e independente, claims e limitacoes.
3. **Roteiro:** mecanismo, trade-off, consequencia e interpretacao.
4. **Visual:** hero visual, diagrama original e procedencia por cena.
5. **Seguranca:** originalidade, direitos, disclosure e advertiser safety.
6. **Render:** legibilidade, audio, labels, continuidade, `ffprobe` e hash.

## 3. Originalidade

- score 16-20: aprovado;
- score 12-15: revisao editorial;
- abaixo de 12: rejeitado;
- introducao, tese, hero visual e conclusao nao podem ser clonados;
- componentes Remotion podem ser reutilizados, mas dados, composicao e raciocinio devem variar.

## 4. Fontes e claims

- fato exige `claim_id` e fonte;
- estimativa e inferencia devem ser rotuladas;
- conflito entre fontes deve ser registrado;
- uma unica pagina nao sustenta um episodio;
- material sem licenca definida nao entra;
- credito ou disclaimer nao substitui permissao.
- Abraham e Eugene sao referencias de metodo, nunca fontes factuais ou substitutos do source pack.
- o runtime nao persiste prosa das referencias; somente principios abstratos, metadados, hashes e fingerprints.
- titulo sugerido nao substitui `seed.title` sem nova aprovacao humana.
- promessa exige evidencia ate a terceira cena, payoff posterior e conclusao proporcional.

## 5. IA visual

- Kling nao e evidencia;
- toda cena generativa declara funcao;
- cena fotorealista recebe `AI VISUALIZATION`;
- nenhuma marca ou instalacao inventada pode parecer registro real;
- pessoa real nao pode ser simulada;
- tragedia nao pode ser reconstruida de forma sensacionalista;
- image-to-video exige start frame, SHA-256 e continuidade;
- o SHA-256 aprovado pelo humano deve ser identico ao arquivo enviado ao Firefly;
- texto e logo sao adicionados no Remotion, nao gerados no Kling.
- Veo nunca substitui texto, numero, label ou documento que precise permanecer exato;
- o Start Frame Veo deve representar o estado inicial e conter uma unica transformacao planejada;
- amarelo move, azul estrutura, laranja restringe e branco informa;
- audio Veo e opcional e somente entra apos validacao tecnica;
- ausencia ou rejeicao do audio Veo aciona fallback Kenney, nunca silencio acidental;
- cenas com audio Veo validado nao recebem cues Kenney automaticos sobre o mesmo evento;
- Kling permanece disponivel para realidade fisica, escala, atmosfera e reconstrucao;
- toda geracao Veo conserva Start Frame, SHA-256, aprovacao humana e disclosure de IA.

## 6. Formato e marca

- 16:9, 30 fps;
- 4K master ou 1080p render;
- sem apresentador ou rosto olhando para camera;
- cores e fontes somente do design system;
- safe margin de 64 px em 1080p;
- movimento visual a cada 4-7 segundos;
- watermark, capitulo, fonte e disclosure conforme o layout global.

## 7. Mix visual

- Remotion domina a explicacao;
- material real confirma existencia e escala;
- Kling ajuda a imaginar;
- tipografia fixa ideias;
- nenhum tipo de midia entra apenas para preencher duracao.

## 8. Verdade de producao

- sem dummy, fixture, fallback ou placeholder em producao;
- sucesso exige arquivo fisico, `ffprobe` e SHA-256;
- dashboard nao prova execucao;
- erro de runtime bloqueia o pipeline;
- dispatch pago no Firefly exige `HSL_ALLOW_PAID_FIREFLY_DISPATCH=true`;
- dry run nunca despacha geracao paga;
- estado ambiguo nao autoriza reenvio automatico;
- evidencias antigas nao sao apagadas para limpar historico.

## 9. Publicacao

- aprovacao humana obrigatoria;
- descricao inclui pergunta, tese, escopo, fontes, producao visual e disclosure;
- titulo precisa ser respondido pelo video;
- correcoes devem ser registradas;
- nao existe garantia de monetizacao, apenas garantia de processo documentado.

## 10. Checklist

- [ ] pergunta, fluxo, sistema, restricao e consequencia;
- [ ] tese e interpretacao originais;
- [ ] source pack e claims;
- [ ] limitacao ou contrateoria;
- [ ] hero visual exclusivo;
- [ ] pelo menos tres cenas Remotion fortes;
- [ ] procedencia e licenca por asset;
- [ ] IA classificada e rotulada;
- [ ] Originality Score minimo 16;
- [ ] aprovacao humana;
- [ ] nivel de consciencia, sofisticacao e desejo registrados;
- [ ] titulo, thumbnail, hook e final entregam a mesma promessa;
- [ ] gates Abraham e Eugene sem correspondencias literais;
- [ ] render 16:9 validado;
- [ ] descricao, fontes e disclosure prontos.
