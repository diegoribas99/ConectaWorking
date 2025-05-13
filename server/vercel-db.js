// Configuração de banco de dados otimizada para ambiente serverless (Vercel)
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema';

// Configuração para WebSockets no Neon DB
neonConfig.webSocketConstructor = ws;

// Verificação de variáveis de ambiente
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não está definida. Verifique suas variáveis de ambiente.');
}

// Pool de conexões com configurações ideais para serverless
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 1, // Reduzir para economia de recursos em ambiente serverless
  idleTimeoutMillis: 120000, // 2 minutos
  connectionTimeoutMillis: 10000, // 10 segundos
});

// Inicialização do cliente Drizzle
export const db = drizzle({ client: pool, schema });

// Utilitário para liberar a conexão no final de cada função serverless
export const closePool = async () => {
  try {
    await pool.end();
    console.log('Pool de conexões encerrado com sucesso');
  } catch (error) {
    console.error('Erro ao encerrar o pool de conexões:', error);
  }
};