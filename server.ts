import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMarketPulse } from './server/fetcher.ts';
import {
  getAlertHistory,
  getTelegramStatus,
  handleTelegramUpdate,
  startTelegramPolling,
} from './server/telegram.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '256kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      telegram: getTelegramStatus(),
    });
  });

  app.get('/api/market-pulse', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === '1';
      const data = await buildMarketPulse(forceRefresh);
      res.json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load market pulse';
      res.status(502).json({ error: message });
    }
  });

  app.get('/api/alerts', (_req, res) => {
    res.json({
      telegram: getTelegramStatus(),
      alerts: getAlertHistory(),
    });
  });

  app.post('/api/telegram/webhook', async (req, res) => {
    try {
      await handleTelegramUpdate(req.body, async () => {
        const pulse = await buildMarketPulse(false);
        return pulse.coins;
      });
      res.json({ ok: true });
    } catch {
      res.status(200).json({ ok: false });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Production build not found.');
      }
    });
  }

  // Keep live crypto prices, news, and >85 Telegram push alerts warm in background every 25 seconds
  setInterval(() => {
    buildMarketPulse(true).catch(() => {});
  }, 25_000);

  // Start Telegram Bot long-polling when TELEGRAM_BOT_TOKEN is configured
  startTelegramPolling(async () => {
    const pulse = await buildMarketPulse(false);
    return pulse.coins;
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CryptoPulse server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
