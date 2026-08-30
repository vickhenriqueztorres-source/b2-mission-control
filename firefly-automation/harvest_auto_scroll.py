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

async def harvest_scene(page, takes_dir, target_index, scene_id):
    dest_file = takes_dir / f"{scene_id}.mp4"
    if dest_file.exists() and dest_file.stat().st_size > 500_000:
        print(f"[{target_index+1}/{len(AI_SCENES)}] {scene_id} já existe ({dest_file.stat().st_size} bytes). Pulando...", flush=True)
        return True
        
    print(f"\n==========================================", flush=True)
    print(f"[{target_index+1}/{len(AI_SCENES)}] Carregando página para baixar {scene_id} (Cartão #{target_index+1})...", flush=True)
    
    await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
    
    # Aguarda os cartões carregarem
    loaded = False
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
        if c > 0:
            loaded = True
            break
        await asyncio.sleep(2)
        
    if not loaded:
        print("❌ Cartões não carregaram após 30s.", flush=True)
        return False
        
    await asyncio.sleep(2)
    
    # Rola até o cartão e clica nele
    clicked = await page.evaluate('''(targetIndex) => {
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
            cards[targetIndex].scrollIntoView({behavior: 'instant', block: 'center'});
            cards[targetIndex].click();
            return true;
        }
        return false;
    }''', target_index)
    
    print(f"Cartão #{target_index+1} clicado: {clicked}", flush=True)
    if not clicked:
        return False
        
    await asyncio.sleep(2)
    
    # Encontra o botão Baixar na barra inferior
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
        print(f"❌ Botão Baixar não visível para cartão #{target_index+1}", flush=True)
        return False
        
    print(f"Disparando download para {dest_file.name} em ({baixar_rect['x']}, {baixar_rect['y']})...", flush=True)
    try:
        async with page.expect_download(timeout=60000) as dl_info:
            await page.mouse.click(baixar_rect['x'], baixar_rect['y'])
            
        download = await dl_info.value
        await download.save_as(str(dest_file))
        print(f"🎉 [SUCESSO] {dest_file.name} salvo: {dest_file.stat().st_size} bytes", flush=True)
        return True
    except Exception as err:
        print(f"❌ Erro ao baixar {scene_id}: {err}", flush=True)
        return False

async def main():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    takes_dir = Path("../public/episodes/gasolina-adulterada/takes").resolve()
    takes_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Destino dos takes: {takes_dir}", flush=True)
    print(f"Total de cenas de IA a verificar/baixar: {len(AI_SCENES)}", flush=True)
    
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
        
        success_count = 0
        for i, scene_id in enumerate(AI_SCENES):
            ok = await harvest_scene(page, takes_dir, i, scene_id)
            if ok:
                success_count += 1
            await asyncio.sleep(2)
            
        print(f"\n==========================================", flush=True)
        print(f"TOTAL DE TAKES CONCLUÍDOS: {success_count} de {len(AI_SCENES)}!", flush=True)
        await context.close()

if __name__ == '__main__':
    asyncio.run(main())