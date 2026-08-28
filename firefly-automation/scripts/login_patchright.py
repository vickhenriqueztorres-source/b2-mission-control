import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from patchright.sync_api import sync_playwright

profile_dir = Path("C:/Users/brend/firefly_bot_session")
profile_dir.mkdir(parents=True, exist_ok=True)

print("=" * 60)
print("🚀 ABRINDO ADOBE FIREFLY (PERFIL 100% LIMPO E ULTRA RAPIDO)...")
print("=" * 60)

with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        user_data_dir=str(profile_dir),
        headless=False,
        args=[
            "--start-maximized",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-blink-features=AutomationControlled"
        ],
        viewport=None
    )
    page = context.pages[0] if context.pages else context.new_page()
    print("🌐 Acessando https://firefly.adobe.com/ ...")
    page.goto("https://firefly.adobe.com/", wait_until="domcontentloaded")
    
    print("\n" + "=" * 60)
    print("👉 A janela do Adobe Firefly está aberta na sua tela.")
    print("👉 Faça o login na sua NOVA CONTA da Adobe.")
    print("👉 Quando a tela inicial carregar com os seus créditos:")
    print("   Volte nesta janela do terminal e pressione ENTER.")
    print("=" * 60 + "\n")
    
    input("Pressione [ENTER] aqui após concluir o login no Firefly: ")
    context.close()

print("\n✅ SUCESSO: Sessão da nova conta do Firefly persistida em disco!")
