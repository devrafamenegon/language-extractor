import { ParserStrategy } from '../../../compiler/strategies/ParserStrategy';
import { TokenRow } from '../tokens/codes';
import { ErrorCollector } from '../../../errors';
import { Parser } from './parser';

/**
 * Estratégia de análise sintática para C++.
 */
export class CppParserStrategy implements ParserStrategy<TokenRow> {
  parse(tokens: TokenRow[], errorCollector: ErrorCollector): void {
    const parser = new Parser(tokens, errorCollector);
    parser.parse();
  }
}

