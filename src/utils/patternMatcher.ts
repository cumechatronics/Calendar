export type Pattern = {
  pattern: string;
  regex?: boolean;
  label?: string;
  icon?: string;
  color?: string;
  priority?: number;
  matchField?: 'summary' | 'description' | 'location' | 'all';
  caseSensitive?: boolean;
};

export type MatchResult = {
  matched: boolean;
  pattern?: Pattern;
  groups?: Record<string, string>;
};

export class PatternMatcher {
  private patterns: Pattern[];

  constructor(patterns: Pattern[] = []) {
    this.patterns = patterns.slice().sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  public setPatterns(patterns: Pattern[]) {
    this.patterns = patterns.slice().sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  private buildRegex(p: Pattern): RegExp {
    const flags = p.caseSensitive ? 'u' : 'iu';
    if (p.regex) return new RegExp(p.pattern, flags);
    const esc = p.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(esc, flags);
  }

  public matchEvent(event: { summary?: string; description?: string; location?: string; }): MatchResult {
    const fields = {
      summary: event.summary || '',
      description: event.description || '',
      location: event.location || '',
    };

    for (const p of this.patterns) {
      const rx = this.buildRegex(p);
      const targetFields = p.matchField === 'all' ? ['summary', 'description', 'location'] : [p.matchField || 'summary'];

      for (const f of targetFields) {
        const value = fields[f] || '';
        const m = rx.exec(value);
        if (m) {
          const groups: Record<string, string> = {};
          if (m.groups) {
            for (const k of Object.keys(m.groups)) groups[k] = m.groups[k];
          }
          return { matched: true, pattern: p, groups };
        }
      }
    }
    return { matched: false };
  }
}

export default PatternMatcher;
