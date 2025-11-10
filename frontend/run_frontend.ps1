<#
.SYNOPSIS
    Script para configurar, instalar y ejecutar el frontend de React.
.DESCRIPTION
    Este script automatiza los siguientes pasos:
    1. Configura las variables de entorno (.env) necesarias en la sesión de PowerShell actual.
    2. Ejecuta 'npm install' para asegurar que todas las dependencias estén instaladas.
    3. Ejecuta 'npm start' para iniciar el servidor de desarrollo de React.
#>

# --- Configuración Inicial ---
# Detiene el script si cualquier comando falla
$ErrorActionPreference = "Stop"

# Muestra un título
Write-Host "======================================"
Write-Host "  INICIANDO FRONTEND (React)"
Write-Host "======================================"
Write-Host ""

# --- 1. Configuración de Variables de Entorno ---
Write-Host "Configurando variables de entorno para esta sesión..." -ForegroundColor Cyan

# Asigna las variables de entorno solo para esta sesión de terminal
$env:REACT_APP_API_URL = "http://localhost:8080/api"
$env:REACT_APP_USE_MOCKS = "false"

# Muestra las variables configuradas para confirmación
Write-Host "  [OK] REACT_APP_API_URL = $env:REACT_APP_API_URL"
Write-Host "  [OK] REACT_APP_USE_MOCKS = $env:REACT_APP_USE_MOCKS"
Write-Host ""

# --- 2. Instalación de Dependencias ---
Write-Host "Paso 1: Verificando e instalando dependencias (npm install)..." -ForegroundColor Cyan
Write-Host "(Esto puede tardar unos minutos la primera vez)"

try {
    npm install
} catch {
    Write-Host "Error: 'npm install' falló. Revisa los mensajes de error." -ForegroundColor Red
    Read-Host "Presiona Enter para salir..."
    exit 1
}

Write-Host "Dependencias instaladas correctamente." -ForegroundColor Green
Write-Host ""

# --- 3. Ejecución del Frontend ---
Write-Host "Paso 2: Iniciando el servidor de desarrollo (npm start)..." -ForegroundColor Cyan
Write-Host "El navegador debería abrirse automáticamente."
Write-Host "Para DETENER el servidor, presiona CTRL+C en esta ventana."
Write-Host "----------------------------------------------------------"
Write-Host ""

try {
    # npm start tomará el control de la consola y se ejecutará hasta que se cancele
    npm start
} catch {
    Write-Host "Error: 'npm start' no pudo iniciarse correctamente." -ForegroundColor Red
    Read-Host "Presiona Enter para salir..."
    exit 1
}

Write-Host "Servidor detenido. Script finalizado."