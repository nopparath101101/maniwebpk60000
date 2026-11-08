@echo off
rem Create a Windows Scheduled Task that runs sync.vbs every 5 minutes.
rem Run this file ONCE as Administrator. Change the number after /mo to change the interval (minutes).
schtasks /create /f /tn "Reg6 Sync Content" /sc minute /mo 5 /ru SYSTEM /tr "cscript.exe //B //Nologo \"%~dp0sync.vbs\""
if errorlevel 1 (
  echo.
  echo FAILED to create the task. Open Command Prompt with "Run as administrator" and try again.
) else (
  echo.
  echo Task "Reg6 Sync Content" created. Results are written to sync.log in this folder.
  echo To remove it later:  schtasks /delete /tn "Reg6 Sync Content" /f
)
pause
