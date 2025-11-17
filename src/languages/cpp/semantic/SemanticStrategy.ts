import { SemanticStrategy } from '../../../compiler/strategies/SemanticStrategy';
import { TokenRow } from '../tokens/codes';
import { ErrorCollector } from '../../../errors';
import { SemanticAnalyzer } from './analyzer';

/**
 * Estratégia de análise semântica para C++.
 */
export class CppSemanticStrategy implements SemanticStrategy<TokenRow> {
  analyze(tokens: TokenRow[], errorCollector: ErrorCollector): void {
    const analyzer = new SemanticAnalyzer(tokens, errorCollector);
    analyzer.analyze();
  }
}

