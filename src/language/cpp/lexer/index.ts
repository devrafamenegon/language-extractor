/**
 * Analisador léxico (Lexer) para C/C++.
 * 
 * Exporta:
 * - Estratégias de tokenização (Strategy Pattern)
 * - Implementações diretas (para testes e uso avançado)
 * - Detectores de erro léxico
 */

// Estratégias (Strategy Pattern)
export { ManualLexerStrategy } from './ManualLexerStrategy';
export { AfnLexerStrategy } from './AfnLexerStrategy';

// Implementações diretas (para casos específicos)
export { tokenize as tokenizeOrdered } from './ManualLexer';
export { tokenize as tokenizeOrderedAfn } from './AfnLexer';

// Detectores de erro
export * from './LexicalErrorDetector';
