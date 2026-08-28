import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import win32com.client

shortcut_path = r"C:\Users\brend\OneDrive\Desktop\Voicebox.lnk"
if os.path.exists(shortcut_path):
    shell = win32com.client.Dispatch("WScript.Shell")
    shortcut = shell.CreateShortCut(shortcut_path)
    print("🎯 Target Path:", shortcut.TargetPath)
    print("📂 Working Directory:", shortcut.WorkingDirectory)
    print("⚙️ Arguments:", shortcut.Arguments)
else:
    print("Atalho não encontrado.")
