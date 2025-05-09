// Script para resetar o progresso de onboarding de um usuário
// Execute com: tsx scripts/reset_user_onboarding.js 1
// (onde 1 é o ID do usuário)

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from 'ws';
import { users, userTaskProgress } from '../shared/schema';

// Acessar as variáveis de ambiente
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Erro: DATABASE_URL não definida.");
  process.exit(1);
}

// Configuração do WebSocket para Neon
neonConfig.webSocketConstructor = ws;

// Inicializar o pool de conexões
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle({ client: pool });

// Obter o ID do usuário da linha de comando
const userId = parseInt(process.argv[2]);

if (!userId || isNaN(userId)) {
  console.error("Uso: node scripts/reset_user_onboarding.js [ID_DO_USUARIO]");
  process.exit(1);
}

async function resetUserOnboarding() {
  try {
    console.log(`Resetando progresso de onboarding para o usuário ${userId}...`);
    
    // Buscar informações do usuário antes do reset
    const usersResult = await db.select().from(users).where(eq(users.id, userId));
    
    if (usersResult.length === 0) {
      console.error(`Usuário com ID ${userId} não encontrado.`);
      process.exit(1);
    }
    
    const user = usersResult[0];
    console.log("Estado atual do usuário:", JSON.stringify(user, null, 2));
    
    // Resetar o progresso do usuário
    const updatedUsers = await db
      .update(users)
      .set({
        onboardingProgress: 0,
        onboardingCompleted: false,
        onboardingStepsDone: 0,
        totalPoints: 0,
        level: 1
      })
      .where(eq(users.id, userId))
      .returning();
    
    console.log("Progresso do usuário resetado:", JSON.stringify(updatedUsers[0], null, 2));
    
    // Obter progressos de tarefas
    const progress = await db
      .select()
      .from(userTaskProgress)
      .where(eq(userTaskProgress.userId, userId));
    
    console.log(`Encontradas ${progress.length} tarefas completadas para apagar...`);
    
    // Excluir progressos de tarefas
    if (progress.length > 0) {
      await db
        .delete(userTaskProgress)
        .where(eq(userTaskProgress.userId, userId));
      
      console.log(`${progress.length} tarefas completadas foram apagadas.`);
    }
    
    console.log("Reset do progresso de onboarding concluído com sucesso!");
  } catch (error) {
    console.error("Erro ao resetar progresso:", error);
  } finally {
    // Fechar a conexão com o banco de dados
    await pool.end();
  }
}

resetUserOnboarding();