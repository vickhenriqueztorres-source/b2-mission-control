import asyncio
import json
import os
import sys
from pathlib import Path
from patchright.async_api import async_playwright
from firefly_bot.chrome_profile import close_existing_profile_chrome

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

async def inspect_bottom_bar():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
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
        
        print("Navegando para your-stuff...", flush=True)
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        
        print("Aguardando cart?es...", flush=True)
        for _ in range(20):
            has_cards = await page.evaluate('''() => {
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
            if has_cards > 0:
                print(f"Encontrados {has_cards} cart?es!", flush=True)
                break
            await asyncio.sleep(2)
            
        # Clica no cart?o 1
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
        
        # Inspeciona a barra azul inferior
        bar_elements = await page.evaluate('''() => {
            const seen = new Set();
            const elements = [];
            function walk(root) {
                if (!root || seen.has(root)) return;
                seen.add(root);
                const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                for (const el of els) {
                    const t = (el.innerText || el.textContent || '').trim();
                    const aria = el.getAttribute && el.getAttribute('aria-label');
                    const testId = el.getAttribute && el.getAttribute('data-testid');
                    if (/selecionado|abrir|baixar|download|favorito/i.test(t) || /selecionado|abrir|baixar|download|favorito/i.test(aria || '') || (testId && /action|bar|download/i.test(testId))) {
                        const rect = el.getBoundingClientRect();
                        elements.push({
                            tag: el.tagName,
                            className: el.className,
                            testId,
                            aria,
                            text: t,
                            x: rect.x + rect.width / 2,
                            y: rect.y + rect.height / 2,
                            w: rect.width,
                            h: rect.height,
                            disabled: el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true'
                        });
                    }
                    if (el.shadowRoot) walk(el.shadowRoot);
                }
            }
            walk(document);
            return elements;
        }''')
        
        print("\nElementos da barra de a??o encontrados:", flush=True)
        for el in bar_elements:
            print(el, flush=True)
            
        await context.close()

if __name__ == '__main__':
    asyncio.run(inspect_bottom_bar())
