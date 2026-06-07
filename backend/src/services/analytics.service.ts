interface ErrorLog {
  type: string;
  message: string;
  timestamp: string;
}

class AnalyticsService {
  private totalSessions = 0;
  private totalResponses = 0;
  private totalResponseTime = 0;
  private langCount = { en: 0, te: 0 };
  private successCount = 0;
  private escalationCount = 0;
  private totalCallDuration = 0;
  private errors: ErrorLog[] = [];

  recordSession() { this.totalSessions++; }

  recordResponse(responseTimeMs: number, lang: 'en' | 'te') {
    this.totalResponses++;
    this.totalResponseTime += responseTimeMs;
    this.langCount[lang]++;
    this.successCount++;
  }

  recordError(type: string, message: string) {
    this.errors.unshift({ type, message, timestamp: new Date().toISOString() });
    if (this.errors.length > 100) this.errors.pop();
  }

  recordEscalation() { this.escalationCount++; }

  recordCallDuration(seconds: number) { this.totalCallDuration += seconds; }

  getStats() {
    const avgResponseTime = this.totalResponses > 0
      ? Math.round(this.totalResponseTime / this.totalResponses)
      : 0;
    const successRate = this.totalResponses > 0
      ? Math.round((this.successCount / this.totalResponses) * 100)
      : 0;
    const enPct = this.totalResponses > 0
      ? Math.round((this.langCount.en / this.totalResponses) * 100)
      : 62;
    const tePct = 100 - enPct;

    return {
      totalSessions: this.totalSessions,
      totalResponses: this.totalResponses,
      avgResponseTimeMs: avgResponseTime,
      successRate,
      langSplit: { en: enPct, te: tePct },
      escalations: this.escalationCount,
      totalCallDurationSeconds: this.totalCallDuration,
      errorCount: this.errors.length,
    };
  }

  getErrors(): ErrorLog[] { return this.errors.slice(0, 50); }

  reset() {
    this.totalSessions = 0;
    this.totalResponses = 0;
    this.totalResponseTime = 0;
    this.langCount = { en: 0, te: 0 };
    this.successCount = 0;
    this.escalationCount = 0;
    this.totalCallDuration = 0;
    this.errors = [];
  }
}

export const analyticsService = new AnalyticsService();
