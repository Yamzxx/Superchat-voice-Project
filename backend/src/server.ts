import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.routes';
import voiceRoutes from './routes/voice.routes';
import summaryRoutes from './routes/summary.routes';
import analyticsRoutes from './routes/analytics.routes';
import callRoutes from './routes/call.routes';
import { logger } from './utils/logger';

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

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/call', callRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  logger.info(`Superchat backend running on http://localhost:${PORT}`);
});

export default app;