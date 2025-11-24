/**
 * Matcher Pattern para NFAs.
 * Encapsula a lógica de matching e fornece interface limpa.
 */

import { Afn, MatchResult } from './types';
import { matchLongest } from './helpers';

/**
 * Resultado de um scan completo.
 */
export interface ScanResult {
  matches: MatchResult[];
  unmatched: Array<{ index: number; char: string }>;
}

/**
 * Matcher para NFAs com Strategy Pattern implícito.
 * 
 * Exemplo:
 * ```ts
 * const matcher = new NFAMatcher(megaNFA);
 * const match = matcher.matchAt(text, 0);
 * const allMatches = matcher.scanAll(text);
 * ```
 */
export class NFAMatcher {
  private nfa: Afn;

  constructor(nfa: Afn) {
    this.nfa = nfa;
  }

  /**
   * Tenta fazer match em uma posição específica.
   */
  matchAt(text: string, position: number): MatchResult | null {
    return matchLongest(text, position, this.nfa);
  }

  /**
   * Faz scan completo do texto, retornando todos os matches.
   */
  scanAll(text: string): ScanResult {
    const matches: MatchResult[] = [];
    const unmatched: Array<{ index: number; char: string }> = [];
    
    let i = 0;
    while (i < text.length) {
      const match = this.matchAt(text, i);
      
      if (match) {
        matches.push(match);
        i += match.length;
      } else {
        // Caractere não reconhecido
        const ch = text[i];
        if (ch && !/\s/.test(ch)) {
          unmatched.push({ index: i, char: ch });
        }
        i++;
      }
    }
    
    return { matches, unmatched };
  }

  /**
   * Retorna o NFA interno (útil para debugging).
   */
  getNFA(): Afn {
    return this.nfa;
  }
}

