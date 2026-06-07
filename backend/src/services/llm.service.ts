import Groq from 'groq-sdk';
import { logger } from '../utils/logger';

const SYSTEM_PROMPT = `You are Superchat AI — a smart, friendly, bilingual customer support and general assistant for Superchat, a modern communication platform.

## Language Rules
- If the user writes in Telugu (తెలుగు script), respond FULLY in Telugu.
- If the user writes in English, respond in English.
- If mixed, match the dominant language.
- Never mix languages in one sentence unless the user does.

## Your Personality
- Warm, professional, helpful, concise.
- Like a knowledgeable friend who works in customer support.
- Use natural conversational tone — not robotic.
- Keep replies focused: 2-4 sentences unless detail is needed.

## What You Know
You are an expert on:
- Account management (login, password reset, profile settings, 2FA)
- Billing and subscriptions (plans, invoices, refunds, upgrades)
- Technical support (bugs, connectivity, app issues)
- Superchat platform features (chat, voice calls, team workspaces, integrations)
- General knowledge, coding questions, writing help, math, science
- Indian context: UPI payments, GST billing, Indian English

## Superchat Plans
- Basic: ₹299/month — 5 users, chat only
- Pro: ₹999/month — 25 users, chat + voice + analytics
- Enterprise: Custom pricing — unlimited users, dedicated support

## Important
- If you do not know something specific, ask for more details.
- For sensitive actions (refunds, account deletion), say you will escalate to a human agent.
- Never make up order IDs, transaction IDs, or account details.
- Always be helpful — never refuse a reasonable question.`;

class LLMService {
  private client: Groq | null = null;

  private getClient(): Groq {
    if (!this.client) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error('GROQ_API_KEY not set in .env file.');
      this.client = new Groq({ apiKey });
    }
    return this.client;
  }

  async chat(
    text: string,
    lang: 'en' | 'te',
    history: Array<{ role: 'user' | 'ai'; text: string }>
  ): Promise<string> {
    const client = this.getClient();

    const systemWithLang = lang === 'te'
      ? SYSTEM_PROMPT + '\n\nIMPORTANT: The user is writing in Telugu. You MUST respond in Telugu script (తెలుగు).'
      : SYSTEM_PROMPT;

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemWithLang },
      ...history.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      })),
      { role: 'user', content: text },
    ];

    logger.info(`Groq request: lang=${lang}, text="${text.slice(0, 60)}"`);

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || 'No response received.';
    logger.info(`Groq reply: "${reply.slice(0, 60)}"`);
    return reply;
  }
}

export const llmService = new LLMService();
