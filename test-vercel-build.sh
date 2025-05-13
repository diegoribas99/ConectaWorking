#!/bin/bash

# Script para testar o build da Vercel localmente

echo "🧪 Testando build para Vercel localmente..."

# Limpeza prévia
rm -rf dist
mkdir -p dist

# Executar o script de build
echo "🔨 Executando script de build..."
./vercel-build.sh

# Verificar se o build foi criado corretamente
if [ -f "dist/index.html" ] && [ -d "dist/assets" ] && [ -d "dist/api" ]; then
  echo "✅ Verificação de build completa: arquivos principais encontrados"
else
  echo "❌ Verificação de build falhou: arquivos principais não encontrados"
  exit 1
fi

echo "📝 Lista de arquivos gerados:"
find dist -type f -maxdepth 2 | sort

echo "
🚀 Build concluído com sucesso e pronto para deploy na Vercel!

Próximos passos para o deploy:

1. Certifique-se de ter configurado as seguintes variáveis de ambiente na Vercel:
   - DATABASE_URL
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - ANTHROPIC_API_KEY
   - OPENAI_API_KEY
   - VITE_GOOGLE_API_KEY
   - VITE_GOOGLE_CLIENT_ID

2. Na interface da Vercel:
   - Conecte seu repositório GitHub
   - Configure o diretório como raiz (/)
   - Use o comando de build: ./vercel-build.sh
   - Configure o diretório de output como: dist

3. Faça o deploy com o comando: vercel --prod

Pronto! Sua aplicação estará disponível em um domínio .vercel.app
"