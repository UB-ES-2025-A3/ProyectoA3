# Script para compilar y correr el backend desde la raíz del proyecto

# Ruta al .env
$envFile = "src\main\resources\credentials.env"

# Cargar variables del .env
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -and ($_ -notmatch "^#")) {
            $pair = $_ -split '='
            [System.Environment]::SetEnvironmentVariable($pair[0], $pair[1], "Process")
        }
    }
    Write-Host "Variables de credentials.env cargadas."
} else {
    Write-Host "Archivo credentials.env no encontrado. Usando variables de entorno existentes."
}

# Compilar y actualizar dependencias
Write-Host "Compilando y actualizando proyecto..."
mvn -U clean package

# Ejecutar Spring Boot
Write-Host "Arrancando la aplicación Spring Boot..."
mvn spring-boot:run
