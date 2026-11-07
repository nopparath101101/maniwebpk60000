@echo off
rem Test the Supabase sync manually (output is shown here and also written to sync.log)
cscript //Nologo "%~dp0sync.vbs"
echo.
echo exit code = %ERRORLEVEL%   (0 = OK, 1 = failed - see the message above or sync.log)
pause
