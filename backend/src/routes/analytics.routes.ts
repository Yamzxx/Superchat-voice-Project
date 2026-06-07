import { Router, Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  return res.json(analyticsService.getStats());
});

router.get('/errors', (_req: Request, res: Response) => {
  return res.json(analyticsService.getErrors());
});

router.post('/reset', (_req: Request, res: Response) => {
  analyticsService.reset();
  return res.json({ ok: true });
});

export default router;
