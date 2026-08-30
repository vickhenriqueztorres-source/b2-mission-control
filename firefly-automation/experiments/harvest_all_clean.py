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
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

DOSSIE_SCENES = {"GAS_004", "GAS_005", "GAS_008", "GAS_013", "GAS_015", "GAS_016", "GAS_021", "GAS_026", "GAS_027"}
ALL_SCENES = [f"GAS_{i:03d}" for i in range(1, 31)]
AI_SCENES = [s for s in ALL_SCENES if s not in DOSSIE_SCENES]

async def harvest_all_clean():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    takes_dir = Path("../public/episodes/gasolina-adulterada/takes").resolve()
    takes_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Diretório de destino: {takes_dir}", flush=True)
    print(f"Total de cenas de IA ({len(AI_SCENES)}): {', '.join(AI_SCENES)}", flush=True)
    
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
        page.set_default_timeout(60000)
        
        print("Navegando para your-stuff...", flush=True)
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        
        # Espera carregar os primeiros cartões
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
            
        success_count = 0
        
        for idx in range(len(AI_SCENES)):
            scene_id = AI_SCENES[idx]
            dest_file = takes_dir / f"{scene_id}.mp4"
            
            if dest_file.exists() and dest_file.stat().st_size > 500_000:
                print(f"[{idx+1}/{len(AI_SCENES)}] {scene_id} já existe ({dest_file.stat().st_size} bytes). OK!", flush=True)
                success_count += 1
                continue
                
            card_dom_index = idx * 2
            print(f"\n==========================================", flush=True)
            print(f"[{idx+1}/{len(AI_SCENES)}] Processando {scene_id} a partir do Cartão #{idx+1} (DOM index {card_dom_index})...", flush=True)
            
            # Recarrega a página para limpar qualquer estado anterior
            await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
            
            # Aguarda cartões carregarem
            for _ in range(15):
                c = await page.evaluate('''() => {
                    const seen = new Set();
                    let count = 0;
                    function walk(root) {
                        if (!root || seen.has(root)) return;
                        seen.add(root);
                        const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                        for (const el of els) {
                            if (el.classList && (el.classList.contains('cdo-masonryCard-card') || el.classList.contains('gridItem--aMgkD'))) count++;
                            if (el.shadowRoot) walk(el.shadowRoot);
                        }
                    }
                    walk(document);
                    return count;
                }''')
                if c > card_dom_index:
                    break
                await asyncio.sleep(2)
                
            await asyncio.sleep(2)
            
            # Clica no cartão card_dom_index
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
            }''', card_dom_index)
            
            print(f"Cartão #{idx+1} clicado: {clicked}", flush=True)
            if not clicked:
                print(f"❌ Não foi possível clicar no cartão #{idx+1}", flush=True)
                continue
                
            await asyncio.sleep(2)
            
            # Localiza botão Baixar
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
                print(f"❌ Botão Baixar não encontrado para cartão #{idx+1}", flush=True)
                continue
                
            print(f"Clicando em Baixar ({baixar_rect['x']}, {baixar_rect['y']})...", flush=True)
            
            try:
                async with page.expect_download(timeout=60000) as dl_info:
                    await page.mouse.click(baixar_rect['x'], baixar_rect['y'])
                    
                download = await dl_info.value
                await download.save_as(str(dest_file))
                print(f"🎉 SUCESSO: {dest_file.name} ({dest_file.stat().st_size} bytes)", flush=True)
                success_count += 1
            except Exception as dl_err:
                print(f"❌ Erro baixando {scene_id}: {dl_err}", flush=True)
                
            # Fecha a seleção desmarcando o cartão
            await page.evaluate('''(targetIndex) => {
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
                if (targetIndex < cards.length) cards[targetIndex].click();
            }''', idx)
            await asyncio.sleep(1)
            
        print(f"\n==========================================", flush=True)
        print(f"RESULTADO FINAL: {success_count} de {len(AI_SCENES)} takes baixados!", flush=True)
        
        await context.close()

if __name__ == '__main__':
    asyncio.run(harvest_all_clean())