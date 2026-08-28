import time
from playwright.sync_api import Page
from src.selectors import SELECTORS


def is_cloudflare_present(page: Page) -> bool:
    """Verifica se há um desafio ou interstitial do Cloudflare na página."""
    try:
        challenge_element = page.locator(SELECTORS["cloudflare_challenge"]).first
        return challenge_element.is_visible(timeout=1000)
    except Exception:
        return False


def is_session_active(page: Page) -> bool:
    """
    Verifica se a página do ChatGPT está pronta para receber prompts.
    Se o campo de prompt (composer) estiver visível e interativo, a sessão está 100% ativa.
    """
    try:
        textarea = page.locator(SELECTORS["prompt_textarea"]).first
        if textarea.is_visible(timeout=3000):
            return True
    except Exception:
        pass

    return False


def ensure_authenticated(
    page: Page,
    url: str = "https://chatgpt.com/",
    timeout_s: int = 30
) -> bool:
    """
    Garante que a página está aberta e o composer pronto para geração.
    """
    print(f"🌐 Acessando {url}...")
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
    except Exception as e:
        print(f"⚠️ Aviso no carregamento: {e}")

    time.sleep(2)

    if is_session_active(page):
        print("✅ ChatGPT pronto e composer ativo! Iniciando geração imediatamente.")
        return True

    # Se ainda estiver carregando, aguarda até 10 segundos
    start_time = time.time()
    while time.time() - start_time < 10:
        if is_session_active(page):
            print("✅ ChatGPT pronto e composer ativo! Iniciando geração imediatamente.")
            return True
        time.sleep(1)

    print("ℹ️ Continuando para o gerador de prompts...")
    return True
