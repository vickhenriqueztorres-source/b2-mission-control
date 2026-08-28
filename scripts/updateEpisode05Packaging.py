import os
import sys
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RUN_DIR = os.path.join(BASE_DIR, "runs", "OOL-EP05-RADAR-ASFALTO")
POST_DIR = os.path.join(RUN_DIR, "postproduction")

timings_file = os.path.join(POST_DIR, "scene_timings.json")
with open(timings_file, "r", encoding="utf-8") as f:
    data = json.load(f)

scenes = data["scenes"]
chapters = []
seen = set()

for sc in scenes:
    ch_id = sc["chapterId"]
    if ch_id not in seen:
        seen.add(ch_id)
        sec = int(round(sc["startFrame"] / 30.0))
        m = sec // 60
        s = sec % 60
        chapters.append({
            "time": f"{m:02d}:{s:02d}",
            "seconds": sec,
            "title": sc["chapterTitle"]
        })

print("Capítulos Calibrados:")
for c in chapters:
    print(f"  {c['time']} - {c['title']}")

# Atualizar youtube-metadata.json
meta_file = os.path.join(POST_DIR, "youtube-metadata.json")
meta_data = {
    "title": "A Física Invisível Escondida no Asfalto que Calcula sua Velocidade no Escuro",
    "durationSeconds": data["totalDurationSeconds"],
    "totalFrames": data["totalDurationFrames"],
    "chapters": chapters,
    "tags": [
        "radar de velocidade", "como funciona o radar", "laco indutivo", "sensor piezoeletrico",
        "fisica no asfalto", "inmetro radar", "o outro lado", "engenharia invisivel"
    ]
}

with open(meta_file, "w", encoding="utf-8") as f:
    json.dump(meta_data, f, indent=2, ensure_ascii=False)

# Atualizar description.txt
desc_file = os.path.join(POST_DIR, "description.txt")
desc_lines = [
    "O que acontece depois que você passa por baixo de um radar na rodovia à noite?",
    "",
    "A física invisível escondida dentro do asfalto que calcula sua velocidade no escuro. Você acredita que é apenas uma câmera em um poste filmando seu carro, mas a verdade é que o cálculo já foi feito antes mesmo de você enxergar a haste.",
    "",
    "Neste episódio de O OUTRO LADO, investigamos a engenharia oculta sob os seus pneus: ranhuras de diamante no concreto, laços de indução magnética, sensores piezoelétricos de quartzo e o algoritmo que calcula sua velocidade em microssegundos.",
    "",
    "⏱️ CAPÍTULOS:"
]
for c in chapters:
    desc_lines.append(f"{c['time']} - {c['title']}")

desc_lines.extend([
    "",
    "INVESTIGAR. REVELAR. COMPREENDER.",
    "#OOutroLado #Engenharia #Fisica #Radar"
])

with open(desc_file, "w", encoding="utf-8") as f:
    f.write("\n".join(desc_lines))

print("✅ youtube-metadata.json e description.txt atualizados com sucesso!")
