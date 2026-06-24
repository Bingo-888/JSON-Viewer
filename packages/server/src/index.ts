import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { healthRouter } from './routes/health.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 3847;

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use('/api/health', healthRouter);

if (isProduction) {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port} (${isProduction ? 'production' : 'development'})`);
});
