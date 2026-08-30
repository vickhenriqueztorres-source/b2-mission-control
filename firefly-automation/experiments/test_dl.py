import asyncio
import json
import os
import sys
from pathlib import Path
from patchright.async_api import async_playwright
from firefly_bot.chrome_profile import close_existing_profile_chrome

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

async def test_direct_download():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    takes_dir = Path("../public/episodes/gasolina-adulterada/takes").resolve()
    takes_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Diretório de download configurado: {takes_dir}", flush=True)
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=True,
            downloads_path=str(takes_dir),
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"],
            viewport={"width": 1920, "height": 1080},
            accept_downloads=True
        )
        page = context.pages[0] if context.pages else await context.new_page()
        
        print("Navegando para your-stuff...", flush=True)
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        
        print("Aguardando carregamento dos cartões...", flush=True)
        for _ in range(15):
            count = await page.evaluate('''() => {
                const seen = new Set();
                let c = 0;
                function walk(root) {
                    if (!root || seen.has(root)) return;
                    seen.add(root);
                    const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                    for (const el of els) {
                        if (el.classList && (el.classList.contains('cdo-masonryCard-card') || el.classList.contains('gridItem--aMgkD'))) c++;
                        if (el.shadowRoot) walk(el.shadowRoot);
                    }
                }
                walk(document);
                return c;
            }''')
            if count > 0:
                print(f"Total de cartões encontrados: {count}", flush=True)
                break
            await asyncio.sleep(2)
            
        # Clica no primeiro cartão
        print("Selecionando o primeiro cartão...", flush=True)
        await page.evaluate('''() => {
            const seen = new Set();
            const cards = [];
            function walk(root) {
                if (!root || seen.has(root)) return;
                seen.add(root);
                const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                for (const el of els) {
                    if (el.classList && (el.classList.contains('cdo-masonryCard-card') || el.classList.contains('gridItem--aMgkD'))) cards.push(el);
                    if (el.shadowRoot) walk(el.shadowRoot);
                }
            }
            walk(document);
            if (cards.length > 0) cards[0].click();
        }''')
        await asyncio.sleep(2)
        
        # Clica no botão Baixar da barra inferior
        print("Clicando no botão Baixar da barra azul...", flush=True)
        async with page.expect_download(timeout=30000) as download_info:
            clicked = await page.evaluate('''() => {
                const seen = new Set();
                function walk(root) {
                    if (!root || seen.has(root)) return false;
                    seen.add(root);
                    const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                    for (const el of els) {
                        const t = (el.innerText || el.textContent || '').trim();
                        const aria = el.getAttribute && el.getAttribute('aria-label');
                        if (t === 'Baixar' || aria === 'Baixar') {
                            el.click();
                            return true;
                        }
                        if (el.shadowRoot) {
                            if (walk(el.shadowRoot)) return true;
                        }
                    }
                    return false;
                }
                return walk(document);
            }''')
            print(f"Clique em Baixar: {clicked}", flush=True)
            
        download = await download_info.value
        dest = takes_dir / "GAS_001.mp4"
        await download.save_as(str(dest))
        print(f"✅ VÍDEO GAS_001 BAIXADO COM SUCESSO: {dest} ({dest.stat().st_size} bytes)", flush=True)
        
        await context.close()

if __name__ == '__main__':
    asyncio.run(test_direct_download())