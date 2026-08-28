import argparse
import json
import sys
from pathlib import Path
from typing import List, Set, Dict, Any

# Garante suporte completo a UTF-8 no terminal Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from src.browser import launch_persistent_browser, load_config
from src.auth import ensure_authenticated, is_session_active
from src.storage import ensure_dirs
from src.generator import Generator, Colors


def load_queue(queue_path: str = "prompts/queue.txt") -> List[str]:
    """Lê a fila de prompts ignorando linhas vazias e comentários (#)."""
    path = Path(queue_path)
    if not path.is_absolute():
        base_dir = Path(__file__).resolve().parent.parent
        path = base_dir / queue_path

    if not path.exists():
        return []

    prompts = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line_clean = line.strip()
            if line_clean and not line_clean.startswith("#"):
                prompts.append(line_clean)
    return prompts


def load_completed_prompts(manifest_path: str = "output/manifest.jsonl") -> Set[str]:
    """Lê o arquivo de manifesto e retorna o conjunto de prompts com status='success'."""
    path = Path(manifest_path)
    if not path.is_absolute():
        base_dir = Path(__file__).resolve().parent.parent
        path = base_dir / manifest_path

    if not path.exists():
        return set()

    completed = set()
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                data = json.loads(line.strip())
                if data.get("status") == "success" and data.get("prompt"):
                    completed.add(data.get("prompt").strip())
            except Exception:
                pass
    return completed


def setup_login(config_path: str = "config.yaml") -> bool:
    """
    Comando --setup-login:
    Abre o navegador persistente, executa o fluxo de login manual assistido,
    salva screenshot de comprovação e confirma a persistência da sessão.
    """
    config = load_config(config_path)
    url = config.get("url", "https://chatgpt.com/")
    auth_timeout = config.get("auth_timeout_s", 300)
    profile_dir = config.get("profile_dir", "profile")

    print("\n=======================================================")
    print("🚀 CHATGPT IMAGE BOT: CONFIGURAÇÃO DE LOGIN INICIAL")
    print("=======================================================")
    print(f"📁 Diretório de perfil: {profile_dir}")
    print(f"🌐 URL alvo: {url}\n")

    playwright, context, page = launch_persistent_browser(config_path)

    try:
        success = ensure_authenticated(page, url=url, timeout_s=auth_timeout)

        if success:
            artifacts_dir = Path(__file__).resolve().parent.parent / "output" / "artifacts"
            artifacts_dir.mkdir(parents=True, exist_ok=True)
            screenshot_path = artifacts_dir / "session_verified.png"
            page.screenshot(path=str(screenshot_path))
            print(f"📸 Screenshot da sessão salvo em: {screenshot_path}")
            print(f"\n✅ Sessão salva em {profile_dir}/")
            return True
        else:
            print(f"\n❌ Falha na autenticação ou tempo limite excedido.")
            return False
    finally:
        print("🔒 Fechando navegador e salvando perfil...")
        context.close()
        playwright.stop()


def dry_run_pipeline(config_path: str = "config.yaml") -> None:
    """
    Comando --dry-run:
    Lê a fila e o manifesto e exibe quais prompts seriam processados e quais serão pulados.
    """
    config = load_config(config_path)
    queue_file = config.get("prompts_file", "prompts/queue.txt")
    manifest_file = config.get("manifest_file", "output/manifest.jsonl")

    prompts = load_queue(queue_file)
    completed = load_completed_prompts(manifest_file)

    print("\n=======================================================")
    print("🔍 CHATGPT IMAGE BOT: DRY-RUN (SIMULAÇÃO DE FILA)")
    print("=======================================================")
    print(f"📄 Arquivo de fila: {queue_file} ({len(prompts)} prompts)")
    print(f"📋 Manifesto: {manifest_file} ({len(completed)} prompts concluídos)\n")

    to_process = []
    for i, p in enumerate(prompts, 1):
        if p in completed:
            print(f"{Colors.YELLOW}[PULADO - CONCLUÍDO]{Colors.RESET} [{i}] {p}")
        else:
            print(f"{Colors.GREEN}[A PROCESSAR]{Colors.RESET} [{i}] {p}")
            to_process.append(p)

    print(f"\n📊 Total na fila: {len(prompts)} | Concluídos: {len(prompts) - len(to_process)} | Pendentes: {len(to_process)}\n")


