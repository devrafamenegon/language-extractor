/**
 * Módulo completo de suporte à linguagem C/C++.
 * 
 * Contém todas as fases de análise para C++:
 * - Lexer (análise léxica)
 * - Parser (análise sintática)
 * - Semantic (análise semântica)
 */

// Análise Léxica (Lexer)
export * from './lexer';

// Análise Sintática (Parser)
export * from './parser';

// Análise Semântica
export * from './semantic';

// Gramática
export * from './grammar/keywords';
export * from './grammar/punctuators';

// Tokens
export * from './tokens/codes';
