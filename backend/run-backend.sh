#!/bin/bash

# Script para ejecutar el backend con las variables de entorno correctas

# Cambiar al directorio del script (donde está el pom.xml)
cd "$(dirname "$0")"

echo "🔧 Cargando variables de entorno desde credentials.env..."
export $(grep -v '^#' src/main/resources/credentials.env | xargs)

echo "✓ Variables cargadas correctamente"
echo "📊 SPRING_DATASOURCE_URL=$SPRING_DATASOURCE_URL"
echo ""
echo "🚀 Iniciando el servidor backend..."
echo ""

mvn spring-boot:run
