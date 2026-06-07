import { Router, Request, Response } from 'express';
import { sttService } from '../services/stt.service';
import { ttsService } from '../services/tts.service';
import { llmService } from '../services/llm.service';
import { languageService } from '../services/language.service';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/voice/transcribe — accepts audio blob, returns transcript
router.post('/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, lang = 'auto' } = req.body;
    if (!audioData) return res.status(400).json({ error: 'audioData is required' });

    const transcript = await sttService.transcribe(audioData, lang);
    const detectedLang = languageService.detect(transcript);
    return res.json({ transcript, detectedLang });
  } catch (err: any) {
    logger.error('STT error:', err.message);
    return res.status(500).json({ error: 'Transcription error', details: err.message });
  }
});

// POST /api/voice/respond — takes transcript, returns AI reply + TTS audio
router.post('/respond', async (req: Request, res: Response) => {
  try {
    const { transcript, lang, history = [] } = req.body;
    if (!transcript) return res.status(400).json({ error: 'transcript is required' });

    const reply = await llmService.chat(transcript, lang, history);
    const audioUrl = await ttsService.synthesize(reply, lang);
    return res.json({ reply, audioUrl, lang });
  } catch (err: any) {
    logger.error('Voice respond error:', err.message);
    return res.status(500).json({ error: 'Voice response error', details: err.message });
  }
});

// POST /api/voice/tts — text to speech only
router.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, lang = 'en' } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const audioUrl = await ttsService.synthesize(text, lang);
    return res.json({ audioUrl });
  } catch (err: any) {
    logger.error('TTS error:', err.message);
    return res.status(500).json({ error: 'TTS error', details: err.message });
  }
});

export default router;
