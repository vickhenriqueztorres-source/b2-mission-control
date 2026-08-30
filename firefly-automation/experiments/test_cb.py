import asyncio
import json
import os
import sys
from pathlib import Path
from patchright.async_api import async_playwright
from firefly_bot.chrome_profile import close_existing_profile_chrome

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

async def test_checkbox_click():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    takes_dir = Path("../public/episodes/gasolina-adulterada/takes").resolve()
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=True,
            downloads_path=str(takes_dir),
            viewport={"width": 1920, "height": 1080},
            accept_downloads=True
        )
        page = context.pages[0] if context.pages else await context.new_page()
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(8)
        
        # Encontra o terceiro cartão
        c3_rect = await page.evaluate('''() => {
            const seen = new Set();
            const cards = [];
            function walk(root) {
                if (!root || seen.has(root)) return;
                seen.add(root);
                const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                for (const el of els) {
                    if (el.classList && el.classList.contains('cdo-masonryCard-card')) cards.push(el);
                    if (el.shadowRoot) walk(el.shadowRoot);
                }
            }
            walk(document);
            if (cards.length > 2) {
                cards[2].scrollIntoView({behavior: 'instant', block: 'center'});
                const r = cards[2].getBoundingClientRect();
                return {x: r.x, y: r.y, w: r.width, h: r.height};
            }
            return null;
        }''')
        print(f"Retângulo do Cartão #3: {c3_rect}", flush=True)
        
        if c3_rect:
            cb_x = c3_rect['x'] + 16
            cb_y = c3_rect['y'] + 16
            print(f"Clicando no checkbox em ({cb_x}, {cb_y})...", flush=True)
            await page.mouse.click(cb_x, cb_y)
            await asyncio.sleep(2)
            
            await page.screenshot(path="screenshots/card_3_checkbox.png")
            print("Screenshot salvo: screenshots/card_3_checkbox.png", flush=True)
            
            print("Clicando no botão Baixar em (1669, 1041)...", flush=True)
            async with page.expect_download(timeout=45000) as dl_info:
                await page.mouse.click(1669, 1041)
                
            dl = await dl_info.value
            dest = takes_dir / "GAS_003.mp4"
            await dl.save_as(str(dest))
            print(f"🎉 SUCESSO ABSOLUTO GAS_003: {dest} ({dest.stat().st_size} bytes)", flush=True)
            
        await context.close()

if __name__ == '__main__':
    asyncio.run(test_checkbox_click())