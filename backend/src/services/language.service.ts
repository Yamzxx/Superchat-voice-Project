/**
 * Language detection service
 * Detects Telugu vs English from Unicode script ranges
 * Can be extended with a cloud language detection API
 */
class LanguageService {
  detect(text: string): 'en' | 'te' {
    const teluguChars = (text.match(/[\u0C00-\u0C7F]/g) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    if (totalChars === 0) return 'en';
    return teluguChars / totalChars > 0.2 ? 'te' : 'en';
  }

  split(text: string): { en: string[]; te: string[] } {
    const words = text.split(/\s+/);
    const en: string[] = [];
    const te: string[] = [];
    words.forEach(w => (/[\u0C00-\u0C7F]/.test(w) ? te : en).push(w));
    return { en, te };
  }

  langRatio(messages: Array<{ lang: string }>): { en: number; te: number } {
    const total = messages.length || 1;
    const teCount = messages.filter(m => m.lang === 'te').length;
    return {
      en: Math.round(((total - teCount) / total) * 100),
      te: Math.round((teCount / total) * 100),
    };
  }
}

export const languageService = new LanguageService();
