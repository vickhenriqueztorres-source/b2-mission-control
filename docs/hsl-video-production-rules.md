# HSL Video Production Rules

Estas regras sao obrigatorias para qualquer novo video do Hidden Systems Lab.

## Voz oficial

- A voz oficial do projeto e `Echo`.
- O provedor oficial e `Voicebox`.
- O preset oficial e `am_echo`.
- Nao usar Microsoft TTS, ElevenLabs, fallback local ou outra voz para master final.
- Se `HSL_NARRATION_PROVIDER` nao for `voicebox`, o pipeline deve falhar.

## Configuracao visual original

- Manter o plano cinematografico do canal: maioria Kling/Veo, pouca Remotion.
- Remotion fica apenas para dados, labels e informacao que precisa ser exata.
- Start frames para Kling/Veo precisam ter base foto-real/cinematografica.
- Nao aprovar start frame que seja apenas diagrama escuro, texto grande, grid abstrato ou title card.
- O video final nao deve exibir overlays globais como `HSL DOCS`, `AI VISUALIZATION`, barra de loading ou texto hibrido persistente.

## Gates obrigatorios

- Cobertura gerada minima: 70%.
- Cobertura Remotion maxima: 22%.
- No maximo um shot Remotion consecutivo.
- Assets locais/proxy sao proibidos no master final.
- Start frame flat deve reprovar no QA antes de ir para Kling/Veo.
