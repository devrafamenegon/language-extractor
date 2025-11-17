/**
 * NFAs (Non-deterministic Finite Automata) - Thompson Construction.
 * 
 * Módulo para construção e matching usando autômatos finitos.
 * Usado para reconhecimento de padrões léxicos.
 * 
 * Fluxo funcional:
 * ```ts
 * const nfa = combineAlternation([
 *   { afn: literal('int'), label: 'KEYWORD', priority: 1 },
 *   { afn: plus(charClass(c => /[0-9]/.test(c))), label: 'NUMBER', priority: 2 }
 * ]);
 * const match = matchLongest(text, 0, nfa);
 * ```
 * 
 * Fluxo OOP (Matcher Pattern):
 * ```ts
 * const matcher = new NFAMatcher(nfa);
 * const match = matcher.matchAt(text, 0);
 * const allMatches = matcher.scanAll(text);
 * ```
 */

// Tipos
export type { CharPredicate, AfnState, Afn, LabeledAfn, MatchResult } from './types';

// Construtores (Thompson Construction)
export {
  createEmptyAfn,
  createCharAfn,
  literal,
  charClass,
  concatenate,
  alternate,
  kleeneStar,
  plus,
  optional
} from './builders';

// Matchers e Combinadores
export {
  labelAccepts,
  combineAlternation,
  epsilonClosure,
  move,
  matchLongest
} from './helpers';

// Matcher Pattern (OOP interface)
export { NFAMatcher } from './NFAMatcher';
export type { ScanResult } from './NFAMatcher';
