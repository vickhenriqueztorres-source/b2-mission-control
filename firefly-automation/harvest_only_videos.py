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

async def run_video_only_harvest():
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
        
        # Rola para carregar os elementos
        print("2. Rolando a grade para carregar os cartões...", flush=True)
        await page.mouse.move(800, 500)
        for _ in range(6):
            await page.mouse.wheel(0, 1000)
            await asyncio.sleep(2)
            
        await page.evaluate("window.scrollTo(0, 0)")
        await asyncio.sleep(2)
        
        # Extrai TODOS os cartões que contêm badge de vídeo (0:05)
        video_cards = await page.evaluate('''() => {
            const seen = new Set();
            const results = [];
            function walk(root) {
                if (!root || seen.has(root)) return;
                seen.add(root);
                const els = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
                for (const el of els) {
                    const text = (el.innerText || el.textContent || '').trim();
                    if (/0:05|0:04|0:06/i.test(text) && text.length < 10) {
                        // Encontra o container do card
                        let cur = el;
                        while (cur && cur !== document.body) {
                            if (cur.classList && (cur.classList.contains('cdo-masonryCard-card') || cur.classList.contains('gridItem--aMgkD'))) {
                                const r = cur.getBoundingClientRect();
                                results.push({
                                    left: r.x,
                                    top: r.y,
                                    width: r.width,
                                    height: r.height
                                });
                                break;
                            }
                            cur = cur.parentElement || (cur.getRootNode ? cur.getRootNode().host : null);
                        }
                    }
                    if (el.shadowRoot) walk(el.shadowRoot);
                }
            }
            walk(document);
            return results;
        }''')
        
        # Deduplica cartões por coordenadas
        unique_video_cards = []
        for vc in video_cards:
            if not any(abs(vc['left'] - u['left']) < 20 and abs(vc['top'] - u['top']) < 20 for u in unique_video_cards):
                unique_video_cards.append(vc)
                
        print(f"\n🎥 Total de vídeos '0:05' detectados na galeria: {len(unique_video_cards)}", flush=True)
        
        success_count = 0
        
        for idx in range(len(AI_SCENES)):
            scene_id = AI_SCENES[idx]
            dest_file = takes_dir / f"{scene_id}.mp4"
            
            if dest_file.exists() and dest_file.stat().st_size > 500_000:
                print(f"[{idx+1}/{len(AI_SCENES)}] {scene_id} já existe ({dest_file.stat().st_size} bytes). OK!", flush=True)
                success_count += 1
                continue
                
            if idx >= len(unique_video_cards):
                print(f"⚠️ Não há cartão de vídeo disponível para a cena {scene_id} (Índice {idx} >= {len(unique_video_cards)})", flush=True)
                continue
                
            card_info = unique_video_cards[idx]
            print(f"\n==========================================", flush=True)
            print(f"[{idx+1}/{len(AI_SCENES)}] Baixando {scene_id} do Vídeo #{idx+1} ({card_info['left']:.0f}, {card_info['top']:.0f})...", flush=True)
            
            # Clica no checkbox do cartão
            cb_x = card_info['left'] + 16
            cb_y = card_info['top'] + 16
            await page.mouse.click(cb_x, cb_y)
            await asyncio.sleep(2)
            
            # Clica no botão Baixar
            print(f"Clicando no botão Baixar em (1669, 1041)...", flush=True)
            try:
                async with page.expect_download(timeout=45000) as dl_info:
                    await page.mouse.click(1669, 1041)
                    
                download = await dl_info.value
                await download.save_as(str(dest_file))
                print(f"🎉 SUCESSO: {dest_file.name} ({dest_file.stat().st_size} bytes)", flush=True)
                success_count += 1
            except Exception as dl_err:
                print(f"❌ Erro baixando {scene_id}: {dl_err}", flush=True)
                
            # Desmarca clicando no checkbox
            await page.mouse.click(cb_x, cb_y)
            await asyncio.sleep(1)
            
        print(f"\n==========================================", flush=True)
        print(f"TOTAL DE TAKES DE VÍDEO CONCLUÍDOS: {success_count} de {len(AI_SCENES)}!", flush=True)
        await context.close()

if __name__ == '__main__':
    asyncio.run(run_video_only_harvest())