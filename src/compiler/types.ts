import { Token } from './strategies/LexerStrategy';
import { LexicalError, SyntacticError, SemanticError } from '../error';

/**
 * Resultado da análise léxica (genérico).
 */
export interface LexerResult<T extends Token = Token> {
  tokens: T[];
  errors: LexicalError[];
}

/**
 * Resultado da análise sintática (genérico).
 */
export interface ParserResult<T extends Token = Token> {
  tokens: T[];
  errors: SyntacticError[];
}

/**
 * Resultado da análise semântica (genérico).
 */
export interface SemanticResult<T extends Token = Token> {
  tokens: T[];
  errors: SemanticError[];
}

/**
 * Resultado completo da compilação (genérico).
 */
export interface CompilationResult<T extends Token = Token> {
  tokens: T[];
  errors: {
    lexicos: LexicalError[];
    sintaticos: SyntacticError[];
    semanticos: SemanticError[];
    total: number;
  };
}
