@echo off
setlocal enabledelayedexpansion
title MIMO Code - Stop All Services
cd /d "%~dp0"

echo ============================================
echo   MIMO Code - Stop All Services
echo ============================================
echo.

:: Step 1 - Stop WebUI (port 3333)
echo [1/3] Stopping WebUI dev server...
set "_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3333 " ^| findstr "LISTENING"') do set "_PID=%%a"
if not "!_PID!"=="" (
    echo   Killing process on port 3333 (PID: !_PID!)
    taskkill /PID !_PID! /F >nul 2>&1
    if errorlevel 1 (echo   [WARN] Failed to kill) else (echo   [OK] WebUI stopped)
) else (
    echo   [OK] WebUI was not running
)

:: Step 2 - Stop MIMO Code server (port 4096)
echo [2/3] Stopping MIMO Code server...
set "_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4096 " ^| findstr "LISTENING"') do set "_PID=%%a"
if not "!_PID!"=="" (
    echo   Killing process on port 4096 (PID: !_PID!)
    taskkill /PID !_PID! /F >nul 2>&1
    if errorlevel 1 (echo   [WARN] Failed to kill) else (echo   [OK] MIMO server stopped)
) else (
    echo   [OK] MIMO server was not running
)

:: Step 3 - Verify all stopped
echo [3/3] Verifying all services stopped...
set "_STILL_RUNNING="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3333 " ^| findstr "LISTENING"') do set "_STILL_RUNNING=%%a"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4096 " ^| findstr "LISTENING"') do set "_STILL_RUNNING=%%a"
if not "!_STILL_RUNNING!"=="" (
    echo   [WARN] Some services may still be running.
) else (
    echo   [OK] All services stopped.
)

echo.
echo ============================================
echo   All services stopped.
echo   You can now restart with restart-mimo.bat
echo ============================================
echo.
pause
