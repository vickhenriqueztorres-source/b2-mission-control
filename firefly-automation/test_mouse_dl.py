import asyncio
import json
import os
import sys
from pathlib import Path
from patchright.async_api import async_playwright
from firefly_bot.chrome_profile import close_existing_profile_chrome

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

async def test_mouse_click_download():
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
        
        async def on_response(response):
            if any(k in response.url.lower() for k in ["download", "export", "media", "asset", "blob", "mp4", "rendition"]):
                print(f"[NET RESPONSE] {response.status} {response.url[:100]}", flush=True)
                
        page.on("response", on_response)
        
        print("Navegando para your-stuff...", flush=True)
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        
        # Espera carregar
        await asyncio.sleep(10)
        
        # Clica no primeiro cart?o
        print("Clicando no primeiro cart?o...", flush=True)
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
        await asyncio.sleep(3)
        
        # Encontra as coordenadas exatas do bot?o Baixar
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
                            rect = {x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height};
                        }
                    }
                    if (el.shadowRoot) walk(el.shadowRoot);
                }
            }
            walk(document);
            return rect;
        }''')
        print(f"Coordenadas do bot?o Baixar: {baixar_rect}", flush=True)
        
        if baixar_rect:
            print(f"Clicando com mouse em ({baixar_rect['x']}, {baixar_rect['y']})...", flush=True)
            await page.mouse.click(baixar_rect['x'], baixar_rect['y'])
            await asyncio.sleep(5)
            
            await page.screenshot(path="screenshots/after_baixar_click.png")
            print("Screenshot salvo: screenshots/after_baixar_click.png", flush=True)
            
        await context.close()

if __name__ == '__main__':
    asyncio.run(test_mouse_click_download())
