import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRoute } from './src/server/api';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// API routes handled directly
app.use(async (req, res, next) => {
  if (req.url.startsWith('/api/')) {
    const handled = await handleApiRoute(req, res);
    if (handled) return;
  }
  next();
});

// Serve frontend build static files
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Knot Just Krochet server running on port ${port}`);
});
