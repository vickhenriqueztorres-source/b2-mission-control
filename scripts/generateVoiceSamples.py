import asyncio
import os
import sys
import edge_tts

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

samples_dir = os.path.abspath("runs/OOL-EP01-PIX/voice_samples")
os.makedirs(samples_dir, exist_ok=True)

sample_text = (
    "Um gesto simples. Quase imperceptível. Você digita a chave, confirma a transferência de um real e pronto. "
    "Na tela, o comprovante surge em menos de dois segundos. "
    "Mas por trás desse toque existe uma máquina monumental que nunca desliga. Esse é o outro lado."
)

voices_to_test = [
    {
        "id": "antonio",
        "voice": "pt-BR-AntonioNeural",
        "name": "Antonio (pt-BR)",
        "style": "Masculino • Sóbrio, Grave, Investigativo",
        "rate": "+0%",
        "pitch": "+0Hz"
    },
    {
        "id": "francisca",
        "voice": "pt-BR-FranciscaNeural",
        "name": "Francisca (pt-BR)",
        "style": "Feminino • Jornalístico, Sério, Documental",
        "rate": "+0%",
        "pitch": "+0Hz"
    },
    {
        "id": "thalita",
        "voice": "pt-BR-ThalitaMultilingualNeural",
        "name": "Thalita (pt-BR)",
        "style": "Feminino • Profundo, Suspense, Engenharia",
        "rate": "+0%",
        "pitch": "+0Hz"
    },
    {
        "id": "duarte",
        "voice": "pt-PT-DuarteNeural",
        "name": "Duarte (pt-PT)",
        "style": "Masculino • Europeu, Formal, Histórico",
        "rate": "+0%",
        "pitch": "+0Hz"
    },
    {
        "id": "raquel",
        "voice": "pt-PT-RaquelNeural",
        "name": "Raquel (pt-PT)",
        "style": "Feminino • Europeu, Claro, Narrativo",
        "rate": "+0%",
        "pitch": "+0Hz"
    }
]

async def generate_all_samples():
    print("🎙️ Gerando amostras de áudio para audição...")
    results = []
    for v in voices_to_test:
        out_file = os.path.join(samples_dir, f"sample_{v['id']}.mp3")
        communicate = edge_tts.Communicate(sample_text, v["voice"], rate=v["rate"], pitch=v["pitch"])
        await communicate.save(out_file)
        print(f"  ✅ Amostra gerada: {out_file}")
        results.append({
            "id": v["id"],
            "name": v["name"],
            "style": v["style"],
            "voice": v["voice"],
            "file": out_file
        })
    print("\n🎉 Todas as amostras de áudio foram geradas com sucesso!")

if __name__ == "__main__":
    asyncio.run(generate_all_samples())
