import asyncio
import json
import sys
import edge_tts

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

async def main():
    voices = await edge_tts.list_voices()
    pt_voices = [v for v in voices if "pt-BR" in v["Locale"] or "pt-PT" in v["Locale"]]
    print(f"Total de vozes em Português encontradas: {len(pt_voices)}\n")
    
    documentary_presets = []
    for v in pt_voices:
        print(f"🎙️ ID: {v['ShortName']:<25} | Gênero: {v['Gender']:<6} | {v.get('FriendlyName', '')}")
        
    print("\n=======================================================")
    print("🌟 VOZES RECOMENDADAS PARA DOCUMENTÁRIO INVESTIGATIVO:")
    print("=======================================================")
    print("1. pt-BR-AntonioNeural  (Masculina - Tom Sóbrio, Firme, Gravado, Investigativo)")
    print("2. pt-BR-FranciscaNeural (Feminina - Tom Narrativo, Sério, Documental)")
    print("3. pt-BR-ThalitaNeural  (Feminina - Tom Profundo, Jornalístico)")
    print("4. pt-BR-ManuelaNeural  (Feminina - Dinâmica)")
    print("5. pt-BR-NicolauNeural  (Masculina - Sério, Profundo)")
    print("6. pt-BR-ValerioNeural  (Masculina - Narrador de História)")

if __name__ == "__main__":
    asyncio.run(main())
