import { ParserStrategy } from '../../../compiler/strategies/ParserStrategy';
import { TokenRow } from '../consts/codes';
import { ErrorCollector } from '../../../error';
import { Parser } from './Parser';

/**
 * Estratégia de análise sintática para C++.
 */
export class CppParserStrategy implements ParserStrategy<TokenRow> {
  parse(tokens: TokenRow[], errorCollector: ErrorCollector): void {
    const parser = new Parser(tokens, errorCollector);
    parser.parse();
  }
}

