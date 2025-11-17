/**
 * Compilador principal - orquestra todas as fases de análise (genérico).
 */
import { Token } from './strategies/LexerStrategy';
import { LexerStage } from './stages/LexerStage';
import { ParserStage } from './stages/ParserStage';
import { SemanticStage } from './stages/SemanticStage';
import { CompilationResult } from './types';

export class Compiler<T extends Token = Token> {
  private lexer: LexerStage<T>;
  private parser: ParserStage<T>;
  private semantic: SemanticStage<T>;

  constructor(
    lexer: LexerStage<T>,
    parser: ParserStage<T>,
    semantic: SemanticStage<T>
  ) {
    this.lexer = lexer;
    this.parser = parser;
    this.semantic = semantic;
  }

  /**
   * Compila o código fonte executando as 3 fases de análise.
   */
  compile(sourceCode: string): CompilationResult<T> {
    // Fase 1: Análise Léxica
    const lexResult = this.lexer.execute(sourceCode);

    // Fase 2: Análise Sintática
    const parseResult = this.parser.execute(lexResult.tokens);

    // Fase 3: Análise Semântica
    const semanticResult = this.semantic.execute(parseResult.tokens);

    // Agrega todos os erros
    const errors = {
      lexicos: lexResult.errors,
      sintaticos: parseResult.errors,
      semanticos: semanticResult.errors,
      total: lexResult.errors.length + parseResult.errors.length + semanticResult.errors.length
    };

    return {
      tokens: semanticResult.tokens,
      errors
    };
  }
}

