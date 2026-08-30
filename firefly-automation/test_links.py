import asyncio
import json
import os
import sys
from pathlib import Path
from patchright.async_api import async_playwright
from firefly_bot.chrome_profile import close_existing_profile_chrome

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

async def test_capture_links():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    intercepted_links = []
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=True,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"],
            viewport={"width": 1920, "height": 1080}
        )
        page = context.pages[0] if context.pages else await context.new_page()
        
        async def on_response(response):
            if "links?assetid=" in response.url.lower():
                try:
                    data = await response.json()
                    intercepted_links.append({"url": response.url, "data": data})
                    print(f"? CAPTURADO LINKS API: {json.dumps(data, indent=2, ensure_ascii=False)[:500]}", flush=True)
                except Exception as e:
                    print(f"Erro lendo json: {e}", flush=True)
                    
        page.on("response", on_response)
        
        print("Navegando para your-stuff...", flush=True)
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(8)
        
        # Clica no cart?o 1
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
        
        # Clica em Baixar
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
        
        if baixar_rect:
            print(f"Clicando em Baixar ({baixar_rect['x']}, {baixar_rect['y']})...", flush=True)
            await page.mouse.click(baixar_rect['x'], baixar_rect['y'])
            await asyncio.sleep(5)
            
        Path("screenshots/intercepted_links.json").write_text(json.dumps(intercepted_links, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Total de links capturados: {len(intercepted_links)}", flush=True)
        
        await context.close()

if __name__ == '__main__':
    asyncio.run(test_capture_links())
