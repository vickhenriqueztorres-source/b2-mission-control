import asyncio
import json
from pathlib import Path
from patchright.async_api import async_playwright
from firefly_bot.chrome_profile import close_existing_profile_chrome

async def dump_all_elements():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=True,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"],
            viewport={"width": 1920, "height": 1080}
        )
        page = context.pages[0] if context.pages else await context.new_page()
        
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(12)
        
        tree = await page.evaluate('''() => {
            const seen = new Set();
            const tags = {};
            function walk(root) {
                if (!root || seen.has(root)) return;
                seen.add(root);
                const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                for (const el of els) {
                    const tag = el.tagName.toLowerCase();
                    tags[tag] = (tags[tag] || 0) + 1;
                    if (el.shadowRoot) walk(el.shadowRoot);
                }
            }
            walk(document);
            return tags;
        }''')
        print("Contagem de tags no DOM (incluindo shadow roots):", tree)
        
        # Procura elementos com 0:05 ou imagens
        interesting = await page.evaluate('''() => {
            const seen = new Set();
            const items = [];
            function walk(root) {
                if (!root || seen.has(root)) return;
                seen.add(root);
                const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                for (const el of els) {
                    const text = (el.innerText || el.textContent || '').trim();
                    if (/0:05|0:04|0:06|0:08/i.test(text) && text.length < 50) {
                        const rect = el.getBoundingClientRect();
                        items.push({
                            tag: el.tagName,
                            className: el.className,
                            text,
                            rect: {x: rect.x, y: rect.y, w: rect.width, h: rect.height}
                        });
                    }
                    if (el.shadowRoot) walk(el.shadowRoot);
                }
            }
            walk(document);
            return items;
        }''')
        print("Elementos com badge de tempo encontrados:", interesting)
        
        await context.close()

if __name__ == '__main__':
    asyncio.run(dump_all_elements())
