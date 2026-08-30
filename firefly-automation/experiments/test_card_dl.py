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

async def test_cards_dl():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    takes_dir = Path("../public/episodes/gasolina-adulterada/takes").resolve()
    takes_dir.mkdir(parents=True, exist_ok=True)
    
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
        
        # Aguarda carregamento
        for _ in range(20):
            count = await page.evaluate('''() => {
                const seen = new Set();
                let c = 0;
                function walk(root) {
                    if (!root || seen.has(root)) return;
                    seen.add(root);
                    const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                    for (const el of els) {
                        if (el.classList && el.classList.contains('cdo-masonryCard-card')) c++;
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
            
        for card_idx, scene_id in [(2, "GAS_003"), (3, "GAS_006")]:
            dest_file = takes_dir / f"{scene_id}.mp4"
            print(f"\nBaixando {scene_id} a partir do cartão #{card_idx+1}...", flush=True)
            
            # Recarrega a página para resetar a seleção de forma 100% limpa
            if card_idx > 2:
                await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
                await asyncio.sleep(5)
                
            # Clica no cartão card_idx
            clicked = await page.evaluate('''(targetIndex) => {
                const seen = new Set();
                const cards = [];
                function walk(root) {
                    if (!root || seen.has(root)) return;
                    seen.add(root);
                    const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                    for (const el of els) {
                        if (el.classList && el.classList.contains('cdo-masonryCard-card')) {
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
            }''', card_idx)
            
            print(f"Cartão #{card_idx+1} clicado: {clicked}", flush=True)
            await asyncio.sleep(2)
            
            # Localiza e clica no botão Baixar
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
                print(f"Botão Baixar não encontrado para {scene_id}!", flush=True)
                continue
                
            print(f"Clicando no botão Baixar em ({baixar_rect['x']}, {baixar_rect['y']})...", flush=True)
            
            try:
                async with page.expect_download(timeout=60000) as dl_info:
                    await page.mouse.click(baixar_rect['x'], baixar_rect['y'])
                    print("Aguardando stream de download...", flush=True)
                    
                download = await dl_info.value
                await download.save_as(str(dest_file))
                print(f"🎉 SUCESSO: {dest_file.name} ({dest_file.stat().st_size} bytes)", flush=True)
            except Exception as dl_err:
                print(f"❌ Erro baixando {scene_id}: {dl_err}", flush=True)
                
            await page.keyboard.press("Escape")
            await asyncio.sleep(2)
            
        await context.close()

if __name__ == '__main__':
    asyncio.run(test_cards_dl())