/**
 * Analisador léxico (Lexer) para C/C++.
 * 
 * Exporta:
 * - Estratégias de tokenização (Strategy Pattern)
 * - Implementações diretas (para testes e uso avançado)
 */

export { 
  ManualLexerStrategy, 
  AfnLexerStrategy,
} from './strategies';

// Implementações diretas (para casos específicos)
export { tokenizeOrdered } from './implementations/manual';
export { tokenizeOrderedAfn } from './implementations/afn';

