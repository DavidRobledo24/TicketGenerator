@echo off
set SCRIPT_PATH=%~dp0iniciar_servidor.bat
set SCRIPT_DIR=%~dp0
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo Creando acceso directo en: %STARTUP_FOLDER%

echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%STARTUP_FOLDER%\IniciarServidor.lnk" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%SCRIPT_PATH%" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%SCRIPT_DIR%" >> CreateShortcut.vbs
echo oLink.WindowStyle = 1 >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

echo Ejecutando script VBS...
cscript //nologo CreateShortcut.vbs
if errorlevel 1 (
    echo Error al crear el acceso directo
    pause
    exit /b 1
)

del CreateShortcut.vbs

if exist "%STARTUP_FOLDER%\IniciarServidor.lnk" (
    echo Acceso directo creado exitosamente en la carpeta de inicio
) else (
    echo Error: No se pudo verificar la creación del acceso directo
)

echo Verificando Node.js y npm...
where npm >nul 2>nul
if errorlevel 1 (
    echo ADVERTENCIA: npm no se encuentra en el PATH del sistema
    echo Por favor, asegúrese de que Node.js está instalado correctamente
)

pause