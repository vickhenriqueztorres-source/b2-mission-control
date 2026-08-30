import asyncio
import json
import os
import re
import sys
from pathlib import Path
from patchright.async_api import async_playwright
from firefly_bot.chrome_profile import close_existing_profile_chrome

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

async def harvest_all():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    takes_dir = Path("../public/episodes/gasolina-adulterada/takes").resolve()
    takes_dir.mkdir(parents=True, exist_ok=True)
    
    raw_takes_dir = takes_dir / "raw_gallery"
    raw_takes_dir.mkdir(parents=True, exist_ok=True)
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=True,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"],
            viewport={"width": 1920, "height": 1080},
            accept_downloads=True
        )
        page = context.pages[0] if context.pages else await context.new_page()
        page.set_default_timeout(30000)
        
        print("1. Abrindo video generation para validar sessão...", flush=True)
        await page.goto("https://firefly.adobe.com/generate/video", wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(4)
        
        print("2. Navegando para your-stuff (Histórico de geração)...", flush=True)
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        
        print("3. Aguardando carregamento dos cartões...", flush=True)
        cards_count = 0
        for _ in range(15):
            cards_count = await page.evaluate('''() => {
                const seen = new Set();
                let c = 0;
                function walk(root) {
                    if (!root || seen.has(root)) return;
                    seen.add(root);
                    const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                    for (const el of els) {
                        if (el.classList && (el.classList.contains('cdo-masonryCard-card') || el.classList.contains('gridItem--aMgkD'))) {
                            c++;
                        }
                        if (el.shadowRoot) walk(el.shadowRoot);
                    }
                }
                walk(document);
                return c;
            }''')
            if cards_count > 0:
                break
            await asyncio.sleep(2)
            
        print(f"Total de cartões encontrados: {cards_count}", flush=True)
        
        downloaded_files = []
        
        for idx in range(min(cards_count, 22)):
            print(f"\n--- [BAIXANDO TAKE #{idx+1} de {cards_count}] ---", flush=True)
            
            clicked = await page.evaluate('''(targetIndex) => {
                const seen = new Set();
                const cards = [];
                function walk(root) {
                    if (!root || seen.has(root)) return;
                    seen.add(root);
                    const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                    for (const el of els) {
                        if (el.classList && (el.classList.contains('cdo-masonryCard-card') || el.classList.contains('gridItem--aMgkD'))) {
                            cards.push(el);
                        }
                        if (el.shadowRoot) walk(el.shadowRoot);
                    }
                }
                walk(document);
                if (targetIndex < cards.length) {
                    cards[targetIndex].scrollIntoView({behavior: 'instant', block: 'center'});
                    cards[targetIndex].click();
                    return true;
                }
                return false;
            }''', idx)
            
            if not clicked:
                print(f"Não foi possível clicar no cartão #{idx+1}", flush=True)
                continue
                
            await asyncio.sleep(1.5)
            
            out_file = raw_takes_dir / f"take_{idx+1:02d}.mp4"
            print(f"Disparando download para {out_file.name}...", flush=True)
            
            try:
                async with page.expect_download(timeout=20000) as download_info:
                    dl_clicked = await page.evaluate('''() => {
                        const seen = new Set();
                        function walk(root) {
                            if (!root || seen.has(root)) return false;
                            seen.add(root);
                            const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                            for (const el of els) {
                                const t = (el.innerText || el.textContent || '').trim();
                                const aria = el.getAttribute && el.getAttribute('aria-label');
                                if (t === 'Baixar' || aria === 'Baixar' || (el.getAttribute && el.getAttribute('data-testid') === 'download-button')) {
                                    if (el.offsetWidth || el.offsetHeight) {
                                        el.click();
                                        return true;
                                    }
                                }
                                if (el.shadowRoot) {
                                    if (walk(el.shadowRoot)) return true;
                                }
                            }
                            return false;
                        }
                        return walk(document);
                    }''')
                    print(f"Botão Baixar da barra clicado: {dl_clicked}", flush=True)
                    
                download = await download_info.value
                await download.save_as(str(out_file))
                size = out_file.stat().st_size
                print(f"[SUCESSO] Take #{idx+1:02d} salvo: {out_file.name} ({size} bytes)", flush=True)
                downloaded_files.append(out_file)
            except Exception as dl_err:
                print(f"[FALHA DOWNLOAD] Take #{idx+1:02d}: {dl_err}", flush=True)
                
            await page.keyboard.press("Escape")
            await asyncio.sleep(0.5)
            
        print(f"\n==========================================", flush=True)
        print(f"Total de takes baixados com sucesso: {len(downloaded_files)}", flush=True)
        for f in downloaded_files:
            print(f" - {f.name} ({f.stat().st_size} bytes)", flush=True)
            
        await context.close()

if __name__ == '__main__':
    asyncio.run(harvest_all())