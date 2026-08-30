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

async def test_abrir_and_harvest():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    guide_path = sorted(Path("../runs/gasolina-adulterada/dispatch").glob("RUN_LOTE1_*/lote1-guide.json"))[-1]
    guide_data = json.loads(guide_path.read_text(encoding="utf-8"))
    targets = guide_data.get("items", [])
    print(f"Total de cenas alvo: {len(targets)}", flush=True)
    
    takes_dir = Path("../public/episodes/gasolina-adulterada/takes").resolve()
    takes_dir.mkdir(parents=True, exist_ok=True)
    
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
        
        print("Navegando para https://firefly.adobe.com/your-stuff ...", flush=True)
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(8)
        
        # Seleciona o primeiro cart?o
        await page.evaluate('''() => {
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
            if (cards.length > 0) cards[0].click();
        }''')
        await asyncio.sleep(2)
        
        # Clica no bot?o 'Abrir' da barra azul inferior
        print("Clicando no bot?o 'Abrir'...", flush=True)
        abrir_clicked = await page.evaluate('''() => {
            const seen = new Set();
            function walk(root) {
                if (!root || seen.has(root)) return false;
                seen.add(root);
                const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                for (const el of els) {
                    const t = (el.innerText || el.textContent || '').trim();
                    if (t === 'Abrir' || el.getAttribute('aria-label') === 'Abrir') {
                        el.click();
                        return true;
                    }
                    if (el.shadowRoot) {
                        if (walk(el.shadowRoot)) return true;
                    }
                }
                return false;
            }
            return walk(document);
        }''')
        print(f"Abrir clicado: {abrir_clicked}", flush=True)
        await asyncio.sleep(6)
        
        await page.screenshot(path="screenshots/after_abrir_clicked.png")
        print("Screenshot salvo: screenshots/after_abrir_clicked.png", flush=True)
        print(f"Nova URL: {page.url}", flush=True)
        
        # Extrai o prompt exibido na tela aberta
        prompt_text = await page.evaluate('''() => {
            const promptEl = document.querySelector('textarea, [data-testid="prompt-input"], [aria-label*="Prompt"], [placeholder*="Prompt"]') || document.querySelector('firefly-prompt-input');
            let txt = '';
            if (promptEl) {
                txt = promptEl.value || promptEl.innerText || promptEl.textContent || '';
            }
            if (!txt) {
                // Procura em todo o body
                const match = document.body.innerText.match(/(?:Prompt|Aviso)[\\s\\S]{1,500}/i);
                if (match) txt = match[0];
            }
            return txt;
        }''')
        print(f"Prompt detectado na tela aberta:\n{prompt_text[:300]}...", flush=True)
        
        await context.close()

if __name__ == '__main__':
    asyncio.run(test_abrir_and_harvest())
