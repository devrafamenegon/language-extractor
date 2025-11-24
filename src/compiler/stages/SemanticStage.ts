/**
 * Fase de Análise Semântica
 */
import { Token } from '../strategies/LexerStrategy';
import { SemanticStrategy } from '../strategies/SemanticStrategy';
import { ErrorCollector } from '../../error';
import { SemanticResult } from '../types';

export class SemanticStage<T extends Token = Token> {
  private strategy: SemanticStrategy<T>;

  constructor(strategy: SemanticStrategy<T>) {
    this.strategy = strategy;
  }

  /**
   * Executa a análise semântica dos tokens.
   */
  execute(tokens: T[]): SemanticResult<T> {
    const errorCollector = new ErrorCollector();
    this.strategy.analyze(tokens, errorCollector);

    return {
      tokens,
      errors: errorCollector.getErrors().semanticos
    };
  }
}

