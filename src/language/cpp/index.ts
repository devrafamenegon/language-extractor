/**
 * Módulo completo de suporte à linguagem C/C++.
 * 
 * Contém todas as fases de análise para C++:
 * - Lexer (análise léxica)
 * - Parser (análise sintática)
 * - Semantic (análise semântica)
 */

export * from './lexer';
export * from './parser';
export * from './semantic';

export * from './consts/keywords';
export * from './consts/punctuators';
export * from './consts/codes';

export * from './types';
