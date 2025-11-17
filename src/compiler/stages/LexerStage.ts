/**
 * Fase de Análise Léxica
 */
import { LexerStrategy, Token } from '../strategies/LexerStrategy';
import { ErrorCollector } from '../../errors';
import { LexerResult } from '../types';

export class LexerStage<T extends Token = Token> {
  private strategy: LexerStrategy<T>;

  constructor(strategy: LexerStrategy<T>) {
    this.strategy = strategy;
  }

  /**
   * Executa a análise léxica do código fonte usando a estratégia selecionada.
   */
  execute(sourceCode: string): LexerResult<T> {
    const errorCollector = new ErrorCollector();
    const tokens = this.strategy.tokenize(sourceCode, errorCollector);

    return {
      tokens,
      errors: errorCollector.getErrors().lexicos
    };
  }
}

