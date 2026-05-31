@echo off
cd /d "%~dp0"
echo 正在启动黑鸭健身本地服务...
py server.py
if errorlevel 1 (
  echo.
  echo 若 py 不可用，请安装 Python: https://www.python.org/downloads/
  pause
)
