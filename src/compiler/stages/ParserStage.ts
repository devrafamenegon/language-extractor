/**
 * Fase de Análise Sintática
 */
import { Token } from '../strategies/LexerStrategy';
import { ParserStrategy } from '../strategies/ParserStrategy';
import { ErrorCollector } from '../../errors';
import { ParserResult } from '../types';

export class ParserStage<T extends Token = Token> {
  private strategy: ParserStrategy<T>;

  constructor(strategy: ParserStrategy<T>) {
    this.strategy = strategy;
  }

  /**
   * Executa a análise sintática dos tokens.
   */
  execute(tokens: T[]): ParserResult<T> {
    const errorCollector = new ErrorCollector();
    this.strategy.parse(tokens, errorCollector);

    return {
      tokens,
      errors: errorCollector.getErrors().sintaticos
    };
  }
}

