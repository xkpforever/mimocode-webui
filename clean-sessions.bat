@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Delete test/auto-generated sessions from MIMO Code database
:: Keeps only meaningful conversations.

set "_KEEP=ses_148cb8fb1ffewvy1IxYwG3oURO ses_148cb8f56ffefvyDNzEbCK3Hxe ses_149ebba17ffe19hsbgY73KoNys ses_149ebb55bffeKZ3A4b3RORHEx8 ses_149ebba5cffeG8HnEtF33qs6PH ses_149ebb55effe8MYk9fxKmLY4Dx ses_149ebba71ffeq2oatGfyJMaj4m ses_149ebb59fffe9IDw2xIndanbXv"

:: Get all sessions and delete ones not in KEEP list
for /f "tokens=1" %%a in ('.\mimo session list 2^>nul ^| findstr /v "Session.ID\|───"') do (
    set "_DELETE=1"
    for %%k in (%_KEEP%) do (
        if "%%a"=="%%k" set "_DELETE=0"
    )
    if "!_DELETE!"=="1" (
        echo Deleting: %%a
        .\mimo session delete %%a >nul 2>&1
        if errorlevel 1 (echo   [FAIL]) else (echo   [OK])
    )
)

echo.
echo Done. Remaining sessions:
.\mimo session list
echo.
echo.
echo To continue the current session, run:
echo   mimo -s ses_148cb8fb1ffewvy1IxYwG3oURO
