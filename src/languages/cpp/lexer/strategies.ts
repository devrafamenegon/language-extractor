import { LexerStrategy } from '../../../compiler/strategies/LexerStrategy';
import { TokenRow } from '../tokens/codes';
import { ErrorCollector } from '../../../errors';
import { tokenizeOrderedAfn, tokenizeOrdered } from './implementations';

/**
 * Estratégia de tokenização manual (loops/regex) para C++.
 * Mais simples, mas menos flexível que AFN.
 */
export class ManualLexerStrategy implements LexerStrategy<TokenRow> {
  tokenize(sourceCode: string, errorCollector: ErrorCollector): TokenRow[] {
    return tokenizeOrdered(sourceCode, errorCollector);
  }
}

/**
 * Estratégia de tokenização por AFN (Thompson) para C++.
 * Mais flexível e extensível, baseada em autômatos finitos.
 */
export class AfnLexerStrategy implements LexerStrategy<TokenRow> {
  tokenize(sourceCode: string, errorCollector: ErrorCollector): TokenRow[] {
    return tokenizeOrderedAfn(sourceCode, errorCollector);
  }
}
