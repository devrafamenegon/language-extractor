import { LexerStrategy } from '../../../compiler/strategies/LexerStrategy';
import { TokenRow } from '../consts/codes';
import { ErrorCollector } from '../../../error';
import { tokenize } from './ManualLexer';

/**
 * Estratégia de tokenização manual (loops/regex) para C++.
 * Mais simples, mas menos flexível que AFN.
 */
export class ManualLexerStrategy implements LexerStrategy<TokenRow> {
  tokenize(sourceCode: string, errorCollector: ErrorCollector): TokenRow[] {
    return tokenize(sourceCode, errorCollector);
  }
}

