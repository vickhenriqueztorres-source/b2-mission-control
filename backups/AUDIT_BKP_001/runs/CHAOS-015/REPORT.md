# Relatório de Caos — Navegador Chrome Travado (Hang/Freeze) (CHAOS-015)

- **Data/Hora**: 06/08/2026, 14:34:11
- **Lote**: 3
- **Ponto de Injeção**: `FireflyWatchdog`
- **Falha Injetada**: `chrome_frozen`
- **Estado Terminal Esperado**: `RECOVERED`
- **Estado Terminal Obtido**: `RECOVERED`
- **Resultado Global**: ✅ APROVADO (PASS)

---

## 🛡️ Invariantes Verificadas por Código

- ✅ **real_error_displayed**: Cenário não esperava falha terminal.
- ✅ **success_not_marked**: Cenário concluído com sucesso esperado.
- ✅ **state_persisted**: Estado persistido com sucesso (4 eventos registrados em SQLite e JSONL).
- ✅ **no_duplicate_artifacts**: Nenhum artefato duplicado detectado.
- ✅ **no_lost_events**: Todos os eventos obrigatórios estão presentes e os proibidos estão ausentes.
- ✅ **retry_limit_respected**: Limite de retries respeitado (1 / 2).
- ✅ **recovery_possible**: Retomada de estado verificada com sucesso.

---

## 📊 Estatísticas da Execução
- **Total de Eventos Gravados**: 4
- **Tentativas (Retries)**: 1 / 2
- **Duplicações de Eventos Evitadas**: 0