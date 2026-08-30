import asyncio
import json
import os
import sys
import time
from pathlib import Path
from patchright.async_api import async_playwright
from firefly_bot.chrome_profile import close_existing_profile_chrome

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

async def test_full_download():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    takes_dir = Path("../public/episodes/gasolina-adulterada/takes").resolve()
    takes_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Salvando takes em: {takes_dir}", flush=True)
    
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
        
        print("Aguardando carregamento da galeria...", flush=True)
        for _ in range(20):
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
                print(f"Total de {count} cartões carregados!", flush=True)
                break
            await asyncio.sleep(2)
            
        print("Selecionando cartão 1...", flush=True)
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
        
        baixar_rect = await page.evaluate('''() => {
            const seen = new Set();
            let rect = null;
            function walk(root) {
                if (!root || seen.has(root)) return;
                seen.add(root);
                const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                for (const el of els) {
                    const t = (el.innerText || el.textContent || '').trim();
                    const aria = el.getAttribute && el.getAttribute('aria-label');
                    if (t === 'Baixar' || aria === 'Baixar') {
                        const r = el.getBoundingClientRect();
                        if (r.width > 0 && r.height > 0 && r.y > 800) {
                            rect = {x: r.x + r.width / 2, y: r.y + r.height / 2};
                        }
                    }
                    if (el.shadowRoot) walk(el.shadowRoot);
                }
            }
            walk(document);
            return rect;
        }''')
        
        if not baixar_rect:
            print("Botão Baixar não encontrado!", flush=True)
            await context.close()
            return
            
        print(f"Clicando no botão Baixar em ({baixar_rect['x']}, {baixar_rect['y']})...", flush=True)
        
        async with page.expect_download(timeout=60000) as dl_info:
            await page.mouse.click(baixar_rect['x'], baixar_rect['y'])
            print("Mouse clicado, aguardando stream de download...", flush=True)
            
        download = await dl_info.value
        dest_file = takes_dir / "GAS_001.mp4"
        await download.save_as(str(dest_file))
        print(f"🎉 SUCESSO ABSOLUTO! Arquivo salvo: {dest_file} ({dest_file.stat().st_size} bytes)", flush=True)
        
        await context.close()

if __name__ == '__main__':
    asyncio.run(test_full_download())