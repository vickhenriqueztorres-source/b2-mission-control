import os
import sys
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

src_base = r"C:\Users\brend\OneDrive\Desktop\PROJETO 30K ATE 27\AGENTES - ANTIGRAVITY - HSL"
dest_base = os.path.abspath(".")

print("══════════════════════════════════════════════════════════════════")
print("🎧 IMPORTANDO SUÍTE COMPLETA DE SOUND DESIGN & RAG AUDIO AGENT")
print("══════════════════════════════════════════════════════════════════\n")

directories_to_copy = [
    ("sound-agent", "sound-agent"),
    ("sfx-agent", "sfx-agent"),
    ("music-agent", "music-agent"),
    ("rag", "rag"),
    ("RAG - AGENTE - SFX", "RAG - AGENTE - SFX"),
    (os.path.join("public", "audio"), os.path.join("public", "audio")),
    ("examples", "examples"),
]

for src_rel, dest_rel in directories_to_copy:
    src_dir = os.path.join(src_base, src_rel)
    dest_dir = os.path.join(dest_base, dest_rel)
    
    if os.path.exists(src_dir):
        os.makedirs(dest_dir, exist_ok=True)
        print(f"📦 Copiando {src_rel} ➔ {dest_rel}...")
        # Copia recursivamente ignorando conflitos
        for root, dirs, files in os.walk(src_dir):
            rel_root = os.path.relpath(root, src_dir)
            target_root = os.path.join(dest_dir, rel_root) if rel_root != "." else dest_dir
            os.makedirs(target_root, exist_ok=True)
            for f in files:
                src_file = os.path.join(root, f)
                dest_file = os.path.join(target_root, f)
                shutil.copy2(src_file, dest_file)
        print(f"  ✅ Concluído: {dest_rel}")
    else:
        print(f"  ⚠️ Origem não encontrada: {src_dir}")

# Copia os testes específicos
tests_src = os.path.join(src_base, "tests")
tests_dest = os.path.join(dest_base, "tests")
os.makedirs(tests_dest, exist_ok=True)

test_files = [
    "sound_agent.test.ts",
    "sfx_agent.test.ts",
    "music_agent.test.ts",
]

for tf in test_files:
    tf_src = os.path.join(tests_src, tf)
    tf_dest = os.path.join(tests_dest, tf)
    if os.path.exists(tf_src):
        shutil.copy2(tf_src, tf_dest)
        print(f"  ✅ Teste copiado: tests/{tf}")

print("\n🎉 IMPORTAÇÃO CONCLUÍDA COM SUCESSO!")
