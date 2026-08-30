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

async def run_perfect_harvest():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    takes_dir = Path("../public/episodes/gasolina-adulterada/takes").resolve()
    takes_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Diretório de destino dos takes: {takes_dir}", flush=True)
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
        
        print("1. Abrindo sua galeria (Histórico de geração)...", flush=True)
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(8)
        
        # Move mouse para o centro da grade e rola 4 vezes para carregar todos os cartões
        print("2. Rolando a grade para carregar os vídeos...", flush=True)
        await page.mouse.move(800, 500)
        for i in range(4):
            await page.mouse.wheel(0, 1000)
            await asyncio.sleep(2)
            
        await page.evaluate("window.scrollTo(0, 0)")
        await asyncio.sleep(2)
        
        success_count = 0
        
        for idx in range(len(AI_SCENES)):
            scene_id = AI_SCENES[idx]
            dest_file = takes_dir / f"{scene_id}.mp4"
            
            if dest_file.exists() and dest_file.stat().st_size > 500_000:
                print(f"[{idx+1}/{len(AI_SCENES)}] {scene_id} já existe ({dest_file.stat().st_size} bytes). OK!", flush=True)
                success_count += 1
                continue
                
            print(f"\n==========================================", flush=True)
            print(f"[{idx+1}/{len(AI_SCENES)}] Baixando {scene_id} do Cartão #{idx+1}...", flush=True)
            
            # Obtém a posição e checkbox do cartão idx
            card_info = await page.evaluate('''(targetIndex) => {
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
                    const c = cards[targetIndex];
                    c.scrollIntoView({behavior: 'instant', block: 'center'});
                    const r = c.getBoundingClientRect();
                    return {x: r.x + r.width / 2, y: r.y + r.height / 2, left: r.x, top: r.y};
                }
                return null;
            }''', idx)
            
            if not card_info:
                print(f"❌ Não foi possível localizar o cartão #{idx+1}", flush=True)
                continue
                
            await asyncio.sleep(0.5)
            
            # Clica no checkbox do cartão (canto superior esquerdo)
            cb_x = card_info['left'] + 16
            cb_y = card_info['top'] + 16
            print(f"Marcando checkbox em ({cb_x:.0f}, {cb_y:.0f})...", flush=True)
            await page.mouse.click(cb_x, cb_y)
            await asyncio.sleep(2)
            
            # Clica em Baixar na barra inferior
            print(f"Clicando no botão Baixar em (1669, 1041)...", flush=True)
            try:
                async with page.expect_download(timeout=60000) as dl_info:
                    await page.mouse.click(1669, 1041)
                    
                download = await dl_info.value
                await download.save_as(str(dest_file))
                print(f"🎉 SUCESSO: {dest_file.name} ({dest_file.stat().st_size} bytes)", flush=True)
                success_count += 1
            except Exception as dl_err:
                print(f"❌ Erro baixando {scene_id}: {dl_err}", flush=True)
                
            # Desmarca clicando no checkbox novamente
            await page.mouse.click(cb_x, cb_y)
            await asyncio.sleep(1)
            
        print(f"\n==========================================", flush=True)
        print(f"TOTAL DE TAKES CONCLUÍDOS: {success_count} de {len(AI_SCENES)}!", flush=True)
        await context.close()

if __name__ == '__main__':
    asyncio.run(run_perfect_harvest())