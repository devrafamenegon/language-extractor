/** Resultado de extração de tokens C++. */
export type ExtractResult = {
    keywordCounts: Map<string, number>;
    punctuatorCounts: Map<string, number>;
};
/**
 * Extrai contagens de palavras-chave e pontuadores de código C++.
 * Exemplo rápido:
 *   const r = extractCppTokens('int main() { return 0; }');
 *   // r.keywordCounts.get('int') === 1; r.punctuatorCounts.get('(') === 1
 */
export declare function extractCppTokens(sourceCode: string): ExtractResult;
//# sourceMappingURL=extractor.d.ts.map