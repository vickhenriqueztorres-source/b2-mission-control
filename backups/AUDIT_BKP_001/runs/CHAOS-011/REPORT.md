# Relatório de Caos — Sessão do Navegador Deslogada (CHAOS-011)

- **Data/Hora**: 06/08/2026, 14:34:11
- **Lote**: 3
- **Ponto de Injeção**: `FireflyStateReader`
- **Falha Injetada**: `session_logged_out`
- **Estado Terminal Esperado**: `FAILED`
- **Estado Terminal Obtido**: `FAILED`
- **Resultado Global**: ✅ APROVADO (PASS)

---

## 🛡️ Invariantes Verificadas por Código

- ✅ **real_error_displayed**: Erro real registrado corretamente nos eventos.
- ✅ **success_not_marked**: Sucesso FALSO evitado 100%.
- ✅ **state_persisted**: Estado persistido com sucesso (3 eventos registrados em SQLite e JSONL).
- ✅ **no_duplicate_artifacts**: Nenhum artefato duplicado detectado.
- ✅ **no_lost_events**: Todos os eventos obrigatórios estão presentes e os proibidos estão ausentes.
- ✅ **retry_limit_respected**: Limite de retries respeitado (0 / 1).
- ✅ **recovery_possible**: Cenário não requeria recuperação de estado.

---

## 📊 Estatísticas da Execução
- **Total de Eventos Gravados**: 3
- **Tentativas (Retries)**: 0 / 1
- **Duplicações de Eventos Evitadas**: 0