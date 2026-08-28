import os
import sys
import subprocess
import shutil
import time

# Set utf-8 encoding for standard output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

output_dir = r"runs/OOL-EP02-CABOS"
final_master = os.path.join(output_dir, "final_master.mp4")
chunks_list_file = os.path.join(output_dir, "chunks_list.txt")
narration_file = os.path.join(output_dir, "postproduction", "narration.mp3")

# ==============================================================================
# 🛡️ GATE PRÉ-RENDER DETERMINÍSTICO (FALHA RÁPIDA ANTES DE RENDERIZAR QUALQUER FRAME)
# ==============================================================================
print("=======================================================")
print("🛡️ EXECUTANDO GATE DETERMINÍSTICO PRÉ-RENDER (100% DOS ASSETS)...")
print("=======================================================")

cmd_verify = "npx ts-node scripts/verify-run.ts --runId OOL-EP02-CABOS --pre-render"
res = subprocess.call(cmd_verify, shell=True)
if res != 0:
    print(f"\n[FATAL_GATE_ERROR] O Gate Pré-Render reprovou a run. Renderização CANCELADA com exit code 1.\n")
    sys.exit(1)

print("\n✅ Gate Pré-Render APROVADO! Iniciando renderização segmentada segura...")

total_frames = 13598
chunk_size = 3400 # ~1.9 minutes per chunk

chunks = []
start = 0
chunk_idx = 1

while start < total_frames:
    end = min(start + chunk_size, total_frames - 1)
    chunk_file = os.path.join(output_dir, f"chunk_{chunk_idx}.mp4")
    chunks.append({
        "index": chunk_idx,
        "start": start,
        "end": end,
        "file": chunk_file
    })
    start = end + 1
    chunk_idx += 1

print(f"Divided {total_frames} frames into {len(chunks)} safe chunks for rendering:")
for c in chunks:
    print(f"  Chunk {c['index']}: frames {c['start']}-{c['end']} -> {c['file']}")

temp_dir = os.environ.get("TEMP", r"C:\Users\brend\AppData\Local\Temp")

def clean_temp():
    if not os.path.exists(temp_dir):
        return
    for item in os.listdir(temp_dir):
        if "remotion" in item.lower() or "hsl-" in item.lower():
            p = os.path.join(temp_dir, item)
            try:
                if os.path.isdir(p):
                    shutil.rmtree(p, ignore_errors=True)
                else:
                    os.remove(p)
            except Exception:
                pass

clean_temp()

# Render each chunk
for c in chunks:
    print(f"\n=======================================================")
    print(f"[RENDER] CHUNK {c['index']}/{len(chunks)}: frames {c['start']}-{c['end']}")
    print(f"=======================================================")
    
    cmd = (
        f'npx remotion render remotion/index.ts Episode02Cabos "{c["file"]}" '
        f'--frames={c["start"]}-{c["end"]} --concurrency=4 --image-format=jpeg --jpeg-quality=80'
    )
    t0 = time.time()
    subprocess.check_call(cmd, shell=True)
    dt = time.time() - t0
    print(f"[SUCCESS] Chunk {c['index']} finalizado em {dt:.1f}s!")
    
    clean_temp()
    
    total, used, free = shutil.disk_usage("C:\\")
    print(f"[DISK] Espaco livre em disco: {free / (1024**3):.2f} GB")

# Concatenate chunks with ffmpeg
print("\n=======================================================")
print("[CONCAT] CONCATENANDO CHUNKS NO MASTER FINAL...")
print("=======================================================")

with open(chunks_list_file, "w", encoding="utf-8") as f_out:
    for c in chunks:
        abs_p = os.path.abspath(c["file"])
        f_out.write(f"file '{abs_p}'\n")

cmd_concat = f'ffmpeg -y -f concat -safe 0 -i "{chunks_list_file}" -c copy "{final_master}"'
subprocess.check_call(cmd_concat, shell=True)

# ==============================================================================
# 🛡️ GATE PRÉ-MUX / PÓS-RENDER DE DURAÇÃO & INTEGRIDADE
# ==============================================================================
print("\n=======================================================")
print("🛡️ VALIDANDO SINCRONISMO MASTER FINAL (VÍDEO vs NARRAÇÃO)...")
print("=======================================================")

sz_mb = os.path.getsize(final_master) / (1024 * 1024)

cmd_probe_v = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{final_master}"'
cmd_probe_a = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{narration_file}"'

dur_v = float(subprocess.check_output(cmd_probe_v, shell=True, text=True).strip())
dur_a = float(subprocess.check_output(cmd_probe_a, shell=True, text=True).strip())
delta = abs(dur_v - dur_a)

print(f"Duração Vídeo Master:   {dur_v:.2f}s")
print(f"Duração Narração Áudio: {dur_a:.2f}s")
print(f"Divergência (Delta):    {delta:.2f}s (Tolerância Máxima: 1.50s)")

if delta > 1.50:
    print(f"\n[FATAL_DESYNC_ERROR] Descompasso de {delta:.2f}s excede a tolerância de 1.50s! Abortando.")
    sys.exit(1)

print(f"\n🎉 [DONE] MASTER FINAL CONCLUÍDO E VALIDADO COM SUCESSO!")
print(f"Arquivo: {final_master} ({sz_mb:.2f} MB)")
