import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import shutil
from patchright.sync_api import sync_playwright

profile_dir = Path("C:/Users/brend/firefly_bot_session")
profile_dir.mkdir(parents=True, exist_ok=True)

# Limpeza preventiva de caches e locks
for item in ["GPUPersistentCache", "ShaderCache", "GrShaderCache", "firefly_bot_session.CHROME_DELETE", "Default/GPUPersistentCache", "Default/ShaderCache"]:
    p = profile_dir / item
    if p.exists():
        shutil.rmtree(p, ignore_errors=True)

print("=" * 60)
print("🚀 ABRINDO ADOBE FIREFLY NO GOOGLE CHROME...")
print("=" * 60)

with sync_playwright() as p:
    launch_kwargs = {
        "user_data_dir": str(profile_dir),
        "headless": False,
        "args": [
            "--start-maximized",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-blink-features=AutomationControlled"
        ],
        "viewport": None
    }
    
    # Tenta usar o Chrome nativo do sistema para compatibilidade total de perfil
    try:
        context = p.chromium.launch_persistent_context(**launch_kwargs, channel="chrome")
    except Exception:
        context = p.chromium.launch_persistent_context(**launch_kwargs)

    page = context.pages[0] if context.pages else context.new_page()
    print("🌐 Acessando https://firefly.adobe.com/generate/video ...")
    page.goto("https://firefly.adobe.com/generate/video", wait_until="domcontentloaded")
    
    print("\n" + "=" * 60)
    print("👉 A janela do Adobe Firefly está aberta na sua tela.")
    print("👉 Se aparecer 'Fazer logon' no topo direito, clique e faça o login.")
    print("👉 Quando a página carregar com os seus créditos:")
    print("   Volte nesta janela do terminal e pressione ENTER.")
    print("=" * 60 + "\n")
    
    input("Pressione [ENTER] aqui após concluir o login no Firefly: ")
    context.close()

print("\n✅ SUCESSO: Sessão da nova conta do Firefly persistida em disco!")
