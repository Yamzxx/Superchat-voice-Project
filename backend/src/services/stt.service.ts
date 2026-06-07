import { logger } from '../utils/logger';

/**
 * STT Service — Speech-to-Text
 * Supports: Whisper API (OpenAI), Google Cloud STT, or local Whisper
 * Telugu (te-IN) and English (en-IN) are both supported via Whisper
 */
class STTService {
  private provider = process.env.STT_PROVIDER || 'whisper'; // 'whisper' | 'google' | 'local'

  async transcribe(audioData: string, lang: string): Promise<string> {
    switch (this.provider) {
      case 'whisper':
        return this.transcribeWhisper(audioData, lang);
      case 'google':
        return this.transcribeGoogle(audioData, lang);
      default:
        return this.transcribeWhisper(audioData, lang);
    }
  }

  private async transcribeWhisper(audioData: string, lang: string): Promise<string> {
    const apiKey = process.env.STT_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('STT_API_KEY not set');

    // Convert base64 to blob
    const buffer = Buffer.from(audioData, 'base64');
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    if (lang !== 'auto') {
      formData.append('language', lang === 'te' ? 'te' : 'en');
    }

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!res.ok) throw new Error(`Whisper STT error: ${res.status}`);
    const data = await res.json();
    logger.info(`STT transcript: ${data.text?.slice(0, 60)}...`);
    return data.text || '';
  }

  private async transcribeGoogle(audioData: string, lang: string): Promise<string> {
    const apiKey = process.env.STT_API_KEY;
    if (!apiKey) throw new Error('STT_API_KEY not set for Google STT');

    const langCode = lang === 'te' ? 'te-IN' : 'en-IN';
    const res = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: { encoding: 'WEBM_OPUS', sampleRateHertz: 48000, languageCode: langCode },
          audio: { content: audioData },
        }),
      }
    );

    if (!res.ok) throw new Error(`Google STT error: ${res.status}`);
    const data = await res.json();
    return data.results?.[0]?.alternatives?.[0]?.transcript || '';
  }
}

export const sttService = new STTService();
