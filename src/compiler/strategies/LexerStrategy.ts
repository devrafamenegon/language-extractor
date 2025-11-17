import { ErrorCollector } from '../../errors';

/**
 * Interface genérica de Token.
 * Qualquer linguagem deve implementar esta interface.
 */
export interface Token {
  tipo: string;
  codigo: number;
  valor: string;
  linha: number;
  coluna: number;
}

/**
 * Interface genérica de estratégia de análise léxica.
 */
export interface LexerStrategy<T extends Token = Token> {
  tokenize(sourceCode: string, errorCollector: ErrorCollector): T[];
}

