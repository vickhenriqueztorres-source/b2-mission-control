import os
import sys
import subprocess
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

EPISODE_ID = "OOL-EP05-RADAR-ASFALTO"
PROD_DIR = os.path.abspath(f"runs/{EPISODE_ID}")
THUMB_DIR = os.path.join(PROD_DIR, "postproduction", "thumbnails")
ARTIFACT_DIR = os.path.abspath(r"C:\Users\brend\.gemini\antigravity\brain\458559fc-b6a0-43b0-900e-40923ec3998e")

os.makedirs(THUMB_DIR, exist_ok=True)

# Definição das 3 Thumbnails 4K oficiais para o Episódio 05
thumbnails = [
    {
        "filename": "thumbnail_variant_a_mechanism.png",
        "bg_src": os.path.abspath("assets/submarine_curated/laser_silica_lab.jpg") if os.path.exists("assets/submarine_curated/laser_silica_lab.jpg") else "",
        "line1": "O SEGREDO",
        "line2": "DENTRO DO",
        "line3_accent": "ASFALTO",
        "subheadline": "A FÍSICA INVISÍVEL QUE CALCULA SUA VELOCIDADE NO ESCURO.",
        "coords": "-23.5505° S, -46.6333° W // SP",
        "reveal": "92%",
        "delta": "ΔT = 60.000 µs"
    },
    {
        "filename": "thumbnail_variant_b_consequence.png",
        "bg_src": os.path.abspath("assets/submarine_curated/satellite_space.jpg") if os.path.exists("assets/submarine_curated/satellite_space.jpg") else "",
        "line1": "NÃO É A",
        "line2": "CÂMERA NO",
        "line3_accent": "POSTE.",
        "subheadline": "O QUE ESTÁ ESCONDIDO DEBAIXO DAS SUAS RODAS.",
        "coords": "RODOVIA DOS IMIGRANTES // KM 42",
        "reveal": "87%",
        "delta": "MARGEM ±7 KM/H"
    },
    {
        "filename": "thumbnail_variant_c_final_handoff.png",
        "bg_src": os.path.abspath("assets/submarine_curated/server_room_datacenter.jpg") if os.path.exists("assets/submarine_curated/server_room_datacenter.jpg") else "",
        "line1": "ARMADILHA",
        "line2": "MAGNÉTICA",
        "line3_accent": "3 METROS",
        "subheadline": "COMO O LAÇO INDUTIVO MEDE O CARRO EM MILISSEGUNDOS.",
        "coords": "INMETRO // PORTARIA 158/2022",
        "reveal": "95%",
        "delta": "1/10.000s FLASH"
    }
]

print("══════════════════════════════════════════════════════════════════")
print("🎨 GERANDO THUMBNAILS 4K // EPISÓDIO 05: RADAR NO ASFALTO")
print("══════════════════════════════════════════════════════════════════\n")

