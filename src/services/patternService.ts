// src/services/patternService.ts
import PatternMatcher, { Pattern, MatchResult } from '../utils/patternMatcher';

class PatternService {
  private matcher: PatternMatcher;

  constructor(patterns: Pattern[] = []) {
    this.matcher = new PatternMatcher(patterns);
  }

  public update(patterns: Pattern[] = []) {
    this.matcher.setPatterns(patterns || []);
  }

  public match(event: { summary?: string; description?: string; location?: string; }): MatchResult {
    return this.matcher.matchEvent(event);
  }
}

const instance = new PatternService();
export default instance;
