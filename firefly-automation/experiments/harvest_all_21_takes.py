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

# Lista das 21 cenas de IA em ordem de produção
DOSSIE_SCENES = {"GAS_004", "GAS_005", "GAS_008", "GAS_013", "GAS_015", "GAS_016", "GAS_021", "GAS_026", "GAS_027"}
ALL_SCENES = [f"GAS_{i:03d}" for i in range(1, 31)]
AI_SCENES = [s for s in ALL_SCENES if s not in DOSSIE_SCENES]

async def harvest_all_takes():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    takes_dir = Path("../public/episodes/gasolina-adulterada/takes").resolve()
    takes_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Diretório de destino: {takes_dir}", flush=True)
    print(f"Cenas de IA a colher ({len(AI_SCENES)}): {', '.join(AI_SCENES)}", flush=True)
    
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
        
        print("Navegando para your-stuff (Histórico de geração)...", flush=True)
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(10)
        
        # Rola suavemente para baixo para carregar os primeiros 25 cartões no layout
        await page.mouse.wheel(0, 800)
        await asyncio.sleep(2)
        await page.evaluate("window.scrollTo(0, 0)")
        await asyncio.sleep(2)
        
        success_count = 0
        
        for idx in range(len(AI_SCENES)):
            scene_id = AI_SCENES[idx]
            dest_file = takes_dir / f"{scene_id}.mp4"
            
            # Se o arquivo já existe e é válido (>500KB), pula
            if dest_file.exists() and dest_file.stat().st_size > 500_000:
                print(f"[{idx+1}/{len(AI_SCENES)}] {scene_id} já existe ({dest_file.stat().st_size} bytes). OK!", flush=True)
                success_count += 1
                continue
                
            print(f"\n==========================================", flush=True)
            print(f"[{idx+1}/{len(AI_SCENES)}] Baixando Take para {scene_id} a partir do Cartão #{idx+1}...", flush=True)
            
            # Obtém a posição atual do cartão idx
            card_pos = await page.evaluate('''(targetIndex) => {
                const seen = new Set();
                const cards = [];
                function walk(root) {
                    if (!root || seen.has(root)) return;
                    seen.add(root);
                    const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                    for (const el of els) {
                        if (el.classList && el.classList.contains('cdo-masonryCard-card')) {
                            cards.push(el);
                        }
                        if (el.shadowRoot) walk(el.shadowRoot);
                    }
                }
                walk(document);
                if (targetIndex < cards.length) {
                    const el = cards[targetIndex];
                    el.scrollIntoView({behavior: 'instant', block: 'center'});
                    const r = el.getBoundingClientRect();
                    return {x: r.x + r.width / 2, y: r.y + r.height / 2};
                }
                return null;
            }''', idx)
            
            if not card_pos:
                print(f"❌ Não encontrou cartão #{idx+1}", flush=True)
                continue
                
            await asyncio.sleep(0.5)
            # Clica no cartão para selecionar
            await page.mouse.click(card_pos['x'], card_pos['y'])
            await asyncio.sleep(2)
            
            # Localiza coordenadas do botão Baixar da barra azul
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
                await page.keyboard.press("Escape")
                continue
                
            try:
                async with page.expect_download(timeout=45000) as dl_info:
                    await page.mouse.click(baixar_rect['x'], baixar_rect['y'])
                    
                download = await dl_info.value
                await download.save_as(str(dest_file))
                print(f"✅ [{scene_id}] SALVO COM SUCESSO: {dest_file.name} ({dest_file.stat().st_size} bytes)", flush=True)
                success_count += 1
            except Exception as dl_err:
                print(f"❌ Erro baixando {scene_id}: {dl_err}", flush=True)
                
            # Desmarca clicando no cartão novamente
            await page.mouse.click(card_pos['x'], card_pos['y'])
            await asyncio.sleep(1)
            
        print(f"\n==========================================", flush=True)
        print(f"RESULTADO FINAL: {success_count} de {len(AI_SCENES)} takes de vídeo colhidos!", flush=True)
        
        await context.close()

if __name__ == '__main__':
    asyncio.run(harvest_all_takes())