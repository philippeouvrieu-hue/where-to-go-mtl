@echo off
cd /d "%~dp0"
if "%SUPABASE_SERVICE_KEY%"=="" (
  set /p SUPABASE_SERVICE_KEY="Colle ta service key Supabase (sb_secret_...): "
)
python sync_venues_to_supabase.py
pause
