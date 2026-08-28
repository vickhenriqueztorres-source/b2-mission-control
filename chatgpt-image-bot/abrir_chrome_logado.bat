@echo off
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --profile-directory="Profile 14" "https://chatgpt.com/"
echo.
echo =======================================================
echo Chrome iniciado na sua conta oficial na porta 9222!
echo Agora voce ja pode executar o passo 2 (executar_gerador.bat).
echo =======================================================
echo.
timeout /t 5
