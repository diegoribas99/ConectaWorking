// Ponto de entrada para rotas dinâmicas na Vercel
import express from 'express';
import { registerRoutes } from '../server/routes';

// Inicialize o app Express
const app = express();

// Middleware para processar JSON
app.use(express.json());

// Configure as rotas da API
let initialized = false;
const initialize = async () => {
  if (!initialized) {
    await registerRoutes(app);
    initialized = true;
  }
};

// Handler para todas as rotas da API
export default async function handler(req, res) {
  await initialize();
  
  // Criar um middleware Express para processar a solicitação
  return new Promise((resolve, reject) => {
    app(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}