import asyncio
import json
import os
import re
from pathlib import Path
from patchright.async_api import async_playwright
from firefly_bot.chrome_profile import close_existing_profile_chrome

async def harvest_gallery():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    # Carrega os guias mais recentes do lote 1
    guide_path = sorted(Path("../runs/gasolina-adulterada/dispatch").glob("RUN_LOTE1_*/lote1-guide.json"))[-1]
    guide_data = json.loads(guide_path.read_text(encoding="utf-8"))
    guide_items = guide_data.get("items", [])
    print(f"Total de itens no guia alvo: {len(guide_items)}")
    for item in guide_items:
        print(f" - {item['name']}: {item['prompt'][:60]}...")
        
    takes_dir = Path("../public/episodes/gasolina-adulterada/takes").resolve()
    takes_dir.mkdir(parents=True, exist_ok=True)
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
            ],
            viewport={"width": 1920, "height": 1080},
            accept_downloads=True
        )
        page = context.pages[0] if context.pages else await context.new_page()
        page.set_default_timeout(30000)
        
        print("Navegando para https://firefly.adobe.com/your-stuff ...")
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        
        print("Aguardando carregamento dos cart?es da galeria...")
        await asyncio.sleep(15)
        
        screenshot_path = Path("screenshots/gallery_loaded.png")
        screenshot_path.parent.mkdir(parents=True, exist_ok=True)
        await page.screenshot(path=str(screenshot_path))
        print("Screenshot da galeria salvo:", screenshot_path)
        
        # Descobre os itens reais da galeria
        items = await page.evaluate('''() => {
            const seen = new Set();
            const list = [];
            function walk(root) {
                if (!root || seen.has(root)) return;
                seen.add(root);
                const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                for (const el of els) {
                    const testId = el.getAttribute && el.getAttribute('data-testid');
                    const ariaLabel = el.getAttribute && el.getAttribute('aria-label');
                    const tag = el.tagName;
                    const text = (el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim();
                    if (tag === 'IMG' || tag === 'VIDEO' || (testId && /asset|card|item|thumbnail|history/i.test(testId))) {
                        const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : {x:0, y:0, width:0, height:0};
                        if (rect.width > 50 && rect.height > 50) {
                            list.push({
                                tag,
                                testId,
                                ariaLabel,
                                text: text.slice(0, 200),
                                src: el.src || el.getAttribute('src') || '',
                                x: rect.x + rect.width / 2,
                                y: rect.y + rect.height / 2,
                                width: rect.width,
                                height: rect.height
                            });
                        }
                    }
                    if (el.shadowRoot) walk(el.shadowRoot);
                }
            }
            walk(document);
            return list;
        }''')
        print(f"Total de itens vis?veis identificados: {len(items)}")
        for it in items[:15]:
            print(it)
            
        await context.close()

if __name__ == '__main__':
    asyncio.run(harvest_gallery())
