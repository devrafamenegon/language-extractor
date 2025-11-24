import { Token } from './LexerStrategy';
import { ErrorCollector } from '../../error';

/**
 * Interface genérica de estratégia de análise sintática.
 */
export interface ParserStrategy<T extends Token = Token> {
  parse(tokens: T[], errorCollector: ErrorCollector): void;
}

