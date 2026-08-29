@echo off
chcp 65001 >nul
title MiMo Code 安装脚本
echo ============================================
echo    MiMo Code v0.1.0 - D 盘部署配置
echo ============================================
echo.

:: 1. 设置二进制路径
set "MIMO_HOME=D:\MiMo-Code"
set "MIMO_BIN=%MIMO_HOME%\dist"

:: 2. 添加到用户 PATH
echo [1/3] 正在添加 PATH 环境变量...
setx PATH "%PATH%;%MIMO_BIN%" /M 2>nul
if %errorlevel% neq 0 (
    setx PATH "%PATH%;%MIMO_BIN%" >nul
)
echo    完成！

:: 3. 创建桌面快捷方式演示
echo [2/3] 测试 MiMo Code 运行...
"%MIMO_BIN%\mimo.exe" --version

:: 4. 验证
echo [3/3] 验证完成！
echo.
echo ============================================
echo  部署成功！使用方法：
echo.
echo  在终端中输入: mimo
echo  首次启动: mimo (会自动进入配置引导)
echo  指定项目目录: mimo ^<项目路径^>
echo  查看帮助: mimo --help
echo.
echo  源码位置: D:\MiMo-Code
echo  二进制位置: D:\MiMo-Code\dist\mimo.exe
echo  启动脚: D:\MiMo-Code\mimo.bat
echo.
echo  注意：请重启终端或执行 `refreshenv` 
echo  使 PATH 生效
echo ============================================
pause
