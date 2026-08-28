# PROMPT DE DESENVOLVIMENTO — Sprint 1: Fundação

## Contexto

Você está desenvolvendo o projeto **Firefly Video Automation** — automação de geração de vídeos no Adobe Firefly via browser (Patchright), com fila durável (SQLite), worker resiliente e watchdog externo.

**LEIA OS DOCUMENTOS DO PROJETO ANTES DE CODAR:**
- `AIGUARD.md` — Regras defensivas (proibições absolutas, checagens obrigatórias)
- `PRD.md` — Escopo e requisitos funcionais
- `RULES.md` — Regras de código (stack fixa, estrutura de pastas, R1-R12)
- `ARQUITETURA.md` — Componentes e fluxos de falha
- `SELECTORS_GUIDE.md` — Como mapear seletores (ainda não mapeados)

**Stack fixa (RULES.md C2 — não trocar):**
- Python 3.11+, Patchright (async API), humancursor-playwright, SQLite (stdlib, sem ORM), logging (stdlib), pytest, ruff

**Princípio central:** Nunca inferir sucesso por ausência de sinal. Todo estado é verificado positivamente.

---

## O que implementar neste sprint

Implemente os **4 módulos fundacionais** abaixo. Sem eles, nenhum outro módulo funciona. São a base sobre a qual o State Reader, Worker, Session Manager e Watchdog vão operar.

### 1. `firefly_bot/config.py`

Dataclass única com TODOS os timeouts e configurações. Sem framework de config, sem .env, sem yaml.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Config:
    # Timeouts (RULES.md R5 — cada um com comentário do porquê)
    SELECTOR_TIMEOUT: int = 60_000        # ms — esperar elemento aparecer no DOM
    GENERATION_BUDGET: int = 300_000      # ms — máximo esperando still_generating sair (5 min)
    WATCHDOG_WALL_CLOCK: int = 600_000    # ms — teto total de um job antes de considerar travado (10 min)
    NAV_TIMEOUT: int = 90_000             # ms — navegação de página
    DOWNLOAD_TIMEOUT: int = 120_000       # ms — esperar download iniciar e completar

    # Jitter (RNF2 — ritmo humano entre jobs)
    JITTER_MIN: int = 8                   # segundos — pausa mínima entre jobs
    JITTER_MAX: int = 20                  # segundos — pausa máxima entre jobs

    # Retry
    MAX_ATTEMPTS: int = 3                 # teto de tentativas por job (AI Guard 1.6)
    UNKNOWN_THRESHOLD: int = 3            # unknowns consecutivos antes de pausar (paused-blocked)

    # Rate limiting (RNF3 — teto configurável de gerações por período)
    MAX_GENERATIONS_PER_HOUR: int = 20

    # Download validation (RULES.md R9)
    MIN_FILE_SIZE_BYTES: int = 100_000    # 100KB — mínimo plausível para vídeo

    # Paths
    DB_PATH: str = "data/firefly_jobs.db"
    DOWNLOAD_DIR: str = "downloads"
    SCREENSHOT_DIR: str = "screenshots"
    CHROME_PROFILE_DIR: str = "data/chrome_profile"

    # Browser (ADR-0003)
    FIREFLY_URL: str = "https://firefly.adobe.com/generate/video"
    VIEWPORT_WIDTH: int = 1920
    VIEWPORT_HEIGHT: int = 1080
```

Adicione comentários explicando o *porquê* de cada valor (RULES.md C7). Não adicione campos que não estão listados acima.

---

### 2. `firefly_bot/selectors.py`

Dicionário único centralizando TODOS os seletores da UI (RULES.md R2, AI Guard 2.1). 

**TODOS os seletores começam como `TODO:SELETOR` com `confirmed=False`** (AI Guard 4.1, RULES.md C3, SELECTORS_GUIDE.md). Nenhum seletor real do Firefly deve ser chutado.

Use a estrutura `SelectorDef` com: `method` (role/text/label/css/test_id/url_pattern), `value`, `description`, `confirmed`.

Inclua:
- `STATE_SELECTORS` — dicionário mapeando `ScreenState` → `SelectorDef` para cada um dos 7 estados
- `ACTION_SELECTORS` — dicionário com seletores de ação (prompt_input, generate_button, download_button, export_quality_option, logged_in_marker, overlay_close_buttons)
- `STATE_PRIORITY` — lista ordenada definindo a prioridade de checagem

Comente no topo do arquivo: `# AVISO: Este arquivo contém seletores não confirmados. Precisa preencher com seletores reais do Firefly antes de rodar. Ver SELECTORS_GUIDE.md.`

---

### 3. `firefly_bot/job_store.py`

Camada SQLite com WAL mode, operações atômicas e reconciliação no boot.

**Requisitos (RULES.md R4, AI Guard 2.3-2.4, ADR-0002):**

