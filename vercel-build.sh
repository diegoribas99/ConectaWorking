#!/bin/bash

# Script otimizado para preparar o deploy na Vercel

echo "🔨 Iniciando build para Vercel..."

# Definir NODE_ENV para produção
export NODE_ENV=production

# Construir o frontend (Vite)
echo "📦 Construindo frontend..."
npx vite build

# Construir o backend (ESBuild)
echo "🛠️ Construindo backend..."
npx esbuild server/vercel-entry.js server/vercel-db.js server/routes.ts server/storage.ts server/index.ts shared/schema.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist/server \
  --minify \
  --sourcemap=linked

# Garantir que a pasta api existe no output
echo "🔄 Preparando estrutura para Vercel..."
mkdir -p dist/api

# Copiar arquivos da API para dist/api
echo "📄 Copiando arquivos da API..."
cp -r api/* dist/api/

# Converter os arquivos JavaScript para módulos ESM
echo "🔄 Adaptando módulos para ESM..."
find dist/api -name "*.js" -exec sed -i '1s/^/\/\/ @ts-nocheck\n/' {} \;

# Crie um handler serverless otimizado
echo "📄 Criando handler serverless otimizado..."
cat > dist/api/_handler.js << 'EOF'
// Handler serverless otimizado
import app from '../server/vercel-entry.js';
import { closePool } from '../server/vercel-db.js';

// Handler para todas as solicitações
export default async function handler(req, res) {
  try {
    // Processar a solicitação usando o Express
    await new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  } catch (error) {
    console.error('Erro no processamento da solicitação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    // Liberar recursos no final da execução
    await closePool().catch(console.error);
  }
}
EOF

# Copiar vercel.json para a raiz do dist
echo "📄 Copiando arquivos de configuração..."
cp vercel.json dist/

# Criar um arquivo package.json no dist para o Vercel
echo "📄 Criando package.json para produção..."
cat > dist/package.json << 'EOF'
{
  "name": "conectaworking",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=18.x"
  }
}
EOF

echo "✅ Build para Vercel concluído com sucesso!"