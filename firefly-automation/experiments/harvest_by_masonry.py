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

async def harvest_by_masonry():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    # Carrega os guias de cena do lote 1 e lote 2
    guide_path = sorted(Path("../runs/gasolina-adulterada/dispatch").glob("RUN_LOTE1_*/lote1-guide.json"))[-1]
    guide_data = json.loads(guide_path.read_text(encoding="utf-8"))
    targets = guide_data.get("items", [])
    print(f"Total de cenas alvo no guia: {len(targets)}")
    for t in targets:
        print(f" - {t['name']}: {t['prompt'][:60]}...")
    
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
        
        print("Navegando para https://firefly.adobe.com/your-stuff ...")
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        
        print("Aguardando carregamento dos cartões na galeria...")
        cards_found = False
        for attempt in range(20):
            count = await page.evaluate('''() => {
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
            if count > 0:
                print(f"✅ {count} cartões de vídeo encontrados no Shadow DOM!")
                cards_found = True
                break
            await asyncio.sleep(2)
            
        if not cards_found:
            print("❌ Nenhum cartão encontrado após 40s.")
            await context.close()
            return
        
        matched_takes = {}
        
        for idx in range(min(count, 10)):
            print(f"\n==========================================", flush=True)
            print(f"Inspecionando Cartão #{idx+1} de {count}...", flush=True)
            
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
            print(f"Clique no cartão #{idx+1}: {clicked}", flush=True)
            await asyncio.sleep(4)
            
            # Salva screenshot do modal aberto
            await page.screenshot(path=f"screenshots/card_{idx+1}_opened.png")
            print(f"Screenshot salvo: screenshots/card_{idx+1}_opened.png", flush=True)
            
            info = await page.evaluate('''() => {
                const seen = new Set();
                const texts = [];
                const buttons = [];
                function walk(root) {
                    if (!root || seen.has(root)) return;
                    seen.add(root);
                    const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                    for (const el of els) {
                        const t = (el.innerText || el.textContent || '').trim();
                        if (t && t.length > 15 && !texts.includes(t)) {
                            texts.push(t);
                        }
                        const testId = el.getAttribute && el.getAttribute('data-testid');
                        const aria = el.getAttribute && el.getAttribute('aria-label');
                        if (el.tagName === 'BUTTON' || el.tagName === 'SP-BUTTON' || /button/i.test(el.getAttribute('role') || '')) {
                            const bt = t || aria || testId || '';
                            if (bt && !buttons.includes(bt)) buttons.push(bt);
                        }
                        if (el.shadowRoot) walk(el.shadowRoot);
                    }
                }
                walk(document);
                return { texts: texts.slice(0, 10), buttons: buttons.slice(0, 15), url: location.href };
            }''')
            
            print(f"URL: {info.get('url')}", flush=True)
            print(f"Botões encontrados: {info.get('buttons')}", flush=True)
            extracted_text = " ".join(info.get("texts", []))
            print(f"Texto extraído: {extracted_text[:200]}...", flush=True)
            
            best_match = None
            best_score = 0
            for tgt in targets:
                scene_id = tgt["name"]
                prompt = tgt["prompt"].lower()
                keywords = [w for w in re.findall(r'\b[a-zA-Z]{4,}\b', prompt) if w not in {'from', 'film', 'with', 'denis', 'villeneuve', 'photoreal', 'cinematic', 'anamorphic', 'dense', 'sharp'}]
                score = sum(1 for kw in keywords if kw in extracted_text.lower())
                if score > best_score:
                    best_score = score
                    best_match = scene_id
                    
            print(f"Melhor match de cena: {best_match} (score: {best_score})", flush=True)
            
            if best_match and best_score >= 3 and best_match not in matched_takes:
                out_file = takes_dir / f"{best_match}.mp4"
                print(f"--> MATCH CONFIRMADO: {best_match}! Tentando download para {out_file}...", flush=True)
                
                try:
                    async with page.expect_download(timeout=15000) as download_info:
                        btn_clicked = await page.evaluate('''() => {
                            const seen = new Set();
                            function walk(root) {
                                if (!root || seen.has(root)) return false;
                                seen.add(root);
                                const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                                for (const el of els) {
                                    const t = (el.innerText || el.textContent || '').trim();
                                    const aria = el.getAttribute && el.getAttribute('aria-label');
                                    const testId = el.getAttribute && el.getAttribute('data-testid');
                                    if (/baixar|download/i.test(t) || /baixar|download/i.test(aria || '') || (testId && /download/i.test(testId))) {
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
                        print(f"Botão de download clicado: {btn_clicked}", flush=True)
                        
                    download = await download_info.value
                    await download.save_as(str(out_file))
                    print(f"✅ VÍDEO SALVO COM SUCESSO: {out_file} ({out_file.stat().st_size} bytes)", flush=True)
                    matched_takes[best_match] = str(out_file)
                except Exception as dl_err:
                    print(f"❌ Erro ao baixar vídeo {best_match}: {dl_err}", flush=True)
            
            await page.keyboard.press("Escape")
            await asyncio.sleep(1)
            
        print(f"\n==========================================")
        print(f"Total de takes baixados com sucesso: {len(matched_takes)}")
        for sc, pth in matched_takes.items():
            print(f" - {sc}: {pth}")
            
        await context.close()

if __name__ == '__main__':
    asyncio.run(harvest_by_masonry())