@echo off
setlocal enabledelayedexpansion
title MIMO Code - Restart All Services
cd /d "%~dp0"

set "_SELF=%~nx0"

echo ========================================================
echo   MIMO Code - Restart All Services
echo   This script restarts both MIMO server + WebUI
echo ========================================================
echo.

:: --------------------------------------------------
:: STEP 1 - Kill existing services on ports 4096 + 3333
:: --------------------------------------------------
echo [1/5] Stopping existing services...

set "_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4096 " ^| findstr "LISTENING"') do set "_PID=%%a"
if not "!_PID!"=="" (
    echo   - Killing MIMO server on port 4096 (PID: !_PID!)
    taskkill /PID !_PID! /F >nul 2>&1
    if errorlevel 1 (echo   [WARN] Failed to kill) else (echo   [OK] MIMO server stopped)
)

set "_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3333 " ^| findstr "LISTENING"') do set "_PID=%%a"
if not "!_PID!"=="" (
    echo   - Killing WebUI dev server on port 3333 (PID: !_PID!)
    taskkill /PID !_PID! /F >nul 2>&1
    if errorlevel 1 (echo   [WARN] Failed to kill) else (echo   [OK] WebUI server stopped)
)

:: Verify ports are freed
set "_WAIT=0"
:check_free_ports
set /a "_WAIT+=1"
if !_WAIT! geq 10 (
    echo   [WARN] Ports may not be fully released, continuing anyway...
    goto check_done
)
set "_BUSY="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4096 " ^| findstr "LISTENING"') do set "_BUSY=%%a"
if not "!_BUSY!"=="" (
    ping -n 2 127.0.0.1 >nul
    goto check_free_ports
)
set "_BUSY="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3333 " ^| findstr "LISTENING"') do set "_BUSY=%%a"
if not "!_BUSY!"=="" (
    ping -n 2 127.0.0.1 >nul
    goto check_free_ports
)
:check_done
echo   [OK] Ports 4096 and 3333 are free.
echo.

:: --------------------------------------------------
:: STEP 2 - Check prerequisites
:: --------------------------------------------------
echo [2/5] Checking prerequisites...

:: Check node
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found in PATH.
    pause
    exit /b 1
)
echo   [OK] Node.js found

:: Check mimo executable
if not exist ".\mimo.exe" (
    echo [ERROR] mimo.exe not found in current directory.
    echo   Expected at: %CD%\mimo.exe
    pause
    exit /b 1
)
echo   [OK] mimo.exe found

:: Check webui directory
if not exist ".\webui\package.json" (
    echo [ERROR] webui/package.json not found.
    echo   Make sure the webui folder exists in the project root.
    pause
    exit /b 1
)
echo   [OK] webui/ found
echo.

:: --------------------------------------------------
:: STEP 3 - Start MIMO Code server
:: --------------------------------------------------
echo [3/5] Starting MIMO Code server...
start "MIMO Code Server" cmd /c ".\mimo.exe web"
echo   Waiting for port 4096...

:: Wait up to 30 seconds for port 4096 to listen
set "_WAITED=0"
:wait_mimo
set /a "_WAITED+=1"
if !_WAITED! geq 30 (
    echo [ERROR] MIMO server did not start within 30 seconds.
    echo   Check if mimo web ran without errors in its window.
    pause
    exit /b 1
)
set "_FOUND="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4096 " ^| findstr "LISTENING"') do set "_FOUND=%%a"
if "!_FOUND!"=="" (
    ping -n 2 127.0.0.1 >nul
    goto wait_mimo
)
echo   [OK] MIMO server is running on http://localhost:4096
echo.

:: --------------------------------------------------
:: STEP 4 - Start WebUI dev server
:: --------------------------------------------------
echo [4/5] Starting WebUI dev server...
start "MIMO WebUI" cmd /c "npm --prefix webui run dev"
echo   Waiting for port 3333...

:: Wait up to 30 seconds for port 3333 to listen
set "_WAITED=0"
:wait_webui
set /a "_WAITED+=1"
if !_WAITED! geq 30 (
    echo [ERROR] WebUI did not start within 30 seconds.
    echo   Check the WebUI window for errors.
    pause
    exit /b 1
)
set "_FOUND="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3333 " ^| findstr "LISTENING"') do set "_FOUND=%%a"
if "!_FOUND!"=="" (
    ping -n 2 127.0.0.1 >nul
    goto wait_webui
)
echo   [OK] WebUI is running on http://localhost:3333
echo.

:: --------------------------------------------------
:: STEP 5 - Open browser
:: --------------------------------------------------
echo [5/5] All services started successfully!
echo.
echo ========================================================
echo   MIMO Code Server:  http://localhost:4096
echo   WebUI:             http://localhost:3333
echo ========================================================
echo.
start http://localhost:3333
echo   Browser opened to WebUI.
echo.
echo   You may now close this window.
echo   The server and WebUI will keep running.
echo.

pause
