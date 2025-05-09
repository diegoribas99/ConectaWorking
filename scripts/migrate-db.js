require('dotenv').config();
const { drizzle } = require('drizzle-orm/neon-serverless');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const ws = require('ws');

// Configure Neon for WebSocket
neonConfig.webSocketConstructor = ws;

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Starting database migration...');
  
  try {
    // Connect to database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool });
    
    // Run migration
    await migrate(db, { migrationsFolder: 'sql/migrations' });
    
    console.log('Migration completed successfully');
    
    // Close the pool
    await pool.end();
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();