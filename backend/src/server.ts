import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.routes';
import voiceRoutes from './routes/voice.routes';
import summaryRoutes from './routes/summary.routes';
import analyticsRoutes from './routes/analytics.routes';
import callRoutes from './routes/call.routes';
import { logger } from './utils/logger';

import { ttsService } from './services/tts.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Allow ALL origins — needed when opening HTML as a local file
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes mounted with /api prefix
app.use('/api/chat', chatRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/call', callRoutes);

// Fallback mounts directly without /api (handles rewrites that strip the prefix)
app.use('/chat', chatRoutes);
app.use('/voice', voiceRoutes);
app.use('/summary', summaryRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/call', callRoutes);

// Audio cache static serving
app.use('/tts-cache', express.static(ttsService.cacheDir));
app.use('/api/tts-cache', express.static(ttsService.cacheDir));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`Superchat backend running on http://localhost:${PORT}`);
  });
}

export default app;