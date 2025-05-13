// Serverless API entry point for Vercel
import express from 'express';
import { registerRoutes } from '../server/routes';

// Initialize Express app
const app = express();

// Setup middleware and routes
registerRoutes(app).then(() => {
  console.log('API routes registered successfully');
}).catch(err => {
  console.error('Failed to register API routes:', err);
});

// Export the Express app as the serverless function
export default app;