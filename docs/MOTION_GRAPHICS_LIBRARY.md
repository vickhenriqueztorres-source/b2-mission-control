# Biblioteca De Motion Documental

Biblioteca orientada a dados para a identidade Documentario de Campo Investigativo. A fotografia real continua sendo o sujeito principal. O motion serve apenas para apontar, medir, comparar ou provar.

## Arquitetura

- Contrato: `contracts/documentaryMotionContract.ts`
- Tokens e safe zones: `remotion/motion-documentary/tokens.ts`
- Primitives SVG: `remotion/motion-documentary/primitives.tsx`
- Receitas visuais: `remotion/motion-documentary/motions.tsx`
- Diretor e freeze: `remotion/motion-documentary/DocumentaryOverlayDirector.tsx`
- Integracao: `motionRecipes` em cada cena do `TimelineContract`

## Receitas Disponiveis

1. `field_marker`: aponta componente fisico observado.
2. `evidence_freeze`: congela a midia por 0,8 a 1,2 segundo e marca a evidencia.
3. `measurement_bracket`: mede distancia, altura ou escala.
4. `verified_counter`: anima um valor verificado.
5. `source_caption`: identifica registro e procedencia.
6. `process_chain`: mostra a etapa atual de um processo.
7. `route_trace`: desenha rota sobre geografia ou infraestrutura real.
8. `comparison`: compara dois estados ou grandezas.
9. `document_highlight`: destaca trecho exato de documento visto na cena.
10. `data_bars`: compara ate cinco valores.
11. `timeline_marks`: organiza marcos cronologicos.
12. `location_stamp`: informa local e coordenadas verificadas.
13. `area_outline`: delimita uma area fisica observada.
14. `risk_marker`: identifica gargalo ou risco real.

## Exemplo

```json
{
  "id": "DAN_014",
  "component": "DynamicDocumentaryMedia",
  "durationSeconds": 5,
  "mediaFile": "episodes/drones-agro-noturnos/takes/DAN_014.mp4",
  "motionRecipes": [
    {
      "id": "lidar-evidence",
      "type": "evidence_freeze",
      "startSeconds": 1.8,
      "durationSeconds": 0.9,
      "zone": "bottom_left",
      "colorRole": "evidence",
      "anchor": {"x": 0.62, "y": 0.39},
      "label": "Sensor de distancia",
      "source": "Manual tecnico do equipamento"
    }
  ]
}
```

## Regras

- Uma unica receita principal ativa por vez.
- Texto limitado e dentro de safe zones.
- `telemetry` exige `verifiedData: true` e fonte.
- Dados, documentos, mapas, riscos e comparacoes exigem fonte.
- Freeze fora de 0,8 a 1,2 segundo falha no contrato.
- Motion fora da duracao da cena falha no contrato.
- Motion sobreposto a callout falha no contrato.
- O compositor oficial continua sendo `CinematicEpisode`.
