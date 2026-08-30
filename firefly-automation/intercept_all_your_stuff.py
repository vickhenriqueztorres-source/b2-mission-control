import asyncio
import json
import os
from pathlib import Path
from patchright.async_api import async_playwright
from firefly_bot.chrome_profile import close_existing_profile_chrome

async def intercept_all_your_stuff():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    all_responses = []
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
            ],
            viewport={"width": 1920, "height": 1080}
        )
        page = context.pages[0] if context.pages else await context.new_page()
        
        async def on_response(response):
            url = response.url
            ct = response.headers.get("content-type", "")
            if "json" in ct or "text" in ct or "graphql" in url or "adobe" in url:
                try:
                    text = await response.text()
                    if any(k in text.lower() for k in ["prompt", "gasolina", "combustivel", "video", "bico", "tanque", "pulse", "generation"]):
                        all_responses.append({
                            "url": url,
                            "status": response.status,
                            "len": len(text),
                            "preview": text[:500]
                        })
                        print(f"[FOUND PROMPT/MEDIA] {url[:80]} (len: {len(text)})")
                except Exception:
                    pass
                    
        page.on("response", on_response)
        
        print("Navegando para your-stuff...")
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        
        # Rola a p?gina para baixo para carregar os cart?es
        for _ in range(5):
            await page.mouse.wheel(0, 500)
            await asyncio.sleep(3)
            
        Path("screenshots/all_your_stuff_hits.json").write_text(json.dumps(all_responses, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Total de hits capturados com prompts/m?dias: {len(all_responses)}")
        
        await context.close()

if __name__ == '__main__':
    asyncio.run(intercept_all_your_stuff())
