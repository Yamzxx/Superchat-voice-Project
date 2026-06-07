import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

/**
 * TTS Service — Text-to-Speech
 * Supports: Google Cloud TTS (best Telugu), ElevenLabs, OpenAI TTS
 * Telugu voices: Google WaveNet te-IN is recommended
 */
class TTSService {
  private provider = process.env.TTS_PROVIDER || 'google'; // 'google' | 'elevenlabs' | 'openai'
  private cacheDir = path.join(process.cwd(), 'tts-cache');

  constructor() {
    if (!fs.existsSync(this.cacheDir)) fs.mkdirSync(this.cacheDir, { recursive: true });
  }

  async synthesize(text: string, lang: 'en' | 'te'): Promise<string> {
    const hash = crypto.createHash('md5').update(`${lang}:${text}`).digest('hex');
    const cachedPath = path.join(this.cacheDir, `${hash}.mp3`);
    if (fs.existsSync(cachedPath)) return `/tts-cache/${hash}.mp3`;

    switch (this.provider) {
      case 'google':
        return this.synthesizeGoogle(text, lang, cachedPath, hash);
      case 'elevenlabs':
        return this.synthesizeElevenLabs(text, lang, cachedPath, hash);
      case 'openai':
        return this.synthesizeOpenAI(text, cachedPath, hash);
      default:
        return this.synthesizeGoogle(text, lang, cachedPath, hash);
    }
  }

  private async synthesizeGoogle(text: string, lang: 'en' | 'te', filePath: string, hash: string): Promise<string> {
    const apiKey = process.env.TTS_API_KEY;
    if (!apiKey) throw new Error('TTS_API_KEY not set');

    const voiceConfig = lang === 'te'
      ? { languageCode: 'te-IN', name: 'te-IN-Standard-A', ssmlGender: 'FEMALE' }
      : { languageCode: 'en-IN', name: 'en-IN-Wavenet-D', ssmlGender: 'MALE' };

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: voiceConfig,
          audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 },
        }),
      }
    );

    if (!res.ok) throw new Error(`Google TTS error: ${res.status}`);
    const data = await res.json();
    fs.writeFileSync(filePath, Buffer.from(data.audioContent, 'base64'));
    logger.info(`TTS generated: ${hash}.mp3`);
    return `/tts-cache/${hash}.mp3`;
  }

  private async synthesizeElevenLabs(text: string, _lang: string, filePath: string, hash: string): Promise<string> {
    const apiKey = process.env.TTS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    if (!apiKey) throw new Error('TTS_API_KEY not set');

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    });

    if (!res.ok) throw new Error(`ElevenLabs TTS error: ${res.status}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return `/tts-cache/${hash}.mp3`;
  }

  private async synthesizeOpenAI(text: string, filePath: string, hash: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'tts-1', input: text, voice: 'nova', speed: 0.95 }),
    });

    if (!res.ok) throw new Error(`OpenAI TTS error: ${res.status}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return `/tts-cache/${hash}.mp3`;
  }
}

export const ttsService = new TTSService();
