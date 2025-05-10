import express from 'express';
import path from 'path';

export function setupStaticFileServing(app: express.Express) {
  // Serve arquivos estáticos de uploads
  app.use('/uploads', express.static(path.resolve('public/uploads')));
}