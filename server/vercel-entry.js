// Ponto de entrada otimizado para Vercel
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { registerRoutes } from './routes';
import path from 'path';

// Inicializar Express
const app = express();

// Middleware essenciais
app.use(cors());
app.use(compression());
app.use(express.json());

// Configurar rotas estáticas e API
async function setupApp() {
  // Servir arquivos estáticos do diretório dist
  app.use(express.static(path.join(__dirname, '../')));
  
  // Registrar rotas da API
  await registerRoutes(app);
  
  // Fallback para SPA (Single Page Application)
  app.get('*', (req, res) => {
    // Ignorar solicitações de API
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint não encontrado' });
    }
    
    // Enviar index.html para todas as outras rotas
    res.sendFile(path.join(__dirname, '../index.html'));
  });
}

// Configurar o app para Vercel
setupApp().then(() => {
  console.log('Aplicação configurada para Vercel');
}).catch(err => {
  console.error('Erro ao configurar a aplicação para Vercel:', err);
});

// Exportar o app Express para ser usado pelas funções serverless da Vercel
export default app;