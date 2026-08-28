import os
import sys
import json
import subprocess

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

EPISODE_ID = "OOL-EP04-GPS-TEMPO"
PROD_DIR = os.path.abspath(f"runs/{EPISODE_ID}")
POST_DIR = os.path.join(PROD_DIR, "postproduction")
THUMB_DIR = os.path.join(POST_DIR, "thumbnails")

os.makedirs(THUMB_DIR, exist_ok=True)

# 1. Gerar as 3 Thumbnails 4K (3840x2160)
variants = [
    {
        "name": "thumbnail_variant_a_mechanism.png",
        "src": "assets/submarine_curated/laser_silica_lab.jpg",
        "headline": "CÉSIO-133: 9.192.631.770/s"
    },
    {
        "name": "thumbnail_variant_b_consequence.png",
        "src": "assets/submarine_curated/satellite_space.jpg",
        "headline": "SE O TEMPO DERIVAR 0.000038s"
    },
    {
        "name": "thumbnail_variant_c_official.png",
        "src": "assets/submarine_curated/server_room_datacenter.jpg",
        "headline": "O GPS NÃO É UM MAPA"
    }
]

for v in variants:
    out_path = os.path.join(THUMB_DIR, v["name"])
    src_path = os.path.abspath(v["src"])
    cmd = (
        f'ffmpeg -y -hide_banner -loglevel error -i "{src_path}" '
        f'-vf "scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,eq=contrast=1.15:gamma=0.92:saturation=1.10" '
        f'-frames:v 1 "{out_path}"'
    )
    subprocess.check_call(cmd, shell=True)
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"✅ Thumbnail 4K gerada: {v['name']} ({size_mb:.2f} MB)")

# 2. Gerar description.txt
desc_content = """O Outro Lado do GPS: O Relógio Atômico que Evita o Colapso dos Bancos

Se a constelação inteira de 31 satélites de GPS fosse desligada agora, os carros continuariam andando pelas ruas com mapas salvos na memória. Porém, em menos de 10 minutos, o sistema bancário global travaria, o Pix pararia de funcionar e as redes 5G entrariam em colapso.

Neste documentário investigativo, revelamos a verdade física oculta: o GPS não é um sistema de localização. Ele é o relógio mestre da civilização moderna.

CAPÍTULOS:
00:00 - O Mito do Mapa & O Desligamento Invisível
01:20 - A Constelação Orbital & A Física do Tempo
02:45 - A Jornada do Nanossegundo: Wall Street & Faria Lima
04:10 - O Paradoxo de Einstein: O Erro de 38 Microssegundos
05:50 - A Sala de Controle & Redes Terrestres de Redundância
07:15 - A Infraestrutura Mais Frágil da Terra

TAGS:
#GPS #Relatividade #EconomiaDigital #Pix #Tecnologia #Documentario #OOutroLado
"""
desc_path = os.path.join(POST_DIR, "description.txt")
with open(desc_path, "w", encoding="utf-8") as f:
    f.write(desc_content)

# 3. Gerar youtube-metadata.json
metadata_content = {
    "episode_id": EPISODE_ID,
    "recommended_title": "O Outro Lado do GPS: A Verdadeira Arma Temporal dos Satélites",
    "recommended_thumbnail_variant": "C",
    "target_duration_minutes": 7.5,
    "titles": [
        {"variant_id": "A", "type": "Mecanismo", "title": "O Relógio Atômico de Nanossegundos que Ninguém Te Mostra"},
        {"variant_id": "B", "type": "Consequência", "title": "38 Microssegundos: O Erro de Einstein que Quebraria os Bancos"},
        {"variant_id": "C", "type": "Oficial", "title": "O Outro Lado do GPS: A Verdadeira Arma Temporal dos Satélites"}
    ],
    "tags": {
        "primary_entities": ["GPS", "Relógio Atômico", "Césio-133", "Relatividade Geral", "B3", "Pix", "5G"],
        "search_queries": ["como funciona o gps", "relógio atômico cesio", "relatividade einstein gps", "colapso bancario gps"],
        "all_flat_tags": ["GPS", "Relógio Atômico", "Césio-133", "Relatividade", "Einstein", "Bancos", "Pix", "5G", "O Outro Lado", "Documentário"]
    }
}
meta_path = os.path.join(POST_DIR, "youtube-metadata.json")
with open(meta_path, "w", encoding="utf-8") as f:
    json.dump(metadata_content, f, indent=2, ensure_ascii=False)

# 4. Gerar publication-summary.md
pub_summary_content = """# 📦 PACOTE OFICIAL DE PUBLICAÇÃO & SEO — O OUTRO LADO

**Episódio:** OOL-EP04-GPS-TEMPO — O Outro Lado do GPS
**Data de Geração:** 2026-08-27

---

## 🏆 RECOMENDAÇÃO PRINCIPAL PARA PUBLICAÇÃO
**Título Principal:** O Outro Lado do GPS: A Verdadeira Arma Temporal dos Satélites
**Thumbnail Recomendada:** Variante C (Investigação Oficial)

---

## 🧪 MATRIZ DE TESTE A/B/C (YOUTUBE STUDIO)
| Variante | Perfil Estratégico | Título Candidato | Headline da Capa |
|---|---|---|---|
| **A** | *Mecanismo* | O Relógio Atômico de Nanossegundos que Ninguém Te Mostra | `CÉSIO-133: 9.192.631.770/s` |
| **B** | *Consequência* | 38 Microssegundos: O Erro de Einstein que Quebraria os Bancos | `SE O TEMPO DERIVAR 0.000038s` |
| **C** | *Oficial* | O Outro Lado do GPS: A Verdadeira Arma Temporal dos Satélites | `O GPS NÃO É UM MAPA` |
"""
summary_path = os.path.join(POST_DIR, "publication-summary.md")
with open(summary_path, "w", encoding="utf-8") as f:
    f.write(pub_summary_content)

print("🎉 Pacote de Packaging e Thumbnails 4K concluído com sucesso!")
