# Relatório de Caos — Reinício do Mission Control e Retomada de Estado (CHAOS-006)

- **Data/Hora**: 06/08/2026, 14:34:10
- **Lote**: 2
- **Ponto de Injeção**: `OrchestratorStateMachine`
- **Falha Injetada**: `mission_control_restart`
- **Estado Terminal Esperado**: `RECOVERED`
- **Estado Terminal Obtido**: `RECOVERED`
- **Resultado Global**: ✅ APROVADO (PASS)

---

## 🛡️ Invariantes Verificadas por Código

- ✅ **real_error_displayed**: Cenário não esperava falha terminal.
- ✅ **success_not_marked**: Cenário concluído com sucesso esperado.
- ✅ **state_persisted**: Estado persistido com sucesso (3 eventos registrados em SQLite e JSONL).
- ✅ **no_duplicate_artifacts**: Nenhum artefato duplicado detectado.
- ✅ **no_lost_events**: Todos os eventos obrigatórios estão presentes e os proibidos estão ausentes.
- ✅ **retry_limit_respected**: Limite de retries respeitado (1 / 2).
- ✅ **recovery_possible**: Retomada de estado verificada com sucesso.

---

## 📊 Estatísticas da Execução
- **Total de Eventos Gravados**: 3
- **Tentativas (Retries)**: 1 / 2
- **Duplicações de Eventos Evitadas**: 0