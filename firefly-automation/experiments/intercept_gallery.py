import asyncio
import json
import os
from pathlib import Path
from patchright.async_api import async_playwright
from firefly_bot.chrome_profile import close_existing_profile_chrome

async def intercept_your_stuff():
    profile_dir = Path("data/chrome_profile").resolve()
    close_existing_profile_chrome(profile_dir)
    
    intercepted_assets = []
    
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
            if any(k in url.lower() for k in ["asset", "generation", "history", "colligo", "your-stuff", "project", "graphql", "storage", "media", "query"]):
                try:
                    if "application/json" in response.headers.get("content-type", ""):
                        body = await response.json()
                        intercepted_assets.append({"url": url, "data": body})
                        print(f"[API HIT] {url[:80]} (keys: {list(body.keys()) if isinstance(body, dict) else len(body)})")
                except Exception:
                    pass
                    
        page.on("response", on_response)
        
        print("Navegando para your-stuff com intercepta??o ativa...")
        await page.goto("https://firefly.adobe.com/your-stuff", wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(15)
        
        Path("screenshots/intercepted_data.json").write_text(json.dumps(intercepted_assets, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Total de respostas JSON interceptadas: {len(intercepted_assets)}")
        
        await context.close()

if __name__ == '__main__':
    asyncio.run(intercept_your_stuff())
