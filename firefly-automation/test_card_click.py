import asyncio
import json
import os
from pathlib import Path
from patchright.async_api import async_playwright
from firefly_bot.chrome_profile import close_existing_profile_chrome

async def test_card_click():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
            ],
            viewport={"width": 1920, "height": 1080}
        )
        page = context.pages[0] if context.pages else await context.new_page()
        
        print("Navegando para your-stuff...")
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(8)
        
        # Inspeciona dentro do shadowRoot de cc-asset-organizer
        card_info = await page.evaluate('''() => {
            const seen = new Set();
            const cards = [];
            function walk(root) {
                if (!root || seen.has(root)) return;
                seen.add(root);
                const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                for (const el of els) {
                    const tag = el.tagName;
                    const testId = el.getAttribute && el.getAttribute('data-testid');
                    const aria = el.getAttribute && el.getAttribute('aria-label');
                    const className = String(el.className || '');
                    if (tag === 'CC-GRID-ITEM' || tag === 'CC-CARD' || /asset-card|grid-item|card/i.test(className) || (testId && /asset|card|item/i.test(testId))) {
                        const rect = el.getBoundingClientRect();
                        if (rect.width > 50 && rect.height > 50) {
                            cards.push({
                                tag,
                                className,
                                testId,
                                aria,
                                text: (el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 150),
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
            return cards;
        }''')
        print(f"Cards encontrados: {len(card_info)}")
        for c in card_info[:10]:
            print(c)
            
        if card_info:
            first = card_info[0]
            print(f"Clicando no primeiro card em ({first['x']}, {first['y']})...")
            await page.mouse.click(first['x'], first['y'])
            await asyncio.sleep(4)
            
            # Inspeciona o que abriu
            modal_data = await page.evaluate('''() => {
                const seen = new Set();
                const texts = [];
                const buttons = [];
                function walk(root) {
                    if (!root || seen.has(root)) return;
                    seen.add(root);
                    const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                    for (const el of els) {
                        const t = (el.innerText || el.textContent || '').trim();
                        if (t && t.length > 15 && !texts.includes(t)) texts.push(t);
                        if (el.tagName === 'BUTTON' || el.tagName === 'SP-BUTTON' || el.getAttribute('role') === 'button') {
                            const bt = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim();
                            if (bt) buttons.push({text: bt, testId: el.getAttribute('data-testid')});
                        }
                        if (el.shadowRoot) walk(el.shadowRoot);
                    }
                }
                walk(document);
                return {texts: texts.slice(0, 15), buttons: buttons.slice(0, 15), url: location.href};
            }''')
            print("Dados do modal/p?gina ap?s clique:", json.dumps(modal_data, indent=2, ensure_ascii=False))
            
        await context.close()

if __name__ == '__main__':
    asyncio.run(test_card_click())
