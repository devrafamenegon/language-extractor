"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCppTokens = extractCppTokens;
const keywords_1 = require("./keywords");
const punctuators_1 = require("./punctuators");
/**
 * Remove comentários de linha (//) e de bloco, preservando o comprimento via espaços.
 * Exemplo:
 *   stripComments('int x; // ok') // 'int x;      '
 */
function stripComments(sourceCode) {
    let result = sourceCode.replace(/\/\*[\s\S]*?\*\//g, match => ' '.repeat(match.length));
    result = result.replace(/(^|[^:])\/\/.*$/gm, (m, p1) => p1 + ' '.repeat(m.length - p1.length));
    return result;
}
/**
 * Remove literais de string mantendo comprimento.
 * Exemplo:
 *   stripStringLiterals('std::string s = "hi";') // 'std::string s =     ;'
 */
function stripStringLiterals(sourceCode) {
    const pattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
    return sourceCode.replace(pattern, match => ' '.repeat(match.length));
}
/**
 * Extrai contagens de palavras-chave e pontuadores de código C++.
 * Exemplo rápido:
 *   const r = extractCppTokens('int main() { return 0; }');
 *   // r.keywordCounts.get('int') === 1; r.punctuatorCounts.get('(') === 1
 */
function extractCppTokens(sourceCode) {
    // Preprocess to reduce false positives in comments/strings
    const strippedComments = stripComments(sourceCode);
    const strippedStrings = stripStringLiterals(strippedComments);
    const preprocessedSource = strippedStrings;
    // Keywords (whole word matches)
    const keywordCounts = new Map();
    const keywordPattern = new RegExp(`\\b(${keywords_1.cppKeywords.join('|')})\\b`, 'g');
    const keywordMatches = preprocessedSource.matchAll(keywordPattern);
    for (const match of keywordMatches) {
        const matchedKeyword = match[1];
        if (!matchedKeyword)
            continue;
        const previousCount = keywordCounts.get(matchedKeyword) ?? 0;
        const updatedCount = previousCount + 1;
        keywordCounts.set(matchedKeyword, updatedCount);
    }
    // Punctuators/operators
    const punctuatorCounts = new Map();
    const punctuatorPattern = (0, punctuators_1.getPunctuatorRegex)();
    const punctuatorMatches = preprocessedSource.matchAll(punctuatorPattern);
    for (const match of punctuatorMatches) {
        const matchedPunctuator = match[1];
        if (!matchedPunctuator)
            continue;
        const previousCount = punctuatorCounts.get(matchedPunctuator) ?? 0;
        const updatedCount = previousCount + 1;
        punctuatorCounts.set(matchedPunctuator, updatedCount);
    }
    const result = { keywordCounts, punctuatorCounts };
    return result;
}
//# sourceMappingURL=extractor.js.map