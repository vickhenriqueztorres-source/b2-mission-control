import os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_scene_frame(scene_num, title, subtitle, telemetry, subject_type):
    width, height = 1920, 1080
    
    # Base background: Deep Carbon (#060709) with low-key gradient
    base = np.zeros((height, width, 3), dtype=np.uint8)
    base[:, :, 0] = 6
    base[:, :, 1] = 7
    base[:, :, 2] = 9
    
    # Add subtle vertical vignette and ground plane
    for y in range(height):
        factor = 1.0 - 0.4 * (abs(y - height/2) / (height/2))
        ground_glow = max(0, (y - 500) / 580) * 0.25
        base[y, :, 0] = int(min(255, 6 * factor + 15 * ground_glow))
        base[y, :, 1] = int(min(255, 7 * factor + 18 * ground_glow))
        base[y, :, 2] = int(min(255, 9 * factor + 26 * ground_glow))
        
    img = Image.fromarray(base)
    draw = ImageDraw.Draw(img, 'RGBA')
    
    # 1. Desenhar a Máquina / Estrutura / Grid em 35mm Chiaroscuro
    center_x, center_y = width // 2, height // 2
    
    # Grid de perspectiva no solo (Cerrado / Terreno)
    grid_color = (0, 240, 255, 25)
    for i in range(-12, 13):
        x_start = center_x + i * 160
        draw.line([(center_x + i * 20, 520), (x_start, 1080)], fill=grid_color, width=1)
    for y in [540, 580, 640, 720, 820, 940, 1070]:
        draw.line([(0, y), (1920, y)], fill=grid_color, width=1)
        
    # Elementos temáticos por cena
    if subject_type == 'drone_full':
        # Chassi do Octocóptero em Fibra de Carbono (#0D0E15 com highlights #FF5500 e #00F0FF)
        draw.ellipse([center_x - 180, center_y - 120, center_x + 180, center_y + 40], fill=(13, 14, 21, 230), outline=(255, 85, 0, 180), width=2)
        # 8 Braços de Carbono
        for angle in range(0, 360, 45):
            rad = math.radians(angle)
            bx = center_x + int(math.cos(rad) * 380)
            by = center_y - 40 + int(math.sin(rad) * 160)
            draw.line([(center_x, center_y - 40), (bx, by)], fill=(30, 34, 45, 240), width=8)
            draw.ellipse([bx - 60, by - 25, bx + 60, by + 25], outline=(0, 240, 255, 140), width=2)
            draw.ellipse([bx - 15, by - 15, bx + 15, by + 15], fill=(255, 85, 0, 220))
        # Cone de Radar / LiDAR
        draw.polygon([(center_x, center_y), (center_x - 350, 980), (center_x + 350, 980)], fill=(0, 240, 255, 18))
        draw.line([(center_x, center_y), (center_x - 350, 980)], fill=(0, 240, 255, 90), width=2)
        draw.line([(center_x, center_y), (center_x + 350, 980)], fill=(0, 240, 255, 90), width=2)
        
    elif subject_type == 'lidar_mesh':
        # Nuvem de Pontos 3D e Varredura Laser
        for i in range(160):
            px = random.randint(200, 1720)
            py = random.randint(480, 1020)
            c = (0, 240, 255, random.randint(80, 240)) if random.random() > 0.3 else (255, 85, 0, 200)
            draw.ellipse([px-3, py-3, px+3, py+3], fill=c)
        # Feixes Laser
        draw.line([(center_x, 200), (300, 900)], fill=(0, 240, 255, 120), width=2)
        draw.line([(center_x, 200), (1600, 900)], fill=(0, 240, 255, 120), width=2)
        draw.arc([center_x - 400, 200, center_x + 400, 900], 0, 180, fill=(255, 85, 0, 160), width=2)
        
    elif subject_type == 'fluid_downwash':
        # Vórtices e Linhas de Fluxo Aerodinâmico
        for r in range(120, 480, 45):
            draw.arc([center_x - r, center_y - 200, center_x + r, center_y + 300], 30, 150, fill=(0, 240, 255, 140), width=3)
            draw.arc([center_x - r, center_y - 180, center_x + r, center_y + 320], 30, 150, fill=(255, 85, 0, 110), width=2)
        # Vetores de Força
        draw.line([(center_x, 300), (center_x, 850)], fill=(255, 85, 0, 230), width=4)
        draw.polygon([(center_x, 870), (center_x - 15, 830), (center_x + 15, 830)], fill=(255, 85, 0, 230))
        
    elif subject_type == 'battery_power':
        # Pacote de Baterias Industriais 30.000 mAh
        draw.rectangle([center_x - 260, center_y - 140, center_x + 260, center_y + 140], fill=(13, 14, 21, 240), outline=(255, 85, 0, 220), width=3)
        for b in range(6):
            bx = center_x - 220 + b * 75
            draw.rectangle([bx, center_y - 100, bx + 60, center_y + 100], fill=(20, 24, 35, 255), outline=(0, 240, 255, 120), width=2)
            draw.rectangle([bx + 10, center_y + 20, bx + 50, center_y + 90], fill=(0, 240, 255, 180))
            
    elif subject_type == 'motor_macro':
        # Macro do Motor Brushless e Estator de Cobre
        draw.ellipse([center_x - 220, center_y - 220, center_x + 220, center_y + 220], fill=(13, 14, 21, 255), outline=(255, 85, 0, 240), width=4)
        for a in range(0, 360, 30):
            rad = math.radians(a)
            sx = center_x + int(math.cos(rad) * 140)
            sy = center_y + int(math.sin(rad) * 140)
            draw.rectangle([sx - 12, sy - 12, sx + 12, sy + 12], fill=(255, 85, 0, 230))
        draw.ellipse([center_x - 60, center_y - 60, center_x + 60, center_y + 60], fill=(30, 35, 50, 255), outline=(0, 240, 255, 220), width=3)
        
    elif subject_type == 'rtk_swarm':
        # Swarm de Drones e Estação Base RTK
        draw.line([(center_x, 900), (center_x, 500)], fill=(0, 240, 255, 200), width=3)
        draw.polygon([(center_x, 480), (center_x - 40, 560), (center_x + 40, 560)], outline=(0, 240, 255, 240), width=2)
        for r in range(80, 360, 60):
            draw.arc([center_x - r, 480 - r//2, center_x + r, 480 + r//2], 0, 360, fill=(0, 240, 255, 60), width=1)
        # 3 Drones em formação
        for dx, dy in [(-380, 260), (0, 180), (380, 240)]:
            draw.ellipse([center_x + dx - 40, center_y + dy - 20, center_x + dx + 40, center_y + dy + 20], fill=(255, 85, 0, 220))
            draw.line([(center_x, 480), (center_x + dx, center_y + dy)], fill=(255, 85, 0, 80), width=1)
            
    else:
        # Padrão Schematics & Optical Inspection
        draw.rectangle([center_x - 300, center_y - 180, center_x + 300, center_y + 180], fill=(13, 14, 21, 200), outline=(0, 240, 255, 140), width=2)
        draw.line([(center_x - 300, center_y), (center_x + 300, center_y)], fill=(255, 85, 0, 120), width=1)
        draw.line([(center_x, center_y - 180), (center_x, center_y + 180)], fill=(255, 85, 0, 120), width=1)
        draw.arc([center_x - 140, center_y - 140, center_x + 140, center_y + 140], 0, 360, fill=(0, 240, 255, 180), width=2)

    # 2. HUD & Telemetria em Vidro Fosco Chiaroscuro
    # Header Top Bar
    draw.rectangle([80, 60, 1840, 110], fill=(13, 14, 21, 190), outline=(255, 255, 255, 30), width=1)
    draw.line([80, 110, 1840, 110], fill=(0, 240, 255, 90), width=1)
    
    # Left Telemetry Box
    draw.rectangle([80, 140, 640, 320], fill=(13, 14, 21, 210), outline=(0, 240, 255, 80), width=1)
    draw.line([80, 140, 120, 140], fill=(255, 85, 0, 255), width=3)
    draw.line([80, 140, 80, 180], fill=(255, 85, 0, 255), width=3)
    
    # Right Status Dial
    draw.ellipse([1620, 140, 1820, 340], fill=(13, 14, 21, 210), outline=(255, 85, 0, 180), width=2)
    draw.arc([1630, 150, 1810, 330], -90, 180, fill=(0, 240, 255, 255), width=4)
    
    # Bottom Subtitle Bar
    draw.rectangle([80, 950, 1840, 1020], fill=(13, 14, 21, 230), outline=(255, 255, 255, 40), width=1)
    draw.line([80, 950, 360, 950], fill=(255, 85, 0, 255), width=3)
    
    # Textos renderizados com fontes do sistema
    try:
        font_lg = ImageFont.truetype("arialbd.ttf", 34)
        font_md = ImageFont.truetype("arialbd.ttf", 22)
        font_sm = ImageFont.truetype("courbd.ttf", 16)
        font_xs = ImageFont.truetype("cour.ttf", 13)
    except:
        font_lg = font_md = font_sm = font_xs = ImageFont.load_default()
        
    # Top Header Text
    draw.text((110, 72), f"O OUTRO LADO // DOSSIÊ 17: DRONES GIGANTES DO AGRO", fill=(244, 244, 240, 255), font=font_md)
    draw.text((1450, 75), f"CENA {scene_num:02d}/24 // 35MM ANAMORPHIC", fill=(0, 240, 255, 240), font=font_sm)
    
    # Telemetry Box Text
    draw.text((105, 155), f"ANÁLISE DE VOO // {subject_type.upper()}", fill=(0, 240, 255, 255), font=font_sm)
    draw.text((105, 188), title.upper(), fill=(244, 244, 240, 255), font=font_lg)
    draw.text((105, 245), f"TELEMETRIA: {telemetry}", fill=(255, 85, 0, 240), font=font_sm)
    draw.text((105, 275), f"STATUS: RTK FIX // COMPENSAÇÃO DE VENTO ATIVA", fill=(138, 141, 159, 255), font=font_xs)
    
    # Right Dial Text
    draw.text((1685, 225), f"8 ROTORES", fill=(244, 244, 240, 255), font=font_sm)
    draw.text((1670, 250), f"100 KG / 28 KM/H", fill=(0, 240, 255, 255), font=font_xs)
    
    # Bottom Text
    draw.text((110, 968), f"EVIDÊNCIA FORENSE // {subtitle}", fill=(244, 244, 240, 255), font=font_md)
    draw.text((1500, 972), f"LAT: -12.9714° // LON: -55.8421°", fill=(138, 141, 159, 255), font=font_sm)
    
    return img

def main():
    scenes_meta = [
        ("MEIA-NOITE NO CERRADO", "Decolagem no breu total a 2.5m do solo", "ALTITUDE: 2.5M // VEL: 28 KM/H", "drone_full"),
        ("100 KG NO AR", "Octocóptero entra na linha de plantio", "CARGA ÚTIL: 50L // PESO: 100 KG", "drone_full"),
        ("CHASSI DE FIBRA DE CARBONO", "Tubos aeroespaciais de 2.5m de envergadura", "TORÇÃO: < 0.2° // MASSA ESTRUTURAL", "schematic"),
        ("8 MOTORES BRUSHLESS", "Estatores de cobre e pás de 50 polegadas", "EMPUXO: 25 KG / ROTOR // 200 KG TOTAL", "motor_macro"),
        ("BATERIA INDUSTRIAL 30.000 MAH", "Estação de recarga rápida em gerador móvel", "TENSÃO: 51.8V // ENERGIA: 1554 WH", "battery_power"),
        ("BICOS ROTATIVOS 20.000 RPM", "Atomização centrífuga de microgotas", "ROTAÇÃO: 20.000 RPM // VAZÃO: 8 L/MIN", "schematic"),
        ("CÚPULA SENSORIAL", "Navegação autônoma sem piloto humano", "IMU 6-EIXOS // VISÃO COMPUTACIONAL", "schematic"),
        ("RADAR SAR 77 GHZ", "Ondas milimétricas varrendo o relevo a 200 Hz", "FREQUÊNCIA: 77 GHZ // TAXA: 200 HZ", "lidar_mesh"),
        ("LIDAR 360° INFRAVERMELHO", "Feixe laser de 905nm construindo nuvem 3D", "LASER 905NM // RESOLUÇÃO: 0.5 CM", "lidar_mesh"),
        ("PERFIL TOPOGRÁFICO", "Curvas de nível mapeadas em tempo real", "DESNÍVEL: 3.2M // RELEVO ADAPTATIVO", "lidar_mesh"),
        ("EVASÃO AUTÔNOMA", "Desvio de cabos de alta tensão em 20 ms", "TEMPO RESPOSTA: 20 MS // RAIO: 50M", "schematic"),
        ("A FÍSICA DO DOWNWASH", "Túnel de vento e vorticidade das 8 pás", "EMPUXO: T = 2*rho*A*vi^2", "fluid_downwash"),
        ("COLUNA DE AR DESCENDENTE", "Vento maciço empurrando o topo da soja", "VELOCIDADE DOWNWASH: 14 M/S", "fluid_downwash"),
        ("O EFEITO SOLO", "Colisão do fluxo abrindo o dossel vegetal", "PRESSÃO DINÂMICA: 180 PA", "fluid_downwash"),
        ("MICROGOTAS NO VERSO", "Fixação abaxial na folha da planta", "DIÂMETRO: 150 MÍCRONS // ADERÊNCIA", "schematic"),
        ("LIMITE DE DERIVA", "Tolerância crítica de altitude <= 0.5m", "DERIVA MÁX: 0.35M // VENTO 12 KM/H", "fluid_downwash"),
        ("FORMAÇÃO EM ENXAME", "Três octocópteros operando em sincronia", "ESCALONAMENTO: 15M // MALHA MESH", "rtk_swarm"),
        ("BASE GNSS RTK", "Correção diferencial UHF no solo", "PRECISÃO: 2.5 CM // LINK 915 MHZ", "rtk_swarm"),
        ("FAIXAS DE PASSADA", "Sobreposição milimétrica sem falhas", "LARGURA FAIXA: 8.0M // ERRO < 2 CM", "rtk_swarm"),
        ("REDE MESH INTER-DRONE", "Compensação dinâmica de vetor de vento", "LATÊNCIA: 4 MS // TOPOLOGIA DINÂMICA", "rtk_swarm"),
        ("DOCA AUTÔNOMA", "Retorno automático com 10% de bateria", "POUSO ÓPTICO // RESÍDUO 10%", "schematic"),
        ("COMPACTAÇÃO ZERO", "Substituição de maquinário de 30 toneladas", "IMPACTO SOLO: 0.04 KG/CM2", "schematic"),
        ("LAVOURA ALGORÍTMICA", "A escala monumental do agronegócio noturno", "COBERTURA: 40 HA/H // RENDIMENTO", "drone_full"),
        ("O OUTRO LADO", "A verdade do sistema revelada", "INVESTIGAR // REVELAR // COMPREENDER", "schematic")
    ]
    
    pub_img_dir = r"public/episodes/drones-agro/images"
    run_img_dir = r"runs/OOL-EP17-DRONES-AGRO/images"
    os.makedirs(pub_img_dir, exist_ok=True)
    os.makedirs(run_img_dir, exist_ok=True)
    
    print("🎨 Gerando 24 frames de alto contraste em 35mm Chiaroscuro...")
    for idx, (title, subtitle, telemetry, stype) in enumerate(scenes_meta, 1):
        s_id = f"AGRO_{idx:03d}"
        frame = create_scene_frame(idx, title, subtitle, telemetry, stype)
        
        p1 = os.path.join(pub_img_dir, f"{s_id}.png")
        p2 = os.path.join(run_img_dir, f"{s_id}.png")
        frame.save(p1, quality=95)
        frame.save(p2, quality=95)
        print(f"  ✅ {s_id}.png gerado ({stype}) -> {title}")
        
    print("\n🎉 24 FRAMES ÚNICOS E DE ALTO CONTRASTE GERADOS COM SUCESSO!")

if __name__ == "__main__":
    main()
