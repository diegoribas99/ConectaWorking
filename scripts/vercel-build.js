/**
 * Script para preparar a aplicação para deploy na Vercel
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Executar o build regular
console.log('🔨 Iniciando build para Vercel...');
try {
  // Construir o frontend (Vite)
  console.log('📦 Construindo frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Construir o backend (ESBuild)
  console.log('🛠️ Construindo backend...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify', { stdio: 'inherit' });
  
  // Copiar vercel.json para a pasta dist
  console.log('📄 Copiando arquivos de configuração...');
  fs.copyFileSync('vercel.json', 'dist/vercel.json');
  
  // Criar uma pasta API para servir os endpoints
  console.log('🔄 Preparando rotas da API...');
  const apiDir = path.join('dist', 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  // Criar um arquivo de ponto de entrada serverless para a Vercel
  fs.writeFileSync(
    path.join(apiDir, 'index.js'),
    `
    import express from 'express';
    import { createServer } from 'http';
    import { registerRoutes } from '../server/routes.js';
    
    const app = express();
    const server = createServer(app);
    
    // Configurar rotas da API
    await registerRoutes(app);
    
    export default app;
    `
  );
  
  console.log('✅ Build para Vercel concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o build:', error);
  process.exit(1);
}