- `init_db(config) -> sqlite3.Connection` — cria conexão com pragmas WAL, cria tabela `jobs` se não existir
- `feed_prompts(conn, prompts: list[str]) -> int` — insere N prompts como `pending`, retorna quantos inseriu
- `claim_job(conn) -> dict | None` — claim atômico com CAS (`UPDATE ... WHERE status='pending' RETURNING ...`), incrementa `attempts`
- `mark_generating(conn, job_id)` — transição `claimed → generating`, seta `generation_started_at`
- `mark_done(conn, job_id, output_path)` — transição `generating → done`
- `mark_failed(conn, job_id, error, status='failed-infra')` — transição para `failed-content` ou `failed-infra`
- `mark_dead(conn, job_id, error)` — transição para `dead`
- `get_status(conn) -> dict` — contagem de jobs por status
- `reconcile_jobs(conn, generation_budget_seconds)` — reconciliação no boot (ADR-0002 edge case):
  - Jobs `claimed` sem `generation_started_at` → voltam pra `pending`
  - Jobs `generating` com `generation_started_at + budget < now` → voltam pra `pending`
  - Jobs `generating` dentro do budget → viram `stale_generating`
  - Jobs `stale_generating` que expiraram o budget → voltam pra `pending`

**Schema da tabela `jobs` (ADR-0002):**
```
id, prompt, status, attempts, output_path, error, claimed_at, generation_started_at, updated_at
```

**Regras:**
- Toda transição é `UPDATE ... WHERE id=? AND status=?` — verificar `cursor.rowcount`, se 0 alguém mudou o estado no meio, logar e abortar
- Nunca `DELETE` de jobs (AI Guard 1.5)
- `generation_started_at` é distinto de `claimed_at`
- Toda operação loga com `logging` estruturado (RULES.md R6): `timestamp | LEVEL | job_id=X status=Y action=Z`
- Type hints em todas as funções públicas (RULES.md C9)
- Código em inglês, comentários em português (RULES.md C8)

---

### 4. `firefly_bot/state_reader.py`

Enum `ScreenState` + função `read_screen_state()`.

**Requisitos (RULES.md R3, AI Guard 2.2, SELECTORS_GUIDE.md):**

```python
from enum import Enum

class ScreenState(Enum):
    LOGGED_OUT = "logged_out"
    QUOTA_EXHAUSTED = "quota_exhausted"
    CONTENT_REJECTED = "content_rejected"
    ERROR_TOAST = "error_toast"
    RESULT_READY = "result_ready"
    STILL_GENERATING = "still_generating"
    UNKNOWN = "unknown"
```

- `async def read_screen_state(page) -> ScreenState` — checa estados em ordem de prioridade (ordem do enum), retorna o primeiro que bater
- Estados com `confirmed=False` são skipados (não confirmam nem negam)
- `UNKNOWN` **nunca** é tratado como sucesso
- Seletor `url_pattern` checa `page.url` com regex, não procura elemento
- `is_visible(timeout=500)` — timeout curto para não bloquear (500ms por estado)
- Captura exceções específicas (`TimeoutError`, `PatchrightError`) por estado, loga qual chave falhou
- Importa `STATE_SELECTORS` e `STATE_PRIORITY` de `selectors.py`
- Importa `Config` de `config.py` para `SELECTOR_TIMEOUT`

---

## Regras de entrega

1. **Não implemente** worker.py, session.py, overlays.py, export_flow.py, downloads.py, watchdog.py, main.py — só os 4 módulos acima
2. **Não invente seletores** — tudo como `TODO:SELETOR` com `confirmed=False`
3. **Não adicione dependências** além das listadas na stack
4. **Não use** `print()` — use `logging` (RULES.md R6)
5. **Não engula exceção** — capture específico, logue com contexto (AI Guard 1.7, RULES.md R7)
6. **Type hints** em todas as funções públicas (RULES.md C9)
7. **Código em inglês, comentários/docstrings em português** (RULES.md C8)
8. **Sem magia** — sem decorators exóticos, metaclasses, monkey patch (RULES.md C10)

## Checklist final (AI Guard seção 3)

Ao final, liste explicitamente:
- [ ] Nenhum sleep fixo sincroniza com UI
- [ ] Nenhum networkidle
- [ ] Nenhum sucesso inferido por ausência
- [ ] Seletores todos em selectors.py
- [ ] Transições de Job Store são atômicas
- [ ] Reconciliação de boot existe
- [ ] Retries têm teto explícito (MAX_ATTEMPTS em config)
- [ ] Nenhuma exceção engolida
- [ ] Zero tentativa de login automático
- [ ] UNKNOWN vira falha com screenshot (documentar que screenshot será implementado no worker.py)

Se algum item não marcar, explicita o que falta.
