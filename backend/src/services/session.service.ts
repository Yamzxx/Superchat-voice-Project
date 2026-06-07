import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface SessionMessage {
  role: 'user' | 'ai';
  text: string;
  lang: 'en' | 'te';
  timestamp?: string;
}

export interface Session {
  id: string;
  createdAt: string;
  messages: SessionMessage[];
  lang: string;
  escalated: boolean;
}

/**
 * In-memory session store.
 * For production: replace with Redis or a database via DATABASE_URL.
 */
class SessionService {
  private sessions = new Map<string, Session>();
  private readonly MAX_SESSIONS = 1000;

  createSession(lang = 'auto'): string {
    const id = crypto.randomUUID();
    if (this.sessions.size >= this.MAX_SESSIONS) {
      // evict oldest
      const oldest = this.sessions.keys().next().value;
      if (oldest) this.sessions.delete(oldest);
    }
    this.sessions.set(id, {
      id,
      createdAt: new Date().toISOString(),
      messages: [],
      lang,
      escalated: false,
    });
    logger.info(`Session created: ${id}`);
    return id;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  addMessage(sessionId: string, msg: SessionMessage): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.messages.push({ ...msg, timestamp: new Date().toISOString() });
  }

  escalateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.escalated = true;
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  deleteSession(id: string): void {
    this.sessions.delete(id);
  }

  count(): number {
    return this.sessions.size;
  }
}

export const sessionService = new SessionService();
