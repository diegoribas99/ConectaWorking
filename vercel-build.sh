#!/bin/bash

# Script para preparar o deploy na Vercel

echo "🔨 Iniciando build para Vercel..."

# Construir o frontend (Vite)
echo "📦 Construindo frontend..."
npm run build

# Garantir que a pasta api existe no output
echo "🔄 Preparando estrutura para Vercel..."
mkdir -p dist/api

# Copiar o arquivo api/index.js para dist/api
echo "📄 Copiando arquivos da API..."
cp -r api/* dist/api/

# Copiar vercel.json para a raiz do dist
echo "📄 Copiando arquivos de configuração..."
cp vercel.json dist/

echo "✅ Build para Vercel concluído com sucesso!"