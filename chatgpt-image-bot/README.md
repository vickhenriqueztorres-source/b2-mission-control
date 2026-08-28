# 🤖 ChatGPT Image Bot

Automação em Python com Playwright (Sync API) para geração e download de imagens diretamente na interface web do ChatGPT (`chatgpt.com`), **SEM** necessidade de API key ou endpoints pagos.

---

## 📁 Estrutura de Pastas

```text
chatgpt-image-bot/
├── config.yaml            # Configurações de diretórios, delays, URL e timeouts
├── prompts/               # Fila de prompts (.txt, um por linha)
│   └── exemplo.txt
├── output/                # Imagens baixadas + manifest.jsonl + artifacts/ (ignorado no git)
├── profile/               # Perfil persistente do Chrome com cookies e sessão (NUNCA commitar)
├── src/
│   ├── __init__.py
│   ├── main.py            # CLI de entrada (argparse: --setup-login, --run)
│   ├── browser.py         # launch_persistent_context + anti-detecção
│   ├── auth.py            # Login manual assistido + verificação de sessão
│   └── storage.py         # Funções para salvar imagens e manifesto
├── requirements.txt
├── .gitignore             # profile/, output/, __pycache__/
└── README.md
```

---

## 🛠️ Instalação e Requisitos

- **Python 3.11+**
- **Playwright**
- **PyYAML**

### 1. Criar ambiente virtual (opcional, mas recomendado)
```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate
```

### 2. Instalar dependências
```bash
pip install -r requirements.txt
```

### 3. Instalar o navegador Chromium do Playwright
```bash
playwright install chromium
```

---

## 🚀 Como Usar

### Passo 1: Configuração Inicial e Login Assistido
Abra a janela do navegador e faça o login manualmente uma única vez. A sessão será salva de forma persistente na pasta `profile/`.

```bash
cd chatgpt-image-bot
python -m src.main --setup-login
```

O script irá:
1. Abrir a janela do Chrome.
2. Aguardar até que você faça o login manualmente (ou resolver desafios do Cloudflare, se houver).
3. Detectar a presença do campo de mensagem (*composer*).
4. Salvar a sessão e fechar o navegador com segurança.

---

### Passo 2: Verificação de Sessão Ativa
Para validar que a sessão está salva e pronta para o próximo estágio de geração:

```bash
python -m src.main --run
```

---

## ⚙️ Configurações (`config.yaml`)

| Parâmetro | Padrão | Descrição |
| :--- | :--- | :--- |
| `output_dir` | `"output"` | Pasta de destino das imagens geradas |
| `profile_dir` | `"profile"` | Pasta onde os dados de sessão do Chrome são salvos |
| `url` | `"https://chatgpt.com/"` | URL alvo da interface web |
| `delay_min_ms` | `1000` | Delay mínimo em milissegundos entre ações |
| `delay_max_ms` | `3000` | Delay máximo em milissegundos entre ações |
| `timeout_geracao_s` | `180` | Tempo limite em segundos para aguardar a imagem |
| `auth_timeout_s` | `300` | Tempo limite para o login manual assistido (5 min) |
