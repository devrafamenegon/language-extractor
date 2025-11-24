import { SemanticStrategy } from '../../../compiler/strategies/SemanticStrategy';
import { TokenRow } from '../consts/codes';
import { ErrorCollector } from '../../../error';
import { SemanticAnalyzer } from './SemanticAnalyzer';

/**
 * Estratégia de análise semântica para C++.
 */
export class CppSemanticStrategy implements SemanticStrategy<TokenRow> {
  analyze(tokens: TokenRow[], errorCollector: ErrorCollector): void {
    const analyzer = new SemanticAnalyzer(tokens, errorCollector);
    analyzer.analyze();
  }
}

