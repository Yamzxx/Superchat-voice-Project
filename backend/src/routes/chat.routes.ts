import { Router, Request, Response } from 'express';
import { llmService } from '../services/llm.service';
import { sessionService } from '../services/session.service';
import { languageService } from '../services/language.service';
import { analyticsService } from '../services/analytics.service';
import { logger } from '../utils/logger';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const { text, lang, history = [], sessionId } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'text is required' });

    // Detect language if not provided
    const detectedLang = (lang && lang !== 'auto') ? lang : languageService.detect(text);

    // Create or reuse session
    const sid = sessionId && sessionService.getSession(sessionId)
      ? sessionId
      : sessionService.createSession(detectedLang);

    // Add user message to session
    sessionService.addMessage(sid, { role: 'user', text, lang: detectedLang });

    // Get AI reply
    const reply = await llmService.chat(text, detectedLang, history);

    // Add AI reply to session
    sessionService.addMessage(sid, { role: 'ai', text: reply, lang: detectedLang });

    // Track analytics
    const responseTime = Date.now() - start;
    analyticsService.recordResponse(responseTime, detectedLang);

    return res.json({ reply, lang: detectedLang, sessionId: sid, responseTime });
  } catch (err: any) {
    logger.error('Chat error:', err.message);
    analyticsService.recordError('chat', err.message);

    // Return friendly error based on error type
    let userMessage = 'Sorry, something went wrong. Please try again.';
    if (err.message?.includes('API key')) {
      userMessage = 'API key not configured. Please set OPENAI_API_KEY in backend/.env file.';
    } else if (err.message?.includes('401')) {
      userMessage = 'Invalid API key. Please check your OPENAI_API_KEY in backend/.env file.';
    } else if (err.message?.includes('429')) {
      userMessage = 'Rate limit reached. Please wait a moment and try again.';
    }

    return res.status(500).json({ error: userMessage });
  }
});

router.get('/session/:sessionId', (req: Request, res: Response) => {
  const session = sessionService.getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  return res.json(session);
});

router.delete('/session/:sessionId', (req: Request, res: Response) => {
  sessionService.deleteSession(req.params.sessionId);
  return res.json({ ok: true });
});

export default router;
