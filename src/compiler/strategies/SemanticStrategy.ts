import { Token } from './LexerStrategy';
import { ErrorCollector } from '../../error';

/**
 * Interface genérica de estratégia de análise semântica.
 */
export interface SemanticStrategy<T extends Token = Token> {
  analyze(tokens: T[], errorCollector: ErrorCollector): void;
}

