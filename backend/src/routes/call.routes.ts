import { Router, Request, Response } from 'express';
import { sessionService } from '../services/session.service';
import { analyticsService } from '../services/analytics.service';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/call/start
router.post('/start', (req: Request, res: Response) => {
  try {
    const { lang = 'auto' } = req.body;
    const sessionId = sessionService.createSession();
    analyticsService.recordSession();
    logger.info(`Call started: ${sessionId}`);
    return res.json({ sessionId, status: 'ringing', lang });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/call/end
router.post('/end', (req: Request, res: Response) => {
  try {
    const { sessionId, duration } = req.body;
    const session = sessionService.getSession(sessionId);
    analyticsService.recordCallDuration(duration || 0);
    logger.info(`Call ended: ${sessionId}, duration: ${duration}s`);
    return res.json({ sessionId, status: 'ended', messages: session?.messages || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/call/escalate
router.post('/escalate', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const session = sessionService.getSession(sessionId);
    analyticsService.recordEscalation();
    logger.info(`Escalation requested: ${sessionId}`);
    return res.json({
      sessionId,
      status: 'escalated',
      transcript: session?.messages || [],
      message: 'Human agent will join shortly. Transcript preserved.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
