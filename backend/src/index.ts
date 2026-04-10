import express from 'express';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { pool } from './db';

const app = express();

// Middleware
app.use(express.json());
app.use(pinoHttp({
  autoLogging: {
    ignore: (req) => req.url === '/favicon.ico'
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  }
}));

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});

export default app;