for t in thumbnails:
    out_png = os.path.join(THUMB_DIR, t["filename"])
    svg_temp = os.path.join(THUMB_DIR, f"temp_{t['filename']}.svg")

    # Gera o overlay SVG 4K (3840x2160)
    svg_content = f"""<svg width="3840" height="2160" viewBox="0 0 3840 2160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradiente Chiaroscuro Denis Villeneuve -->
        <linearGradient id="vignette" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#060709" stop-opacity="0.97"/>
          <stop offset="40%" stop-color="#060709" stop-opacity="0.88"/>
          <stop offset="70%" stop-color="#060709" stop-opacity="0.40"/>
          <stop offset="100%" stop-color="#060709" stop-opacity="0.10"/>
        </linearGradient>

        <!-- Brilho Laranja Volumétrico -->
        <radialGradient id="orangeGlow" cx="65%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FF5500" stop-opacity="0.38"/>
          <stop offset="50%" stop-color="#00F0FF" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#060709" stop-opacity="0.0"/>
        </radialGradient>
      </defs>

      <!-- Fundo de Gradiente e Glow -->
      <rect width="3840" height="2160" fill="#060709"/>
      <rect width="3840" height="2160" fill="url(#vignette)"/>
      <rect width="3840" height="2160" fill="url(#orangeGlow)"/>

      <!-- Linha de Corte a Laser Laranja (#FF5500) -->
      <line x1="2200" y1="0" x2="2000" y2="2160" stroke="#FF5500" stroke-width="12" stroke-opacity="0.9"/>
      <line x1="2200" y1="0" x2="2000" y2="2160" stroke="#FFFFFF" stroke-width="3" stroke-opacity="0.7"/>

      <!-- Cantoneiras de Enquadramento Cinematográfico [ ] -->
      <path d="M 120 180 L 120 120 L 180 120" stroke="#F4F4F0" stroke-width="6" fill="none" stroke-opacity="0.4"/>
      <path d="M 3720 180 L 3720 120 L 3660 120" stroke="#F4F4F0" stroke-width="6" fill="none" stroke-opacity="0.4"/>
      <path d="M 120 1980 L 120 2040 L 180 2040" stroke="#F4F4F0" stroke-width="6" fill="none" stroke-opacity="0.4"/>
      <path d="M 3720 1980 L 3720 2040 L 3660 2040" stroke="#F4F4F0" stroke-width="6" fill="none" stroke-opacity="0.4"/>

      <!-- Caixa de Texto da Headline (Industrial X-Ray) -->
      <path d="M 220 380 L 220 340 L 260 340" stroke="#F4F4F0" stroke-width="4" fill="none" stroke-opacity="0.6"/>
      
      <!-- Headline em 3 Linhas -->
      <text x="220" y="620" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="280" fill="#F4F4F0" letter-spacing="4">{t['line1']}</text>
      <text x="220" y="890" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="280" fill="#F4F4F0" letter-spacing="4">{t['line2']}</text>
      <text x="220" y="1160" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="280" fill="#FF5500" letter-spacing="4">{t['line3_accent']}</text>

      <path d="M 220 1260 L 220 1300 L 260 1300" stroke="#F4F4F0" stroke-width="4" fill="none" stroke-opacity="0.6"/>

      <!-- Subheadline em Ciano Laser com Barra Indicadora -->
      <rect x="220" y="1360" width="12" height="54" fill="#00F0FF"/>
      <text x="256" y="1404" font-family="Consolas, monospace" font-weight="bold" font-size="48" fill="#00F0FF" letter-spacing="3">{t['subheadline']}</text>

      <!-- Selo Circular de Auditoria Técnica (Canto Inferior Direito) -->
      <g transform="translate(3200, 1600)">
        <circle r="260" fill="#060709" fill-opacity="0.85" stroke="#00F0FF" stroke-width="4" stroke-opacity="0.8"/>
        <circle r="240" fill="none" stroke="#00F0FF" stroke-width="2" stroke-dasharray="12,12" stroke-opacity="0.5"/>
        <text y="-90" text-anchor="middle" font-family="Consolas, monospace" font-size="28" font-weight="bold" fill="#00F0FF" letter-spacing="4">ANÁLISE FÍSICA</text>
        <text y="-10" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="52" font-weight="900" fill="#F4F4F0" letter-spacing="2">O OUTRO LADO</text>
        <text y="60" text-anchor="middle" font-family="Consolas, monospace" font-size="22" font-weight="bold" fill="#F4F4F0" fill-opacity="0.7" letter-spacing="2">AUDITORIA METROLÓGICA</text>
        <text y="110" text-anchor="middle" font-family="Consolas, monospace" font-size="26" font-weight="bold" fill="#FF5500" letter-spacing="3">INMETRO 158/22</text>
      </g>

      <!-- Card de Telemetria Lateral -->
      <rect x="220" y="1520" width="580" height="220" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(0, 240, 255, 0.35)" stroke-width="3"/>
      <text x="260" y="1580" font-family="Consolas, monospace" font-size="28" font-weight="bold" fill="#8A8D9F" letter-spacing="2">TELEMETRIA DE PISTA</text>
      <text x="260" y="1670" font-family="Arial Black, sans-serif" font-size="64" font-weight="900" fill="#FF5500">{t['delta']}</text>

      <!-- Barra Inferior de Telemetria e Coordenadas -->
      <line x1="220" y1="2000" x2="3620" y2="2000" stroke="#F4F4F0" stroke-width="2" stroke-opacity="0.2"/>
      
      <!-- Lockup Logo no Rodapé -->
      <circle cx="240" cy="2045" r="14" fill="none" stroke="#FF5500" stroke-width="5"/>
      <text x="270" y="2054" font-family="Arial Black, sans-serif" font-size="28" font-weight="900" fill="#F4F4F0" letter-spacing="3"><tspan fill="#FF5500">O</tspan> OUTRO LADO</text>

      <!-- Coordenadas Geográficas -->
      <text x="1920" y="2054" text-anchor="middle" font-family="Consolas, monospace" font-size="28" font-weight="bold" fill="#F4F4F0" fill-opacity="0.6" letter-spacing="2">RODOVIA // <tspan fill="#00F0FF">{t['coords']}</tspan></text>

      <!-- Indicador de Revelação -->
      <circle cx="3380" cy="2045" r="10" fill="#FF5500"/>
      <text x="3410" y="2054" font-family="Consolas, monospace" font-size="28" font-weight="bold" fill="#F4F4F0" letter-spacing="2">REVELAÇÃO: <tspan fill="#FF5500">{t['reveal']}</tspan></text>
    </svg>"""

    with open(svg_temp, "w", encoding="utf-8") as f:
        f.write(svg_content)

    # Renderiza o SVG diretamente para PNG 4K via FFmpeg
    cmd = f'ffmpeg -y -hide_banner -loglevel error -f lavfi -i color=c=#060709:s=3840x2160 -i "{svg_temp}" -filter_complex "[0:v][1:v]overlay=0:0" -frames:v 1 "{out_png}"'
    subprocess.check_call(cmd, shell=True)
    os.remove(svg_temp)

    # Copia para o artifact dir
    shutil.copy2(out_png, os.path.join(ARTIFACT_DIR, t["filename"]))
    size_mb = os.path.getsize(out_png) / (1024 * 1024)
    print(f"✅ Thumbnail 4K gerada: {t['filename']} ({size_mb:.2f} MB)")

# Sincroniza também thumbnail_variant_c_official.png
off_src = os.path.join(THUMB_DIR, "thumbnail_variant_c_final_handoff.png")
off_dst = os.path.join(THUMB_DIR, "thumbnail_variant_c_official.png")
shutil.copy2(off_src, off_dst)
shutil.copy2(off_src, os.path.join(ARTIFACT_DIR, "thumbnail_variant_c_official.png"))

print("\n🎉 Todas as 3 Thumbnails 4K do Episódio 05 foram renderizadas com perfeição!")
