import { LexerStrategy } from '../../../compiler/strategies/LexerStrategy';
import { TokenRow } from '../consts/codes';
import { ErrorCollector } from '../../../error';
import { tokenize } from './AfnLexer';

/**
 * Estratégia de tokenização por AFN (Thompson) para C++.
 * Mais flexível e extensível, baseada em autômatos finitos.
 */
export class AfnLexerStrategy implements LexerStrategy<TokenRow> {
  tokenize(sourceCode: string, errorCollector: ErrorCollector): TokenRow[] {
    return tokenize(sourceCode, errorCollector);
  }
}