def run_pipeline(config_path: str = "config.yaml") -> bool:
    """
    Comando --run:
    Executa o pipeline completo da máquina de estados para todos os prompts pendentes.
    """
    config = load_config(config_path)
    url = config.get("url", "https://chatgpt.com/")
    profile_dir = config.get("profile_dir", "profile")
    queue_file = config.get("prompts_file", "prompts/queue.txt")
    manifest_file = config.get("manifest_file", "output/manifest.jsonl")

    prompts = load_queue(queue_file)
    completed = load_completed_prompts(manifest_file)

    pending_prompts = [p for p in prompts if p not in completed]

    print("\n=======================================================")
    print("🤖 CHATGPT IMAGE BOT: EXECUÇÃO DO PIPELINE DE GERAÇÃO")
    print("=======================================================")
    print(f"📁 Perfil: {profile_dir} | URL: {url}")
    print(f"📊 Fila total: {len(prompts)} | Concluídos: {len(completed)} | A processar: {len(pending_prompts)}\n")

    if not pending_prompts:
        print("🎉 Todos os prompts da fila já foram concluídos anteriormente! (Retomada automática)")
        return True

    playwright, context, page = launch_persistent_browser(config_path)

    try:
        print("🌐 Validando sessão no ChatGPT...")
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(3000)

        if not is_session_active(page):
            print("⚠️ Sessão não autenticada. Aguardando login manual...")
            if not ensure_authenticated(page, url=url, timeout_s=300):
                print("❌ Não foi possível autenticar. Abortando execução.")
                return False

        generator = Generator(page, config)

        success_count = 0
        failed_count = 0

        for index, prompt in enumerate(pending_prompts, 1):
            print(f"\n-------------------------------------------------------")
            print(f"📌 PROMPT [{index}/{len(pending_prompts)}]")
            print(f"-------------------------------------------------------")
            
            ok = generator.process_prompt(prompt)
            if ok:
                success_count += 1
            else:
                failed_count += 1

        print("\n=======================================================")
        print("🏁 RESUMO DA EXECUÇÃO DO PIPELINE")
        print("=======================================================")
        print(f"✅ Sucessos: {success_count}")
        print(f"❌ Falhas: {failed_count}")
        print(f"📁 Imagens e manifesto salvos em: {config.get('output_dir', 'output')}/")
        print("=======================================================\n")

        return failed_count == 0

    finally:
        print("🔒 Fechando navegador...")
        context.close()
        playwright.stop()


def main():
    parser = argparse.ArgumentParser(
        description="ChatGPT Image Bot: Automação de geração de imagens via Web Interface."
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--setup-login",
        action="store_true",
        help="Abre o navegador para login manual assistido e salva a sessão no profile/."
    )
    group.add_argument(
        "--run",
        action="store_true",
        help="Executa o pipeline de geração de imagens a partir da fila prompts/queue.txt."
    )
    group.add_argument(
        "--dry-run",
        action="store_true",
        help="Simula a execução e lista os prompts pendentes vs já concluídos sem abrir o browser."
    )
    parser.add_argument(
        "--config",
        type=str,
        default="config.yaml",
        help="Caminho alternativo para o arquivo config.yaml (padrão: config.yaml)"
    )

    args = parser.parse_args()

    ensure_dirs()

    if args.setup_login:
        success = setup_login(config_path=args.config)
        sys.exit(0 if success else 1)
    elif args.dry_run:
        dry_run_pipeline(config_path=args.config)
        sys.exit(0)
    elif args.run:
        success = run_pipeline(config_path=args.config)
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
