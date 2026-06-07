import { Router, Request, Response } from 'express';
import { llmService } from '../services/llm.service';
import { logger } from '../utils/logger';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { messages, duration } = req.body;
    if (!messages?.length) return res.status(400).json({ error: 'messages required' });

    const transcript = messages.map((m: any) => `${m.role}: ${m.text}`).join('\n');
    const summaryPrompt = `Analyze this conversation and respond with JSON only (no markdown, no backticks):
{
  "summary": "2-3 sentence summary",
  "detectedLanguages": ["en", "te"],
  "languageSplit": {"en": 70, "te": 30},
  "primaryIntent": "account management",
  "actionItems": [{"text": "...", "status": "done"}],
  "unresolvedItems": ["..."],
  "sentiment": "positive"
}

Conversation:
${transcript}`;

    const raw = await llmService.chat(summaryPrompt, 'en', []);
    let summary;
    try {
      summary = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      summary = { summary: raw, detectedLanguages: ['en'], actionItems: [] };
    }
    return res.json({ ...summary, duration: duration || '00:00' });
  } catch (err: any) {
    logger.error('Summary error:', err.message);
    return res.status(500).json({ error: 'Summary generation failed' });
  }
});

export default router;
