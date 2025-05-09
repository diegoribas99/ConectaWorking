import { db, pool } from "../server/db.js";

async function runMigration() {
  console.log("Iniciando migração para adicionar colunas de gamificação ao schema...");

  try {
    // Adicionando colunas à tabela users
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS onboarding_progress INTEGER DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
      ADD COLUMN IF NOT EXISTS onboarding_steps_done INTEGER DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 NOT NULL;
    `);
    console.log("✅ Colunas adicionadas à tabela users");

    // Criando tabela onboarding_tasks
    await db.execute(`
      CREATE TABLE IF NOT EXISTS onboarding_tasks (
        id SERIAL PRIMARY KEY,
        task_name TEXT NOT NULL,
        description TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        points INTEGER DEFAULT 10 NOT NULL,
        category TEXT NOT NULL,
        route_path TEXT,
        icon_name TEXT,
        is_required BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Tabela onboarding_tasks criada");

    // Criando tabela user_task_progress
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_task_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        task_id INTEGER NOT NULL REFERENCES onboarding_tasks(id),
        completed BOOLEAN DEFAULT FALSE NOT NULL,
        completed_at TIMESTAMP,
        points_earned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, task_id)
      );
    `);
    console.log("✅ Tabela user_task_progress criada");

    // Criando tabela user_achievements
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        achievement_name TEXT NOT NULL,
        description TEXT NOT NULL,
        points_awarded INTEGER NOT NULL,
        earned_at TIMESTAMP DEFAULT NOW(),
        badge_icon TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Tabela user_achievements criada");

    // Inserindo tarefas padrão de onboarding
    await db.execute(`
      INSERT INTO onboarding_tasks (task_name, description, "order", points, category, route_path, icon_name, is_required)
      VALUES
        ('Complete seu perfil', 'Preencha suas informações de perfil para personalizar sua experiência', 1, 20, 'setup', '/profile', 'user', TRUE),
        ('Adicione seu primeiro colaborador', 'Cadastre um membro da sua equipe', 2, 30, 'setup', '/colaboradores', 'users', TRUE),
        ('Configure os custos do escritório', 'Informe os custos fixos e variáveis do seu escritório', 3, 40, 'setup', '/custos-escritorio', 'building', TRUE),
        ('Cadastre seu primeiro cliente', 'Adicione um cliente para começar a criar orçamentos', 4, 30, 'clients', '/clientes', 'briefcase', TRUE),
        ('Crie seu primeiro orçamento', 'Desenvolva seu primeiro orçamento usando a ferramenta', 5, 50, 'pricing', '/novo-orcamento', 'file-plus', TRUE),
        ('Utilize a IA para análise de cliente', 'Teste o assistente de IA para extrair insights de um cliente', 6, 40, 'ai', '/clientes-ia', 'brain', FALSE),
        ('Visite a página de Dashboard', 'Confira seus dados e estatísticas', 7, 20, 'analytics', '/dashboard', 'pie-chart', FALSE),
        ('Personalize um modelo de orçamento', 'Crie ou personalize um modelo para agilizar futuros orçamentos', 8, 40, 'templates', '/modelos', 'copy', FALSE)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("✅ Tarefas de onboarding iniciais criadas");

    console.log("✅ Migração concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);
  } finally {
    await pool.end();
  }
}

runMigration();