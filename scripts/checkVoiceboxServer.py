import os
import sys
import subprocess

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

user_home = os.path.expanduser("~")
print("=== BUSCA POR ARQUIVOS DE DADOS / VOZES DO VOICEBOX ===")

possible_data_dirs = [
    os.path.join(user_home, ".voicebox"),
    os.path.join(user_home, "Voicebox"),
    os.path.join(os.environ.get("APPDATA", ""), "voicebox"),
    os.path.join(os.environ.get("LOCALAPPDATA", ""), "voicebox-server"),
    os.path.join(os.environ.get("LOCALAPPDATA", ""), "voicebox-mcp"),
    os.path.join(user_home, "AppData", "Roaming", "voicebox")
]

for d in possible_data_dirs:
    if os.path.exists(d):
        print(f"📂 Encontrado diretório de dados: {d}")
        for item in os.listdir(d):
            print(f"   └── {item}")

# Verifica se o voicebox está rodando ou se tem help
voicebox_server_exe = r"C:\Users\brend\AppData\Local\Voicebox\voicebox-server.exe"
voicebox_mcp_exe = r"C:\Users\brend\AppData\Local\Voicebox\voicebox-mcp.exe"

print("\n=== AJUDA DO VOICEBOX SERVER ===")
try:
    res = subprocess.run([voicebox_server_exe, "--help"], capture_output=True, text=True, timeout=5)
    print("STDOUT:", res.stdout)
    print("STDERR:", res.stderr)
except Exception as e:
    print(f"Erro ao executar --help: {e}")

try:
    res = subprocess.run([voicebox_mcp_exe, "--help"], capture_output=True, text=True, timeout=5)
    print("\nMCP STDOUT:", res.stdout)
except Exception as e:
    pass
